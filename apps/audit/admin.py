from django.contrib import admin
from django.utils.html import format_html
from audit.models import AuditLog, AuditPurgePolicy, BackupPolicy, BackupHistory
from admin_utils import EnhancedModelAdmin, export_as_csv, export_as_json, colored_status


@admin.register(AuditLog)
class AuditLogAdmin(EnhancedModelAdmin):
    list_display = ('action_badge', 'resource_type', 'username', 'ip_display', 'severity_badge', 'security_badge', 'created_display')
    list_filter = ('action', 'severity', 'is_security_event', 'resource_type')
    search_fields = ('username', 'resource_type', 'action_description', 'ip_address')
    readonly_fields = ('id', 'created_at')
    date_hierarchy = 'created_at'
    actions = [export_as_csv, export_as_json]
    list_per_page = 50

    def action_badge(self, obj):
        a = getattr(obj, 'action', '')
        colors = {
            'CREATE': '#10b981', 'UPDATE': '#3b82f6', 'DELETE': '#ef4444',
            'LOGIN': '#8b5cf6', 'LOGOUT': '#64748b', 'VIEW': '#94a3b8',
            'EXPORT': '#f59e0b', 'IMPORT': '#22d3ee',
        }
        c = colors.get(a, '#94a3b8')
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:{}22;color:{};font-weight:700;">{}</span>',
            c, c, a or '-'
        )
    action_badge.short_description = 'Action'

    def ip_display(self, obj):
        ip = getattr(obj, 'ip_address', '')
        return format_html(
            '<span style="font-family:monospace;font-size:0.78rem;color:#94a3b8;padding:2px 6px;background:rgba(99,102,241,0.06);border-radius:4px;">{}</span>',
            ip or '-'
        )
    ip_display.short_description = 'IP'

    def severity_badge(self, obj):
        s = getattr(obj, 'severity', '')
        colors = {'LOW': '#10b981', 'MEDIUM': '#3b82f6', 'HIGH': '#f59e0b', 'CRITICAL': '#ef4444'}
        c = colors.get(s, '#94a3b8')
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:{}22;color:{};font-weight:600;">{}</span>',
            c, c, s or '-'
        )
    severity_badge.short_description = 'Severity'

    def security_badge(self, obj):
        if getattr(obj, 'is_security_event', False):
            return format_html('<span style="color:#ef4444;font-weight:700;">&#128274; Security</span>')
        return format_html('<span style="color:#64748b;">-</span>')
    security_badge.short_description = 'Security'


@admin.register(AuditPurgePolicy)
class AuditPurgePolicyAdmin(EnhancedModelAdmin):
    list_display = ('resource_type', 'retention_days', 'action_on_expiry', 'active_badge')
    list_filter = ('is_active',)
    actions = [export_as_csv]

    def active_badge(self, obj):
        return colored_status(getattr(obj, 'is_active', False))
    active_badge.short_description = 'Active'


@admin.register(BackupPolicy)
class BackupPolicyAdmin(EnhancedModelAdmin):
    list_display = ('policy_name', 'backup_type', 'schedule_cron', 'retention_days', 'active_badge')
    list_filter = ('is_active', 'backup_type')
    actions = [export_as_csv]

    def active_badge(self, obj):
        return colored_status(getattr(obj, 'is_active', False))
    active_badge.short_description = 'Active'


@admin.register(BackupHistory)
class BackupHistoryAdmin(EnhancedModelAdmin):
    list_display = ('policy', 'status_badge', 'started_at', 'completed_at', 'size_display')
    list_filter = ('status',)
    actions = [export_as_csv, export_as_json]

    def size_display(self, obj):
        size = getattr(obj, 'backup_size_bytes', 0) or 0
        if size > 1073741824:
            return format_html('<span style="color:#94a3b8;font-weight:600;">{:.1f} GB</span>', size / 1073741824)
        if size > 1048576:
            return format_html('<span style="color:#94a3b8;font-weight:600;">{:.1f} MB</span>', size / 1048576)
        if size > 1024:
            return format_html('<span style="color:#94a3b8;font-weight:600;">{:.1f} KB</span>', size / 1024)
        return format_html('<span style="color:#94a3b8;">{} B</span>', size)
    size_display.short_description = 'Size'
