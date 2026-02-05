from motegao.celery_app import celery_app

@celery_app.task()
def run_command_ping(host: str):
    import subprocess
    return subprocess.run(
        ["ping", "-c", "4", host],
        capture_output=True,
        text=True
    ).stdout.decode()