from motegao.celery.app import celery


@celery.task()
def run_command_ping(host: str):
    import subprocess

    return subprocess.run(
        ["ping", "-c", "3", host], capture_output=True, text=True
    ).stdout.encode()
