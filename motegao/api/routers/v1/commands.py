from motegao.celery.app import celery
from motegao.celery.tasks.commands import (
    run_command_nmap,
    run_command_ping,
    run_command_subdomain_enum,
    run_command_path_enum
)
from fastapi import APIRouter, HTTPException

from motegao.models.cmd_request import NmapRequest, subdomainEnumRequest, PathEnumRequest

router = APIRouter(prefix="/commands", tags=["commands"])

ALLOWED_NMAP_OPTIONS = {
    "-sS",  # SYN scan
    "-sT",  # TCP connect
    "-sU",  # UDP
    "-Pn",  # No ping
    "--open",  # Show open ports only
    "-n",  # No DNS
    "-sV",  # Version detection
}


@router.get("/{task_id}/result")
def get_task_result(task_id: str):
    task = celery.AsyncResult(task_id)

    return {"status": task.status, "result": task.info}

@router.get("/{task_id}/cancel")
def cancel_task(task_id: str):
    task = celery.AsyncResult(task_id)
    result = task.result
    
    celery.control.revoke(task_id, terminate=True, signal='SIGKILL')

    return {"status": "CANCELLED", "result": result}


@router.post("/ping")
def ping(host: str):
    task = run_command_ping.delay(host)
    return {"task_id": task.id}


@router.post("/nmap")
def nmap(payload: NmapRequest):
    for opt in payload.options or []:
        if opt not in ALLOWED_NMAP_OPTIONS:
            raise HTTPException(status_code=400, detail=f"Option not allowed: {opt}")

    if payload.all_ports and (payload.ports_range or payload.ports_specific):
        raise HTTPException(
            status_code=400,
            detail="Cannot combine all_ports with specific port selections",
        )

    ports = ""

    if payload.all_ports:
        ports = "-p-"

    elif payload.ports_range or payload.ports_specific:
        parts = []

        if payload.ports_range:
            if len(payload.ports_range) != 2:
                raise HTTPException(400, "ports_range must contain exactly 2 values")
            parts.append(f"{payload.ports_range[0]}-{payload.ports_range[1]}")

        if payload.ports_specific:
            parts.append(",".join(map(str, payload.ports_specific)))

        ports = f"-p{','.join(parts)}"

    task = run_command_nmap.delay(
        payload.timing_template,
        payload.host,
        "".join(payload.options) if payload.options else "",
        ports,
    )

    return {"task_id": task.id}


@router.post("/subdomain_dns_enum")
def subdomain_enum(payload: subdomainEnumRequest):
    task = run_command_subdomain_enum.delay(
        payload.domain, payload.threads, payload.wordlist
    )
    return {"task_id": task.id}

@router.post("/path_enum")
def path_enum(payload: PathEnumRequest):
    task = run_command_path_enum.delay(
        payload.url, payload.threads, payload.wordlist, payload.exclude_status
    )
    return {"task_id": task.id}