"""
Tenant context processor for templates.
"""


def tenant_context(request):
    """Add tenant information to template context."""
    tenant = getattr(request, 'tenant', None)
    return {
        'tenant': tenant,
        'tenant_name': tenant.name if tenant else 'LMS Platform',
        'tenant_logo': tenant.logo_url if tenant else None,
        'primary_color': tenant.primary_color if tenant else '#1E3A5F',
    }
