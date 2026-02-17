"""
LMS Enterprise - System Configuration Models
System settings, feature flags, MFA policies, maintenance windows.
Replaces legacy: info, founder, management_team, live_link, jee_2024
"""
import uuid
from django.db import models
from django.utils import timezone


class SystemSetting(models.Model):
    """Global or per-tenant configuration. Replaces legacy [info]."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE,
        null=True, blank=True, related_name='system_settings',
        help_text='NULL = global setting'
    )

    setting_key = models.CharField(max_length=200, db_index=True)
    setting_value = models.TextField(null=True, blank=True)
    setting_json = models.JSONField(null=True, blank=True)

    class ValueType(models.TextChoices):
        STRING = 'STRING', 'String'
        INTEGER = 'INTEGER', 'Integer'
        BOOLEAN = 'BOOLEAN', 'Boolean'
        JSON = 'JSON', 'JSON'
        DECIMAL = 'DECIMAL', 'Decimal'

    value_type = models.CharField(max_length=10, choices=ValueType.choices, default=ValueType.STRING)

    category = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_secret = models.BooleanField(default=False)
    is_editable = models.BooleanField(default=True)

    updated_by_id = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'system_settings'
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'setting_key'],
                name='uq_system_setting_key'
            ),
        ]


class FeatureFlag(models.Model):
    """Feature flags for gradual feature rollout."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE,
        null=True, blank=True, related_name='feature_flags'
    )

    flag_key = models.CharField(max_length=200)
    flag_name = models.CharField(max_length=500)
    description = models.TextField(null=True, blank=True)

    is_enabled = models.BooleanField(default=False)
    rollout_percentage = models.IntegerField(default=0)
    allowed_user_types = models.JSONField(default=list, blank=True)
    allowed_user_ids = models.JSONField(default=list, blank=True)

    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'feature_flags'
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'flag_key'],
                name='uq_feature_flag_key'
            ),
        ]


class MFAPolicy(models.Model):
    """MFA policy configuration."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='mfa_policies')

    class MFAType(models.TextChoices):
        TOTP = 'TOTP', 'Time-based OTP'
        SMS = 'SMS', 'SMS OTP'
        EMAIL = 'EMAIL', 'Email OTP'

    mfa_type = models.CharField(max_length=10, choices=MFAType.choices, default=MFAType.EMAIL)
    is_mandatory = models.BooleanField(default=False)
    applies_to_user_types = models.JSONField(default=list, blank=True)

    otp_length = models.IntegerField(default=6)
    otp_expiry_seconds = models.IntegerField(default=300)
    max_attempts = models.IntegerField(default=5)
    lockout_duration_minutes = models.IntegerField(default=30)
    resend_cooldown_seconds = models.IntegerField(default=60)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'mfa_policies'
        verbose_name_plural = 'MFA policies'


class MaintenanceWindow(models.Model):
    """Scheduled maintenance windows."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=500)
    description = models.TextField(null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=False)

    class Scope(models.TextChoices):
        FULL = 'FULL', 'Full Maintenance'
        PARTIAL = 'PARTIAL', 'Partial (Read-Only)'
        FEATURE = 'FEATURE', 'Feature Specific'

    scope = models.CharField(max_length=10, choices=Scope.choices, default=Scope.FULL)
    affected_features = models.JSONField(default=list, blank=True)
    notification_sent = models.BooleanField(default=False)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'maintenance_windows'


