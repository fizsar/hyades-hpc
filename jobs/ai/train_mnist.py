# Entrena una CNN pequeña con MNIST en CPU. Pensado para correr en pocos minutos.
# SPDX-License-Identifier: AGPL-3.0-only
import os, socket, sys, time
import torch, torch.nn as nn, torch.nn.functional as F
from torchvision import datasets, transforms

threads = int(os.environ.get("SLURM_CPUS_PER_TASK", "2"))
n_train = int(sys.argv[1]) if len(sys.argv) > 1 else 20000
epochs = int(sys.argv[2]) if len(sys.argv) > 2 else 2
torch.set_num_threads(threads)
torch.manual_seed(0)
print(f"host={socket.gethostname()} torch={torch.__version__} threads={threads} "
      f"train={n_train} epochs={epochs}", flush=True)

tf = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.1307,), (0.3081,))])
train = datasets.MNIST("/opt/mnist", train=True, download=False, transform=tf)
test = datasets.MNIST("/opt/mnist", train=False, download=False, transform=tf)
train = torch.utils.data.Subset(train, range(n_train))
tl = torch.utils.data.DataLoader(train, batch_size=64, shuffle=True)
vl = torch.utils.data.DataLoader(test, batch_size=1000)

model = nn.Sequential(
    nn.Conv2d(1, 8, 3), nn.ReLU(), nn.MaxPool2d(2),
    nn.Conv2d(8, 16, 3), nn.ReLU(), nn.MaxPool2d(2),
    nn.Flatten(), nn.Linear(400, 10))
opt = torch.optim.Adam(model.parameters(), lr=2e-3)

t0 = time.time()
for ep in range(1, epochs + 1):
    model.train(); total = 0.0
    for x, y in tl:
        opt.zero_grad(); loss = F.cross_entropy(model(x), y); loss.backward(); opt.step()
        total += loss.item() * len(y)
    model.eval(); ok = 0
    with torch.no_grad():
        for x, y in vl:
            ok += (model(x).argmax(1) == y).sum().item()
    print(f"epoch {ep}/{epochs}  loss={total / n_train:.4f}  test_acc={ok / len(test):.4f}  "
          f"t={time.time() - t0:.0f}s", flush=True)
