from django.contrib import admin
from django.utils.html import format_html
from tenants.models import Tenant
from admin_utils import EnhancedModelAdmin, ImportExportMixin, export_as_csv, export_as_json, activate_selected, deactivate_selected, colored_status


@admin.register(Tenant)
class TenantAdmin(ImportExportMixin, EnhancedModelAdmin):
    list_display = ('code', 'name', 'subdomain_display', 'plan_badge', 'status_badge', 'created_display')
    list_filter = ('status', 'plan_type')
    search_fields = ('code', 'name', 'subdomain', 'custom_domain')
    readonly_fields = ('id', 'created_at', 'updated_at')
    actions = [export_as_csv, export_as_json, activate_selected, deactivate_selected]

    def subdomain_display(self, obj):
        sd = getattr(obj, 'subdomain', '')
        return format_html(
            '<span style="font-family:monospace;font-size:0.82rem;color:#a5b4fc;padding:2px 8px;background:rgba(99,102,241,0.08);border-radius:6px;">{}</span>',
            sd or '-'
        )
    subdomain_display.short_description = 'Subdomain'

    def plan_badge(self, obj):
        p = getattr(obj, 'plan_type', '')
        colors = {'FREE': '#94a3b8', 'BASIC': '#3b82f6', 'PRO': '#8b5cf6', 'ENTERPRISE': '#f59e0b'}
        c = colors.get(p, '#94a3b8')
        return format_html(
            '<span style="padding:2px 8px;border-radius:5px;font-size:0.72rem;background:{}22;color:{};font-weight:700;">{}</span>',
            c, c, p or '-'
        )
    plan_badge.short_description = 'Plan'
