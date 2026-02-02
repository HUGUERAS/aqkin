from django.contrib.auth.models import AbstractUser
from django.contrib.gis.db import models

class Tenant(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_TOPOGRAFO = 'topografo'
    ROLE_PROPRIETARIO = 'proprietario'

    ROLE_CHOICES = [
        (ROLE_TOPOGRAFO, 'Topografo'),
        (ROLE_PROPRIETARIO, 'Proprietario'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='users')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_PROPRIETARIO)

class Project(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_DONE = 'done'

    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Rascunho'),
        (STATUS_IN_PROGRESS, 'Em andamento'),
        (STATUS_DONE, 'Concluido'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='projects')
    owner = models.ForeignKey(User, on_delete=models.PROTECT, related_name='owned_projects')
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Parcel(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='parcels')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='parcels')
    name = models.CharField(max_length=200)
    boundary = models.MultiPolygonField(srid=4326)
    area_sq_m = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    perimeter_m = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Budget(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='budgets')
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='budget')
    total_value = models.DecimalField(max_digits=14, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Payment(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='payments')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    received_at = models.DateField()
    description = models.CharField(max_length=255, blank=True)

class Expense(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='expenses')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='expenses')
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    paid_at = models.DateField()
    description = models.CharField(max_length=255, blank=True)

class Document(models.Model):
    TYPE_ART = 'art'
    TYPE_MEMORIAL = 'memorial'
    TYPE_CAR = 'car'
    TYPE_SIGEF = 'sigef'

    TYPE_CHOICES = [
        (TYPE_ART, 'ART'),
        (TYPE_MEMORIAL, 'Memorial'),
        (TYPE_CAR, 'CAR'),
        (TYPE_SIGEF, 'SIGEF'),
    ]

    STATUS_DRAFT = 'draft'
    STATUS_SUBMITTED = 'submitted'
    STATUS_APPROVED = 'approved'

    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Rascunho'),
        (STATUS_SUBMITTED, 'Enviado'),
        (STATUS_APPROVED, 'Aprovado'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='documents')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    doc_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    file = models.FileField(upload_to='documents/', blank=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
