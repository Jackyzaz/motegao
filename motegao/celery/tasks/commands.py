from motegao.celery.app import celery

@celery.task()
def run_command_ping(host: str):
    import subprocess

    return subprocess.run(
        ["ping", "-c", "3", host], capture_output=True, text=True
    ).stdout.encode()

@celery.task()
def run_command_nmap(timing_template: int, host: str, options: str = "", ports: str = ""):
    import subprocess

    return subprocess.run(
        ["nmap", f"-T{timing_template}", options, ports, host], capture_output=True, text=True
    ).stdout.encode()
