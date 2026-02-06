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

@celery.task()
def run_command_subdomain_enum(domain: str, threads: int = 10, wordlist: int = 1):

    wordlist_files = {
        1: "/usr/share/wordlists/subdomains-top1million-5000.txt",
        2: "/usr/share/wordlists/subdomains-top1million-20000.txt",
        3: "/usr/share/wordlists/subdomains-top1million-110000.txt"
    }

    wordlist_file = wordlist_files.get(wordlist, wordlist_files[1])
    results = []

    for progress in run_command_subdomain_enum_yielder(["gobuster", "dns", "-d", domain, "-w", wordlist_file, "-t", str(threads)]):        
        if "Found:" in progress:
            subdomain = progress.split()[1].strip()
            results.append(subdomain)

        run_command_subdomain_enum.backend.mark_as_started(
            run_command_subdomain_enum.request.id,
            subdomains=results)
    
    return {"subdomains": results}


def run_command_subdomain_enum_yielder(cmd):
    from subprocess import Popen, PIPE

    p = Popen(
        cmd,
        stdin=PIPE,
        stdout=PIPE,
        stderr=PIPE,
        bufsize=1,
        text=True
    )

    for line in p.stdout:
        yield line.rstrip()

    p.wait()