"""
LMS Enterprise - Account Models
All user types: Student, Teacher, Admin, Parent
With full session, device, and profile tracking.
"""
import uuid
from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone


# ---------------------------------------------------------------------------
# Base User (Abstract)
# ---------------------------------------------------------------------------
class BaseUser(models.Model):
    """Abstract base model for all user types."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE,
        related_name='%(class)s_users', db_index=True,
    )

    # Authentication
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=20)
    password_hash = models.CharField(max_length=255)
    password_changed_at = models.DateTimeField(null=True, blank=True)
    force_password_change = models.BooleanField(default=False)

    # MFA
    mfa_enabled = models.BooleanField(default=False)

    class MFAMethod(models.TextChoices):
        TOTP = 'TOTP', 'TOTP Authenticator'
        SMS = 'SMS', 'SMS'
        EMAIL = 'EMAIL', 'Email'

    mfa_method = models.CharField(max_length=10, choices=MFAMethod.choices, null=True, blank=True)
    mfa_secret = models.TextField(null=True, blank=True, help_text="Encrypted")
    mfa_backup_codes = models.JSONField(null=True, blank=True, help_text="Encrypted backup codes")
    mfa_enforced_by_admin = models.BooleanField(default=False)

    # Profile
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    display_name = models.CharField(max_length=200, null=True, blank=True)
    avatar_url = models.URLField(max_length=500, null=True, blank=True)

    # Status
    class UserStatus(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        PENDING_VERIFICATION = 'PENDING_VERIFICATION', 'Pending Verification'

    status = models.CharField(max_length=25, choices=UserStatus.choices, default=UserStatus.PENDING_VERIFICATION)
    status_reason = models.TextField(null=True, blank=True)
    status_changed_at = models.DateTimeField(null=True, blank=True)
    status_changed_by = models.UUIDField(null=True, blank=True)

    # Verification
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    phone_verified = models.BooleanField(default=False)
    phone_verified_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    last_activity_at = models.DateTimeField(null=True, blank=True)

    # Future Extension Columns
    meta_data = models.JSONField(default=dict, blank=True)
    ext_string_1 = models.CharField(max_length=500, null=True, blank=True)
    ext_string_2 = models.CharField(max_length=500, null=True, blank=True)
    ext_text_1 = models.TextField(null=True, blank=True)
    ext_json_1 = models.JSONField(null=True, blank=True)
    ext_decimal_1 = models.DecimalField(max_digits=18, decimal_places=4, null=True, blank=True)

    class Meta:
        abstract = True

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)
        self.password_changed_at = timezone.now()

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return f"{self.full_name} ({self.email})"


# ---------------------------------------------------------------------------
# Student Model
# ---------------------------------------------------------------------------
class Student(BaseUser):
    """Student user model - enrolled learner."""

    # Student-specific ID
    student_code = models.CharField(max_length=50, help_text="e.g. 'STU2026001'")
    enrollment_number = models.CharField(max_length=100, null=True, blank=True)

    # Academic
    class ClassLevel(models.TextChoices):
        CLASS_9 = '9', 'Class 9'
        CLASS_10 = '10', 'Class 10'
        CLASS_11 = '11', 'Class 11'
        CLASS_12 = '12', 'Class 12'

    student_class = models.CharField(
        max_length=5, choices=ClassLevel.choices, db_column='class_level'
    )

    class ExamTarget(models.TextChoices):
        JEE = 'JEE', 'JEE'
        NEET = 'NEET', 'NEET'
        BOTH = 'BOTH', 'Both'

    exam_target = models.CharField(max_length=10, choices=ExamTarget.choices)

    class Stream(models.TextChoices):
        PCM = 'PCM', 'Physics Chemistry Mathematics'
        PCB = 'PCB', 'Physics Chemistry Biology'
        PCMB = 'PCMB', 'Physics Chemistry Math Biology'

    stream = models.CharField(max_length=10, choices=Stream.choices, null=True, blank=True)
    school_name = models.CharField(max_length=300, null=True, blank=True)

    class Board(models.TextChoices):
        CBSE = 'CBSE', 'CBSE'
        ICSE = 'ICSE', 'ICSE'
        STATE_BOARD = 'STATE_BOARD', 'State Board'
        IB = 'IB', 'IB'
        OTHER = 'OTHER', 'Other'

    board = models.CharField(max_length=20, choices=Board.choices, null=True, blank=True)

    class Medium(models.TextChoices):
        ENGLISH = 'ENGLISH', 'English'
        HINDI = 'HINDI', 'Hindi'
        REGIONAL = 'REGIONAL', 'Regional'

    medium = models.CharField(max_length=20, choices=Medium.choices, default=Medium.ENGLISH)

    # Location
    address_line_1 = models.CharField(max_length=500, null=True, blank=True)
    address_line_2 = models.CharField(max_length=500, null=True, blank=True)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100)
    pin_code = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='India')
    geo_lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    geo_lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    # Personal
    date_of_birth = models.DateField(null=True, blank=True)

    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        OTHER = 'OTHER', 'Other'
        PREFER_NOT = 'PREFER_NOT_TO_SAY', 'Prefer not to say'

    gender = models.CharField(max_length=20, choices=Gender.choices, null=True, blank=True)
    blood_group = models.CharField(max_length=5, null=True, blank=True)
    aadhaar_last_four = models.CharField(max_length=4, null=True, blank=True)

    # Parent/Guardian
    parent_name = models.CharField(max_length=200, null=True, blank=True)

    class ParentRelation(models.TextChoices):
        FATHER = 'FATHER', 'Father'
        MOTHER = 'MOTHER', 'Mother'
        GUARDIAN = 'GUARDIAN', 'Guardian'

    parent_relation = models.CharField(max_length=15, choices=ParentRelation.choices, null=True, blank=True)
    parent_phone = models.CharField(max_length=20, null=True, blank=True)
    parent_email = models.EmailField(null=True, blank=True)
    parent_occupation = models.CharField(max_length=200, null=True, blank=True)
    alternate_contact = models.CharField(max_length=20, null=True, blank=True)

    # Admission
    admission_date = models.DateField(null=True, blank=True)

    class AdmissionSource(models.TextChoices):
        DIRECT = 'DIRECT', 'Direct'
        REFERRAL = 'REFERRAL', 'Referral'
        ONLINE = 'ONLINE', 'Online'
        WALK_IN = 'WALK_IN', 'Walk-in'
        PARTNER = 'PARTNER', 'Partner'

    admission_source = models.CharField(max_length=15, choices=AdmissionSource.choices, null=True, blank=True)
    referred_by = models.UUIDField(null=True, blank=True)
    counselor_id = models.UUIDField(null=True, blank=True)

    # Subscription
    class SubscriptionType(models.TextChoices):
        FREE = 'FREE', 'Free'
        BASIC = 'BASIC', 'Basic'
        PREMIUM = 'PREMIUM', 'Premium'
        SCHOLARSHIP = 'SCHOLARSHIP', 'Scholarship'

    subscription_type = models.CharField(max_length=15, choices=SubscriptionType.choices, default=SubscriptionType.FREE)
    subscription_start = models.DateField(null=True, blank=True)
    subscription_end = models.DateField(null=True, blank=True)

    class FeeStatus(models.TextChoices):
        PAID = 'PAID', 'Paid'
        PARTIAL = 'PARTIAL', 'Partial'
        PENDING = 'PENDING', 'Pending'
        WAIVED = 'WAIVED', 'Waived'

    fee_status = models.CharField(max_length=10, choices=FeeStatus.choices, default=FeeStatus.PENDING)

    # Communication Preferences
    preferred_language = models.CharField(max_length=10, default='en')
    notification_email = models.BooleanField(default=True)
    notification_sms = models.BooleanField(default=True)
    notification_push = models.BooleanField(default=True)
    notification_whatsapp = models.BooleanField(default=True)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)

    # Profile Edit Control
    profile_editable_by_self = models.BooleanField(default=False)
    profile_last_edited_by = models.UUIDField(null=True, blank=True)
    profile_last_edited_at = models.DateTimeField(null=True, blank=True)

    # Batch relation
    batch = models.ForeignKey(
        'academics.Batch', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='primary_students'
    )

    # Student-specific extensions
    academic_json = models.JSONField(null=True, blank=True, help_text="Marks, grades, previous scores")
    family_json = models.JSONField(null=True, blank=True, help_text="Extended family details")
    ext_student_1 = models.CharField(max_length=500, null=True, blank=True)
    ext_student_2 = models.CharField(max_length=500, null=True, blank=True)
    ext_student_3 = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'students'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'student_code'],
                name='uq_student_code_per_tenant'
            ),
            models.UniqueConstraint(
                fields=['tenant', 'email'],
                name='uq_student_email_per_tenant'
            ),
            models.UniqueConstraint(
                fields=['tenant', 'phone'],
                name='uq_student_phone_per_tenant'
            ),
        ]
        indexes = [
            models.Index(fields=['tenant', 'student_code'], name='idx_student_code'),
            models.Index(fields=['tenant', 'email'], name='idx_student_email'),
            models.Index(fields=['tenant', 'phone'], name='idx_student_phone'),
            models.Index(fields=['tenant', 'student_class', 'exam_target'], name='idx_student_class_exam'),
            models.Index(fields=['tenant', 'status'], name='idx_student_status'),
            models.Index(fields=['tenant', 'state', 'city'], name='idx_student_location'),
            models.Index(fields=['tenant', 'batch'], name='idx_student_batch'),
        ]


# ---------------------------------------------------------------------------
# Teacher Model
# ---------------------------------------------------------------------------
class Teacher(BaseUser):
    """Teacher user model - subject matter expert."""

    # Teacher-specific ID
    teacher_code = models.CharField(max_length=50, help_text="e.g. 'TCH001'")
    employee_id = models.CharField(max_length=100, null=True, blank=True)

    # Professional
    subjects = models.JSONField(
        default=list, blank=True,
        help_text="List of subjects: PHYSICS, CHEMISTRY, MATHEMATICS, BIOLOGY"
    )
    specialization = models.JSONField(default=list, blank=True, help_text="e.g. ['Mechanics', 'Thermodynamics']")
    qualification = models.CharField(max_length=255, null=True, blank=True)
    highest_degree = models.CharField(max_length=255, null=True, blank=True)
    experience_years = models.IntegerField(null=True, blank=True)
    experience_details = models.TextField(null=True, blank=True)
    certifications = models.JSONField(default=list, blank=True)

    # Work
    class EmploymentType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full Time'
        PART_TIME = 'PART_TIME', 'Part Time'
        CONTRACT = 'CONTRACT', 'Contract'
        VISITING = 'VISITING', 'Visiting'

    employment_type = models.CharField(max_length=15, choices=EmploymentType.choices, null=True, blank=True)
    joining_date = models.DateField(null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    designation = models.CharField(max_length=100, null=True, blank=True)
    reporting_to = models.ForeignKey(
        'self', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='reportees'
    )

    # YouTube Configuration
    personal_youtube_channel_id = models.CharField(max_length=100, null=True, blank=True)
    youtube_channel_verified = models.BooleanField(default=False)
    youtube_oauth_token = models.TextField(null=True, blank=True, help_text="Encrypted")
    youtube_refresh_token = models.TextField(null=True, blank=True, help_text="Encrypted")
    youtube_token_expiry = models.DateTimeField(null=True, blank=True)
    can_create_streams = models.BooleanField(default=False)

    # Permissions
    can_edit_student_profile = models.BooleanField(default=True)
    can_override_attendance = models.BooleanField(default=True)
    can_override_scores = models.BooleanField(default=True)
    max_batches_allowed = models.IntegerField(null=True, blank=True)

    # Contact
    personal_email = models.EmailField(null=True, blank=True)
    personal_phone = models.CharField(max_length=20, null=True, blank=True)
    emergency_contact = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    teacher_city = models.CharField(max_length=100, null=True, blank=True, db_column='city')
    teacher_state = models.CharField(max_length=100, null=True, blank=True, db_column='state')

    # Banking (for payroll) - Encrypted fields
    bank_name = models.CharField(max_length=200, null=True, blank=True)
    bank_account = models.TextField(null=True, blank=True, help_text="Encrypted")
    ifsc_code = models.CharField(max_length=20, null=True, blank=True)
    pan_number = models.TextField(null=True, blank=True, help_text="Encrypted")

    # Teacher-specific extensions
    expertise_json = models.JSONField(null=True, blank=True)
    availability_json = models.JSONField(null=True, blank=True, help_text="Schedule preferences")
    ext_teacher_1 = models.CharField(max_length=500, null=True, blank=True)
    ext_teacher_2 = models.CharField(max_length=500, null=True, blank=True)
    ext_teacher_3 = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'teachers'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'teacher_code'],
                name='uq_teacher_code_per_tenant'
            ),
            models.UniqueConstraint(
                fields=['tenant', 'email'],
                name='uq_teacher_email_per_tenant'
            ),
            models.UniqueConstraint(
                fields=['tenant', 'phone'],
                name='uq_teacher_phone_per_tenant'
            ),
        ]
        indexes = [
            models.Index(fields=['tenant', 'teacher_code'], name='idx_teacher_code'),
            models.Index(fields=['tenant', 'email'], name='idx_teacher_email'),
            models.Index(fields=['tenant', 'status'], name='idx_teacher_status'),
        ]


# ---------------------------------------------------------------------------
# Admin Model
# ---------------------------------------------------------------------------
class Admin(BaseUser):
    """Admin user model - system/tenant/branch administrator."""

    admin_code = models.CharField(max_length=50, null=True, blank=True)

    class AdminType(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', 'Super Admin'
        TENANT_ADMIN = 'TENANT_ADMIN', 'Tenant Admin'
        BRANCH_ADMIN = 'BRANCH_ADMIN', 'Branch Admin'
        ACADEMIC_ADMIN = 'ACADEMIC_ADMIN', 'Academic Admin'
        FINANCE_ADMIN = 'FINANCE_ADMIN', 'Finance Admin'
        SUPPORT_ADMIN = 'SUPPORT_ADMIN', 'Support Admin'

    admin_type = models.CharField(max_length=20, choices=AdminType.choices)

    # Access Control
    role = models.ForeignKey(
        'accounts.Role', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='admins'
    )
    permissions_override = models.JSONField(default=list, blank=True, help_text="Direct permission overrides")
    managed_branches = models.JSONField(default=list, blank=True)

    # Security
    require_ip_whitelist = models.BooleanField(default=False)
    allowed_ips = models.JSONField(default=list, blank=True)
    session_timeout_minutes = models.IntegerField(default=240)

    # Preferences
    class Theme(models.TextChoices):
        LIGHT = 'LIGHT', 'Light'
        DARK = 'DARK', 'Dark'
        SYSTEM = 'SYSTEM', 'System'
        CUSTOM = 'CUSTOM', 'Custom'

    theme = models.CharField(max_length=10, choices=Theme.choices, default=Theme.LIGHT)
    accent_color = models.CharField(max_length=7, null=True, blank=True)
    dashboard_layout = models.JSONField(null=True, blank=True)
    default_view = models.CharField(max_length=100, null=True, blank=True)
    admin_timezone = models.CharField(max_length=50, default='Asia/Kolkata', db_column='timezone')
    admin_date_format = models.CharField(max_length=20, null=True, blank=True, db_column='date_format')

    class TimeFormat(models.TextChoices):
        H12 = '12H', '12 Hour'
        H24 = '24H', '24 Hour'

    time_format = models.CharField(max_length=5, choices=TimeFormat.choices, default=TimeFormat.H12)

    # Activity
    last_password_change = models.DateTimeField(null=True, blank=True)
    password_expires_at = models.DateTimeField(null=True, blank=True)
    failed_login_count = models.IntegerField(default=0)
    locked_until = models.DateTimeField(null=True, blank=True)

    # Admin-specific extensions
    admin_config = models.JSONField(null=True, blank=True)
    ext_admin_1 = models.CharField(max_length=500, null=True, blank=True)
    ext_admin_2 = models.CharField(max_length=500, null=True, blank=True)
    ext_admin_3 = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'admins'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'admin_type'], name='idx_admin_type'),
            models.Index(fields=['tenant', 'email'], name='idx_admin_email'),
            models.Index(fields=['tenant', 'status'], name='idx_admin_status'),
        ]


# ---------------------------------------------------------------------------
# Parent Model
# ---------------------------------------------------------------------------
class Parent(BaseUser):
    """Parent/Guardian user model - optional portal access."""

    parent_code = models.CharField(max_length=50, null=True, blank=True)
    primary_student = models.ForeignKey(
        'accounts.Student', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='primary_parent'
    )

    class Relationship(models.TextChoices):
        FATHER = 'FATHER', 'Father'
        MOTHER = 'MOTHER', 'Mother'
        GUARDIAN = 'GUARDIAN', 'Guardian'
        OTHER = 'OTHER', 'Other'

    relationship = models.CharField(max_length=15, choices=Relationship.choices, null=True, blank=True)

    # Permissions
    can_view_attendance = models.BooleanField(default=True)
    can_view_results = models.BooleanField(default=True)
    can_view_fee_details = models.BooleanField(default=True)
    can_communicate_teacher = models.BooleanField(default=True)
    receive_notifications = models.BooleanField(default=True)

    # Extensions
    ext_parent_1 = models.CharField(max_length=500, null=True, blank=True)
    ext_parent_2 = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'parents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', 'email'], name='idx_parent_email'),
        ]


class ParentStudent(models.Model):
    """Many-to-many relationship between Parents and Students."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    parent = models.ForeignKey(Parent, on_delete=models.CASCADE, related_name='student_links')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='parent_links')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'parent_students'
        unique_together = ('parent', 'student')


