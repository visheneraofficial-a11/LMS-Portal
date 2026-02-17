from django.contrib import admin
from django.utils.html import format_html
from classes.models import YouTubeChannel, ScheduledClass, ClassAccessToken, ClassWatchTime
from admin_utils import EnhancedModelAdmin, ImportExportMixin, export_as_csv, export_as_json, activate_selected, deactivate_selected, colored_status


@admin.register(YouTubeChannel)
class YouTubeChannelAdmin(EnhancedModelAdmin):
    list_display = ('channel_name', 'channel_id_short', 'status_badge', 'verification_badge', 'primary_badge')
    list_filter = ('status', 'verification_status', 'primary_channel')
    search_fields = ('channel_name', 'channel_id')
    actions = [export_as_csv, activate_selected, deactivate_selected]

    def channel_id_short(self, obj):
        cid = str(getattr(obj, 'channel_id', ''))
        return format_html(
            '<span style="font-family:monospace;font-size:0.78rem;color:#94a3b8;" title="{}">{}</span>',
            cid, cid[:16] + '...' if len(cid) > 16 else cid
        )
    channel_id_short.short_description = 'Channel ID'

    def verification_badge(self, obj):
        v = getattr(obj, 'verification_status', '')
        if v == 'VERIFIED':
            return format_html('<span style="color:#10b981;font-weight:700;">&#10003; Verified</span>')
        return format_html('<span style="color:#f59e0b;">{}</span>', v or 'Pending')
    verification_badge.short_description = 'Verified'

    def primary_badge(self, obj):
        if getattr(obj, 'primary_channel', False):
            return format_html('<span style="color:#f59e0b;font-weight:700;">&#9733;</span>')
        return '-'
    primary_badge.short_description = 'Primary'


@admin.register(ScheduledClass)
class ScheduledClassAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = (
        'class_code', 'title', 'subject', 'scheduled_date',
        'time_display', 'teacher', 'status_badge', 'live_link',
    )
    list_filter = ('status', 'subject', 'scheduled_date')
    search_fields = ('class_code', 'title', 'teacher__first_name', 'teacher__last_name')
    date_hierarchy = 'scheduled_date'
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]

    def time_display(self, obj):
        st = getattr(obj, 'start_time', None)
        et = getattr(obj, 'end_time', None)
        if st:
            parts = str(st)
            if et:
                parts += f' - {et}'
            return format_html('<span style="color:#94a3b8;font-size:0.82rem;">{}</span>', parts)
        return '-'
    time_display.short_description = 'Time'

    def live_link(self, obj):
        url = getattr(obj, 'youtube_live_url', None) or getattr(obj, 'live_url', None)
        if url:
            return format_html(
                '<a href="{}" target="_blank" style="color:#ef4444;text-decoration:none;font-weight:600;">'
                '<i class="fab fa-youtube"></i> Live</a>', url
            )
        return format_html('<span style="color:#64748b;">-</span>')
    live_link.short_description = 'Live'


@admin.register(ClassAccessToken)
class ClassAccessTokenAdmin(EnhancedModelAdmin):
    list_display = ('scheduled_class', 'student', 'used_badge', 'revoked_badge', 'expires_at')
    list_filter = ('used', 'revoked')
    actions = [export_as_csv]

    def used_badge(self, obj):
        return colored_status(obj.used)
    used_badge.short_description = 'Used'

    def revoked_badge(self, obj):
        if obj.revoked:
            return format_html('<span style="color:#ef4444;font-weight:600;">Revoked</span>')
        return format_html('<span style="color:#64748b;">-</span>')
    revoked_badge.short_description = 'Revoked'


@admin.register(ClassWatchTime)
class ClassWatchTimeAdmin(EnhancedModelAdmin):
    list_display = ('scheduled_class', 'student', 'watch_time_display', 'completion_badge', 'live_badge')
    list_filter = ('completion_status', 'is_live_watch')
    actions = [export_as_csv, export_as_json]

    def watch_time_display(self, obj):
        secs = getattr(obj, 'total_watch_seconds', 0) or 0
        mins = secs // 60
        remaining = secs % 60
        return format_html('<span style="font-weight:600;color:#e2e8f0;">{}m {}s</span>', mins, remaining)
    watch_time_display.short_description = 'Watch Time'

    def completion_badge(self, obj):
        s = getattr(obj, 'completion_status', '')
        if s:
            return colored_status(s)
        return '-'
    completion_badge.short_description = 'Completion'

    def live_badge(self, obj):
        if getattr(obj, 'is_live_watch', False):
            return format_html('<span style="color:#ef4444;font-weight:600;">&#9679; LIVE</span>')
        return format_html('<span style="color:#64748b;">VOD</span>')
    live_badge.short_description = 'Type'
