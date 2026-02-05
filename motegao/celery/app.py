from celery import Celery

app = Celery(
    "worker",
    broker="amqp://guest@localhost//",
    # Add the path to your tasks module here
    include=["motegao.celery.tasks.commands"],
)
