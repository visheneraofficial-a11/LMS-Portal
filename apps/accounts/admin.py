from django.contrib import admin
from django.utils.html import format_html
from accounts.models import (
    Student, Teacher, Admin as AdminUser, Parent,
    Role, Permission, RolePermission, ParentStudent,
)
from admin_utils import (
    EnhancedModelAdmin, ImportExportMixin, export_as_csv,
    export_as_json, activate_selected, deactivate_selected,
    suspend_selected, colored_status,
)


# ═══════════════════════════════════════════════════════════════════
# STUDENT
# ═══════════════════════════════════════════════════════════════════
@admin.register(Student)
class StudentAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = (
        'student_code', 'full_name_display', 'email', 'phone',
        'student_class', 'exam_target', 'stream',
        'fee_status_badge', 'status_badge', 'created_display',
    )
    list_filter = ('status', 'student_class', 'exam_target', 'stream', 'fee_status', 'gender', 'email_verified')
    search_fields = ('student_code', 'first_name', 'last_name', 'email', 'phone', 'parent_name')
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_login_at', 'last_activity_at')
    list_per_page = 30
    date_hierarchy = 'created_at'
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected, suspend_selected]

    fieldsets = (
        ('Identity', {
            'fields': ('id', 'tenant', 'student_code', 'enrollment_number', 'first_name', 'last_name', 'display_name', 'email', 'phone', 'avatar_url'),
        }),
        ('Academic', {
            'fields': ('student_class', 'exam_target', 'stream', 'medium', 'board', 'school_name', 'batch'),
        }),
        ('Fee & Financial', {
            'fields': ('fee_status', 'subscription_type', 'subscription_start', 'subscription_end'),
            'classes': ('collapse',),
        }),
        ('Parents / Guardian', {
            'fields': ('parent_name', 'parent_relation', 'parent_phone', 'parent_email', 'parent_occupation', 'alternate_contact'),
            'classes': ('collapse',),
        }),
        ('Personal', {
            'fields': ('date_of_birth', 'gender', 'blood_group', 'aadhaar_last_four'),
            'classes': ('collapse',),
        }),
        ('Address', {
            'fields': ('address_line_1', 'address_line_2', 'city', 'district', 'state', 'pin_code', 'country'),
            'classes': ('collapse',),
        }),
        ('Security & Auth', {
            'fields': ('password_hash', 'mfa_enabled', 'mfa_method', 'force_password_change', 'email_verified', 'phone_verified'),
            'classes': ('collapse',),
        }),
        ('Communication', {
            'fields': ('preferred_language', 'notification_email', 'notification_sms', 'notification_push', 'notification_whatsapp'),
            'classes': ('collapse',),
        }),
        ('Status & Timestamps', {
            'fields': ('status', 'status_reason', 'admission_date', 'admission_source', 'created_at', 'updated_at', 'last_login_at', 'last_activity_at'),
        }),
    )

    def full_name_display(self, obj):
        avatar = obj.avatar_url or ''
        initials = f"{obj.first_name[0]}{obj.last_name[0]}" if obj.first_name and obj.last_name else '?'
        if avatar:
            return format_html(
                '<div style="display:flex;align-items:center;gap:8px;">'
                '<img src="{}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">'
                '<span style="font-weight:600;color:#e2e8f0;">{} {}</span></div>',
                avatar, obj.first_name, obj.last_name
            )
        return format_html(
            '<div style="display:flex;align-items:center;gap:8px;">'
            '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);'
            'display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:#fff;font-weight:700;">{}</div>'
            '<span style="font-weight:600;color:#e2e8f0;">{} {}</span></div>',
            initials, obj.first_name, obj.last_name
        )
    full_name_display.short_description = 'Name'
    full_name_display.admin_order_field = 'first_name'

    def fee_status_badge(self, obj):
        status = getattr(obj, 'fee_status', None)
        if status:
            return colored_status(status)
        return '-'
    fee_status_badge.short_description = 'Fee Status'


