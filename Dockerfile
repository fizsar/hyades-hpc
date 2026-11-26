# Hyades: imagen única (Rocky Linux 9) para todos los roles del clúster.
# SPDX-License-Identifier: AGPL-3.0-only

# --- etapa 1: compilar el trabajo MPI de ejemplo (así la imagen final no lleva gcc)
FROM rockylinux/rockylinux:9@sha256:bb5755f96bec05ff26165e779ec843d7167544be9e50770508f307019a6d05c4 AS build
RUN dnf -y install gcc openmpi-devel && dnf clean all
COPY jobs/pi/pi.c /src/pi.c
RUN /usr/lib64/openmpi/bin/mpicc -O2 -o /pi_mpi /src/pi.c -lm

# --- etapa 2: exporters de Prometheus (versión fijada y checksum verificado)
FROM rockylinux/rockylinux:9@sha256:bb5755f96bec05ff26165e779ec843d7167544be9e50770508f307019a6d05c4 AS tools
RUN curl -fsSL -o ne.tgz https://github.com/prometheus/node_exporter/releases/download/v1.13.1/node_exporter-1.13.1.linux-amd64.tar.gz  && echo "5c00c5234f1ee45900b25539a5a0ab82146a098c15c16a4ec3bc855b597a6477  ne.tgz" | sha256sum -c -  && tar -xzf ne.tgz --strip-components=1 node_exporter-1.13.1.linux-amd64/node_exporter  && curl -fsSL -o se.tgz https://github.com/rivosinc/prometheus-slurm-exporter/releases/download/v1.8.0/prometheus-slurm-exporter_linux_amd64.tar.gz  && echo "903b8e3c9684a6c43e433b36a3582c1c93d461a1a9516a666d2ef0a8886c2046  se.tgz" | sha256sum -c -  && tar -xzf se.tgz prometheus-slurm-exporter

# --- etapa 3: imagen del clúster
FROM rockylinux/rockylinux:9@sha256:bb5755f96bec05ff26165e779ec843d7167544be9e50770508f307019a6d05c4

# UID/GID fijos: tienen que coincidir en todos los nodos (NFS/volumen compartido).
RUN groupadd -g 990 slurm && useradd -r -u 990 -g slurm -d /var/lib/slurm -s /sbin/nologin slurm \
 && groupadd -g 991 munge && useradd -r -u 991 -g munge -d /var/lib/munge -s /sbin/nologin munge \
 && groupadd -g 2001 alice && useradd -m -u 2001 -g alice -s /bin/bash -p '*' alice \
 && groupadd -g 2002 bob   && useradd -m -u 2002 -g bob   -s /bin/bash -p '*' bob

RUN dnf -y install epel-release \
 && dnf -y --enablerepo=crb install \
      munge slurm slurm-slurmctld slurm-slurmd slurm-slurmdbd \
      apptainer openmpi openssh-server openssh-clients \
      procps-ng iproute hostname \
 && dnf clean all \
 && install -d -o slurm -g slurm /var/spool/slurmctld /var/log/slurm \
 && install -d -m 0755 /var/spool/slurmd /srv/images

ENV PATH=/usr/lib64/openmpi/bin:$PATH \
    LD_LIBRARY_PATH=/usr/lib64/openmpi/lib \
    OMPI_MCA_btl_vader_single_copy_mechanism=none

COPY --from=build /pi_mpi /usr/local/bin/pi_mpi
COPY --from=tools /node_exporter /prometheus-slurm-exporter /usr/local/bin/
COPY scripts/entrypoint.sh scripts/init.sh scripts/accounting.sh /opt/hyades/
COPY config/slurm/slurmdbd.conf.tmpl config/sshd_config /opt/hyades/
RUN chmod 0755 /opt/hyades/*.sh

ENTRYPOINT ["/opt/hyades/entrypoint.sh"]
