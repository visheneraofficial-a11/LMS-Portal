"""
ENF Online Class — Admin Utilities
Shared mixins, actions, and helpers for the enhanced admin console.
"""
import csv
import io
import json
from datetime import datetime, timedelta

from django.contrib import admin, messages
from django.http import HttpResponse, HttpResponseRedirect
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils import timezone
from django.utils.html import format_html
from django.db.models import Count, Q


# ═══════════════════════════════════════════════════════════════════
# EXPORT ACTIONS
# ═══════════════════════════════════════════════════════════════════

def export_as_csv(modeladmin, request, queryset):
    """Export selected records as CSV."""
    meta = modeladmin.model._meta
    field_names = [f.name for f in meta.fields]

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename={meta.verbose_name_plural.replace(" ", "_")}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'

    writer = csv.writer(response)
    writer.writerow(field_names)

    for obj in queryset:
        row = []
        for field in field_names:
            value = getattr(obj, field)
            if isinstance(value, datetime):
                value = value.strftime('%Y-%m-%d %H:%M:%S')
            row.append(str(value) if value is not None else '')
        writer.writerow(row)

    modeladmin.message_user(request, f"Exported {queryset.count()} {meta.verbose_name_plural} to CSV.", messages.SUCCESS)
    return response

export_as_csv.short_description = "📥 Export selected as CSV"


def export_as_json(modeladmin, request, queryset):
    """Export selected records as JSON."""
    meta = modeladmin.model._meta
    field_names = [f.name for f in meta.fields]

    data = []
    for obj in queryset:
        row = {}
        for field in field_names:
            value = getattr(obj, field)
            if isinstance(value, datetime):
                value = value.isoformat()
            elif hasattr(value, 'pk'):
                value = str(value.pk)
            else:
                value = str(value) if value is not None else None
            row[field] = value
        data.append(row)

    response = HttpResponse(
        json.dumps(data, indent=2, ensure_ascii=False),
        content_type='application/json'
    )
    response['Content-Disposition'] = f'attachment; filename={meta.verbose_name_plural.replace(" ", "_")}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'

    modeladmin.message_user(request, f"Exported {queryset.count()} {meta.verbose_name_plural} to JSON.", messages.SUCCESS)
    return response

export_as_json.short_description = "📥 Export selected as JSON"


# ═══════════════════════════════════════════════════════════════════
# STATUS ACTIONS
# ═══════════════════════════════════════════════════════════════════

def activate_selected(modeladmin, request, queryset):
    """Activate selected records (set status=ACTIVE or is_active=True)."""
    count = 0
    if hasattr(modeladmin.model, 'status'):
        count = queryset.update(status='ACTIVE')
    elif hasattr(modeladmin.model, 'is_active'):
        count = queryset.update(is_active=True)
    modeladmin.message_user(request, f"Activated {count} records.", messages.SUCCESS)

activate_selected.short_description = "✅ Activate selected"


def deactivate_selected(modeladmin, request, queryset):
    """Deactivate selected records."""
    count = 0
    if hasattr(modeladmin.model, 'status'):
        count = queryset.update(status='INACTIVE')
    elif hasattr(modeladmin.model, 'is_active'):
        count = queryset.update(is_active=False)
    modeladmin.message_user(request, f"Deactivated {count} records.", messages.SUCCESS)

deactivate_selected.short_description = "🚫 Deactivate selected"


def suspend_selected(modeladmin, request, queryset):
    """Suspend selected records."""
    if hasattr(modeladmin.model, 'status'):
        count = queryset.update(status='SUSPENDED')
        modeladmin.message_user(request, f"Suspended {count} records.", messages.WARNING)

suspend_selected.short_description = "⏸ Suspend selected"


# ═══════════════════════════════════════════════════════════════════
# DISPLAY HELPERS
# ═══════════════════════════════════════════════════════════════════

def colored_status(status):
    """Returns HTML for a color-coded status badge."""
    color_map = {
        'ACTIVE': ('#10b981', '#064e3b'),
        'INACTIVE': ('#ef4444', '#450a0a'),
        'SUSPENDED': ('#f59e0b', '#451a03'),
        'PENDING_VERIFICATION': ('#3b82f6', '#1e3a5f'),
        'PENDING': ('#3b82f6', '#1e3a5f'),
        'DRAFT': ('#94a3b8', '#1e293b'),
        'PUBLISHED': ('#10b981', '#064e3b'),
        'COMPLETED': ('#10b981', '#064e3b'),
        'CANCELLED': ('#ef4444', '#450a0a'),
        'IN_PROGRESS': ('#f59e0b', '#451a03'),
        'SCHEDULED': ('#8b5cf6', '#2e1065'),
        'LIVE': ('#ef4444', '#450a0a'),
        'OPEN': ('#10b981', '#064e3b'),
        'CLOSED': ('#94a3b8', '#1e293b'),
        'RESOLVED': ('#10b981', '#064e3b'),
        True: ('#10b981', '#064e3b'),
        False: ('#ef4444', '#450a0a'),
    }
    fg, bg = color_map.get(status, ('#94a3b8', '#1e293b'))
    label = str(status).replace('_', ' ').title() if isinstance(status, str) else ('Active' if status else 'Inactive')
    return format_html(
        '<span style="display:inline-flex;align-items:center;padding:3px 10px;'
        'border-radius:6px;font-size:0.72rem;font-weight:600;'
        'color:{};background:{};letter-spacing:0.03em;'
        'border:1px solid {}22;">{}</span>',
        fg, bg, fg, label
    )


