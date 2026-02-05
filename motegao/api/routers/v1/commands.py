from motegao.celery.app import celery
from motegao.celery.tasks.commands import run_command_ping
from fastapi import APIRouter

router = APIRouter(prefix="/commands", tags=['commands'])

@router.get("/test")
def test():
    return {
        'status': 'SUCCESS',
        'result': 'test'
    }

@router.post("/ping")
def ping(host: str):
    task = run_command_ping.delay(host)
    return {"task_id": task.id}

@router.get("/result/{task_id}")
def get_task_result(task_id: str):
    task = celery.AsyncResult(task_id)
    return {
        "status": task.status,
        "result": task.result if task.ready() else None
    }