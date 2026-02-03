from django.contrib import admin
from .models import Tenant, User, Project, Parcel, Budget, Payment, Expense, Document

admin.site.register(Tenant)
admin.site.register(User)
admin.site.register(Project)
admin.site.register(Parcel)
admin.site.register(Budget)
admin.site.register(Payment)
admin.site.register(Expense)
admin.site.register(Document)
