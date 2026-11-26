#!/bin/bash
# Espera a que los 3 nodos de cálculo estén listos en Slurm.
echo -n "Esperando a Slurm"
for i in $(seq 1 90); do
  n=$(docker compose exec -T login sinfo -h -N -t idle,mixed,alloc -o '%N' 2>/dev/null | wc -l)
  if [ "${n:-0}" -ge 3 ]; then echo; docker compose exec -T login sinfo; exit 0; fi
  echo -n "."; sleep 2
done
echo; echo "Slurm no ha levantado a tiempo; revisa: docker compose logs control compute1" >&2
exit 1
