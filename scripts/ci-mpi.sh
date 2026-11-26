#!/bin/bash
# Prueba de humo de CI: el trabajo MPI de ejemplo debe acabar bien y dar pi correcto.
set -euo pipefail
as() { docker compose exec -T -u alice -w /home/alice/hyades-jobs login bash -lc "$*"; }
JID=$(as "sbatch --parsable pi/pi_mpi.sbatch")
as "while squeue -h -j $JID | grep -q .; do sleep 2; done"
OUT=$(as "cat pi-mpi-$JID.out"); echo "$OUT"
echo "$OUT" | grep -q "^pi ~= 3\.14159265" || { echo "pi incorrecto" >&2; exit 1; }
[ "$(echo "$OUT" | grep -c "^rango")" -eq 6 ] || { echo "faltan rangos MPI" >&2; exit 1; }
as "sacct -X -n -j $JID -o State" | grep -q COMPLETED || { echo "el trabajo no acabó en COMPLETED" >&2; exit 1; }
echo "OK: pi con MPI en 3 nodos"
