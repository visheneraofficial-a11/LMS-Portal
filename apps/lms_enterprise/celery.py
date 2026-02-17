# =============================================================================
# LMS Enterprise - Celery Configuration
# /u01/app/django/apps/lms_enterprise/celery.py
# =============================================================================
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lms_enterprise.settings.production')

app = Celery('lms_enterprise')

app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all installed apps
app.autodiscover_tasks()

# Periodic tasks (Celery Beat)
app.conf.beat_schedule = {
    # Purge expired sessions every hour
    'purge-expired-sessions': {
        'task': 'sessions_tracking.tasks.purge_expired_sessions',
        'schedule': 3600.0,
    },
    # Calculate attendance summaries daily at 11:30 PM
    'calculate-attendance-summaries': {
        'task': 'attendance.tasks.calculate_daily_summaries',
        'schedule': {
            'hour': 23,
            'minute': 30,
        },
    },
    # Reset YouTube quota counters daily
    'reset-youtube-quota': {
        'task': 'classes.tasks.reset_youtube_quota',
        'schedule': {
            'hour': 0,
            'minute': 5,
        },
    },
    # Run audit purge weekly (Sunday 3 AM)
    'audit-purge': {
        'task': 'audit.tasks.run_purge_policies',
        'schedule': {
            'hour': 3,
            'minute': 0,
            'day_of_week': 0,
        },
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
