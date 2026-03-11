"""
ENABLE PROGRAM - Custom Admin Site Configuration
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

    # ── User Groups ──
    try:
        from accounts.models import UserGroup
        groups = UserGroup.objects.all().order_by('name')[:10]
        extra_context['groups'] = groups
        extra_context['groups_count'] = UserGroup.objects.count()
    except Exception:
        extra_context['groups'] = []
        extra_context['groups_count'] = 0

    # ── Integration Configs ──
    try:
        from system_config.models import IntegrationConfig
        youtube_int = IntegrationConfig.objects.filter(integration_type='YOUTUBE', is_active=True).first()
        llm_int = IntegrationConfig.objects.filter(integration_type='LLM', is_active=True).first()
        storage_int = IntegrationConfig.objects.filter(integration_type='STORAGE', is_active=True).first()
        extra_context['youtube_integration_active'] = youtube_int is not None
        extra_context['youtube_integration_status'] = 'Active' if youtube_int else 'Not Configured'
        extra_context['llm_integration_active'] = llm_int is not None
        extra_context['llm_integration_status'] = 'Active' if llm_int else 'Not Configured'
        extra_context['storage_integration_active'] = storage_int is not None
        extra_context['storage_integration_status'] = 'Active' if storage_int else 'Not Configured'
        extra_context['meeting_integration_active'] = extra_context.get('class_link_count', 0) > 0
    except Exception:
        extra_context['youtube_integration_active'] = False
        extra_context['youtube_integration_status'] = 'Not Configured'
        extra_context['llm_integration_active'] = False
        extra_context['llm_integration_status'] = 'Not Configured'
        extra_context['storage_integration_active'] = False
        extra_context['storage_integration_status'] = 'Not Configured'
        extra_context['meeting_integration_active'] = False

    # ── Community & Knowledge Features ──
    try:
        from system_config.models import FeatureFlag
        community_flag = FeatureFlag.objects.filter(flag_key__icontains='community', is_enabled=True).first()
        extra_context['community_features_active'] = community_flag is not None
        extra_context['community_feature_status'] = 'Enabled' if community_flag else 'Available'
        knowledge_flag = FeatureFlag.objects.filter(flag_key__icontains='knowledge', is_enabled=True).first()
        extra_context['knowledge_tools_active'] = knowledge_flag is not None
        extra_context['knowledge_tools_status'] = 'Enabled' if knowledge_flag else 'Available'
    except Exception:
        extra_context['community_features_active'] = False
        extra_context['community_feature_status'] = 'Available'
        extra_context['knowledge_tools_active'] = False
        extra_context['knowledge_tools_status'] = 'Available'

    # ── Batches for Report Filters ──
    try:
        from academics.models import Batch
        extra_context['batches'] = Batch.objects.filter(status='ACTIVE').order_by('name')[:20]
    except Exception:
        extra_context['batches'] = []

    # ── Report Templates ──
    try:
        from system_config.models import ReportTemplate
        extra_context['report_templates'] = ReportTemplate.objects.filter(is_active=True).order_by('-created_at')[:5]
    except Exception:
        extra_context['report_templates'] = []

    return original_index(self, request, extra_context=extra_context)


# ═══════════════════════════════════════════════════════════════════
# Model ordering for 'Identity Management' section
# ═══════════════════════════════════════════════════════════════════
# Defines the order in which models appear under the accounts app.
IDENTITY_MODEL_ORDER = [
    # 1. User Lifecycle
    'Student', 'Teacher', 'Admin', 'Parent', 'UserRoleAssignment',
    # 2. Permissions & Roles
    'Permission', 'Role', 'StaffRole',
    # 3. Groups & Assignment
    'UserGroup', 'GroupMembership', 'GroupRoleAssignment',
    # 4. Account Protection
    'SecurityPolicy', 'LoginAttemptLog', 'TrustedDevice',
    # 5. Audit & Monitoring
    'AccessLog', 'AuditEntry', 'BehaviorEvent',
    # 6. Compliance
    'ComplianceRule', 'ConsentRecord', 'DataAccessRequest', 'RetentionPolicy',
]


def custom_get_app_list(self, request, app_label=None):
    """Override get_app_list to control model ordering in Identity Management."""
    app_list = original_get_app_list(self, request, app_label)
    for app in app_list:
        if app['app_label'] == 'accounts':
            app['name'] = 'Identity Management'
            model_dict = {m['object_name']: m for m in app['models']}
            ordered = []
            for name in IDENTITY_MODEL_ORDER:
                if name in model_dict:
                    ordered.append(model_dict.pop(name))
            # Append any remaining models not in the explicit list
            ordered.extend(model_dict.values())
            app['models'] = ordered
    # Remove empty audit app (all models moved to accounts)
    app_list = [a for a in app_list if not (
        a['app_label'] == 'audit' and len(a.get('models', [])) == 0
    )]
    # Remove 'Authentication and Authorization' (django.contrib.auth)
    app_list = [a for a in app_list if a['app_label'] != 'auth']
    # Remove 'Communication' section (models moved to System Configuration)
    app_list = [a for a in app_list if a['app_label'] != 'communication']
    return app_list


original_get_app_list = admin.AdminSite.get_app_list
admin.AdminSite.get_app_list = custom_get_app_list


# Store original and replace
original_index = admin.AdminSite.index
admin.AdminSite.index = custom_admin_index

# Customize branding
admin.site.site_header = 'ENABLE PROGRAM — Admin Console'
admin.site.site_title = 'ENF Admin'
admin.site.index_title = 'Administration Dashboard'
admin.site.site_url = '/'
