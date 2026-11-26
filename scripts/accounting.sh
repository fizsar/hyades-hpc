#!/bin/bash
# Cluster, QoS, cuentas y usuarios en la contabilidad de Slurm. Idempotente.
sa() { sacctmgr -i "$@" >/dev/null 2>&1 || true; }

sa add cluster hyades
# QoS: debug = prioridad alta, trabajos cortos; batch = prioridad normal, tope de 4 CPUs por usuario
sa add qos debug Priority=100 MaxJobsPerUser=2 MaxWall=00:10:00
sa add qos batch Priority=10  MaxTRESPerUser=cpu=4 MaxWall=1-00:00:00
# Dos cuentas con cuotas de fairshare distintas (60/40)
sa add account physics Cluster=hyades Fairshare=60 Description="Fisica" Organization=lab
sa add account ai      Cluster=hyades Fairshare=40 Description="IA"     Organization=lab
sa add user alice Account=physics DefaultAccount=physics
sa add user bob   Account=ai      DefaultAccount=ai
sa modify user where name=alice,bob set QOS=debug,batch DefaultQOS=batch
echo "[accounting] listo"