class FounderInfo(models.Model):
    """Founder / management team. Replaces legacy [founder], [management_team]."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='founders')

    class MemberType(models.TextChoices):
        FOUNDER = 'FOUNDER', 'Founder'
        MANAGEMENT = 'MANAGEMENT', 'Management Team'
        ADVISOR = 'ADVISOR', 'Advisor'

    member_type = models.CharField(max_length=15, choices=MemberType.choices, default=MemberType.FOUNDER)
    name = models.CharField(max_length=200)
    designation = models.CharField(max_length=200, null=True, blank=True)
    photo_url = models.URLField(max_length=1000, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    qualifications = models.CharField(max_length=500, null=True, blank=True)
    contact_email = models.EmailField(null=True, blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'founder_info'
        ordering = ['sort_order']


class EnquiryForm(models.Model):
    """Contact / enquiry forms. Replaces legacy [enquiry]."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='enquiries')

    name = models.CharField(max_length=200)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    subject = models.CharField(max_length=500, null=True, blank=True)
    message = models.TextField()

    class Source(models.TextChoices):
        WEBSITE = 'WEBSITE', 'Website'
        APP = 'APP', 'Mobile App'
        REFERRAL = 'REFERRAL', 'Referral'
        WALK_IN = 'WALK_IN', 'Walk-in'

    source = models.CharField(max_length=10, choices=Source.choices, default=Source.WEBSITE)

    class EnquiryStatus(models.TextChoices):
        NEW = 'NEW', 'New'
        CONTACTED = 'CONTACTED', 'Contacted'
        CONVERTED = 'CONVERTED', 'Converted'
        CLOSED = 'CLOSED', 'Closed'

    status = models.CharField(max_length=10, choices=EnquiryStatus.choices, default=EnquiryStatus.NEW)

    assigned_to = models.UUIDField(null=True, blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'enquiry_forms'
        ordering = ['-created_at']


# ---------------------------------------------------------------------------
# AI Feature Configuration
# ---------------------------------------------------------------------------
class AIFeatureConfig(models.Model):
    """Centralized AI feature configuration for the LMS platform."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE,
        null=True, blank=True, related_name='ai_features',
        help_text='NULL = global setting'
    )

    feature_key = models.CharField(
        max_length=100, db_index=True,
        help_text="Unique identifier, e.g. 'ai_summarization'"
    )
    feature_name = models.CharField(max_length=200, help_text="Display name")
    description = models.TextField(null=True, blank=True)

    class FeatureCategory(models.TextChoices):
        CONTENT = 'CONTENT', 'Content Generation'
        ANALYTICS = 'ANALYTICS', 'Analytics & Prediction'
        ASSESSMENT = 'ASSESSMENT', 'Assessment Engine'
        COMMUNICATION = 'COMMUNICATION', 'Communication & Support'
        AUTOMATION = 'AUTOMATION', 'Workflow Automation'

    category = models.CharField(
        max_length=20, choices=FeatureCategory.choices,
        default=FeatureCategory.CONTENT
    )

    is_enabled = models.BooleanField(default=False)

    class IntegrationScope(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        TEACHER = 'TEACHER', 'Teacher'
        STUDENT = 'STUDENT', 'Student'
        ALL = 'ALL', 'All'

    integration_scope = models.CharField(
        max_length=10, choices=IntegrationScope.choices,
        default=IntegrationScope.ALL,
        help_text='Which dashboard this feature appears on'
    )

    # Provider Configuration
    provider = models.CharField(
        max_length=100, null=True, blank=True,
        help_text="e.g. 'openai', 'google', 'internal'"
    )
    api_endpoint = models.URLField(max_length=500, null=True, blank=True)
    api_key_reference = models.CharField(
        max_length=200, null=True, blank=True,
        help_text='Reference to SystemSetting key holding the API key'
    )

    # Rate Limits
    max_requests_per_hour = models.IntegerField(default=100)
    max_requests_per_user = models.IntegerField(default=20)

    # Metadata
    icon_class = models.CharField(
        max_length=100, default='fas fa-brain',
        help_text='Font Awesome icon class'
    )
    sort_order = models.IntegerField(default=0)
    config_json = models.JSONField(
        default=dict, blank=True,
        help_text='Additional configuration parameters'
    )

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.UUIDField(null=True, blank=True)

    class Meta:
        db_table = 'ai_feature_configs'
        ordering = ['sort_order', 'feature_name']
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'feature_key'],
                name='uq_ai_feature_key_per_tenant'
            ),
        ]
        verbose_name = 'AI Feature'
        verbose_name_plural = 'AI Features'

    def __str__(self):
        status = 'ON' if self.is_enabled else 'OFF'
        return f"{self.feature_name} [{status}]"


# ---------------------------------------------------------------------------
# Class Scheduling / Link Automation Config
# ---------------------------------------------------------------------------
class ClassLinkConfig(models.Model):
    """Configuration for auto-generating class meeting links (Zoom, Meet, etc.)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE,
        related_name='class_link_configs'
    )

    class Platform(models.TextChoices):
        YOUTUBE = 'YOUTUBE', 'YouTube Live'
        ZOOM = 'ZOOM', 'Zoom'
        GOOGLE_MEET = 'GOOGLE_MEET', 'Google Meet'
        MICROSOFT_TEAMS = 'MS_TEAMS', 'Microsoft Teams'
        CUSTOM = 'CUSTOM', 'Custom URL'

    platform = models.CharField(max_length=15, choices=Platform.choices)
    is_active = models.BooleanField(default=False)
    is_default = models.BooleanField(default=False)

    # API Configuration
    api_endpoint = models.URLField(max_length=500, null=True, blank=True)
    api_key_reference = models.CharField(
        max_length=200, null=True, blank=True,
        help_text='Reference to SystemSetting key for the API key'
    )
    client_id = models.CharField(max_length=300, null=True, blank=True)
    client_secret_reference = models.CharField(
        max_length=200, null=True, blank=True,
        help_text='Reference to SystemSetting key for client secret'
    )
    oauth_token_reference = models.CharField(
        max_length=200, null=True, blank=True,
        help_text='Reference to SystemSetting key for OAuth token'
    )
    webhook_url = models.URLField(max_length=500, null=True, blank=True)

    # Auto-generation settings
    auto_generate_link = models.BooleanField(default=False)
    generate_minutes_before = models.IntegerField(
        default=15,
        help_text='Minutes before class to auto-generate link'
    )
    default_duration_minutes = models.IntegerField(default=60)
    auto_record = models.BooleanField(default=False)
    auto_admit_participants = models.BooleanField(default=True)

    # Extra config
    config_json = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'class_link_configs'
        verbose_name = 'Class Link Configuration'
        verbose_name_plural = 'Class Link Configurations'
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'platform'],
                name='uq_class_link_platform_per_tenant'
            ),
        ]

    def __str__(self):
        return f"{self.get_platform_display()} - {'Active' if self.is_active else 'Inactive'}"


