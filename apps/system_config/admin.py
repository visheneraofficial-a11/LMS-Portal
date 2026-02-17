from django.contrib import admin
from django.utils.html import format_html
from system_config.models import (
    SystemSetting, FeatureFlag, MFAPolicy,
    MaintenanceWindow, FounderInfo, EnquiryForm,
    AIFeatureConfig, ClassLinkConfig, AttendanceRule,
)
from admin_utils import (
    EnhancedModelAdmin, ImportExportMixin, export_as_csv,
    export_as_json, activate_selected, deactivate_selected, colored_status,
)


# ═══════════════════════════════════════════════════════════════════
# SYSTEM SETTING
# ═══════════════════════════════════════════════════════════════════
@admin.register(SystemSetting)
class SystemSettingAdmin(EnhancedModelAdmin):
    list_display = ('setting_key', 'value_type_badge', 'category_badge', 'secret_badge', 'editable_badge')
    list_filter = ('value_type', 'category', 'is_secret')
    search_fields = ('setting_key',)
    actions = [export_as_csv]

    def value_type_badge(self, obj):
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:rgba(99,102,241,0.1);color:#a5b4fc;font-weight:600;">{}</span>',
            getattr(obj, 'value_type', '-')
        )
    value_type_badge.short_description = 'Type'

    def category_badge(self, obj):
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:rgba(139,92,246,0.1);color:#c084fc;font-weight:600;">{}</span>',
            getattr(obj, 'category', '-')
        )
    category_badge.short_description = 'Category'

    def secret_badge(self, obj):
        if getattr(obj, 'is_secret', False):
            return format_html('<span style="color:#ef4444;font-weight:700;">&#128274; Secret</span>')
        return format_html('<span style="color:#64748b;">-</span>')
    secret_badge.short_description = 'Secret'

    def editable_badge(self, obj):
        return colored_status(getattr(obj, 'is_editable', False))
    editable_badge.short_description = 'Editable'


# ═══════════════════════════════════════════════════════════════════
# FEATURE FLAG
# ═══════════════════════════════════════════════════════════════════
@admin.register(FeatureFlag)
class FeatureFlagAdmin(EnhancedModelAdmin):
    list_display = ('flag_key', 'flag_name', 'enabled_badge', 'rollout_display')
    list_filter = ('is_enabled',)
    search_fields = ('flag_key', 'flag_name')
    actions = [export_as_csv, activate_selected, deactivate_selected]

    def enabled_badge(self, obj):
        if getattr(obj, 'is_enabled', False):
            return format_html('<span style="color:#10b981;font-weight:700;">&#9679; ON</span>')
        return format_html('<span style="color:#ef4444;font-weight:600;">&#9675; OFF</span>')
    enabled_badge.short_description = 'Enabled'

    def rollout_display(self, obj):
        pct = getattr(obj, 'rollout_percentage', 0) or 0
        color = '#10b981' if pct >= 80 else '#f59e0b' if pct >= 30 else '#94a3b8'
        return format_html(
            '<div style="display:flex;align-items:center;gap:8px;">'
            '<div style="flex:1;height:6px;background:rgba(99,102,241,0.1);border-radius:3px;overflow:hidden;max-width:100px;">'
            '<div style="width:{}%;height:100%;background:{};border-radius:3px;"></div></div>'
            '<span style="font-size:0.78rem;color:{};font-weight:600;">{}%</span></div>',
            pct, color, color, pct
        )
    rollout_display.short_description = 'Rollout'


# ═══════════════════════════════════════════════════════════════════
# MFA POLICY
# ═══════════════════════════════════════════════════════════════════
@admin.register(MFAPolicy)
class MFAPolicyAdmin(EnhancedModelAdmin):
    list_display = ('mfa_type', 'mandatory_badge', 'otp_length', 'otp_expiry_seconds', 'active_badge')
    list_filter = ('is_active', 'is_mandatory')
    actions = [export_as_csv]

    def mandatory_badge(self, obj):
        if getattr(obj, 'is_mandatory', False):
            return format_html('<span style="color:#ef4444;font-weight:700;">Mandatory</span>')
        return format_html('<span style="color:#64748b;">Optional</span>')
    mandatory_badge.short_description = 'Mandatory'

    def active_badge(self, obj):
        return colored_status(getattr(obj, 'is_active', False))
    active_badge.short_description = 'Active'