# ---------------------------------------------------------------------------
# Role & Permission Models
# ---------------------------------------------------------------------------
class Role(models.Model):
    """Role model for RBAC."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(
        'tenants.Tenant', on_delete=models.CASCADE,
        null=True, blank=True, related_name='roles',
        help_text="Null for system-level roles"
    )

    code = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)

    class RoleType(models.TextChoices):
        SYSTEM = 'SYSTEM', 'System'
        TENANT_DEFAULT = 'TENANT_DEFAULT', 'Tenant Default'
        CUSTOM = 'CUSTOM', 'Custom'

    role_type = models.CharField(max_length=20, choices=RoleType.choices, default=RoleType.CUSTOM)

    class AppliesTo(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        TEACHER = 'TEACHER', 'Teacher'
        STUDENT = 'STUDENT', 'Student'
        PARENT = 'PARENT', 'Parent'
        ALL = 'ALL', 'All'

    applies_to = models.CharField(max_length=10, choices=AppliesTo.choices, default=AppliesTo.ALL)

    level = models.IntegerField(default=0, help_text="Role hierarchy level")
    parent_role = models.ForeignKey(
        'self', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='child_roles'
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.UUIDField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Extension
    role_meta = models.JSONField(null=True, blank=True)
    ext_role_1 = models.CharField(max_length=500, null=True, blank=True)

    class Meta:
        db_table = 'roles'
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'code'],
                name='uq_role_code_per_tenant'
            ),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class Permission(models.Model):
    """Permission model for fine-grained access control."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    code = models.CharField(max_length=100, unique=True, help_text="e.g. 'student:profile:edit'")
    name = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)

    module = models.CharField(max_length=50, help_text="e.g. 'student', 'teacher', 'class'")
    category = models.CharField(max_length=50, help_text="e.g. 'profile', 'attendance'")

    resource = models.CharField(max_length=50)

    class Action(models.TextChoices):
        CREATE = 'CREATE', 'Create'
        READ = 'READ', 'Read'
        UPDATE = 'UPDATE', 'Update'
        DELETE = 'DELETE', 'Delete'
        EXECUTE = 'EXECUTE', 'Execute'
        APPROVE = 'APPROVE', 'Approve'
        EXPORT = 'EXPORT', 'Export'

    action = models.CharField(max_length=10, choices=Action.choices)

    class Scope(models.TextChoices):
        OWN = 'OWN', 'Own'
        BATCH = 'BATCH', 'Batch'
        BRANCH = 'BRANCH', 'Branch'
        TENANT = 'TENANT', 'Tenant'
        GLOBAL = 'GLOBAL', 'Global'

    scope = models.CharField(max_length=10, choices=Scope.choices, default=Scope.OWN)

    requires = models.JSONField(default=list, blank=True, help_text="Required permission codes")
    is_active = models.BooleanField(default=True)

    permission_meta = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'permissions'
        ordering = ['module', 'category', 'action']

    def __str__(self):
        return self.code