# ---------------------------------------------------------------------------
# Attendance Rule Configuration
# ---------------------------------------------------------------------------
class AttendanceRule(models.Model):
    """Configurable attendance rules that inherit down to teacher profiles."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE,
        related_name='attendance_rules'
    )

    rule_name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)

    class AppliesTo(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        TEACHER = 'TEACHER', 'Teacher'
        ALL = 'ALL', 'All'

    applies_to = models.CharField(
        max_length=10, choices=AppliesTo.choices, default=AppliesTo.ALL
    )

    # Timing rules
    class_start_grace_minutes = models.IntegerField(
        default=10,
        help_text='Minutes after class start to still mark Present'
    )
    late_threshold_minutes = models.IntegerField(
        default=15,
        help_text='Minutes after which student is marked Late'
    )
    absent_threshold_minutes = models.IntegerField(
        default=30,
        help_text='Minutes after which student is marked Absent'
    )
    min_watch_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=75.00,
        help_text='Minimum % of class to watch for Present status'
    )

    # Auto-attendance from live class
    auto_mark_from_live_class = models.BooleanField(default=True)
    auto_mark_from_biometric = models.BooleanField(default=False)
    auto_mark_from_geofence = models.BooleanField(default=False)

    # Notifications
    notify_absent_student = models.BooleanField(default=True)
    notify_parent_on_absent = models.BooleanField(default=True)
    notify_admin_below_threshold = models.BooleanField(default=True)
    threshold_alert_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=75.00,
        help_text='Alert when attendance drops below this %'
    )

    # Teacher self-attendance
    teacher_self_attendance_required = models.BooleanField(
        default=True,
        help_text='Teachers must mark their own attendance'
    )
    teacher_attendance_auto_from_class = models.BooleanField(
        default=True,
        help_text='Auto-mark teacher present when they start a class'
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendance_rules'
        ordering = ['rule_name']
        verbose_name = 'Attendance Rule'
        verbose_name_plural = 'Attendance Rules'

    def __str__(self):
        return f"{self.rule_name} ({'Active' if self.is_active else 'Inactive'})"
