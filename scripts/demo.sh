#!/bin/bash
# Lanza los trabajos de ejemplo con usuarios sin privilegios y enseña cola y contabilidad.
#   alice: pi con MPI en los 3 nodos     bob: entrenamiento de MNIST con PyTorch dentro de Apptainer
set -euo pipefail
cd "$(dirname "$0")/.."
as() { local u=$1; shift; docker compose exec -T -u "$u" -w "/home/$u/hyades-jobs" login bash -lc "$*"; }

scripts/build-image.sh >/dev/null   # no hace nada si la imagen ya existe

echo "== bob lanza MNIST (PyTorch en Apptainer); alice lanza pi (MPI, 3 nodos) =="
AI=$(as bob   "sbatch --parsable ai/mnist.sbatch")
PI=$(as alice "sbatch --parsable pi/pi_mpi.sbatch")   # necesita los 3 nodos: espera a que MNIST suelte CPUs
echo "pi = trabajo $PI, MNIST = trabajo $AI"
sleep 3
echo; echo "== squeue =="; as alice "squeue"

as bob "while squeue -h -j $AI | grep -q .; do sleep 3; done"
echo; echo "== salida de MNIST =="; as bob "cat mnist-$AI.out"
as alice "while squeue -h -j $PI | grep -q .; do sleep 2; done"
echo; echo "== salida de pi =="; as alice "cat pi-mpi-$PI.out"

echo; echo "== sacct =="
as alice "sacct -X -j $AI,$PI -o JobID,JobName%10,User%6,Partition%9,QOS%6,AllocCPUS%5,Elapsed,State%10,ExitCode"