# ═══════════════════════════════════════════════════════════════════
# MAINTENANCE WINDOW
# ═══════════════════════════════════════════════════════════════════
@admin.register(MaintenanceWindow)
class MaintenanceWindowAdmin(EnhancedModelAdmin):
    list_display = ('title', 'scope', 'start_time', 'end_time', 'active_badge')
    list_filter = ('is_active', 'scope')
    actions = [export_as_csv]

    def active_badge(self, obj):
        if getattr(obj, 'is_active', False):
            return format_html('<span style="color:#f59e0b;font-weight:700;">&#9888; Active</span>')
        return format_html('<span style="color:#64748b;">-</span>')
    active_badge.short_description = 'Active'


# ═══════════════════════════════════════════════════════════════════
# FOUNDER INFO
# ═══════════════════════════════════════════════════════════════════
@admin.register(FounderInfo)
class FounderInfoAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = ('name', 'member_type', 'designation', 'active_badge', 'photo_preview')
    list_filter = ('is_active', 'member_type')
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]

    def active_badge(self, obj):
        return colored_status(getattr(obj, 'is_active', False))
    active_badge.short_description = 'Active'

    def photo_preview(self, obj):
        url = getattr(obj, 'photo_url', None)
        if url:
            return format_html(
                '<img src="{}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid rgba(99,102,241,0.2);">',
                url
            )
        return '-'
    photo_preview.short_description = 'Photo'


# ═══════════════════════════════════════════════════════════════════
# ENQUIRY FORM
# ═══════════════════════════════════════════════════════════════════
@admin.register(EnquiryForm)
class EnquiryFormAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = ('name', 'email', 'phone', 'source_badge', 'status_badge', 'created_display')
    list_filter = ('status', 'source')
    search_fields = ('name', 'email', 'phone')
    date_hierarchy = 'created_at'
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]

    def source_badge(self, obj):
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:rgba(99,102,241,0.1);color:#a5b4fc;font-weight:600;">{}</span>',
            getattr(obj, 'source', '-')
        )
    source_badge.short_description = 'Source'


# ═══════════════════════════════════════════════════════════════════
# AI FEATURE CONFIG — NEW
# ═══════════════════════════════════════════════════════════════════
@admin.register(AIFeatureConfig)
class AIFeatureConfigAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = (
        'feature_icon', 'feature_name', 'category_badge', 'scope_badge',
        'enabled_toggle_badge', 'provider_badge', 'rate_info', 'updated_display',
    )
    list_filter = ('is_enabled', 'category', 'integration_scope', 'provider')
    search_fields = ('feature_key', 'feature_name', 'description')
    list_editable = ()
    actions = [export_as_csv, export_as_json, 'enable_features', 'disable_features']
    ordering = ['sort_order', 'feature_name']

    fieldsets = (
        ('Feature Identity', {
            'fields': ('tenant', 'feature_key', 'feature_name', 'description', 'icon_class', 'sort_order'),
        }),
        ('Control', {
            'fields': ('is_enabled', 'category', 'integration_scope'),
        }),
        ('Provider & API', {
            'fields': ('provider', 'api_endpoint', 'api_key_reference'),
            'classes': ('collapse',),
        }),
        ('Rate Limits', {
            'fields': ('max_requests_per_hour', 'max_requests_per_user'),
            'classes': ('collapse',),
        }),
        ('Advanced', {
            'fields': ('config_json',),
            'classes': ('collapse',),
        }),
    )

    def feature_icon(self, obj):
        icon = getattr(obj, 'icon_class', 'fas fa-brain')
        return format_html(
            '<div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#6366f1,#8b5cf6);'
            'display:flex;align-items:center;justify-content:center;">'
            '<i class="{}" style="color:#fff;font-size:0.8rem;"></i></div>',
            icon
        )
    feature_icon.short_description = ''

    def category_badge(self, obj):
        colors = {
            'CONTENT': ('#8b5cf6', 'rgba(139,92,246,0.12)'),
            'ANALYTICS': ('#3b82f6', 'rgba(59,130,246,0.12)'),
            'ASSESSMENT': ('#f59e0b', 'rgba(245,158,11,0.12)'),
            'COMMUNICATION': ('#10b981', 'rgba(16,185,129,0.12)'),
            'AUTOMATION': ('#22d3ee', 'rgba(34,211,238,0.12)'),
        }
        cat = getattr(obj, 'category', '')
        fg, bg = colors.get(cat, ('#94a3b8', 'rgba(148,163,184,0.12)'))
        return format_html(
            '<span style="padding:3px 10px;border-radius:6px;font-size:0.72rem;font-weight:600;color:{};background:{};">{}</span>',
            fg, bg, cat.replace('_', ' ').title() if cat else '-'
        )
    category_badge.short_description = 'Category'

    def scope_badge(self, obj):
        scope = getattr(obj, 'integration_scope', '')
        scope_colors = {
            'ADMIN': ('rgba(245,158,11,0.15)', '#fbbf24'),
            'TEACHER': ('rgba(16,185,129,0.15)', '#34d399'),
            'STUDENT': ('rgba(59,130,246,0.15)', '#60a5fa'),
            'ALL': ('rgba(139,92,246,0.15)', '#c084fc'),
        }
        bg, fg = scope_colors.get(scope, ('rgba(148,163,184,0.12)', '#94a3b8'))
        return format_html(
            '<span style="padding:3px 10px;border-radius:6px;font-size:0.72rem;font-weight:700;color:{};background:{};">{}</span>',
            fg, bg, scope
        )
    scope_badge.short_description = 'Scope'

    def enabled_toggle_badge(self, obj):
        if getattr(obj, 'is_enabled', False):
            return format_html(
                '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;'
                'font-size:0.75rem;font-weight:700;background:rgba(16,185,129,0.12);color:#34d399;'
                'border:1px solid rgba(16,185,129,0.2);"><span style="width:6px;height:6px;border-radius:50%;background:#34d399;"></span>Enabled</span>'
            )
        return format_html(
            '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;'
            'font-size:0.75rem;font-weight:700;background:rgba(239,68,68,0.12);color:#f87171;'
            'border:1px solid rgba(239,68,68,0.2);"><span style="width:6px;height:6px;border-radius:50%;background:#f87171;"></span>Disabled</span>'
        )
    enabled_toggle_badge.short_description = 'Status'

    def provider_badge(self, obj):
        p = getattr(obj, 'provider', None)
        if not p:
            return format_html('<span style="color:#64748b;">—</span>')
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:rgba(99,102,241,0.1);'
            'color:#a5b4fc;font-weight:600;font-family:monospace;">{}</span>',
            p
        )
    provider_badge.short_description = 'Provider'

    def rate_info(self, obj):
        return format_html(
            '<span style="color:#94a3b8;font-size:0.78rem;">{}/hr · {}/user</span>',
            getattr(obj, 'max_requests_per_hour', 0),
            getattr(obj, 'max_requests_per_user', 0),
        )
    rate_info.short_description = 'Rate Limit'

    @admin.action(description="✅ Enable selected features")
    def enable_features(self, request, queryset):
        count = queryset.update(is_enabled=True)
        self.message_user(request, f"Enabled {count} AI feature(s).")

    @admin.action(description="🚫 Disable selected features")
    def disable_features(self, request, queryset):
        count = queryset.update(is_enabled=False)
        self.message_user(request, f"Disabled {count} AI feature(s).")


