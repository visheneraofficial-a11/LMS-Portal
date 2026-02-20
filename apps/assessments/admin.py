from django.contrib import admin
from django.utils.html import format_html
from assessments.models import (
    Test, TestSection, Question, TestAttempt,
    TestAttemptAnswer, TestFeedback, OfflineTestMarks
)
from core.admin_utils import EnhancedModelAdmin, ImportExportMixin, export_as_csv, export_as_json, activate_selected, deactivate_selected, colored_status


class TestSectionInline(admin.TabularInline):
    model = TestSection
    extra = 0
    fields = ('section_name', 'section_order', 'total_questions', 'max_marks')
    show_change_link = True


@admin.register(Test)
class TestAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = (
        'test_code', 'title', 'type_badge', 'exam_target',
        'status_badge', 'total_marks', 'duration_display', 'start_datetime',
    )
    list_filter = ('status', 'test_type', 'exam_target', 'difficulty_level')
    search_fields = ('test_code', 'title')
    date_hierarchy = 'start_datetime'
    inlines = [TestSectionInline]
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]

    def type_badge(self, obj):
        colors = {
            'PRACTICE': '#3b82f6', 'MOCK': '#8b5cf6', 'LIVE': '#ef4444',
            'ASSIGNMENT': '#f59e0b', 'QUIZ': '#10b981',
        }
        c = colors.get(getattr(obj, 'test_type', ''), '#94a3b8')
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:{}22;color:{};font-weight:600;">{}</span>',
            c, c, getattr(obj, 'test_type', '-')
        )
    type_badge.short_description = 'Type'

    def duration_display(self, obj):
        mins = getattr(obj, 'duration_minutes', None)
        if mins:
            h, m = divmod(mins, 60)
            if h:
                return format_html('<span style="color:#94a3b8;">{}h {}m</span>', h, m)
            return format_html('<span style="color:#94a3b8;">{}m</span>', m)
        return '-'
    duration_display.short_description = 'Duration'


@admin.register(TestSection)
class TestSectionAdmin(EnhancedModelAdmin):
    list_display = ('test', 'section_name', 'section_order', 'total_questions', 'max_marks')
    list_filter = ('test',)
    actions = [export_as_csv]


@admin.register(Question)
class QuestionAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = (
        'question_code', 'type_badge', 'difficulty_badge',
        'subject', 'test', 'active_badge',
    )
    list_filter = ('question_type', 'difficulty', 'is_active', 'subject')
    search_fields = ('question_code', 'question_text')
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]
    list_per_page = 30

    def type_badge(self, obj):
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:rgba(99,102,241,0.1);color:#a5b4fc;font-weight:600;">{}</span>',
            getattr(obj, 'question_type', '-')
        )
    type_badge.short_description = 'Type'

    def difficulty_badge(self, obj):
        colors = {'EASY': '#10b981', 'MEDIUM': '#f59e0b', 'HARD': '#ef4444'}
        d = getattr(obj, 'difficulty', '')
        c = colors.get(d, '#94a3b8')
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:{}22;color:{};font-weight:600;">{}</span>',
            c, c, d or '-'
        )
    difficulty_badge.short_description = 'Difficulty'

    def active_badge(self, obj):
        return colored_status(obj.is_active)
    active_badge.short_description = 'Active'


@admin.register(TestAttempt)
class TestAttemptAdmin(EnhancedModelAdmin):
    list_display = (
        'test', 'student', 'attempt_number', 'status_badge',
        'score_display', 'percentage_display', 'result_badge',
    )
    list_filter = ('status', 'result')
    search_fields = ('student__first_name', 'student__last_name', 'test__title')
    actions = [export_as_csv, export_as_json]
    readonly_fields = ('id',)

    def score_display(self, obj):
        return format_html(
            '<span style="font-weight:700;color:#1e293b;">{}</span>',
            getattr(obj, 'raw_score', '-')
        )
    score_display.short_description = 'Score'

    def percentage_display(self, obj):
        pct = getattr(obj, 'percentage', None)
        if pct is not None:
            color = '#10b981' if pct >= 60 else '#f59e0b' if pct >= 33 else '#ef4444'
            return format_html(
                '<span style="font-weight:700;color:{};">{}%</span>', color, pct
            )
        return '-'
    percentage_display.short_description = '%'

    def result_badge(self, obj):
        r = getattr(obj, 'result', '')
        if r:
            return colored_status(r)
        return '-'
    result_badge.short_description = 'Result'


@admin.register(TestAttemptAnswer)
class TestAttemptAnswerAdmin(EnhancedModelAdmin):
    list_display = ('attempt', 'question', 'status_badge', 'correct_badge', 'marks_awarded', 'time_spent_seconds')
    list_filter = ('status', 'is_correct')
    actions = [export_as_csv]

    def correct_badge(self, obj):
        return colored_status(obj.is_correct)
    correct_badge.short_description = 'Correct'


@admin.register(TestFeedback)
class TestFeedbackAdmin(EnhancedModelAdmin):
    list_display = ('test', 'student', 'overall_rating', 'difficulty_rating')
    actions = [export_as_csv]


@admin.register(OfflineTestMarks)
class OfflineTestMarksAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = ('student', 'test_name', 'test_date', 'marks_obtained', 'total_marks', 'percentage_display')
    actions = [export_as_csv, export_as_json]

    def percentage_display(self, obj):
        pct = getattr(obj, 'percentage', None)
        if pct is not None:
            color = '#10b981' if pct >= 60 else '#f59e0b' if pct >= 33 else '#ef4444'
            return format_html('<span style="font-weight:700;color:{};">{}%</span>', color, pct)
        return '-'
    percentage_display.short_description = '%'
