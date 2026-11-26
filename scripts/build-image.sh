#!/bin/bash
# Construye la imagen Apptainer de IA en un nodo de cálculo (tarea de administración, como root).
# Los trabajos de los usuarios luego la ejecutan sin privilegios.
set -euo pipefail
if docker compose exec -T compute1 test -f /srv/images/mnist.sif; then
  echo "Imagen mnist.sif ya construida"; exit 0
fi
echo "Construyendo mnist.sif (solo la primera vez, unos minutos)..."
docker compose exec -T compute1 apptainer build --disable-cache /srv/images/mnist.sif /home/alice/hyades-jobs/ai/mnist.def
docker compose exec -T compute1 chmod 0644 /srv/images/mnist.sif
