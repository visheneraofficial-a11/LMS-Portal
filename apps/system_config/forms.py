"""
Friendly Admin Forms for System Configuration
==============================================
Replaces raw JSON textareas with visual, user-friendly widgets.
"""
from django import forms
from system_config.models import (
    SystemSetting, FeatureFlag, MFAPolicy,
    MaintenanceWindow, FounderInfo,
    AIFeatureConfig, ClassLinkConfig,
    IntegrationConfig, WebsiteSetting, ReportTemplate,
    FooterConfig,
)
from system_config.widgets import (
    TagListWidget, EmailListWidget, KeyValueWidget,
    SocialLinksWidget, LinksListWidget, FiltersWidget,
)

USER_TYPE_CHOICES = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF']
FEATURE_CHOICES = [
    'Login', 'Dashboard', 'Assessments', 'Attendance',
    'LMS', 'AI Features', 'Communication', 'Reports',
    'Live Classes', 'Materials', 'Payments',
]

REPORT_COLUMN_CHOICES = [
    'student_name', 'student_id', 'roll_number', 'email', 'phone',
    'class_name', 'section', 'center', 'batch',
    'attendance_percentage', 'present_count', 'absent_count', 'late_count',
    'exam_name', 'total_marks', 'obtained_marks', 'percentage', 'grade', 'rank',
    'teacher_name', 'subject', 'department',
    'fee_amount', 'paid_amount', 'due_amount', 'payment_date', 'payment_status',
    'date', 'date_from', 'date_to', 'academic_year', 'semester',
    'status', 'remarks', 'created_at', 'updated_at',
]

REPORT_GROUP_CHOICES = [
    'class_name', 'section', 'center', 'batch',
    'subject', 'department', 'teacher_name',
    'academic_year', 'semester', 'month', 'week',
    'status', 'grade', 'payment_status',
]

REPORT_SORT_CHOICES = [
    'student_name', 'roll_number', 'percentage', 'rank',
    'attendance_percentage', 'date', 'created_at',
    'total_marks', 'obtained_marks', 'fee_amount',
    'teacher_name', 'class_name', 'center',
]


# ═══════════════════════════════════════════════════════════════════
# SYSTEM SETTING
# ═══════════════════════════════════════════════════════════════════
class SystemSettingForm(forms.ModelForm):
    class Meta:
        model = SystemSetting
        fields = '__all__'
        widgets = {
            'setting_json': KeyValueWidget(
                key_placeholder='Setting name',
                value_placeholder='Setting value',
            ),
        }


# ═══════════════════════════════════════════════════════════════════
# FEATURE FLAG
# ═══════════════════════════════════════════════════════════════════
class FeatureFlagForm(forms.ModelForm):
    class Meta:
        model = FeatureFlag
        fields = '__all__'
        widgets = {
            'allowed_user_types': TagListWidget(
                placeholder='Select user type…',
                suggestions=USER_TYPE_CHOICES,
            ),
            'allowed_user_ids': TagListWidget(
                placeholder='Enter user ID…',
            ),
        }


# ═══════════════════════════════════════════════════════════════════
# MFA POLICY
# ═══════════════════════════════════════════════════════════════════
class MFAPolicyForm(forms.ModelForm):
    class Meta:
        model = MFAPolicy
        fields = '__all__'
        widgets = {
            'applies_to_user_types': TagListWidget(
                placeholder='Select user type…',
                suggestions=USER_TYPE_CHOICES,
            ),
        }


# ═══════════════════════════════════════════════════════════════════
# MAINTENANCE WINDOW
# ═══════════════════════════════════════════════════════════════════
class MaintenanceWindowForm(forms.ModelForm):
    class Meta:
        model = MaintenanceWindow
        fields = '__all__'
        widgets = {
            'affected_features': TagListWidget(
                placeholder='Select feature…',
                suggestions=FEATURE_CHOICES,
            ),
        }


# ═══════════════════════════════════════════════════════════════════
# FOUNDER INFO
# ═══════════════════════════════════════════════════════════════════
class FounderInfoForm(forms.ModelForm):
    class Meta:
        model = FounderInfo
        fields = '__all__'
        widgets = {
            'social_links': SocialLinksWidget(),
        }


# ═══════════════════════════════════════════════════════════════════
# AI FEATURE CONFIG
# ═══════════════════════════════════════════════════════════════════
class AIFeatureConfigForm(forms.ModelForm):
    class Meta:
        model = AIFeatureConfig
        fields = '__all__'
        widgets = {
            'config_json': KeyValueWidget(
                key_placeholder='Parameter name',
                value_placeholder='Parameter value',
            ),
        }


# ═══════════════════════════════════════════════════════════════════
# CLASS LINK CONFIG
# ═══════════════════════════════════════════════════════════════════
class ClassLinkConfigForm(forms.ModelForm):
    class Meta:
        model = ClassLinkConfig
        fields = '__all__'
        widgets = {
            'config_json': KeyValueWidget(
                key_placeholder='Config key',
                value_placeholder='Config value',
            ),
        }


# ═══════════════════════════════════════════════════════════════════
# INTEGRATION CONFIG
# ═══════════════════════════════════════════════════════════════════
class IntegrationConfigForm(forms.ModelForm):
    class Meta:
        model = IntegrationConfig
        fields = '__all__'
        widgets = {
            'playlist_ids': TagListWidget(
                placeholder='Enter YouTube playlist ID…',
            ),
            'config_json': KeyValueWidget(
                key_placeholder='Parameter',
                value_placeholder='Value',
            ),
            'usage_stats': KeyValueWidget(
                key_placeholder='Metric',
                value_placeholder='Value',
            ),
        }


# ═══════════════════════════════════════════════════════════════════
# WEBSITE SETTING
# ═══════════════════════════════════════════════════════════════════
class WebsiteSettingForm(forms.ModelForm):
    class Meta:
        model = WebsiteSetting
        fields = '__all__'
        widgets = {
            'setting_json': KeyValueWidget(
                key_placeholder='Setting key',
                value_placeholder='Setting value',
            ),
        }


# ═══════════════════════════════════════════════════════════════════
# REPORT TEMPLATE — the key one from the screenshot
# ═══════════════════════════════════════════════════════════════════
class ReportTemplateForm(forms.ModelForm):
    class Meta:
        model = ReportTemplate
        fields = '__all__'
        widgets = {
            'filters_json': FiltersWidget(),
            'columns_json': TagListWidget(
                placeholder='Select or type column…',
                suggestions=REPORT_COLUMN_CHOICES,
            ),
            'group_by': TagListWidget(
                placeholder='Select grouping field…',
                suggestions=REPORT_GROUP_CHOICES,
            ),
            'sort_by': TagListWidget(
                placeholder='Select sort field…',
                suggestions=REPORT_SORT_CHOICES,
            ),
            'recipients_email': EmailListWidget(),
        }


# ═══════════════════════════════════════════════════════════════════
# FOOTER CONFIG
# ═══════════════════════════════════════════════════════════════════
class FooterConfigForm(forms.ModelForm):
    class Meta:
        model = FooterConfig
        fields = '__all__'
        widgets = {
            'links_json': LinksListWidget(),
            'social_links_json': SocialLinksWidget(),
        }
