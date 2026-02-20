"""
LMS Enterprise - Root URL Configuration

URL Map:
    /admin/              → Django Built-in Admin Panel
    /staff/*             → Staff Dashboard (custom admin pages)
    /student/dashboard/  → Student Dashboard
    /teacher/dashboard/  → Teacher Dashboard
    /api/v1/*            → REST API endpoints
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

# Load custom admin site configuration (dashboard stats, branding)
import core.enf_admin_site as enf_admin_site  # noqa: F401

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions


class APIRootView(APIView):
    # permission_classes uses IsAuthenticated default from settings
    def get(self, request):
        return Response({
            'success': True,
            'application': 'LMS Enterprise API',
            'version': 'v1',
            'endpoints': {
                'auth': '/api/v1/auth/',
                'student': '/api/v1/student/',
                'teacher': '/api/v1/teacher/',
                'admin': '/api/v1/admin/',
                'tenants': '/api/v1/tenants/',
                'academics': '/api/v1/academics/',
                'classes': '/api/v1/classes/',
                'assessments': '/api/v1/assessments/',
                'attendance': '/api/v1/attendance/',
                'materials': '/api/v1/materials/',
                'communication': '/api/v1/communication/',
                'sessions': '/api/v1/sessions/',
                'audit': '/api/v1/audit/',
                'system': '/api/v1/system/',
            }
        })




class HealthCheckView(APIView):
    """Health check endpoint for monitoring and load balancers."""
    # permission_classes uses IsAuthenticated default from settings
    def get(self, request):
        import django
        from django.db import connection
        health = {
            'status': 'healthy',
            'django_version': django.__version__,
            'database': 'unknown',
        }
        try:
            connection.ensure_connection()
            health['database'] = 'connected'
        except Exception as e:
            health['status'] = 'degraded'
            health['database'] = str(e)
        return Response(health)

# ============================================================================
# CORE URL PATTERNS
# ============================================================================
urlpatterns = [
    # ── Django Built-in Admin Panel ──
    # Access at: /admin/
    # This is the standard Django admin for direct database management.
    # All model registrations (admin.py files) appear here.
    path('admin/', admin.site.urls),

    # ── Health Check ──
    path('health/', HealthCheckView.as_view(), name='health-check'),

    # ── API Root ──
    path('api/v1/', APIRootView.as_view(), name='api-root'),

    # ── API v1 Endpoints ──
    path('api/v1/auth/', include('accounts.urls.auth_urls')),
    path('api/v1/student/', include('accounts.urls.student_urls')),
    path('api/v1/teacher/', include('accounts.urls.teacher_urls')),
    path('api/v1/admin/', include('accounts.urls.admin_urls')),

    # ── Module APIs ──
    path('api/v1/tenants/', include('tenants.urls')),
    path('api/v1/academics/', include('academics.urls')),
    path('api/v1/classes/', include('classes.urls')),
    path('api/v1/assessments/', include('assessments.urls')),
    path('api/v1/attendance/', include('attendance.urls')),
    path('api/v1/materials/', include('materials.urls')),
    path('api/v1/communication/', include('communication.urls')),
    path('api/v1/sessions/', include('sessions_tracking.urls')),
    path('api/v1/audit/', include('audit.urls')),
    path('api/v1/system/', include('system_config.urls')),
]


# ============================================================================
# FRONTEND ROUTES — Public Pages
# ============================================================================
from core.frontend_views import (
    HomeView, LoginView, RegisterView, LogoutView,
    StudentDashboardView, TeacherDashboardView, AdminDashboardView,
    ProgramsView, PartnersView, ScholarshipsView, NewsView,
    AboutView, FounderView, ManagementView, EnquiryView,
)

urlpatterns += [
    path('', HomeView.as_view(), name='home'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Content pages
    path('programs/', ProgramsView.as_view(), name='programs'),
    path('partners/', PartnersView.as_view(), name='partners'),
    path('scholarships/', ScholarshipsView.as_view(), name='scholarships'),
    path('news/', NewsView.as_view(), name='news'),
    path('about/', AboutView.as_view(), name='about'),
    path('founder/', FounderView.as_view(), name='founder'),
    path('management/', ManagementView.as_view(), name='management'),
    path('enquiry/', EnquiryView.as_view(), name='enquiry'),
]


# ============================================================================
# STUDENT DASHBOARD — /student/*
# ============================================================================
urlpatterns += [
    path('student/dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    re_path(r'^student/dashboard/(?P<path>.*)$', StudentDashboardView.as_view(), name='student-dashboard-spa'),
]


# ============================================================================
# TEACHER DASHBOARD — /teacher/*
# ============================================================================
urlpatterns += [
    path('teacher/dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    re_path(r'^teacher/dashboard/(?P<path>.*)$', TeacherDashboardView.as_view(), name='teacher-dashboard-spa'),
]


# ============================================================================
# STAFF DASHBOARD — /staff/*  (formerly "Admin Dashboard")
# This is the custom admin interface built with Django templates.
# Django's built-in admin panel lives at /admin/ separately.
# ============================================================================
from core.admin_page_views import (
    AnalyticsView, MonitoringView, SubjectsView, BatchesView,
    ProgramsAdminView, AcademicSessionsView, TestsView, QuestionsView,
    TestReportsView, SchoolsView, TeachersView, TeacherAttendanceView,
    StudentsView, StudentAttendanceView, LiveClassesView, StudyMaterialsView,
    AnnouncementsView, TicketsView, TenantsView, SettingsView,
    AuditView, ProfileView, NotificationsView,
    StaffRolesView, IntegrationsView, ReportsView, WebsiteSettingsView,
    ExamManagementView, ComplianceView, AIFeaturesView, DashboardIntegrationView,
    AutoGradeView,
)

urlpatterns += [
    # Staff Dashboard — Main
    path('staff/dashboard/', AdminDashboardView.as_view(), name='staff-dashboard'),

    # Staff Dashboard — Analytics & Monitoring
    path('staff/analytics/', AnalyticsView.as_view(), name='staff-analytics'),
    path('staff/monitoring/', MonitoringView.as_view(), name='staff-monitoring'),

    # Staff Dashboard — Academic Management
    path('staff/subjects/', SubjectsView.as_view(), name='staff-subjects'),
    path('staff/batches/', BatchesView.as_view(), name='staff-batches'),
    path('staff/programs/', ProgramsAdminView.as_view(), name='staff-programs'),
    path('staff/sessions/', AcademicSessionsView.as_view(), name='staff-sessions'),

    # Staff Dashboard — Assessments
    path('staff/tests/', TestsView.as_view(), name='staff-tests'),
    path('staff/questions/', QuestionsView.as_view(), name='staff-questions'),
    path('staff/test-reports/', TestReportsView.as_view(), name='staff-test-reports'),

    # Staff Dashboard — People Management
    path('staff/schools/', SchoolsView.as_view(), name='staff-schools'),
    path('staff/teachers/', TeachersView.as_view(), name='staff-teachers'),
    path('staff/teacher-attendance/', TeacherAttendanceView.as_view(), name='staff-teacher-attendance'),
    path('staff/students/', StudentsView.as_view(), name='staff-students'),
    path('staff/student-attendance/', StudentAttendanceView.as_view(), name='staff-student-attendance'),

    # Staff Dashboard — Content & Classes
    path('staff/live-classes/', LiveClassesView.as_view(), name='staff-live-classes'),
    path('staff/study-materials/', StudyMaterialsView.as_view(), name='staff-study-materials'),

    # Staff Dashboard — Communication
    path('staff/announcements/', AnnouncementsView.as_view(), name='staff-announcements'),
    path('staff/tickets/', TicketsView.as_view(), name='staff-tickets'),

    # Staff Dashboard — System
    path('staff/tenants/', TenantsView.as_view(), name='staff-tenants'),
    path('staff/settings/', SettingsView.as_view(), name='staff-settings'),
    path('staff/audit/', AuditView.as_view(), name='staff-audit'),
    path('staff/profile/', ProfileView.as_view(), name='staff-profile'),
    path('staff/notifications/', NotificationsView.as_view(), name='staff-notifications'),

    # Staff Dashboard — Advanced
    path('staff/staff-roles/', StaffRolesView.as_view(), name='staff-roles'),
    path('staff/integrations/', IntegrationsView.as_view(), name='staff-integrations'),
    path('staff/reports/', ReportsView.as_view(), name='staff-reports'),
    path('staff/website-settings/', WebsiteSettingsView.as_view(), name='staff-website-settings'),
    path('staff/exam-management/', ExamManagementView.as_view(), name='staff-exam-management'),
    path('staff/compliance/', ComplianceView.as_view(), name='staff-compliance'),
    path('staff/ai-features/', AIFeaturesView.as_view(), name='staff-ai-features'),
    path('staff/dashboard-integration/', DashboardIntegrationView.as_view(), name='staff-dashboard-integration'),
    path('staff/exam/<uuid:test_id>/grade/', AutoGradeView.as_view(), name='staff-auto-grade'),
]


# ============================================================================
# STATIC & MEDIA (Development)
# ============================================================================
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
