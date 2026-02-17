# =============================================================================
# LMS Enterprise - Gunicorn Configuration
# /u01/app/django/config/gunicorn.conf.py
# =============================================================================
import multiprocessing

# Server socket
bind = "unix:/u01/app/django/run/gunicorn.sock"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gthread"
threads = 4
worker_connections = 1000
max_requests = 5000
max_requests_jitter = 500
timeout = 120
graceful_timeout = 30
keepalive = 5

# Server mechanics
daemon = False
pidfile = "/u01/app/django/run/gunicorn.pid"
user = "lmsapp"
group = "lmsapp"
umask = 0o022

# Logging
accesslog = "/u01/app/django/logs/gunicorn-access.log"
errorlog = "/u01/app/django/logs/gunicorn-error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "lms_enterprise"

# Preload
preload_app = True

# SSL (if terminating at Gunicorn)
# keyfile = "/u01/app/django/config/ssl/privkey.pem"
# certfile = "/u01/app/django/config/ssl/fullchain.pem"

# Hooks
def on_starting(server):
    pass

def post_fork(server, worker):
    server.log.info("Worker spawned (pid: %s)", worker.pid)

def pre_exec(server):
    server.log.info("Forked child, re-executing.")

def when_ready(server):
    server.log.info("Server is ready. Spawning workers")
