import json, sys

DS = {"type": "prometheus", "uid": "prometheus"}

def tgt(expr, legend=""):
    return {"datasource": DS, "expr": expr, "legendFormat": legend, "refId": "A"}

def stat(id, title, x, w, exprs, unit="none", colour="green"):
    targets = []
    for i, (e, l) in enumerate(exprs):
        t = tgt(e, l); t["refId"] = chr(65 + i); targets.append(t)
    return {"id": id, "type": "stat", "title": title, "datasource": DS,
            "gridPos": {"x": x, "y": 0, "w": w, "h": 5}, "targets": targets,
            "fieldConfig": {"defaults": {"unit": unit, "color": {"mode": "fixed", "fixedColor": colour},
                                         "thresholds": {"mode": "absolute", "steps": [{"color": colour, "value": None}]}},
                            "overrides": []},
            "options": {"colorMode": "value", "graphMode": "none", "textMode": "value_and_name",
                        "reduceOptions": {"calcs": ["lastNotNull"], "fields": "", "values": False}}}

def ts(id, title, x, y, w, exprs, unit="none", maxv=None, stack=False):
    targets = []
    for i, (e, l) in enumerate(exprs):
        t = tgt(e, l); t["refId"] = chr(65 + i); targets.append(t)
    d = {"unit": unit, "custom": {"lineWidth": 2, "fillOpacity": 18, "showPoints": "never",
                                   "stacking": {"mode": "normal" if stack else "none"}}}
    if maxv is not None:
        d["max"] = maxv; d["min"] = 0
    return {"id": id, "type": "timeseries", "title": title, "datasource": DS,
            "gridPos": {"x": x, "y": y, "w": w, "h": 8}, "targets": targets,
            "fieldConfig": {"defaults": d, "overrides": []},
            "options": {"legend": {"displayMode": "list", "placement": "bottom"}, "tooltip": {"mode": "multi"}}}

panels = [
    stat(1, "Nodos de cálculo", 0, 6,
         [('sum(slurm_node_count_per_state{state=~"idle|alloc|mix.*"}) or vector(0)', "disponibles"),
          ('sum(slurm_node_count_per_state{state=~"down.*|drain.*|fail.*"}) or vector(0)', "caídos")]),
    stat(2, "Trabajos en cola", 6, 6, [('sum(slurm_user_state_total{state="PENDING"}) or vector(0)', "pendientes")], colour="yellow"),
    stat(3, "Trabajos en ejecución", 12, 6, [('sum(slurm_user_state_total{state="RUNNING"}) or vector(0)', "ejecutándose")]),
    stat(4, "CPUs en uso", 18, 6,
         [('sum(slurm_cpus_per_state{state="alloc"}) or vector(0)', "asignadas"),
          ('slurm_cpus_total', "totales")]),
    ts(5, "Trabajos por usuario (en ejecución / en cola)", 0, 5, 12,
       [('sum by(username)(slurm_user_state_total{state="RUNNING"})', "{{username}} ejecutando"),
        ('sum by(username)(slurm_user_state_total{state="PENDING"})', "{{username}} en cola")]),
    ts(6, "CPUs asignadas por cuenta (fairshare)", 12, 5, 12,
       [('sum by(account)(slurm_account_job_state_cpu_alloc{state="RUNNING"})', "{{account}}")], stack=True),
    ts(7, "Uso de CPU por nodo", 0, 13, 12,
       [('100 - avg by(instance)(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100', "{{instance}}")],
       unit="percent", maxv=100),
    ts(8, "Uso de memoria por nodo", 12, 13, 12,
       [('100 * (1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)', "{{instance}}")],
       unit="percent", maxv=100),
]

dash = {"uid": "hyades", "title": "Hyades — clúster", "tags": ["hyades", "slurm"], "timezone": "browser",
        "schemaVersion": 39, "version": 1, "refresh": "10s", "time": {"from": "now-15m", "to": "now"},
        "panels": panels}
json.dump(dash, open(sys.argv[1], "w"), indent=1, ensure_ascii=False)