class RolePermission(models.Model):
    """Many-to-many between Role and Permission."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='role_permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name='permission_roles')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'role_permissions'
        unique_together = ('role', 'permission')


# ---------------------------------------------------------------------------
# Password Change Request Model
# ---------------------------------------------------------------------------
class PasswordChangeRequest(models.Model):
    """Tracks password change/reset requests."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)

    user_id = models.UUIDField()

    class UserType(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        TEACHER = 'TEACHER', 'Teacher'
        ADMIN = 'ADMIN', 'Admin'
        PARENT = 'PARENT', 'Parent'

    user_type = models.CharField(max_length=10, choices=UserType.choices)

    class Method(models.TextChoices):
        SELF_CHANGE = 'SELF_CHANGE', 'Self Change'
        OTP_PHONE = 'OTP_PHONE', 'OTP via Phone'
        OTP_EMAIL = 'OTP_EMAIL', 'OTP via Email'
        ADMIN_RESET = 'ADMIN_RESET', 'Admin Reset'
        TICKET_REQUEST = 'TICKET_REQUEST', 'Ticket Request'

    method = models.CharField(max_length=20, choices=Method.choices)

    # OTP
    otp_code = models.CharField(max_length=255, null=True, blank=True, help_text="Hashed OTP")
    otp_sent_to = models.CharField(max_length=255, null=True, blank=True)
    otp_sent_at = models.DateTimeField(null=True, blank=True)
    otp_expires_at = models.DateTimeField(null=True, blank=True)
    otp_attempts = models.IntegerField(default=0)
    otp_verified = models.BooleanField(default=False)

    # Token
    reset_token = models.CharField(max_length=500, unique=True, null=True, blank=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)

    # Status
    class RequestStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        OTP_SENT = 'OTP_SENT', 'OTP Sent'
        OTP_VERIFIED = 'OTP_VERIFIED', 'OTP Verified'
        COMPLETED = 'COMPLETED', 'Completed'
        EXPIRED = 'EXPIRED', 'Expired'
        CANCELLED = 'CANCELLED', 'Cancelled'

    status = models.CharField(max_length=15, choices=RequestStatus.choices, default=RequestStatus.PENDING)

    # Completion
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_from_ip = models.GenericIPAddressField(null=True, blank=True)
    completed_from_device = models.ForeignKey(
        'sessions_tracking.UserDevice', on_delete=models.SET_NULL,
        null=True, blank=True
    )

    # Related ticket
    ticket = models.ForeignKey(
        'communication.SupportTicket', on_delete=models.SET_NULL,
        null=True, blank=True
    )

    created_at = models.DateTimeField(default=timezone.now)

    # Extension
    request_meta = models.JSONField(null=True, blank=True)
    ext_pwd_1 = models.CharField(max_length=500, null=True, blank=True)

    class Meta:
        db_table = 'password_change_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_id', 'user_type', 'status'], name='idx_pwd_req_user'),
            models.Index(fields=['reset_token'], name='idx_pwd_req_token'),
        ]
