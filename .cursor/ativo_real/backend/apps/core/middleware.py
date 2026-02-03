from .models import Tenant

class TenantContextMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.tenant = None
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            if user.is_superuser:
                tenant_id = request.META.get('HTTP_X_TENANT_ID')
                tenant_slug = request.META.get('HTTP_X_TENANT_SLUG')
                if tenant_id:
                    try:
                        request.tenant = Tenant.objects.get(id=tenant_id)
                    except Tenant.DoesNotExist:
                        request.tenant = None
                elif tenant_slug:
                    try:
                        request.tenant = Tenant.objects.get(slug=tenant_slug)
                    except Tenant.DoesNotExist:
                        request.tenant = None
                else:
                    request.tenant = getattr(user, 'tenant', None)
            else:
                request.tenant = getattr(user, 'tenant', None)

        return self.get_response(request)
