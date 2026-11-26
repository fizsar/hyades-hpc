#!/bin/bash
#SBATCH --job-name=mnist
#SBATCH --partition=batch
#SBATCH --qos=batch
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=2
#SBATCH --time=00:10:00
#SBATCH --output=mnist-%j.out

# Entrenamiento de IA (PyTorch, CPU) dentro de un contenedor Apptainer.
# La imagen se construye una vez con "make image" (tarea de administración).
apptainer exec /srv/images/mnist.sif python3.12 "$HOME/hyades-jobs/ai/train_mnist.py" 20000 2
