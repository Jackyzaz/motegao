from celery import Celery

celery = Celery(
    "worker",
    broker="amqp://guest@localhost//",
    backend='rpc://',
    include=["motegao.celery.tasks.commands"],
)
