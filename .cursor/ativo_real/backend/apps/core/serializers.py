from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Tenant, User, Project, Parcel, Budget, Payment, Expense, Document

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'

class BaseTenantSerializer(serializers.ModelSerializer):
    def get_request_user(self):
        request = self.context.get('request')
        return getattr(request, 'user', None)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'tenant']
        read_only_fields = ['tenant']

    def validate(self, attrs):
        user = self.context['request'].user
        tenant = attrs.get('tenant')
        if tenant and not user.is_superuser and tenant != user.tenant:
            raise serializers.ValidationError('Usuario deve pertencer ao mesmo tenant.')
        return attrs

class ProjectSerializer(BaseTenantSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['tenant']

    def validate(self, attrs):
        user = self.get_request_user()
        owner = attrs.get('owner')
        if user and owner and not user.is_superuser and owner.tenant_id != user.tenant_id:
            raise serializers.ValidationError('Owner deve pertencer ao mesmo tenant.')
        return attrs

class ParcelSerializer(BaseTenantSerializer, GeoFeatureModelSerializer):
    class Meta:
        model = Parcel
        geo_field = 'boundary'
        fields = ['id', 'tenant', 'project', 'name', 'boundary', 'area_sq_m', 'perimeter_m', 'created_at']
        read_only_fields = ['tenant', 'created_at']

    def validate(self, attrs):
        user = self.get_request_user()
        project = attrs.get('project')
        if user and project and not user.is_superuser and project.tenant_id != user.tenant_id:
            raise serializers.ValidationError('Projeto deve pertencer ao mesmo tenant.')
        return attrs

class BudgetSerializer(BaseTenantSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ['tenant']

    def validate(self, attrs):
        user = self.get_request_user()
        project = attrs.get('project')
        if user and project and not user.is_superuser and project.tenant_id != user.tenant_id:
            raise serializers.ValidationError('Projeto deve pertencer ao mesmo tenant.')
        return attrs

class PaymentSerializer(BaseTenantSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['tenant']

    def validate(self, attrs):
        user = self.get_request_user()
        project = attrs.get('project')
        if user and project and not user.is_superuser and project.tenant_id != user.tenant_id:
            raise serializers.ValidationError('Projeto deve pertencer ao mesmo tenant.')
        return attrs

class ExpenseSerializer(BaseTenantSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['tenant']

    def validate(self, attrs):
        user = self.get_request_user()
        project = attrs.get('project')
        if user and project and not user.is_superuser and project.tenant_id != user.tenant_id:
            raise serializers.ValidationError('Projeto deve pertencer ao mesmo tenant.')
        return attrs

class DocumentSerializer(BaseTenantSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['tenant']

    def validate(self, attrs):
        user = self.get_request_user()
        project = attrs.get('project')
        if user and project and not user.is_superuser and project.tenant_id != user.tenant_id:
            raise serializers.ValidationError('Projeto deve pertencer ao mesmo tenant.')
        return attrs
