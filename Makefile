# Hyades — SPDX-License-Identifier: AGPL-3.0-only
DC = docker compose

.PHONY: up down demo clean ssh logs image grafana-password

up:                       ## Construye y arranca el clúster
	$(DC) up -d --build
	@scripts/wait-ready.sh
	@scripts/build-image.sh

down:                     ## Para el clúster (conserva datos)
	$(DC) down

demo:                     ## Lanza los trabajos de ejemplo y muestra cola y contabilidad
	@scripts/demo.sh

ssh:                      ## Entra al nodo de acceso como alice (make ssh U=bob para bob)
	$(DC) exec -u $(or $(U),alice) login bash -l

image:                    ## Construye la imagen Apptainer de IA (si no existe)
	@scripts/build-image.sh

grafana-password:         ## Muestra la contraseña de admin de Grafana (usuario: admin)
	@$(DC) run --rm --no-deps --entrypoint cat init /secrets/grafana_password; echo

logs:
	$(DC) logs -f --tail=50

clean:                    ## Borra contenedores, volúmenes (incluidos secretos y contabilidad) e imagen
	$(DC) down -v --remove-orphans
	-docker image rm hyades-base:local
