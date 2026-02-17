"""
Tenant Middleware - Resolves tenant from request subdomain/domain.
"""
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from tenants.models import Tenant
import logging

logger = logging.getLogger('lms')


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to resolve the current tenant from request host.
    Sets request.tenant for use in views and querysets.
    """
    EXEMPT_PATHS = ['/admin/', '/api/v1/system/health/']

    def process_request(self, request):
        # Skip tenant resolution for exempt paths
        for path in self.EXEMPT_PATHS:
            if request.path.startswith(path):
                request.tenant = None
                return None

        host = request.get_host().split(':')[0]  # Remove port

        # Try custom domain first
        tenant = Tenant.objects.filter(
            custom_domain=host,
            status__in=[Tenant.Status.ACTIVE, Tenant.Status.TRIAL]
        ).first()

        if not tenant:
            # Try subdomain
            parts = host.split('.')
            if len(parts) >= 3:
                subdomain = parts[0]
                tenant = Tenant.objects.filter(
                    subdomain=subdomain,
                    status__in=[Tenant.Status.ACTIVE, Tenant.Status.TRIAL]
                ).first()

        if not tenant and not request.path.startswith('/api/v1/admin/tenants'):
            # For development, allow passing tenant via header
            tenant_header = request.META.get('HTTP_X_TENANT_ID')
            if tenant_header:
                tenant = Tenant.objects.filter(
                    id=tenant_header,
                    status__in=[Tenant.Status.ACTIVE, Tenant.Status.TRIAL]
                ).first()

        request.tenant = tenant
        return None
