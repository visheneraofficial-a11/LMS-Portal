from django.apps import AppConfig


class SessionsTrackingConfig(AppConfig):
    default_auto_field = 'django.db.models.UUIDField'
    name = 'sessions_tracking'
    verbose_name = 'Session & Activity Tracking'
