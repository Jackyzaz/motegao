from celery import Celery

celery_app = Celery(
    'worker', 
    broker='amqp://guest:guest@localhost:5672//',
    backend='rpc://'
)