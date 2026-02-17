"""
ENF Online Class - Custom Admin Site Configuration
Monkey-patches the default admin site to add dashboard stats.
"""
from django.contrib import admin


def custom_admin_index(self, request, extra_context=None):
    """Override the default admin index to inject dashboard statistics."""
    extra_context = extra_context or {}

    try:
        from accounts.models import Student
        extra_context['student_count'] = Student.objects.count()
    except Exception:
        extra_context['student_count'] = 0

    try:
        from accounts.models import Teacher
        extra_context['teacher_count'] = Teacher.objects.count()
    except Exception:
        extra_context['teacher_count'] = 0

    try:
        from academics.models import Batch
        extra_context['batch_count'] = Batch.objects.filter(status='ACTIVE').count()
    except Exception:
        extra_context['batch_count'] = 0

    try:
        from assessments.models import Test
        extra_context['test_count'] = Test.objects.count()
    except Exception:
        extra_context['test_count'] = 0

    try:
        from sessions_tracking.models import UserSession
        extra_context['active_sessions'] = UserSession.objects.filter(status='ACTIVE').count()
    except Exception:
        extra_context['active_sessions'] = 0

    try:
        from tenants.models import Tenant
        extra_context['tenant_count'] = Tenant.objects.count()
    except Exception:
        extra_context['tenant_count'] = 0

    # ── AI Features ──
    try:
        from system_config.models import AIFeatureConfig
        ai_qs = AIFeatureConfig.objects.all().order_by('sort_order', 'feature_name')
        extra_context['ai_features'] = ai_qs
        extra_context['ai_feature_count'] = ai_qs.count()
        extra_context['ai_enabled_count'] = ai_qs.filter(is_enabled=True).count()
    except Exception:
        extra_context['ai_features'] = []
        extra_context['ai_feature_count'] = 0
        extra_context['ai_enabled_count'] = 0

    # ── Class Link Configs ──
    try:
        from system_config.models import ClassLinkConfig
        extra_context['class_link_count'] = ClassLinkConfig.objects.filter(is_active=True).count()
    except Exception:
        extra_context['class_link_count'] = 0

    # ── Attendance Rules ──
    try:
        from system_config.models import AttendanceRule
        extra_context['attendance_rule_count'] = AttendanceRule.objects.filter(is_active=True).count()
    except Exception:
        extra_context['attendance_rule_count'] = 0

    # ── Attendance Today ──
    try:
        from attendance.models import Attendance
        from datetime import date
        today = date.today()
        today_qs = Attendance.objects.filter(date=today)
        extra_context['today_present'] = today_qs.filter(status='PRESENT').count()
        extra_context['today_absent'] = today_qs.filter(status='ABSENT').count()
        extra_context['today_late'] = today_qs.filter(status='LATE').count()
        extra_context['today_leave'] = today_qs.filter(status='LEAVE').count()
    except Exception:
        extra_context['today_present'] = 0
        extra_context['today_absent'] = 0
        extra_context['today_late'] = 0
        extra_context['today_leave'] = 0

    # ── RBAC Counts ──
    try:
        from accounts.models import Role, Permission
        extra_context['admin_role_count'] = Role.objects.filter(applies_to__in=['ADMIN', 'ALL'], is_active=True).count()
        extra_context['teacher_role_count'] = Role.objects.filter(applies_to__in=['TEACHER', 'ALL'], is_active=True).count()
        extra_context['student_role_count'] = Role.objects.filter(applies_to__in=['STUDENT', 'ALL'], is_active=True).count()
        extra_context['permission_count'] = Permission.objects.filter(is_active=True).count()
    except Exception:
        extra_context['admin_role_count'] = 0
        extra_context['teacher_role_count'] = 0
        extra_context['student_role_count'] = 0
        extra_context['permission_count'] = 0

    return original_index(self, request, extra_context=extra_context)


# Store original and replace
original_index = admin.AdminSite.index
admin.AdminSite.index = custom_admin_index

# Customize branding
admin.site.site_header = 'ENF Online Class — Admin Console'
admin.site.site_title = 'ENF Admin'
admin.site.index_title = 'Administration Dashboard'
admin.site.site_url = '/'
