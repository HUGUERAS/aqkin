from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

def env_bool(name, default=False):
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}

def env_list(name, default=None):
    value = os.environ.get(name)
    if value is None:
        return default or []
    return [item.strip() for item in value.split(',') if item.strip()]

DEBUG = env_bool('DJANGO_DEBUG', False)
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = 'dev-insecure-key'
    else:
        raise RuntimeError('DJANGO_SECRET_KEY must be set in production.')

ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', ['localhost', '127.0.0.1'])

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'rest_framework',
    'django_filters',
    'corsheaders',
    'apps.core',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.core.middleware.TenantContextMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ativo_real.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ativo_real.wsgi.application'
ASGI_APPLICATION = 'ativo_real.asgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get('POSTGRES_DB', 'ativo_real'),
        'USER': os.environ.get('POSTGRES_USER', 'ativo_real'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'ativo_real'),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
        'OPTIONS': {},
    }
}

_db_sslmode = os.environ.get('POSTGRES_SSLMODE')
if _db_sslmode:
    DATABASES['default']['OPTIONS']['sslmode'] = _db_sslmode

GDAL_LIBRARY_PATH = os.environ.get('GDAL_LIBRARY_PATH')
GEOS_LIBRARY_PATH = os.environ.get('GEOS_LIBRARY_PATH')

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'core.User'

CORS_ALLOW_ALL_ORIGINS = env_bool('CORS_ALLOW_ALL_ORIGINS', False)
CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS', [])
CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS', [])

SECURE_SSL_REDIRECT = env_bool('DJANGO_SECURE_SSL_REDIRECT', False)
SESSION_COOKIE_SECURE = SECURE_SSL_REDIRECT
CSRF_COOKIE_SECURE = SECURE_SSL_REDIRECT
SECURE_HSTS_SECONDS = int(os.environ.get('DJANGO_HSTS_SECONDS', '0'))
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool('DJANGO_HSTS_INCLUDE_SUBDOMAINS', False)
SECURE_HSTS_PRELOAD = env_bool('DJANGO_HSTS_PRELOAD', False)
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'same-origin'
X_FRAME_OPTIONS = 'DENY'
if env_bool('DJANGO_SECURE_PROXY_SSL_HEADER', False):
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

_authentication_classes = [
    'rest_framework_simplejwt.authentication.JWTAuthentication',
]
if env_bool('DJANGO_ENABLE_SESSION_AUTH', False):
    _authentication_classes.append('rest_framework.authentication.SessionAuthentication')
if env_bool('DJANGO_ENABLE_BASIC_AUTH', False):
    _authentication_classes.append('rest_framework.authentication.BasicAuthentication')

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': _authentication_classes,
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': os.environ.get('DRF_THROTTLE_ANON', '30/min'),
        'user': os.environ.get('DRF_THROTTLE_USER', '120/min'),
    },
}

SIMPLE_JWT = {
    'AUTH_HEADER_TYPES': ('Bearer',),
}
