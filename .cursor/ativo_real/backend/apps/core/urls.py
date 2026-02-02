from rest_framework.routers import DefaultRouter
from django.urls import include, path
from .views import (
    TenantViewSet,
    UserViewSet,
    ProjectViewSet,
    ParcelViewSet,
    BudgetViewSet,
    PaymentViewSet,
    ExpenseViewSet,
    DocumentViewSet,
    DashboardView,
)

router = DefaultRouter()
router.register('tenants', TenantViewSet)
router.register('users', UserViewSet)
router.register('projects', ProjectViewSet)
router.register('parcels', ParcelViewSet)
router.register('budgets', BudgetViewSet)
router.register('payments', PaymentViewSet)
router.register('expenses', ExpenseViewSet)
router.register('documents', DocumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
]
