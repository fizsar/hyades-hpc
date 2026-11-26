// SPDX-License-Identifier: AGPL-3.0-only
// ES / EN strings. data-i18n → textContent, data-i18n-html → trusted static
// markup written here, data-i18n-alt / data-i18n-aria → attributes.

export const dict = {
  es: {
    'doc.title': 'Hyades — mini clúster HPC de laboratorio',
    'nav.arch': 'arquitectura', 'nav.demo': 'demo', 'nav.qos': 'QoS', 'nav.learn': 'qué se aprende', 'nav.limits': 'límites',
    'hero.sub': 'Mini clúster HPC de laboratorio',
    'hero.why': 'Slurm, MPI, Apptainer, PyTorch, Prometheus y Grafana en Docker Compose. Cada estrella del cúmulo de las Híades es un nodo del clúster.',
    'hero.note.t': 'Proyecto de portfolio',
    'hero.note.b': 'Un laboratorio que reproduce la arquitectura de un centro HPC (como el FinisTerrae del CESGA). No es un supercomputador.',
    'hero.cta1': 'Ver la arquitectura', 'hero.cta2': 'Ver la demo',
    'cluster.cap': 'Posiciones reales (J2000) de las estrellas principales de las Híades. Aldebarán se ve en la misma dirección, pero no pertenece al cúmulo.',
    'tip.hint': 'ver en la arquitectura →', 'cluster.ald': 'no es del cúmulo',

    'arch.h': 'Arquitectura',
    'arch.intro': 'Pasa el ratón por un nodo, o tócalo, para ver qué hace. Todos los nodos comparten la misma imagen base (Rocky Linux 9).',
    'arch.chips': 'Nodos del clúster',
    'arch.default.t': 'Elige un nodo',
    'arch.default.b': 'Los usuarios entran por el nodo de acceso, el nodo de control reparte los trabajos entre los nodos de cálculo y la monitorización lo observa todo.',
    'arch.user': 'usuarios', 'arch.munge': 'munge: autenticación entre nodos', 'arch.home': 'volumen /home compartido',
    'n.login.t': 'login · nodo de acceso',
    'n.login.b': 'Los usuarios entran por SSH con clave (sin contraseñas ni acceso de root) y desde aquí lanzan sbatch y squeue. No ejecuta trabajos: separa a los usuarios del plano de control.',
    'n.control.t': 'control · slurmctld + slurmdbd',
    'n.control.b': 'slurmctld decide qué trabajo va a qué nodo (colas, prioridad, fairshare, límites). slurmdbd guarda la contabilidad. Los dos corren como el usuario slurm, no como root.',
    'n.mariadb.t': 'mariadb · contabilidad',
    'n.mariadb.b': 'La base de datos de slurmdbd: de aquí salen sacct, el fairshare, las QoS y los límites. Su contraseña se genera en el primer arranque; no está en el repositorio.',
    'n.compute1.t': 'compute1 · nodo de cálculo',
    'n.compute2.t': 'compute2 · nodo de cálculo',
    'n.compute3.t': 'compute3 · nodo de cálculo',
    'n.compute.b': 'slurmd arranca los trabajos con la identidad de cada usuario (por eso necesita root). Lleva Apptainer y OpenMPI. En el laboratorio es privileged: ver limitaciones.',
    'n.monitoring.t': 'monitorización · Prometheus + Grafana',
    'n.monitoring.b': 'Prometheus recoge métricas de node_exporter (todos los nodos) y del exporter de Slurm (nodos, cola, CPUs). Grafana las muestra en un panel ya configurado.',
    'n.home.t': '/home · volumen compartido',
    'n.home.b': 'Todos los nodos ven los mismos ficheros y los mismos UIDs, como en un centro real. Aquí es un volumen Docker en lugar de NFS (ver limitaciones).',

    'demo.h': 'Una demo real',
    'demo.intro': 'Salida real de <code>make demo</code> (el script imprime en castellano): <strong>bob</strong> lanza un entrenamiento de MNIST con PyTorch dentro de Apptainer y <strong>alice</strong> lanza π con MPI en los 3 nodos. Mira <code>squeue</code>: un trabajo en ejecución (<code>R</code>) y otro pendiente (<code>PD</code>).',
    'demo.replay': 'Repetir',
    'demo.note': 'La demo completa tarda unos 35 s en el clúster real. Aquí se reproduce más despacio para poder leerla.',
    'mon.h': 'Monitorización',
    'mon.intro': 'Panel de Grafana ya configurado, con el clúster ejecutando trabajos: nodos disponibles, trabajos en cola y en ejecución, CPUs por cuenta (fairshare), y CPU y memoria por nodo.',
    'mon.alt': 'Panel de Grafana de Hyades: nodos de cálculo, trabajos en cola y en ejecución, CPUs en uso, trabajos por usuario, CPUs por cuenta, y uso de CPU y memoria por nodo.',

    'qos.h': 'Caso práctico: «¿por qué mi trabajo está pendiente?»',
    'qos.p1': 'Al montar el ejemplo de MPI, el trabajo de <code>alice</code> se quedó en la cola con el clúster libre. El motivo: <code>QOSMaxCpuPerUserLimit</code>.',
    'qos.h2': 'Diagnóstico',
    'qos.p2': 'El trabajo pedía 6 CPUs, pero la QoS con la que corría (<code>batch</code>, la QoS <em>por defecto</em> de alice) limita a 4 CPUs por usuario. La QoS de la partición (<code>debug</code>) no se aplicó, porque <strong>la QoS del trabajo manda sobre la de la partición</strong>. Hay dos arreglos correctos, según lo que se quiera:',
    'qos.f1': 'Pedir la QoS adecuada: <code>#SBATCH --qos=debug</code> (lo que hace el ejemplo).',
    'qos.f2': 'Cambiar la política, si el límite está mal: <code>sacctmgr modify qos batch set MaxTRESPerUser=cpu=6</code>.',
    'qos.p3': 'La lección: los límites viven en la <em>base de datos de contabilidad</em> (asociaciones y QoS), no solo en <code>slurm.conf</code>, y <code>AccountingStorageEnforce=associations,limits,qos</code> es lo que hace que se apliquen.',

    'learn.h': 'Qué aprende un administrador con cada pieza',
    'learn.rows': [
      ['munge', 'secretos compartidos, coherencia de reloj y UIDs; por qué slurmctld y slurmd no hablan sin él'],
      ['slurmctld / slurm.conf', 'definición de nodos y particiones, planificador, pesos de prioridad'],
      ['slurmdbd + MariaDB', 'contabilidad, asociaciones, QoS, fairshare; sacctmgr y sacct'],
      ['slurmd y cgroups', 'por qué los demonios necesitan cgroups y qué cambia sin systemd'],
      ['nodo de acceso', 'separar a los usuarios del plano de control; SSH solo con clave; sin root'],
      ['/home compartido', 'por qué todos los nodos deben ver los mismos ficheros y UIDs'],
      ['Apptainer', 'ejecutar contenedores como usuario normal (sin demonio Docker en HPC)'],
      ['OpenMPI', 'un trabajo en varios nodos; cómo se reparten los rangos con --nodes y --ntasks-per-node'],
      ['Prometheus + Grafana', 'objetivos, exporters, qué poner en un panel de operaciones'],
    ],

    'limits.h': 'Limitaciones',
    'limits.intro': 'Un laboratorio honesto cuenta lo que no es.',
    'limits.rows': [
      ['Slurm 22.05', 'viene de EPEL 9 y está fuera del soporte del proyecto (sin parches de seguridad). Vale para aprender; no expongas este clúster a una red.'],
      ['OpenHPC', 'sería una mejora natural (Slurm actual, pilas MPI, lmod), pero se instala en /opt/ohpc con otras rutas y obligaría a rehacer la imagen base. Queda como trabajo futuro.'],
      ['/home no es NFS', 'es un volumen Docker: un servidor NFS en un contenedor necesita privilegios y módulos del kernel que Docker gestiona mal. Se pierden las lecciones de bloqueos, caché y root_squash.'],
      ['Nodos de cálculo privileged', 'Apptainer necesita user namespaces y slurmd necesita escribir cgroups, y el perfil por defecto de Docker bloquea ambas cosas. Los nodos de control y de acceso no lo son. Un clúster real no haría esto.'],
      ['node_exporter mide el host', 'los contenedores comparten el kernel, así que la CPU y la memoria salen casi iguales en todos los nodos. Lo que cambia entre nodos son las cifras de Slurm.'],
      ['Tiempos y límites', 'cada nodo declara 2 CPUs pero comparten los núcleos reales del host: los tiempos no son significativos, y Slurm no fuerza límites de CPU ni de memoria.'],
      ['Un solo controlador', 'sin alta disponibilidad, sin expulsión de trabajos, sin GPUs ni InfiniBand.'],
      ['Grafana y TLS', 'Grafana permite lectura anónima y nada usa TLS: bien en 127.0.0.1, mal en cualquier otro sitio.'],
    ],

    'foot.repo': 'Código en GitHub', 'foot.lab': 'Un laboratorio, no un supercomputador.',
    'foot.src': 'Coordenadas de las estrellas (J2000) tomadas de Wikipedia; proyección plana simplificada. Todo el sitio está autoalojado, sin CDN ni terceros.',
  },

  en: {
    'doc.title': 'Hyades — miniature HPC cluster lab',
    'nav.arch': 'architecture', 'nav.demo': 'demo', 'nav.qos': 'QoS', 'nav.learn': 'what you learn', 'nav.limits': 'limits',
    'hero.sub': 'Miniature HPC cluster lab',
    'hero.why': 'Slurm, MPI, Apptainer, PyTorch, Prometheus and Grafana in Docker Compose. Every star of the Hyades cluster is a node of the cluster.',
    'hero.note.t': 'A portfolio project',
    'hero.note.b': 'A lab that reproduces the architecture of an HPC centre (like CESGA’s FinisTerrae). It is not a supercomputer.',
    'hero.cta1': 'See the architecture', 'hero.cta2': 'Watch the demo',
    'cluster.cap': 'Real positions (J2000) of the main stars of the Hyades. Aldebaran lies along the same line of sight but is not a member of the cluster.',
    'tip.hint': 'see it in the architecture →', 'cluster.ald': 'not in the cluster',

    'arch.h': 'Architecture',
    'arch.intro': 'Hover a node, or tap it, to see what it does. Every node shares the same base image (Rocky Linux 9).',
    'arch.chips': 'Cluster nodes',
    'arch.default.t': 'Pick a node',
    'arch.default.b': 'Users come in through the login node, the control node hands jobs out to the compute nodes, and monitoring watches it all.',
    'arch.user': 'users', 'arch.munge': 'munge: authentication between nodes', 'arch.home': 'shared /home volume',
    'n.login.t': 'login · access node',
    'n.login.b': 'Users come in over SSH with a key (no passwords, no root login) and run sbatch and squeue from here. It runs no jobs: it keeps users apart from the control plane.',
    'n.control.t': 'control · slurmctld + slurmdbd',
    'n.control.b': 'slurmctld decides which job goes to which node (queues, priority, fairshare, limits). slurmdbd keeps the accounting. Both run as the slurm user, not root.',
    'n.mariadb.t': 'mariadb · accounting',
    'n.mariadb.b': 'The slurmdbd database: sacct, fairshare, QoS and limits all come from here. Its password is generated on first start and is not in the repository.',
    'n.compute1.t': 'compute1 · compute node',
    'n.compute2.t': 'compute2 · compute node',
    'n.compute3.t': 'compute3 · compute node',
    'n.compute.b': 'slurmd starts jobs under each user’s identity (that is why it needs root). It carries Apptainer and OpenMPI. In the lab it is privileged: see limitations.',
    'n.monitoring.t': 'monitoring · Prometheus + Grafana',
    'n.monitoring.b': 'Prometheus scrapes node_exporter (every node) and the Slurm exporter (nodes, queue, CPUs). Grafana shows them in a ready-made dashboard.',
    'n.home.t': '/home · shared volume',
    'n.home.b': 'Every node sees the same files and the same UIDs, as in a real centre. Here it is a Docker volume instead of NFS (see limitations).',

    'demo.h': 'A real demo',
    'demo.intro': 'Real output of <code>make demo</code> (the script prints in Spanish): <strong>bob</strong> launches an MNIST training with PyTorch inside Apptainer and <strong>alice</strong> launches π with MPI across the 3 nodes. Look at <code>squeue</code>: one running job (<code>R</code>) and one pending (<code>PD</code>).',
    'demo.replay': 'Replay',
    'demo.note': 'The whole demo takes about 35 s on the real cluster. Here it plays slower so it can be read.',
    'mon.h': 'Monitoring',
    'mon.intro': 'A ready-made Grafana dashboard, with the cluster running jobs: available nodes, queued and running jobs, CPUs per account (fairshare), and CPU and memory per node.',
    'mon.alt': 'Hyades Grafana dashboard: compute nodes, queued and running jobs, CPUs in use, jobs per user, CPUs per account, and CPU and memory use per node.',

    'qos.h': 'Case study: “why is my job pending?”',
    'qos.p1': 'While building the MPI example, <code>alice</code>’s job sat in the queue with the cluster idle. The reason: <code>QOSMaxCpuPerUserLimit</code>.',
    'qos.h2': 'Diagnosis',
    'qos.p2': 'The job asked for 6 CPUs, but the QoS it was running under (<code>batch</code>, alice’s <em>default</em> QoS) caps a user at 4 CPUs. The partition’s QoS (<code>debug</code>) did not apply, because <strong>the job’s QoS wins over the partition’s</strong>. There are two correct fixes, depending on intent:',
    'qos.f1': 'Ask for the right QoS: <code>#SBATCH --qos=debug</code> (what the example does).',
    'qos.f2': 'Change the policy, if the limit is wrong: <code>sacctmgr modify qos batch set MaxTRESPerUser=cpu=6</code>.',
    'qos.p3': 'The lesson: limits live in the <em>accounting database</em> (associations and QoS), not only in <code>slurm.conf</code>, and <code>AccountingStorageEnforce=associations,limits,qos</code> is what makes them bite.',

    'learn.h': 'What an administrator learns from each piece',
    'learn.rows': [
      ['munge', 'shared secrets, clock and UID consistency; why slurmctld and slurmd refuse to talk without it'],
      ['slurmctld / slurm.conf', 'node and partition definitions, scheduler, priority weights'],
      ['slurmdbd + MariaDB', 'accounting, associations, QoS, fairshare; sacctmgr and sacct'],
      ['slurmd and cgroups', 'why daemons need cgroup access, and what changes without systemd'],
      ['login node', 'keeping users apart from the control plane; key-only SSH; no root login'],
      ['shared /home', 'why every node must see the same files and UIDs'],
      ['Apptainer', 'running containers as a normal user (no Docker daemon on HPC)'],
      ['OpenMPI', 'one job across nodes; how ranks map to --nodes and --ntasks-per-node'],
      ['Prometheus + Grafana', 'scrape targets, exporters, what to put on an operations dashboard'],
    ],

    'limits.h': 'Limitations',
    'limits.intro': 'An honest lab says what it is not.',
    'limits.rows': [
      ['Slurm 22.05', 'comes from EPEL 9 and is out of upstream support (no security fixes). Fine to learn on; do not expose this cluster to a network.'],
      ['OpenHPC', 'is a natural improvement (current Slurm, MPI stacks, lmod), but it installs under /opt/ohpc with different paths and would mean reworking the base image. Left as future work.'],
      ['/home is not NFS', 'it is a Docker volume: an NFS server in a container needs privileges and kernel modules that Docker handles badly. You lose the locking, caching and root_squash lessons.'],
      ['Privileged compute nodes', 'Apptainer needs user namespaces and slurmd needs to write cgroups, and Docker’s default profile blocks both. The control and login nodes are not privileged. A real cluster would not do this.'],
      ['node_exporter measures the host', 'containers share the host kernel, so CPU and memory look almost identical on every node. The Slurm numbers are the ones that differ.'],
      ['Timings and limits', 'each node declares 2 CPUs but they share the host’s real cores: timings are not meaningful, and Slurm does not enforce CPU or memory limits.'],
      ['One controller', 'no HA, no job preemption, no GPUs, no InfiniBand.'],
      ['Grafana and TLS', 'Grafana allows anonymous read-only access and nothing uses TLS: fine on 127.0.0.1, not elsewhere.'],
    ],

    'foot.repo': 'Code on GitHub', 'foot.lab': 'A lab, not a supercomputer.',
    'foot.src': 'Star coordinates (J2000) from Wikipedia; simplified flat projection. The whole site is self-hosted, with no CDN or third parties.',
  },
}

let lang = 'es'
export const getLang = () => lang
export const t = (k) => dict[lang][k] ?? dict.es[k] ?? k

export function initLang() {
  let saved = null
  try { saved = localStorage.getItem('hyades-lang') } catch { /* private mode */ }
  const nav = (navigator.language || 'es').toLowerCase()
  lang = saved === 'en' || saved === 'es' ? saved : nav.startsWith('es') ? 'es' : 'en'
  return lang
}

export function setLang(l) {
  lang = l
  try { localStorage.setItem('hyades-lang', l) } catch { /* ignore */ }
  document.documentElement.lang = l
  document.title = t('doc.title')
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n)
  for (const el of document.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml) // trusted: strings above
  for (const el of document.querySelectorAll('[data-i18n-alt]')) el.setAttribute('alt', t(el.dataset.i18nAlt))
  for (const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria))
  for (const b of document.querySelectorAll('[data-lang]')) b.setAttribute('aria-pressed', String(b.dataset.lang === l))
}
