#!/bin/bash
# Punto de entrada común. Uso: entrypoint.sh {init|control|compute|login}
set -euo pipefail
ROLE=${1:?rol}

start_munge() {
  install -d -o munge -g munge -m 0700 /etc/munge /var/lib/munge /var/log/munge
  install -d -o munge -g munge -m 0755 /run/munge
  install -o munge -g munge -m 0400 /secrets/munge.key /etc/munge/munge.key
  runuser -u munge -- /usr/sbin/munged
  until munge -n >/dev/null 2>&1; do sleep 0.3; done
}

case "$ROLE" in
  init)
    exec /opt/hyades/init.sh
    ;;

  control)
    start_munge
    install -d -o slurm -g slurm -m 0755 /run/slurm
    # slurmdbd.conf con la contraseña de la BD (generada en el primer arranque)
    sed "s|@DBPASS@|$(cat /secrets/db_password)|" /opt/hyades/slurmdbd.conf.tmpl > /etc/slurm/slurmdbd.conf
    chown slurm:slurm /etc/slurm/slurmdbd.conf; chmod 0600 /etc/slurm/slurmdbd.conf
    # slurmdbd y slurmctld corren como el usuario "slurm", no como root
    runuser -u slurm -- slurmdbd -D -v &
    until runuser -u slurm -- sacctmgr -n show cluster >/dev/null 2>&1; do sleep 1; done
    runuser -u slurm -- bash /opt/hyades/accounting.sh
    exec runuser -u slurm -- slurmctld -D -v
    ;;

  compute)
    start_munge
    install -d -m 0755 /run/slurm
    mkdir -p /sys/fs/cgroup/system.slice   # slurmd (cgroup v2, sin systemd) cuelga de aquí
    # slurmd necesita root para lanzar los trabajos con la identidad de cada usuario
    exec slurmd -D -v -N "$(hostname)"
    ;;

  login)
    start_munge
    install -d -m 0755 /run/sshd
    exec /usr/sbin/sshd -D -e -f /opt/hyades/sshd_config
    ;;

  *) echo "rol desconocido: $ROLE" >&2; exit 2 ;;
esac
