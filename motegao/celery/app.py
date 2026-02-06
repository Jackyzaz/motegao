import os
from celery import Celery

celery = Celery(
    "worker",
    broker=os.environ.get("CELERY_BROKER_URL", "amqp://guest@localhost//"),
    backend="rpc://",
    # Add the path to your tasks module here
    include=["motegao.celery.tasks.commands"],
)

# Windows compatibility: use thread pool instead of prefork
celery.conf.update(
    worker_pool='threads',
    worker_prefetch_multiplier=1,
)
