#!/bin/bash
# Servicio "init": genera secretos en el primer arranque y prepara /home.
# Es lo único (junto con sshd y slurmd) que corre como root; termina y sale.
set -euo pipefail
S=/secrets

if [ ! -f $S/.initialized ]; then
  echo "[init] primer arranque: generando secretos"
  head -c 1024 /dev/urandom > $S/munge.key
  head -c 24 /dev/urandom | od -An -tx1 | tr -d ' \n' > $S/db_password
  ssh-keygen -q -t ed25519 -N '' -C hyades-host -f $S/ssh_host_ed25519_key
  for u in alice bob; do
    install -d -m 0700 $S/users/$u
    ssh-keygen -q -t ed25519 -N '' -C "$u@hyades" -f $S/users/$u/id_ed25519
  done
  chmod 0600 $S/munge.key $S/db_password
  touch $S/.initialized
fi

# Secretos añadidos en fases posteriores: se crean si faltan, también en un clúster ya iniciado
if [ ! -f $S/grafana_password ]; then
  head -c 18 /dev/urandom | od -An -tx1 | tr -d ' \n' > $S/grafana_password
  chmod 0600 $S/grafana_password
fi

# Homes de los usuarios (volumen compartido montado en /home en todos los nodos)
for u in alice bob; do
  h=/home/$u
  uid=$(id -u $u); gid=$(id -g $u)
  install -d -m 0750 -o "$uid" -g "$gid" $h $h/.ssh
  [ -f $h/.bashrc ] || cp /etc/skel/.bash* /etc/skel/.profile $h/ 2>/dev/null || true
  install -m 0600 -o "$uid" -g "$gid" $S/users/$u/id_ed25519.pub $h/.ssh/authorized_keys
  # la clave privada de usuario también sirve para saltar entre nodos si hiciera falta
  rm -rf $h/hyades-jobs
  cp -r /opt/hyades/jobs $h/hyades-jobs
  chown -R "$uid:$gid" $h
done
install -d -m 0755 /srv/images
echo "[init] listo"
