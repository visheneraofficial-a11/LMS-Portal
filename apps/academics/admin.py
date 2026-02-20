from django.contrib import admin
from django.utils.html import format_html
from academics.models import (
    AcademicSession, Group, Category, Subject, SubjectSection,
    Chapter, Topic, Batch, BatchStudent, BatchTeacher,
    Language, State, City, Religion, School,
)
from core.admin_utils import EnhancedModelAdmin, ImportExportMixin, export_as_csv, export_as_json, activate_selected, deactivate_selected, colored_status


class BatchStudentInline(admin.TabularInline):
    model = BatchStudent
    extra = 0
    fields = ('student', 'is_active', 'enrolled_at')
    readonly_fields = ('enrolled_at',)
    show_change_link = True


class BatchTeacherInline(admin.TabularInline):
    model = BatchTeacher
    extra = 0
    fields = ('teacher', 'subject', 'is_primary')
    show_change_link = True


class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 0
    fields = ('name', 'class_level', 'display_order', 'status')
    show_change_link = True


class TopicInline(admin.TabularInline):
    model = Topic
    extra = 0
    fields = ('name', 'display_order', 'status')
    show_change_link = True


@admin.register(AcademicSession)
class AcademicSessionAdmin(EnhancedModelAdmin):
    list_display = ('session_name', 'current_badge', 'status_badge', 'start_date', 'end_date')
    list_filter = ('is_current', 'status')
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]

    def current_badge(self, obj):
        if obj.is_current:
            return format_html('<span style="color:#10b981;font-weight:700;">&#9679; Current</span>')
        return format_html('<span style="color:#64748b;">-</span>')
    current_badge.short_description = 'Current'


@admin.register(Group)
class GroupAdmin(EnhancedModelAdmin):
    list_display = ('name', 'status_badge')
    actions = [export_as_csv, activate_selected, deactivate_selected]


@admin.register(Category)
class CategoryAdmin(EnhancedModelAdmin):
    list_display = ('name', 'group', 'status_badge', 'show_in_student')
    list_filter = ('status', 'show_in_student')


@admin.register(Subject)
class SubjectAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = ('name', 'code', 'subject_type_badge', 'status_badge')
    list_filter = ('subject_type', 'status')
    search_fields = ('name', 'code')
    inlines = [ChapterInline]
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]

    def subject_type_badge(self, obj):
        colors = {'THEORY': '#3b82f6', 'PRACTICAL': '#10b981', 'BOTH': '#8b5cf6'}
        c = colors.get(getattr(obj, 'subject_type', ''), '#94a3b8')
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:{}22;color:{};font-weight:600;">{}</span>',
            c, c, getattr(obj, 'subject_type', '-')
        )
    subject_type_badge.short_description = 'Type'


@admin.register(Chapter)
class ChapterAdmin(EnhancedModelAdmin):
    list_display = ('name', 'subject', 'class_level', 'display_order', 'status_badge')
    list_filter = ('subject', 'status')
    search_fields = ('name',)
    inlines = [TopicInline]
    actions = [export_as_csv, activate_selected, deactivate_selected]


@admin.register(Topic)
class TopicAdmin(EnhancedModelAdmin):
    list_display = ('name', 'chapter', 'display_order', 'status_badge')
    list_filter = ('status',)
    search_fields = ('name',)
    actions = [export_as_csv, activate_selected, deactivate_selected]


@admin.register(Batch)
class BatchAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = ('code', 'name', 'exam_target', 'max_students', 'student_count_display', 'status_badge')
    list_filter = ('status', 'exam_target')
    search_fields = ('code', 'name')
    inlines = [BatchStudentInline, BatchTeacherInline]
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]

    def student_count_display(self, obj):
        count = obj.batch_students.filter(is_active=True).count()
        max_s = obj.max_students or 0
        pct = (count / max_s * 100) if max_s > 0 else 0
        color = '#10b981' if pct < 80 else '#f59e0b' if pct < 95 else '#ef4444'
        return format_html(
            '<div style="display:flex;align-items:center;gap:6px;">'
            '<span style="font-weight:600;color:{};">{}</span>'
            '<span style="color:#64748b;font-size:0.75rem;">/ {}</span>'
            '</div>', color, count, max_s
        )
    student_count_display.short_description = 'Enrolled'


@admin.register(BatchStudent)
class BatchStudentAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = ('batch', 'student', 'active_badge', 'enrolled_at')
    list_filter = ('is_active', 'batch')
    search_fields = ('student__first_name', 'student__last_name', 'batch__name')
    actions = [export_as_csv, export_as_json]

    def active_badge(self, obj):
        return colored_status(obj.is_active)
    active_badge.short_description = 'Active'


@admin.register(BatchTeacher)
class BatchTeacherAdmin(EnhancedModelAdmin):
    list_display = ('batch', 'teacher', 'subject', 'primary_badge')
    list_filter = ('is_primary',)
    actions = [export_as_csv]

    def primary_badge(self, obj):
        if obj.is_primary:
            return format_html('<span style="color:#f59e0b;font-weight:700;">&#9733; Primary</span>')
        return format_html('<span style="color:#64748b;">-</span>')
    primary_badge.short_description = 'Primary'


@admin.register(Language)
class LanguageAdmin(EnhancedModelAdmin):
    list_display = ('__str__',)
    search_fields = ('name',) if hasattr(Language, 'name') else ()
    actions = [export_as_csv]


@admin.register(State)
class StateAdmin(EnhancedModelAdmin):
    list_display = ('__str__',)
    search_fields = ('name',) if hasattr(State, 'name') else ()
    actions = [export_as_csv]


@admin.register(City)
class CityAdmin(EnhancedModelAdmin):
    list_display = ('__str__',)
    search_fields = ('name',) if hasattr(City, 'name') else ()
    actions = [export_as_csv]


@admin.register(Religion)
class ReligionAdmin(EnhancedModelAdmin):
    list_display = ('__str__',)
    actions = [export_as_csv]


@admin.register(School)
class SchoolAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = ('__str__',)
    search_fields = ('name',) if hasattr(School, 'name') else ()
    actions = [export_as_csv, export_as_json]


@admin.register(SubjectSection)
class SubjectSectionAdmin(EnhancedModelAdmin):
    list_display = ('__str__',)
    actions = [export_as_csv]
