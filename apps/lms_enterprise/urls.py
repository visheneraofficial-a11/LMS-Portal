"""
LMS Enterprise - Root URL Configuration
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

# Load custom admin site configuration (dashboard stats, branding)
import enf_admin_site  # noqa: F401
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions


class APIRootView(APIView):
    permission_classes = [permissions.AllowAny]
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


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', APIRootView.as_view(), name='api-root'),

    # API v1 endpoints
    path('api/v1/auth/', include('accounts.urls.auth_urls')),
    path('api/v1/student/', include('accounts.urls.student_urls')),
    path('api/v1/teacher/', include('accounts.urls.teacher_urls')),
    path('api/v1/admin/', include('accounts.urls.admin_urls')),

    # Module APIs
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

# ============ Frontend Routes ============
from frontend_views import (
    HomeView, LoginView, RegisterView, LogoutView,
    StudentDashboardView, TeacherDashboardView, AdminDashboardView,
    ProgramsView, PartnersView, ScholarshipsView, NewsView,
    AboutView, FounderView, ManagementView, EnquiryView,
)

from admin_page_views import (
    AnalyticsView, MonitoringView, SubjectsView, BatchesView,
    ProgramsAdminView, AcademicSessionsView, TestsView, QuestionsView,
    TestReportsView, SchoolsView, TeachersView, TeacherAttendanceView,
    StudentsView, StudentAttendanceView, LiveClassesView, StudyMaterialsView,
    AnnouncementsView, TicketsView, TenantsView, SettingsView,
    AuditView, ProfileView, NotificationsView,
)

urlpatterns += [
    path('', HomeView.as_view(), name='home'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('student/dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    re_path(r'^student/dashboard/(?P<path>.*)$', StudentDashboardView.as_view(), name='student-dashboard-spa'),
    path('teacher/dashboard/', TeacherDashboardView.as_view(), name='teacher-dashboard'),
    re_path(r'^teacher/dashboard/(?P<path>.*)$', TeacherDashboardView.as_view(), name='teacher-dashboard-spa'),
    path('staff/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    # Content pages
    path('programs/', ProgramsView.as_view(), name='programs'),
    path('partners/', PartnersView.as_view(), name='partners'),
    path('scholarships/', ScholarshipsView.as_view(), name='scholarships'),
    path('news/', NewsView.as_view(), name='news'),
    path('about/', AboutView.as_view(), name='about'),
    path('founder/', FounderView.as_view(), name='founder'),
    path('management/', ManagementView.as_view(), name='management'),
    path('enquiry/', EnquiryView.as_view(), name='enquiry'),

    # ============ Admin Section Pages ============
    path('staff/analytics/', AnalyticsView.as_view(), name='admin-analytics'),
    path('staff/monitoring/', MonitoringView.as_view(), name='admin-monitoring'),
    path('staff/subjects/', SubjectsView.as_view(), name='admin-subjects'),
    path('staff/batches/', BatchesView.as_view(), name='admin-batches'),
    path('staff/programs/', ProgramsAdminView.as_view(), name='admin-programs'),
    path('staff/sessions/', AcademicSessionsView.as_view(), name='admin-sessions'),
    path('staff/tests/', TestsView.as_view(), name='admin-tests'),
    path('staff/questions/', QuestionsView.as_view(), name='admin-questions'),
    path('staff/test-reports/', TestReportsView.as_view(), name='admin-test-reports'),
    path('staff/schools/', SchoolsView.as_view(), name='admin-schools'),
    path('staff/teachers/', TeachersView.as_view(), name='admin-teachers'),
    path('staff/teacher-attendance/', TeacherAttendanceView.as_view(), name='admin-teacher-attendance'),
    path('staff/students/', StudentsView.as_view(), name='admin-students'),
    path('staff/student-attendance/', StudentAttendanceView.as_view(), name='admin-student-attendance'),
    path('staff/live-classes/', LiveClassesView.as_view(), name='admin-live-classes'),
    path('staff/study-materials/', StudyMaterialsView.as_view(), name='admin-study-materials'),
    path('staff/announcements/', AnnouncementsView.as_view(), name='admin-announcements'),
    path('staff/tickets/', TicketsView.as_view(), name='admin-tickets'),
    path('staff/tenants/', TenantsView.as_view(), name='admin-tenants'),
    path('staff/settings/', SettingsView.as_view(), name='admin-settings'),
    path('staff/audit/', AuditView.as_view(), name='admin-audit'),
    path('staff/profile/', ProfileView.as_view(), name='admin-profile'),
    path('staff/notifications/', NotificationsView.as_view(), name='admin-notifications'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
