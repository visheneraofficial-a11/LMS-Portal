from django.contrib import admin
from django.utils.html import format_html
from sessions_tracking.models import UserDevice, UserSession, LoginHistory, UserActivity
from admin_utils import EnhancedModelAdmin, export_as_csv, export_as_json, colored_status


@admin.register(UserDevice)
class UserDeviceAdmin(EnhancedModelAdmin):
    list_display = ('device_name', 'device_type_badge', 'user_id_short', 'trusted_badge', 'blocked_badge', 'last_seen')
    list_filter = ('device_type', 'is_trusted', 'is_blocked')
    search_fields = ('device_name', 'user_id')
    actions = [export_as_csv, export_as_json]

    def device_type_badge(self, obj):
        dt = getattr(obj, 'device_type', '')
        icons = {'DESKTOP': 'fa-desktop', 'MOBILE': 'fa-mobile-alt', 'TABLET': 'fa-tablet-alt', 'BROWSER': 'fa-globe'}
        icon = icons.get(dt, 'fa-question')
        return format_html(
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:2px 8px;border-radius:5px;font-size:0.72rem;background:rgba(99,102,241,0.1);color:#a5b4fc;font-weight:600;">'
            '<i class="fas {}"></i> {}</span>', icon, dt or '-'
        )
    device_type_badge.short_description = 'Device Type'

    def user_id_short(self, obj):
        uid = str(getattr(obj, 'user_id', ''))
        return format_html('<span style="font-family:monospace;font-size:0.78rem;color:#94a3b8;" title="{}">{}</span>', uid, uid[:8])
    user_id_short.short_description = 'User'

    def trusted_badge(self, obj):
        return colored_status(getattr(obj, 'is_trusted', False))
    trusted_badge.short_description = 'Trusted'

    def blocked_badge(self, obj):
        if getattr(obj, 'is_blocked', False):
            return format_html('<span style="color:#ef4444;font-weight:700;">BLOCKED</span>')
        return format_html('<span style="color:#64748b;">-</span>')
    blocked_badge.short_description = 'Blocked'


@admin.register(UserSession)
class UserSessionAdmin(EnhancedModelAdmin):
    list_display = ('user_id_short', 'user_type', 'status_badge', 'ip_display', 'started_at', 'last_activity_at', 'duration_display')
    list_filter = ('status', 'user_type')
    search_fields = ('user_id', 'ip_address')
    actions = [export_as_csv, export_as_json]
    list_per_page = 50

    def user_id_short(self, obj):
        uid = str(getattr(obj, 'user_id', ''))
        return format_html('<span style="font-family:monospace;font-size:0.78rem;color:#94a3b8;" title="{}">{}</span>', uid, uid[:8])
    user_id_short.short_description = 'User'

    def ip_display(self, obj):
        ip = getattr(obj, 'ip_address', '')
        return format_html(
            '<span style="font-family:monospace;font-size:0.78rem;color:#94a3b8;padding:2px 6px;background:rgba(99,102,241,0.06);border-radius:4px;">{}</span>',
            ip or '-'
        )
    ip_display.short_description = 'IP Address'

    def duration_display(self, obj):
        start = getattr(obj, 'started_at', None)
        last = getattr(obj, 'last_activity_at', None)
        if start and last:
            delta = last - start
            hours, remainder = divmod(int(delta.total_seconds()), 3600)
            minutes, _ = divmod(remainder, 60)
            if hours > 0:
                return format_html('<span style="color:#94a3b8;">{}h {}m</span>', hours, minutes)
            return format_html('<span style="color:#94a3b8;">{}m</span>', minutes)
        return '-'
    duration_display.short_description = 'Duration'


@admin.register(LoginHistory)
class LoginHistoryAdmin(EnhancedModelAdmin):
    list_display = ('username_attempted', 'user_type', 'result_badge', 'ip_display', 'attempted_at', 'suspicious_badge')
    list_filter = ('result', 'is_suspicious', 'user_type')
    search_fields = ('username_attempted', 'ip_address')
    date_hierarchy = 'attempted_at'
    actions = [export_as_csv, export_as_json]
    list_per_page = 50

    def result_badge(self, obj):
        r = getattr(obj, 'result', '')
        colors = {'SUCCESS': '#10b981', 'FAILED': '#ef4444', 'BLOCKED': '#f59e0b', 'LOCKED': '#8b5cf6'}
        c = colors.get(r, '#94a3b8')
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:{}22;color:{};font-weight:600;">{}</span>',
            c, c, r or '-'
        )
    result_badge.short_description = 'Result'

    def ip_display(self, obj):
        ip = getattr(obj, 'ip_address', '')
        return format_html(
            '<span style="font-family:monospace;font-size:0.78rem;color:#94a3b8;padding:2px 6px;background:rgba(99,102,241,0.06);border-radius:4px;">{}</span>',
            ip or '-'
        )
    ip_display.short_description = 'IP Address'

    def suspicious_badge(self, obj):
        if getattr(obj, 'is_suspicious', False):
            return format_html('<span style="color:#ef4444;font-weight:700;">&#9888; Suspicious</span>')
        return format_html('<span style="color:#64748b;">-</span>')
    suspicious_badge.short_description = 'Suspicious'


@admin.register(UserActivity)
class UserActivityAdmin(EnhancedModelAdmin):
    list_display = ('user_id_short', 'activity_type_badge', 'resource_type', 'occurred_at')
    list_filter = ('activity_type',)
    search_fields = ('user_id',)
    actions = [export_as_csv, export_as_json]

    def user_id_short(self, obj):
        uid = str(getattr(obj, 'user_id', ''))
        return format_html('<span style="font-family:monospace;font-size:0.78rem;color:#94a3b8;" title="{}">{}</span>', uid, uid[:8])
    user_id_short.short_description = 'User'

    def activity_type_badge(self, obj):
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:rgba(99,102,241,0.1);color:#a5b4fc;font-weight:600;">{}</span>',
            getattr(obj, 'activity_type', '-')
        )
    activity_type_badge.short_description = 'Activity'