# ═══════════════════════════════════════════════════════════════════
# CLASS LINK CONFIG — NEW
# ═══════════════════════════════════════════════════════════════════
@admin.register(ClassLinkConfig)
class ClassLinkConfigAdmin(EnhancedModelAdmin):
    list_display = (
        'platform_badge', 'tenant', 'active_badge', 'default_badge',
        'auto_gen_badge', 'gen_before', 'duration_display', 'updated_display',
    )
    list_filter = ('platform', 'is_active', 'is_default', 'auto_generate_link')
    search_fields = ('tenant__name',)
    actions = [export_as_csv, activate_selected, deactivate_selected]

    fieldsets = (
        ('Platform', {
            'fields': ('tenant', 'platform', 'is_active', 'is_default'),
        }),
        ('API Configuration', {
            'fields': ('api_endpoint', 'api_key_reference', 'client_id', 'client_secret_reference', 'oauth_token_reference'),
            'classes': ('collapse',),
        }),
        ('Auto-Generation', {
            'fields': ('auto_generate_link', 'generate_minutes_before', 'default_duration_minutes', 'auto_record', 'auto_admit_participants'),
        }),
        ('Webhook & Advanced', {
            'fields': ('webhook_url', 'config_json'),
            'classes': ('collapse',),
        }),
    )

    def platform_badge(self, obj):
        icons = {
            'YOUTUBE': ('fab fa-youtube', '#ef4444'),
            'ZOOM': ('fas fa-video', '#2d8cff'),
            'GOOGLE_MEET': ('fas fa-video', '#10b981'),
            'MS_TEAMS': ('fas fa-users', '#6264a7'),
            'CUSTOM': ('fas fa-link', '#94a3b8'),
        }
        plat = getattr(obj, 'platform', '')
        icon, color = icons.get(plat, ('fas fa-link', '#94a3b8'))
        return format_html(
            '<span style="display:inline-flex;align-items:center;gap:6px;"><i class="{}" style="color:{};"></i> {}</span>',
            icon, color, obj.get_platform_display() if hasattr(obj, 'get_platform_display') else plat
        )
    platform_badge.short_description = 'Platform'

    def active_badge(self, obj):
        return colored_status(getattr(obj, 'is_active', False))
    active_badge.short_description = 'Active'

    def default_badge(self, obj):
        if getattr(obj, 'is_default', False):
            return format_html('<span style="color:#f59e0b;font-weight:700;">★ Default</span>')
        return format_html('<span style="color:#64748b;">—</span>')
    default_badge.short_description = 'Default'

    def auto_gen_badge(self, obj):
        if getattr(obj, 'auto_generate_link', False):
            return format_html('<span style="color:#10b981;font-weight:600;">⚡ Auto</span>')
        return format_html('<span style="color:#64748b;">Manual</span>')
    auto_gen_badge.short_description = 'Link Gen'

    def gen_before(self, obj):
        mins = getattr(obj, 'generate_minutes_before', 15)
        return format_html('<span style="color:#94a3b8;font-size:0.82rem;">{}m before</span>', mins)
    gen_before.short_description = 'Generate'

    def duration_display(self, obj):
        dur = getattr(obj, 'default_duration_minutes', 60)
        return format_html('<span style="color:#94a3b8;font-size:0.82rem;">{}min</span>', dur)
    duration_display.short_description = 'Duration'