# ═══════════════════════════════════════════════════════════════════
# TEACHER
# ═══════════════════════════════════════════════════════════════════
@admin.register(Teacher)
class TeacherAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = (
        'teacher_code', 'full_name_display', 'email', 'phone',
        'employment_type', 'department',
        'youtube_verified_badge', 'status_badge', 'created_display',
    )
    list_filter = ('status', 'employment_type', 'youtube_channel_verified', 'email_verified', 'can_create_streams')
    search_fields = ('teacher_code', 'first_name', 'last_name', 'email', 'phone')
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_login_at')
    date_hierarchy = 'created_at'
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected, suspend_selected]

    fieldsets = (
        ('Identity', {
            'fields': ('id', 'tenant', 'teacher_code', 'employee_id', 'first_name', 'last_name', 'display_name', 'email', 'phone'),
        }),
        ('Professional', {
            'fields': ('employment_type', 'department', 'designation', 'subjects', 'specialization', 'qualification', 'highest_degree', 'experience_years', 'experience_details', 'certifications'),
        }),
        ('YouTube', {
            'fields': ('personal_youtube_channel_id', 'youtube_channel_verified', 'can_create_streams'),
            'classes': ('collapse',),
        }),
        ('Permissions', {
            'fields': ('can_edit_student_profile', 'can_override_attendance', 'can_override_scores', 'max_batches_allowed'),
            'classes': ('collapse',),
        }),
        ('Contact', {
            'fields': ('personal_email', 'personal_phone', 'emergency_contact', 'address', 'teacher_city', 'teacher_state'),
            'classes': ('collapse',),
        }),
        ('Security', {
            'fields': ('password_hash', 'mfa_enabled', 'status', 'email_verified'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_login_at'),
        }),
    )

    def full_name_display(self, obj):
        initials = f"{obj.first_name[0]}{obj.last_name[0]}" if obj.first_name and obj.last_name else '?'
        return format_html(
            '<div style="display:flex;align-items:center;gap:8px;">'
            '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);'
            'display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:#fff;font-weight:700;">{}</div>'
            '<span style="font-weight:600;color:#e2e8f0;">{} {}</span></div>',
            initials, obj.first_name, obj.last_name
        )
    full_name_display.short_description = 'Name'
    full_name_display.admin_order_field = 'first_name'

    def youtube_verified_badge(self, obj):
        if getattr(obj, 'youtube_channel_verified', False):
            return format_html(
                '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:5px;'
                'font-size:0.72rem;color:#ef4444;background:rgba(239,68,68,0.12);font-weight:600;">'
                '<i class="fab fa-youtube"></i> Verified</span>'
            )
        return format_html('<span style="color:#475569;">—</span>')
    youtube_verified_badge.short_description = 'YouTube'


# ═══════════════════════════════════════════════════════════════════
# ADMIN USER
# ═══════════════════════════════════════════════════════════════════
@admin.register(AdminUser)
class AdminUserAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = (
        'admin_code', 'full_name_display', 'email', 'admin_type_badge',
        'role_display', 'status_badge', 'created_display',
    )
    list_filter = ('status', 'admin_type', 'role')
    search_fields = ('admin_code', 'first_name', 'last_name', 'email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]

    fieldsets = (
        ('Identity', {
            'fields': ('id', 'tenant', 'admin_code', 'first_name', 'last_name', 'display_name', 'email', 'phone'),
        }),
        ('Role & Access Control', {
            'fields': ('admin_type', 'role', 'permissions_override', 'managed_branches'),
            'description': 'Assigning a role automatically inherits all permissions associated with that role.',
        }),
        ('Security', {
            'fields': ('password_hash', 'mfa_enabled', 'require_ip_whitelist', 'allowed_ips', 'session_timeout_minutes'),
            'classes': ('collapse',),
        }),
        ('Preferences', {
            'fields': ('theme', 'accent_color', 'admin_timezone', 'time_format'),
            'classes': ('collapse',),
        }),
        ('Status', {
            'fields': ('status', 'status_reason', 'failed_login_count', 'locked_until', 'created_at', 'updated_at'),
        }),
    )

    def full_name_display(self, obj):
        initials = f"{obj.first_name[0]}{obj.last_name[0]}" if obj.first_name and obj.last_name else '?'
        return format_html(
            '<div style="display:flex;align-items:center;gap:8px;">'
            '<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);'
            'display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:#fff;font-weight:700;">{}</div>'
            '<span style="font-weight:600;color:#e2e8f0;">{} {}</span></div>',
            initials, obj.first_name, obj.last_name
        )
    full_name_display.short_description = 'Name'

    def admin_type_badge(self, obj):
        at = getattr(obj, 'admin_type', '')
        type_colors = {
            'SUPER_ADMIN': ('#ef4444', 'rgba(239,68,68,0.12)'),
            'TENANT_ADMIN': ('#f59e0b', 'rgba(245,158,11,0.12)'),
            'BRANCH_ADMIN': ('#3b82f6', 'rgba(59,130,246,0.12)'),
            'ACADEMIC_ADMIN': ('#10b981', 'rgba(16,185,129,0.12)'),
            'FINANCE_ADMIN': ('#8b5cf6', 'rgba(139,92,246,0.12)'),
            'SUPPORT_ADMIN': ('#22d3ee', 'rgba(34,211,238,0.12)'),
        }
        fg, bg = type_colors.get(at, ('#94a3b8', 'rgba(148,163,184,0.12)'))
        return format_html(
            '<span style="padding:3px 10px;border-radius:6px;font-size:0.72rem;font-weight:700;color:{};background:{};">{}</span>',
            fg, bg, at.replace('_', ' ').title() if at else '-'
        )
    admin_type_badge.short_description = 'Type'

    def role_display(self, obj):
        role = getattr(obj, 'role', None)
        if role:
            return format_html(
                '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:6px;'
                'font-size:0.72rem;font-weight:600;color:#a5b4fc;background:rgba(99,102,241,0.1);">'
                '<i class="fas fa-shield-alt" style="font-size:0.65rem;"></i> {}</span>',
                role.name
            )
        return format_html('<span style="color:#475569;">No Role</span>')
    role_display.short_description = 'Role'


# ═══════════════════════════════════════════════════════════════════
# PARENT
# ═══════════════════════════════════════════════════════════════════
@admin.register(Parent)
class ParentAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = ('parent_code', 'first_name', 'last_name', 'email', 'relationship', 'status_badge')
    list_filter = ('status', 'relationship')
    search_fields = ('parent_code', 'first_name', 'last_name', 'email')
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]


# ═══════════════════════════════════════════════════════════════════
# ROLE — with RBAC inheritance
# ═══════════════════════════════════════════════════════════════════
class RolePermissionInline(admin.TabularInline):
    model = RolePermission
    extra = 1
    raw_id_fields = ('permission',)
    verbose_name = 'Permission'
    verbose_name_plural = 'Permissions (auto-inherited when role is assigned)'


@admin.register(Role)
class RoleAdmin(EnhancedModelAdmin):
    list_display = (
        'code', 'name', 'type_badge', 'applies_to_badge', 'level_display',
        'parent_role_display', 'perm_count', 'active_badge',
    )
    list_filter = ('role_type', 'applies_to', 'is_active')
    search_fields = ('code', 'name')
    inlines = [RolePermissionInline]
    actions = [export_as_csv, activate_selected, deactivate_selected]

    fieldsets = (
        ('Role Identity', {
            'fields': ('tenant', 'code', 'name', 'description'),
        }),
        ('Classification', {
            'fields': ('role_type', 'applies_to', 'level'),
        }),
        ('Inheritance', {
            'fields': ('parent_role',),
            'description': 'Selecting a parent role means this role automatically inherits all permissions from the parent. Permissions flow: Parent → Child.',
        }),
        ('Status', {
            'fields': ('is_active',),
        }),
    )

    def type_badge(self, obj):
        rt = getattr(obj, 'role_type', '')
        colors = {
            'SYSTEM': ('#ef4444', 'rgba(239,68,68,0.12)'),
            'TENANT_DEFAULT': ('#f59e0b', 'rgba(245,158,11,0.12)'),
            'CUSTOM': ('#8b5cf6', 'rgba(139,92,246,0.12)'),
        }
        fg, bg = colors.get(rt, ('#94a3b8', 'rgba(148,163,184,0.12)'))
        return format_html(
            '<span style="padding:3px 10px;border-radius:6px;font-size:0.72rem;font-weight:700;color:{};background:{};">{}</span>',
            fg, bg, rt.replace('_', ' ').title() if rt else '-'
        )
    type_badge.short_description = 'Type'

    def applies_to_badge(self, obj):
        at = getattr(obj, 'applies_to', '')
        colors = {
            'ADMIN': ('#fbbf24', 'rgba(245,158,11,0.12)'),
            'TEACHER': ('#34d399', 'rgba(16,185,129,0.12)'),
            'STUDENT': ('#60a5fa', 'rgba(59,130,246,0.12)'),
            'PARENT': ('#c084fc', 'rgba(192,132,252,0.12)'),
            'ALL': ('#94a3b8', 'rgba(148,163,184,0.12)'),
        }
        fg, bg = colors.get(at, ('#94a3b8', 'rgba(148,163,184,0.12)'))
        return format_html(
            '<span style="padding:3px 10px;border-radius:6px;font-size:0.72rem;font-weight:700;color:{};background:{};">{}</span>',
            fg, bg, at
        )
    applies_to_badge.short_description = 'For'

    def level_display(self, obj):
        level = getattr(obj, 'level', 0) or 0
        color = '#ef4444' if level >= 90 else '#f59e0b' if level >= 50 else '#10b981' if level >= 10 else '#94a3b8'
        return format_html(
            '<span style="padding:3px 10px;border-radius:6px;font-size:0.72rem;font-weight:700;color:{};'
            'background:{}22;font-family:monospace;">L{}</span>',
            color, color, level
        )
    level_display.short_description = 'Level'
    level_display.admin_order_field = 'level'

    def parent_role_display(self, obj):
        parent = getattr(obj, 'parent_role', None)
        if parent:
            return format_html(
                '<span style="display:inline-flex;align-items:center;gap:4px;color:#a5b4fc;font-size:0.82rem;">'
                '<i class="fas fa-arrow-up" style="font-size:0.65rem;"></i> {}</span>',
                parent.name
            )
        return format_html('<span style="color:#475569;">Root</span>')
    parent_role_display.short_description = 'Inherits From'

    def perm_count(self, obj):
        count = obj.role_permissions.count()
        parent = obj.parent_role
        inherited = 0
        visited = set()
        while parent and parent.pk not in visited:
            visited.add(parent.pk)
            inherited += parent.role_permissions.count()
            parent = parent.parent_role
        if inherited > 0:
            return format_html(
                '<span style="color:#10b981;font-weight:600;">{}</span>'
                '<span style="color:#64748b;font-size:0.75rem;"> (+{} inherited)</span>',
                count, inherited
            )
        return format_html('<span style="color:#10b981;font-weight:600;">{}</span>', count)
    perm_count.short_description = 'Permissions'

    def active_badge(self, obj):
        return colored_status(obj.is_active)
    active_badge.short_description = 'Active'


# ═══════════════════════════════════════════════════════════════════
# PERMISSION
# ═══════════════════════════════════════════════════════════════════
@admin.register(Permission)
class PermissionAdmin(EnhancedModelAdmin):
    list_display = ('code', 'name', 'module_badge', 'category_badge', 'action_badge', 'scope_badge', 'active_badge')
    list_filter = ('module', 'action', 'scope', 'is_active')
    search_fields = ('code', 'name', 'description')
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]
    list_per_page = 50

    def module_badge(self, obj):
        return format_html(
            '<span style="padding:3px 10px;border-radius:6px;font-size:0.72rem;'
            'background:rgba(99,102,241,0.1);color:#a5b4fc;font-weight:600;">{}</span>',
            obj.module
        )
    module_badge.short_description = 'Module'

    def category_badge(self, obj):
        return format_html(
            '<span style="padding:3px 8px;border-radius:5px;font-size:0.72rem;'
            'background:rgba(139,92,246,0.1);color:#c084fc;font-weight:500;">{}</span>',
            obj.category
        )
    category_badge.short_description = 'Category'

    def action_badge(self, obj):
        action_colors = {
            'CREATE': '#10b981', 'READ': '#3b82f6', 'UPDATE': '#f59e0b',
            'DELETE': '#ef4444', 'EXECUTE': '#8b5cf6', 'APPROVE': '#22d3ee', 'EXPORT': '#94a3b8',
        }
        c = action_colors.get(getattr(obj, 'action', ''), '#94a3b8')
        return format_html(
            '<span style="padding:3px 8px;border-radius:5px;font-size:0.72rem;color:{};background:{}22;font-weight:700;">{}</span>',
            c, c, getattr(obj, 'action', '-')
        )
    action_badge.short_description = 'Action'

    def scope_badge(self, obj):
        return format_html(
            '<span style="color:#94a3b8;font-size:0.82rem;font-weight:500;">{}</span>',
            getattr(obj, 'scope', '-')
        )
    scope_badge.short_description = 'Scope'

    def active_badge(self, obj):
        return colored_status(getattr(obj, 'is_active', True))
    active_badge.short_description = 'Active'


# ═══════════════════════════════════════════════════════════════════
# ROLE PERMISSION (standalone list)
# ═══════════════════════════════════════════════════════════════════
@admin.register(RolePermission)
class RolePermissionAdmin(EnhancedModelAdmin):
    list_display = ('role', 'permission', 'created_display')
    list_filter = ('role',)
    search_fields = ('role__name', 'permission__code', 'permission__name')
    raw_id_fields = ('role', 'permission')
    actions = [export_as_csv]
