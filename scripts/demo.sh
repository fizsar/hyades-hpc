#!/bin/bash
# Lanza los trabajos de ejemplo como alice (usuario sin privilegios) y enseña cola y contabilidad.
set -euo pipefail
run() { docker compose exec -T -u alice -w /home/alice/hyades-jobs login bash -lc "$1"; }

echo "== Lanzando pi con MPI (3 nodos) =="
JID=$(run "sbatch --parsable pi/pi_mpi.sbatch")
echo "trabajo $JID"
sleep 2
echo "== squeue =="; run "squeue"
run "while squeue -h -j $JID | grep -q .; do sleep 2; done"
echo "== salida =="; run "cat pi-mpi-$JID.out"
echo "== sacct =="
run "sacct -X -o JobID,JobName%12,Partition,Account,AllocCPUS,Elapsed,State,ExitCode"