# ═══════════════════════════════════════════════════════════════════
# ATTENDANCE RULE — NEW
# ═══════════════════════════════════════════════════════════════════
@admin.register(AttendanceRule)
class AttendanceRuleAdmin(EnhancedModelAdmin):
    list_display = (
        'rule_name', 'applies_to_badge', 'grace_display', 'late_display',
        'min_watch_pct', 'auto_live_badge', 'teacher_self_badge', 'active_badge',
    )
    list_filter = ('is_active', 'applies_to', 'auto_mark_from_live_class', 'teacher_self_attendance_required')
    search_fields = ('rule_name',)
    actions = [export_as_csv, activate_selected, deactivate_selected]

    fieldsets = (
        ('Rule Identity', {
            'fields': ('tenant', 'rule_name', 'description', 'applies_to', 'is_active'),
        }),
        ('Timing Rules', {
            'fields': ('class_start_grace_minutes', 'late_threshold_minutes', 'absent_threshold_minutes', 'min_watch_percentage'),
        }),
        ('Auto-Attendance Sources', {
            'fields': ('auto_mark_from_live_class', 'auto_mark_from_biometric', 'auto_mark_from_geofence'),
        }),
        ('Notifications', {
            'fields': ('notify_absent_student', 'notify_parent_on_absent', 'notify_admin_below_threshold', 'threshold_alert_percentage'),
            'classes': ('collapse',),
        }),
        ('Teacher Attendance', {
            'fields': ('teacher_self_attendance_required', 'teacher_attendance_auto_from_class'),
        }),
    )

    def applies_to_badge(self, obj):
        scope = getattr(obj, 'applies_to', '')
        colors = {'STUDENT': '#60a5fa', 'TEACHER': '#34d399', 'ALL': '#c084fc'}
        c = colors.get(scope, '#94a3b8')
        return format_html(
            '<span style="padding:3px 10px;border-radius:6px;font-size:0.72rem;font-weight:700;color:{};background:{}22;">{}</span>',
            c, c, scope
        )
    applies_to_badge.short_description = 'Applies To'

    def grace_display(self, obj):
        return format_html('<span style="color:#10b981;font-size:0.82rem;">{}min</span>', getattr(obj, 'class_start_grace_minutes', 10))
    grace_display.short_description = 'Grace'

    def late_display(self, obj):
        return format_html('<span style="color:#f59e0b;font-size:0.82rem;">{}min</span>', getattr(obj, 'late_threshold_minutes', 15))
    late_display.short_description = 'Late After'

    def min_watch_pct(self, obj):
        pct = getattr(obj, 'min_watch_percentage', 75)
        return format_html('<span style="color:#94a3b8;font-size:0.82rem;">{}%</span>', pct)
    min_watch_pct.short_description = 'Min Watch'

    def auto_live_badge(self, obj):
        if getattr(obj, 'auto_mark_from_live_class', False):
            return format_html('<span style="color:#10b981;font-weight:600;">⚡ Auto</span>')
        return format_html('<span style="color:#64748b;">Manual</span>')
    auto_live_badge.short_description = 'Live Class'

    def teacher_self_badge(self, obj):
        if getattr(obj, 'teacher_self_attendance_required', False):
            return format_html('<span style="color:#f59e0b;font-weight:600;">Required</span>')
        return format_html('<span style="color:#64748b;">Optional</span>')
    teacher_self_badge.short_description = 'Teacher Self'

    def active_badge(self, obj):
        return colored_status(getattr(obj, 'is_active', False))
    active_badge.short_description = 'Active'