# ═══════════════════════════════════════════════════════════════════
# ENHANCED BASE ADMIN
# ═══════════════════════════════════════════════════════════════════

class EnhancedModelAdmin(admin.ModelAdmin):
    """Base ModelAdmin with export actions, colored statuses, and enhanced UI."""

    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]
    list_per_page = 25
    show_full_result_count = True
    save_on_top = True

    class Media:
        css = {'all': ('css/admin_theme.css',)}

    def status_badge(self, obj):
        status = getattr(obj, 'status', None)
        if status is None:
            status = getattr(obj, 'is_active', None)
        if status is not None:
            return colored_status(status)
        return '-'
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'

    def created_display(self, obj):
        dt = getattr(obj, 'created_at', None)
        if dt:
            return format_html(
                '<span style="color:#94a3b8;font-size:0.82rem;" title="{}">{}</span>',
                dt.strftime('%Y-%m-%d %H:%M:%S'),
                dt.strftime('%d %b %Y')
            )
        return '-'
    created_display.short_description = 'Created'
    created_display.admin_order_field = 'created_at'

    def updated_display(self, obj):
        dt = getattr(obj, 'updated_at', None)
        if dt:
            return format_html(
                '<span style="color:#94a3b8;font-size:0.82rem;" title="{}">{}</span>',
                dt.strftime('%Y-%m-%d %H:%M:%S'),
                dt.strftime('%d %b %Y')
            )
        return '-'
    updated_display.short_description = 'Updated'
    updated_display.admin_order_field = 'updated_at'


# ═══════════════════════════════════════════════════════════════════
# IMPORT MIXIN
# ═══════════════════════════════════════════════════════════════════

class ImportExportMixin:
    """Adds import/export URL endpoints to a ModelAdmin."""
    change_list_template = 'admin/enhanced_change_list.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('import-csv/', self.import_csv_view, name=f'{self.model._meta.app_label}_{self.model._meta.model_name}_import_csv'),
            path('export-all-csv/', self.export_all_csv_view, name=f'{self.model._meta.app_label}_{self.model._meta.model_name}_export_all_csv'),
        ]
        return custom_urls + urls

    def import_csv_view(self, request):
        if request.method == 'POST' and request.FILES.get('csv_file'):
            csv_file = request.FILES['csv_file']
            try:
                decoded = csv_file.read().decode('utf-8-sig')
                reader = csv.DictReader(io.StringIO(decoded))
                created_count = 0
                error_count = 0
                for row in reader:
                    try:
                        # Clean row: strip whitespace from keys and values
                        clean_row = {k.strip(): v.strip() if isinstance(v, str) else v for k, v in row.items() if k}
                        # Remove id/pk/uuid fields for creation
                        for remove_key in ['id', 'pk', 'uuid', 'created_at', 'updated_at']:
                            clean_row.pop(remove_key, None)

                        # Get valid field names
                        valid_fields = {f.name for f in self.model._meta.fields}
                        filtered_row = {k: v for k, v in clean_row.items() if k in valid_fields}

                        self.model.objects.create(**filtered_row)
                        created_count += 1
                    except Exception as e:
                        error_count += 1

                self.message_user(
                    request,
                    f"Import complete: {created_count} created, {error_count} errors.",
                    messages.SUCCESS if error_count == 0 else messages.WARNING
                )
            except Exception as e:
                self.message_user(request, f"Import failed: {str(e)}", messages.ERROR)

            return HttpResponseRedirect(request.META.get('HTTP_REFERER', '../'))

        context = {
            **self.admin_site.each_context(request),
            'title': f'Import {self.model._meta.verbose_name_plural.title()}',
            'model_name': self.model._meta.verbose_name_plural.title(),
            'opts': self.model._meta,
        }
        return TemplateResponse(request, 'admin/import_csv.html', context)

    def export_all_csv_view(self, request):
        queryset = self.model.objects.all()
        return export_as_csv(self, request, queryset)
