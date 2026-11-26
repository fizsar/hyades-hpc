#!/bin/bash
#SBATCH --job-name=pi-mpi
#SBATCH --partition=debug
#SBATCH --qos=debug
#SBATCH --nodes=3
#SBATCH --ntasks-per-node=2
#SBATCH --time=00:05:00
#SBATCH --output=pi-mpi-%j.out

# Pi con MPI: 6 rangos repartidos en los 3 nodos de cálculo.
echo "Nodos: $SLURM_JOB_NODELIST"
mpirun /usr/local/bin/pi_mpi 400000000
