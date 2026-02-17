from django.contrib import admin
from django.utils.html import format_html
from materials.models import StudyMaterial, MaterialAccess, PhotoGallery, Scholarship, TopperStudent
from admin_utils import EnhancedModelAdmin, ImportExportMixin, export_as_csv, export_as_json, activate_selected, deactivate_selected, colored_status


@admin.register(StudyMaterial)
class StudyMaterialAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = ('title', 'type_badge', 'subject', 'target_audience', 'published_badge', 'view_count_display')
    list_filter = ('material_type', 'target_audience', 'is_published')
    search_fields = ('title', 'material_code')
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]

    def type_badge(self, obj):
        colors = {'PDF': '#ef4444', 'VIDEO': '#3b82f6', 'DOCUMENT': '#f59e0b', 'LINK': '#8b5cf6', 'IMAGE': '#10b981'}
        t = getattr(obj, 'material_type', '')
        c = colors.get(t, '#94a3b8')
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:{}22;color:{};font-weight:600;">{}</span>',
            c, c, t or '-'
        )
    type_badge.short_description = 'Type'

    def published_badge(self, obj):
        return colored_status(getattr(obj, 'is_published', False))
    published_badge.short_description = 'Published'

    def view_count_display(self, obj):
        count = getattr(obj, 'view_count', 0) or 0
        return format_html(
            '<span style="font-weight:600;color:#94a3b8;"><i class="fas fa-eye" style="margin-right:4px;font-size:0.72rem;"></i>{}</span>',
            count
        )
    view_count_display.short_description = 'Views'


@admin.register(MaterialAccess)
class MaterialAccessAdmin(EnhancedModelAdmin):
    list_display = ('material', 'user_id', 'action', 'accessed_at')
    list_filter = ('action',)
    actions = [export_as_csv]


@admin.register(PhotoGallery)
class PhotoGalleryAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = ('title', 'category', 'active_badge', 'sort_order', 'preview')
    list_filter = ('is_active', 'category')
    list_editable = ('sort_order',)
    actions = [export_as_csv, activate_selected, deactivate_selected]

    def active_badge(self, obj):
        return colored_status(getattr(obj, 'is_active', False))
    active_badge.short_description = 'Active'

    def preview(self, obj):
        url = getattr(obj, 'image_url', None) or getattr(obj, 'image', None)
        if url:
            return format_html(
                '<img src="{}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;border:1px solid rgba(99,102,241,0.15);">',
                url
            )
        return '-'
    preview.short_description = 'Preview'


@admin.register(Scholarship)
class ScholarshipAdmin(EnhancedModelAdmin):
    list_display = ('title', 'amount_display', 'discount_display', 'active_badge')
    actions = [export_as_csv, activate_selected, deactivate_selected]

    def amount_display(self, obj):
        amt = getattr(obj, 'amount', None)
        if amt:
            return format_html('<span style="font-weight:700;color:#10b981;">Rs.{}</span>', amt)
        return '-'
    amount_display.short_description = 'Amount'

    def discount_display(self, obj):
        pct = getattr(obj, 'discount_percent', None)
        if pct:
            return format_html('<span style="font-weight:700;color:#f59e0b;">{}%</span>', pct)
        return '-'
    discount_display.short_description = 'Discount'

    def active_badge(self, obj):
        return colored_status(getattr(obj, 'is_active', False))
    active_badge.short_description = 'Active'


@admin.register(TopperStudent)
class TopperStudentAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = ('student_name', 'exam_name', 'year', 'rank_display', 'featured_badge')
    list_filter = ('year', 'is_featured')
    search_fields = ('student_name', 'exam_name')
    actions = [export_as_csv, export_as_json]

    def rank_display(self, obj):
        rank = getattr(obj, 'rank', None)
        if rank:
            colors = {1: '#f59e0b', 2: '#94a3b8', 3: '#cd7f32'}
            c = colors.get(rank, '#64748b')
            return format_html('<span style="font-weight:800;color:{};font-size:1rem;">#{}</span>', c, rank)
        return '-'
    rank_display.short_description = 'Rank'

    def featured_badge(self, obj):
        if getattr(obj, 'is_featured', False):
            return format_html('<span style="color:#f59e0b;font-weight:700;">&#9733; Featured</span>')
        return '-'
    featured_badge.short_description = 'Featured'
