from django.db.models import Count, Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Tenant, User, Project, Parcel, Budget, Payment, Expense, Document
from .permissions import IsTopografoOrReadOnly
from .serializers import (
    TenantSerializer,
    UserSerializer,
    ProjectSerializer,
    ParcelSerializer,
    BudgetSerializer,
    PaymentSerializer,
    ExpenseSerializer,
    DocumentSerializer,
)

class TenantScopedModelViewSet(viewsets.ModelViewSet):
    tenant_field = 'tenant'

    def get_tenant(self):
        return getattr(self.request, 'tenant', None) or getattr(self.request.user, 'tenant', None)

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        tenant = self.get_tenant()
        if user.is_superuser and not tenant:
            return queryset
        return queryset.filter(**{self.tenant_field: tenant})

    def perform_create(self, serializer):
        user = self.request.user
        tenant = self.get_tenant()
        if user.is_superuser:
            if tenant:
                serializer.save(**{self.tenant_field: tenant})
            else:
                serializer.save()
            return
        serializer.save(**{self.tenant_field: tenant})

    def perform_update(self, serializer):
        user = self.request.user
        tenant = self.get_tenant()
        if user.is_superuser:
            if tenant:
                serializer.save(**{self.tenant_field: tenant})
            else:
                serializer.save()
            return
        serializer.save(**{self.tenant_field: tenant})

class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [IsTopografoOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        tenant = getattr(self.request, 'tenant', None)
        if user.is_superuser and not tenant:
            return self.queryset
        if tenant:
            return self.queryset.filter(id=tenant.id)
        return self.queryset.filter(id=user.tenant_id)

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_superuser:
            raise PermissionDenied('Apenas administradores podem criar novos tenants.')
        serializer.save()

class UserViewSet(TenantScopedModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsTopografoOrReadOnly]
    filterset_fields = ['role']

class ProjectViewSet(TenantScopedModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsTopografoOrReadOnly]
    filterset_fields = ['status', 'owner']
    ordering_fields = ['created_at', 'updated_at', 'title']

class ParcelViewSet(TenantScopedModelViewSet):
    queryset = Parcel.objects.all()
    serializer_class = ParcelSerializer
    permission_classes = [IsTopografoOrReadOnly]
    filterset_fields = ['project']
    ordering_fields = ['created_at', 'name']

class BudgetViewSet(TenantScopedModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [IsTopografoOrReadOnly]
    filterset_fields = ['project']

class PaymentViewSet(TenantScopedModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsTopografoOrReadOnly]
    filterset_fields = ['project', 'received_at']
    ordering_fields = ['received_at', 'amount']

class ExpenseViewSet(TenantScopedModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsTopografoOrReadOnly]
    filterset_fields = ['project', 'paid_at']
    ordering_fields = ['paid_at', 'amount']

class DocumentViewSet(TenantScopedModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsTopografoOrReadOnly]
    filterset_fields = ['status', 'doc_type', 'project']
    ordering_fields = ['created_at', 'updated_at']

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        document = self.get_object()
        document.status = Document.STATUS_SUBMITTED
        document.save(update_fields=['status'])
        return Response(self.get_serializer(document).data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        document = self.get_object()
        document.status = Document.STATUS_APPROVED
        document.save(update_fields=['status'])
        return Response(self.get_serializer(document).data)

    @action(detail=True, methods=['post'])
    def reset(self, request, pk=None):
        document = self.get_object()
        document.status = Document.STATUS_DRAFT
        document.save(update_fields=['status'])
        return Response(self.get_serializer(document).data)

class DashboardView(APIView):
    permission_classes = [IsTopografoOrReadOnly]

    def get(self, request):
        tenant = getattr(request, 'tenant', None) or request.user.tenant
        project_id = request.query_params.get('project')

        project_filter = {'tenant': tenant}
        if project_id:
            project_filter['id'] = project_id

        projects = Project.objects.filter(**project_filter)
        parcels = Parcel.objects.filter(project__in=projects)
        budgets = Budget.objects.filter(project__in=projects)
        payments = Payment.objects.filter(project__in=projects)
        expenses = Expense.objects.filter(project__in=projects)
        documents = Document.objects.filter(project__in=projects)

        project_status = {
            item['status']: item['count']
            for item in projects.values('status').annotate(count=Count('id'))
        }

        document_status = {
            item['status']: item['count']
            for item in documents.values('status').annotate(count=Count('id'))
        }

        totals = {
            'budget_total': budgets.aggregate(total=Sum('total_value'))['total'] or 0,
            'payments_total': payments.aggregate(total=Sum('amount'))['total'] or 0,
            'expenses_total': expenses.aggregate(total=Sum('amount'))['total'] or 0,
            'area_sq_m': parcels.aggregate(total=Sum('area_sq_m'))['total'] or 0,
            'perimeter_m': parcels.aggregate(total=Sum('perimeter_m'))['total'] or 0,
        }

        return Response({
            'project_status': project_status,
            'document_status': document_status,
            'totals': totals,
        })
