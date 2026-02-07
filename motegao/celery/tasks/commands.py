from motegao.celery.app import celery

@celery.task()
def run_command_ping(host: str):
    import subprocess

    return subprocess.run(
        ["ping", "-c", "3", host], capture_output=True, text=True
    ).stdout.encode()


@celery.task()
def run_command_nmap(
    timing_template: int, host: str, options: str = "", ports: str = ""
):
    import subprocess

    return subprocess.run(
        ["nmap", f"-T{timing_template}", options, ports, host],
        capture_output=True,
        text=True,
    ).stdout.encode()

def run_command_yielder(cmd):
    from subprocess import Popen, PIPE, STDOUT

    p = Popen(
        cmd,
        stdout=PIPE,
        stderr=STDOUT,
        bufsize=1,
        text=True
    )

    for line in p.stdout:
        yield line.rstrip()

    p.wait()

@celery.task()
def run_command_subdomain_enum(domain: str, threads: int = 10, wordlist: int = 1):

    wordlist_files = {
        1: "/usr/share/wordlists/subdomains-top1million-5000.txt",
        2: "/usr/share/wordlists/subdomains-top1million-20000.txt",
        3: "/usr/share/wordlists/subdomains-top1million-110000.txt",
    }

    progress = 0.0
    wordlist_file = wordlist_files.get(wordlist, wordlist_files[1])
    results = []

    for line_output in run_command_yielder(
        ["gobuster", "dns", "-d", domain, "-w", wordlist_file, "-t", str(threads), "--no-error"]
    ):
        if "Progress" in line_output:
            progress = float(line_output.split()[-1].strip()[1:5])
        else:
            if "Found:" in line_output:
                subdomain = line_output.split()[1].strip()
                results.append(subdomain)

        run_command_subdomain_enum.backend.mark_as_started(
            run_command_subdomain_enum.request.id, progress=progress, subdomains=results
        )

    return {"subdomains": results, "progress": 100.00}


@celery.task()
def run_command_path_enum(url: str, threads: int = 10, wordlist: int = 1, exclude_status: list = None):

    if exclude_status is None or len(exclude_status) == 0:
        exclude_status = [404]

    wordlist_files = {
        1: "/usr/share/wordlists/dirb-small.txt",
        2: "/usr/share/wordlists/dirb-common.txt",
        3: "/usr/share/wordlists/dirb-big.txt",
        4: "/usr/share/wordlists/dirbuster-medium.txt",
        5: "/usr/share/wordlists/dirbuster-big.txt"
    }

    counter = 0
    wordlist_file = wordlist_files.get(wordlist, wordlist_files[1])
    results = []
    progress = 0.0

    for line_output in run_command_yielder(
        ["gobuster", "dir", "-u", url, "-w", wordlist_file, "-t", str(threads), "-b", ",".join(map(str, exclude_status)), "--no-error"]
    ):
        if "===============================================================" in line_output:
            counter += 1
    
        if counter >= 4:
            if "Error" in line_output:
                error_msg = line_output
                return {"error": error_msg}

            if "Progress" in line_output:
                print(line_output)
                progress = float(line_output.split()[-1].strip()[1:5])
            else:
                if "/" in line_output:
                    path = line_output.split()
                    results.append({"path": path[0][5:], "status_code": path[2][:-1], "size": path[4][:-1]})

        run_command_path_enum.backend.mark_as_started(
            run_command_path_enum.request.id, progress=progress, paths=results
        )

    return {"paths": results, "progress": 100.00}