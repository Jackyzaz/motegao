import os
from celery import Celery

celery = Celery(
    "worker",
    broker=os.environ.get("CELERY_BROKER_URL", "amqp://guest@localhost//"),
    backend="rpc://",
    include=["motegao.celery.tasks.commands"],
)

celery.conf.update(
    task_track_started=True,
    result_extended=True,
)