"""
Admin Staff Page Views — Full CRUD-capable management pages
Each sidebar item gets its own view rendering data from the database.
"""
from datetime import datetime, timedelta, date
from django.conf import settings
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views import View
from django.utils import timezone
from django.db.models import Count, Q, Sum, Avg, F, Max, Min

from accounts.models import Student, Teacher, Admin
from tenants.models import Tenant
from audit.models import AuditLog


def _require_admin(request):
    """Check admin session, return redirect if not admin, else None"""
    if request.session.get('user_type') != 'ADMIN':
        return redirect('/login/?role=admin')
    return None


def _admin_ctx(request, active_page, page_title, breadcrumb_parent=None, breadcrumb_parent_url=None):
    """Build base context for all admin pages"""
    from academics.models import Batch
    from communication.models import SupportTicket
    from assessments.models import Test

    ctx = {
        'user_name': request.session.get('user_name', 'User'),
        'user_type': request.session.get('user_type', ''),
        'user_id': request.session.get('user_id', ''),
        'user_email': request.session.get('user_email', ''),
        'user_initials': ''.join(w[0].upper() for w in request.session.get('user_name', 'U').split()[:2]),
        'active_page': active_page,
        'page_title': page_title,
        'breadcrumb_active': page_title,
        'breadcrumb_parent': breadcrumb_parent,
        'breadcrumb_parent_url': breadcrumb_parent_url or '/staff/dashboard/',
    }

    # Sidebar badge counts
    try:
        from classes.models import ScheduledClass
        live_count = ScheduledClass.objects.filter(status='LIVE').count()
    except Exception:
        live_count = 0

    open_tickets = SupportTicket.objects.filter(status__in=['OPEN', 'IN_PROGRESS', 'PENDING']).count()

    ctx['sidebar_counts'] = {
        'students': Student.objects.count(),
        'teachers': Teacher.objects.count(),
        'tests': Test.objects.count(),
        'live_classes': live_count,
        'open_tickets': open_tickets,
    }

    # Notifications for topbar
    try:
        from communication.models import Notification
        notifs = Notification.objects.filter(
            user_type='ADMIN',
            is_read=False
        ).order_by('-created_at')[:5]
        ctx['notifications'] = [{
            'title': n.title,
            'time': _time_ago(n.created_at),
            'icon': 'fa-bell',
            'color': 'blue',
            'url': n.action_url or '#',
        } for n in notifs]
        ctx['notifications_count'] = Notification.objects.filter(user_type='ADMIN', is_read=False).count()
    except Exception:
        ctx['notifications'] = []
        ctx['notifications_count'] = open_tickets  # Fallback: use ticket count

    return ctx


def _time_ago(dt, now=None):
    if not dt:
        return ''
    if now is None:
        now = timezone.now()
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt)
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return 'Just now'
    elif seconds < 3600:
        return f'{seconds // 60} min ago'
    elif seconds < 86400:
        return f'{seconds // 3600} hr ago'
    else:
        days = seconds // 86400
        return f'{days} day{"s" if days > 1 else ""} ago'


# ═══════════════════════════════════════════════════════════════
# 1. ANALYTICS PAGE
# ═══════════════════════════════════════════════════════════════
class AnalyticsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'analytics', 'Analytics')

        from academics.models import Batch, BatchStudent
        from sessions_tracking.models import LoginHistory

        now = timezone.now()
        today = now.date()

        # Daily logins for last 7 days
        daily_logins = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            count = LoginHistory.objects.filter(attempted_at__date=d, result='SUCCESS').count()
            daily_logins.append({'date': d.strftime('%a %d'), 'count': count})

        # Student growth last 7 days
        daily_students = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            count = Student.objects.filter(created_at__date__lte=d).count()
            daily_students.append({'date': d.strftime('%a %d'), 'count': count})

        max_logins = max((d['count'] for d in daily_logins), default=1) or 1
        max_students = max((d['count'] for d in daily_students), default=1) or 1
        for d in daily_logins:
            d['pct'] = int(d['count'] / max_logins * 100)
        for d in daily_students:
            d['pct'] = int(d['count'] / max_students * 100)

        # Enrollment by batch
        enrollment_by_batch = []
        for b in Batch.objects.filter(status='ACTIVE').order_by('name')[:10]:
            enrolled = BatchStudent.objects.filter(batch=b, is_active=True).count()
            enrollment_by_batch.append({'name': b.name, 'count': enrolled})
        max_enroll = max((e['count'] for e in enrollment_by_batch), default=1) or 1
        for e in enrollment_by_batch:
            e['pct'] = int(e['count'] / max_enroll * 100)

        # Students by tenant
        students_by_tenant = []
        for t in Tenant.objects.all():
            c = Student.objects.filter(tenant=t).count()
            students_by_tenant.append({'name': t.name, 'count': c})

        # Summary stats
        ctx.update({
            'total_students': Student.objects.count(),
            'total_teachers': Teacher.objects.count(),
            'today_logins': LoginHistory.objects.filter(attempted_at__date=today, result='SUCCESS').count(),
            'new_students_week': Student.objects.filter(created_at__date__gte=today - timedelta(days=7)).count(),
            'daily_logins': daily_logins,
            'daily_students': daily_students,
            'enrollment_by_batch': enrollment_by_batch,
            'students_by_tenant': students_by_tenant,
        })
        return render(request, 'dashboards/admin_analytics.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 2. MONITORING CENTER
# ═══════════════════════════════════════════════════════════════
class MonitoringView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'monitoring', 'Monitoring Center')

        from sessions_tracking.models import UserSession, LoginHistory, UserDevice
        from django.db import connection

        now = timezone.now()
        fifteen_min_ago = now - timedelta(minutes=15)

        # Active sessions
        active_sessions = UserSession.objects.filter(
            status='ACTIVE', last_activity_at__gte=fifteen_min_ago
        ).select_related('device')[:50]

        session_list = []
        for s in active_sessions:
            session_list.append({
                'user_id': str(s.user_id)[:8],
                'user_type': s.user_type,
                'ip': s.ip_address or 'N/A',
                'device': s.device.device_type if s.device else 'Unknown',
                'browser': (s.device.browser_name if s.device else 'Unknown'),
                'last_active': _time_ago(s.last_activity_at, now),
                'started': s.started_at.strftime('%H:%M') if s.started_at else '',
            })

        # Recent logins
        recent_logins = LoginHistory.objects.order_by('-attempted_at')[:20]
        login_list = []
        for l in recent_logins:
            login_list.append({
                'user_type': l.user_type,
                'username': l.username_attempted or 'N/A',
                'result': l.result,
                'ip': l.ip_address or 'N/A',
                'time': _time_ago(l.attempted_at, now),
                'suspicious': l.is_suspicious,
            })

        # Database check
        db_ok = True
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT 1")
        except Exception:
            db_ok = False

        ctx.update({
            'active_session_count': UserSession.objects.filter(status='ACTIVE', last_activity_at__gte=fifteen_min_ago).count(),
            'total_sessions_today': UserSession.objects.filter(started_at__date=now.date()).count(),
            'failed_logins_today': LoginHistory.objects.filter(attempted_at__date=now.date(), result='FAILED').count(),
            'suspicious_logins': LoginHistory.objects.filter(attempted_at__date=now.date(), is_suspicious=True).count(),
            'sessions': session_list,
            'recent_logins': login_list,
            'db_ok': db_ok,
            'server_ok': True,
        })
        return render(request, 'dashboards/admin_monitoring.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 3. SUBJECTS / SUBJECT SECTION
# ═══════════════════════════════════════════════════════════════
class SubjectsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'subjects', 'Subject Section', 'Master')

        from academics.models import Subject, SubjectSection, Chapter

        subjects = Subject.objects.all().order_by('display_order', 'name')
        subject_list = []
        for s in subjects:
            chapters = Chapter.objects.filter(subject=s).count()
            sections = SubjectSection.objects.filter(subject=s).count()
            subject_list.append({
                'id': str(s.id),
                'name': s.name,
                'code': s.code or '',
                'type': s.subject_type or 'General',
                'chapters': chapters,
                'sections': sections,
                'status': s.status,
                'color': s.color or '#3b82f6',
            })

        ctx.update({
            'subjects': subject_list,
            'total_subjects': len(subject_list),
            'active_subjects': sum(1 for s in subject_list if s['status'] == 'ACTIVE'),
        })
        return render(request, 'dashboards/admin_subjects.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 4. BATCHES
# ═══════════════════════════════════════════════════════════════
class BatchesView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'batches', 'Batches', 'Master')

        from academics.models import Batch, BatchStudent, BatchTeacher

        batches = Batch.objects.all().order_by('-created_at')
        batch_list = []
        for b in batches:
            enrolled = BatchStudent.objects.filter(batch=b, is_active=True).count()
            teachers = BatchTeacher.objects.filter(batch=b).count()
            batch_list.append({
                'id': str(b.id),
                'name': b.name,
                'code': b.code or '',
                'class_level': b.class_level or '',
                'enrolled': enrolled,
                'max_students': b.max_students or '-',
                'teachers': teachers,
                'start_date': b.start_date.strftime('%d %b %Y') if b.start_date else '',
                'end_date': b.end_date.strftime('%d %b %Y') if b.end_date else '',
                'status': b.status,
            })

        ctx.update({
            'batches': batch_list,
            'total_batches': len(batch_list),
            'active_batches': sum(1 for b in batch_list if b['status'] == 'ACTIVE'),
        })
        return render(request, 'dashboards/admin_batches.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 5. PROGRAMS (Groups/Categories)
# ═══════════════════════════════════════════════════════════════
class ProgramsAdminView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'programs', 'Programs', 'Master')

        from academics.models import Group, Category

        groups = Group.objects.all().order_by('name')
        group_list = []
        for g in groups:
            cats = Category.objects.filter(group=g).count()
            group_list.append({
                'id': str(g.id),
                'name': g.name,
                'description': (g.description or '')[:100],
                'categories': cats,
                'status': 'Active' if g.status else 'Inactive',
            })

        ctx.update({
            'groups': group_list,
            'total_groups': len(group_list),
        })
        return render(request, 'dashboards/admin_programs.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 6. ACADEMIC SESSIONS
# ═══════════════════════════════════════════════════════════════
class AcademicSessionsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'sessions', 'Academic Sessions', 'Master')

        from academics.models import AcademicSession

        sessions = AcademicSession.objects.all().order_by('-start_date')
        session_list = []
        for s in sessions:
            session_list.append({
                'id': str(s.id),
                'name': s.session_name,
                'start_date': s.start_date.strftime('%d %b %Y') if s.start_date else '',
                'end_date': s.end_date.strftime('%d %b %Y') if s.end_date else '',
                'is_current': s.is_current,
                'status': 'Active' if s.status else 'Inactive',
            })

        ctx.update({
            'sessions': session_list,
            'total_sessions': len(session_list),
        })
        return render(request, 'dashboards/admin_sessions.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 7. TESTS
# ═══════════════════════════════════════════════════════════════
class TestsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'tests', 'Tests', 'Test & Questions')

        from assessments.models import Test, TestAttempt

        tests = Test.objects.filter(is_deleted=False).order_by('-created_at')
        test_list = []
        for t in tests:
            attempts = TestAttempt.objects.filter(test=t).count()
            test_list.append({
                'id': str(t.id),
                'title': t.title,
                'code': t.test_code or '',
                'type': t.test_type or '',
                'subject': str(t.subject) if t.subject else 'N/A',
                'duration': t.total_duration_minutes or 0,
                'total_marks': t.total_marks or 0,
                'total_questions': t.total_questions or 0,
                'attempts': attempts,
                'status': t.status,
                'created': t.created_at.strftime('%d %b %Y') if t.created_at else '',
            })

        ctx.update({
            'tests': test_list,
            'total_tests': len(test_list),
            'published_tests': sum(1 for t in test_list if t['status'] == 'PUBLISHED'),
            'draft_tests': sum(1 for t in test_list if t['status'] == 'DRAFT'),
        })
        return render(request, 'dashboards/admin_tests.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 8. QUESTIONS
# ═══════════════════════════════════════════════════════════════
class QuestionsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'questions', 'Questions', 'Test & Questions')

        from assessments.models import Question

        questions = Question.objects.filter(is_deleted=False).order_by('-created_at')[:100]
        q_list = []
        for q in questions:
            q_list.append({
                'id': str(q.id),
                'text': (q.question_text or '')[:80],
                'code': q.question_code or '',
                'type': q.question_type or '',
                'difficulty': q.difficulty or '',
                'subject': str(q.subject) if q.subject else 'N/A',
                'chapter': str(q.chapter) if q.chapter else 'N/A',
                'positive_marks': q.positive_marks or 0,
                'negative_marks': q.negative_marks or 0,
                'success_rate': q.success_rate or 0,
                'status': 'Active' if q.is_active else 'Inactive',
            })

        ctx.update({
            'questions': q_list,
            'total_questions': Question.objects.filter(is_deleted=False).count(),
            'active_questions': Question.objects.filter(is_deleted=False, is_active=True).count(),
        })
        return render(request, 'dashboards/admin_questions.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 9. TEST REPORTS
# ═══════════════════════════════════════════════════════════════
class TestReportsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'test-reports', 'Test Reports', 'Test & Questions')

        from assessments.models import Test, TestAttempt

        tests = Test.objects.filter(is_deleted=False).order_by('-created_at')[:20]
        report_list = []
        for t in tests:
            attempts = TestAttempt.objects.filter(test=t)
            total = attempts.count()
            passed = attempts.filter(result='PASS').count()
            failed = attempts.filter(result='FAIL').count()
            avg_score = attempts.aggregate(avg=Avg('percentage'))['avg'] or 0
            avg_time = attempts.aggregate(avg=Avg('time_taken_seconds'))['avg'] or 0

            report_list.append({
                'test_title': t.title,
                'test_code': t.test_code or '',
                'type': t.test_type or '',
                'total_attempts': total,
                'passed': passed,
                'failed': failed,
                'pass_rate': round(passed / total * 100, 1) if total > 0 else 0,
                'avg_score': round(avg_score, 1),
                'avg_time_min': round(avg_time / 60, 1) if avg_time else 0,
                'status': t.status,
            })

        ctx.update({
            'reports': report_list,
            'total_attempts': TestAttempt.objects.count(),
            'avg_pass_rate': round(
                TestAttempt.objects.filter(result='PASS').count() /
                max(TestAttempt.objects.count(), 1) * 100, 1
            ),
        })
        return render(request, 'dashboards/admin_test_reports.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 10. SCHOOLS / CENTERS (Tenants)
# ═══════════════════════════════════════════════════════════════
class SchoolsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'schools', 'Schools / Centers', 'School / Centers')

        tenants = Tenant.objects.all().order_by('name')
        school_list = []
        for t in tenants:
            students = Student.objects.filter(tenant=t).count()
            active = Student.objects.filter(tenant=t, status='ACTIVE').count()
            teachers = Teacher.objects.filter(tenant=t).count()
            school_list.append({
                'id': str(t.id),
                'name': t.name,
                'code': t.code,
                'total_students': students,
                'active_students': active,
                'inactive_students': students - active,
                'total_teachers': teachers,
            })

        ctx.update({
            'schools': school_list,
            'total_schools': len(school_list),
        })
        return render(request, 'dashboards/admin_schools.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 11. TEACHERS
# ═══════════════════════════════════════════════════════════════
class TeachersView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'teachers', 'Teachers', 'School / Centers')

        from academics.models import BatchTeacher

        teachers = Teacher.objects.all().order_by('first_name')
        teacher_list = []
        for t in teachers:
            batch_count = BatchTeacher.objects.filter(teacher=t).count()
            subjects = t.subjects if isinstance(t.subjects, list) else []
            teacher_list.append({
                'id': str(t.id),
                'name': f"{t.first_name} {t.last_name}",
                'code': t.teacher_code or '',
                'email': t.email,
                'phone': t.phone or '',
                'subjects': ', '.join(subjects[:3]) if subjects else 'N/A',
                'batches': batch_count,
                'status': t.status,
                'joined': t.created_at.strftime('%d %b %Y') if t.created_at else '',
            })

        ctx.update({
            'teachers': teacher_list,
            'total_teachers': len(teacher_list),
            'active_teachers': sum(1 for t in teacher_list if t['status'] == 'ACTIVE'),
        })
        return render(request, 'dashboards/admin_teachers.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 12. TEACHER ATTENDANCE
# ═══════════════════════════════════════════════════════════════
class TeacherAttendanceView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'teacher-attendance', 'Teacher Attendance', 'School / Centers')

        from attendance.models import Attendance

        today = timezone.now().date()
        teachers = Teacher.objects.filter(status='ACTIVE').order_by('first_name')
        att_list = []
        for t in teachers:
            today_att = Attendance.objects.filter(
                user_type='TEACHER', user_id=t.id, attendance_date=today
            ).first()
            total_present = Attendance.objects.filter(
                user_type='TEACHER', user_id=t.id, status='PRESENT'
            ).count()
            total_absent = Attendance.objects.filter(
                user_type='TEACHER', user_id=t.id, status='ABSENT'
            ).count()
            att_list.append({
                'name': f"{t.first_name} {t.last_name}",
                'code': t.teacher_code or '',
                'today_status': today_att.status if today_att else 'Not Marked',
                'today_checkin': today_att.check_in_time.strftime('%I:%M %p') if today_att and today_att.check_in_time else '-',
                'total_present': total_present,
                'total_absent': total_absent,
            })

        ctx.update({
            'attendance': att_list,
            'today_date': today.strftime('%A, %d %B %Y'),
            'marked_today': sum(1 for a in att_list if a['today_status'] != 'Not Marked'),
        })
        return render(request, 'dashboards/admin_teacher_attendance.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 13. ALL STUDENTS
# ═══════════════════════════════════════════════════════════════
class StudentsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'students', 'All Students', 'Students')

        students = Student.objects.all().order_by('-created_at')[:200]
        student_list = []
        for s in students:
            student_list.append({
                'id': str(s.id),
                'name': f"{s.first_name} {s.last_name}",
                'code': s.student_code or '',
                'email': s.email,
                'phone': s.phone or '',
                'tenant': s.tenant.name if s.tenant else 'N/A',
                'status': s.status,
                'joined': s.created_at.strftime('%d %b %Y') if s.created_at else '',
            })

        ctx.update({
            'students': student_list,
            'total_students': Student.objects.count(),
            'active_students': Student.objects.filter(status='ACTIVE').count(),
            'inactive_students': Student.objects.exclude(status='ACTIVE').count(),
        })
        return render(request, 'dashboards/admin_students.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 14. STUDENT ATTENDANCE
# ═══════════════════════════════════════════════════════════════
class StudentAttendanceView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'student-attendance', 'Student Attendance', 'Students')

        from attendance.models import Attendance
        from academics.models import Batch

        today = timezone.now().date()

        # Today's attendance summary by batch
        batches = Batch.objects.filter(status='ACTIVE').order_by('name')
        batch_att = []
        for b in batches:
            present = Attendance.objects.filter(
                user_type='STUDENT', attendance_date=today,
                batch=b, status='PRESENT'
            ).count()
            absent = Attendance.objects.filter(
                user_type='STUDENT', attendance_date=today,
                batch=b, status='ABSENT'
            ).count()
            total = present + absent
            batch_att.append({
                'batch_name': b.name,
                'batch_code': b.code or '',
                'present': present,
                'absent': absent,
                'total': total,
                'pct': round(present / total * 100, 1) if total > 0 else 0,
            })

        # Recent individual records
        recent = Attendance.objects.filter(
            user_type='STUDENT'
        ).order_by('-attendance_date', '-marked_at')[:50]
        records = []
        for a in recent:
            # Resolve student name
            try:
                st = Student.objects.get(id=a.user_id)
                name = f"{st.first_name} {st.last_name}"
            except Student.DoesNotExist:
                name = str(a.user_id)[:8]
            records.append({
                'student': name,
                'date': a.attendance_date.strftime('%d %b %Y') if a.attendance_date else '',
                'batch': a.batch.name if a.batch else 'N/A',
                'status': a.status,
                'source': a.source or '',
            })

        ctx.update({
            'batch_attendance': batch_att,
            'recent_records': records,
            'today_date': today.strftime('%A, %d %B %Y'),
        })
        return render(request, 'dashboards/admin_student_attendance.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 15. LIVE CLASSES
# ═══════════════════════════════════════════════════════════════
class LiveClassesView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'live-classes', 'Live Classes', 'Study Material')

        from classes.models import ScheduledClass

        classes = ScheduledClass.objects.all().order_by('-scheduled_date', '-start_time')[:50]
        class_list = []
        for c in classes:
            class_list.append({
                'id': str(c.id),
                'title': c.title,
                'code': c.class_code or '',
                'teacher': f"{c.teacher.first_name} {c.teacher.last_name}" if c.teacher else 'N/A',
                'batch': c.batch.name if c.batch else 'N/A',
                'date': c.scheduled_date.strftime('%d %b %Y') if c.scheduled_date else '',
                'start_time': c.start_time.strftime('%I:%M %p') if c.start_time else '',
                'end_time': c.end_time.strftime('%I:%M %p') if c.end_time else '',
                'duration': c.duration_minutes or 0,
                'viewers': c.total_unique_viewers or 0,
                'status': c.status,
                'youtube_url': c.youtube_watch_url or '',
            })

        live_now = [c for c in class_list if c['status'] == 'LIVE']
        scheduled = [c for c in class_list if c['status'] == 'SCHEDULED']

        ctx.update({
            'classes': class_list,
            'live_count': len(live_now),
            'scheduled_count': len(scheduled),
            'total_classes': len(class_list),
        })
        return render(request, 'dashboards/admin_live_classes.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 16. STUDY MATERIALS
# ═══════════════════════════════════════════════════════════════
class StudyMaterialsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'study-materials', 'Study Materials', 'Study Material')

        from materials.models import StudyMaterial

        materials = StudyMaterial.objects.filter(is_deleted=False).order_by('-created_at')[:100]
        mat_list = []
        for m in materials:
            mat_list.append({
                'id': str(m.id),
                'title': m.title,
                'code': m.material_code or '',
                'type': m.material_type or '',
                'subject': str(m.subject) if m.subject else 'N/A',
                'views': m.view_count or 0,
                'downloads': m.download_count or 0,
                'is_published': m.is_published,
                'created': m.created_at.strftime('%d %b %Y') if m.created_at else '',
            })

        ctx.update({
            'materials': mat_list,
            'total_materials': StudyMaterial.objects.filter(is_deleted=False).count(),
            'published_materials': StudyMaterial.objects.filter(is_deleted=False, is_published=True).count(),
        })
        return render(request, 'dashboards/admin_study_materials.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 17. ANNOUNCEMENTS
# ═══════════════════════════════════════════════════════════════
class AnnouncementsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'announcements', 'Announcements', 'Communication')

        from communication.models import Announcement

        announcements = Announcement.objects.filter(is_deleted=False).order_by('-created_at')
        ann_list = []
        for a in announcements:
            ann_list.append({
                'id': str(a.id),
                'title': a.title,
                'type': a.announcement_type or 'General',
                'audience': a.target_audience or 'All',
                'is_published': a.is_published,
                'is_pinned': a.is_pinned,
                'views': a.view_count or 0,
                'date': a.published_at.strftime('%d %b %Y') if a.published_at else (a.created_at.strftime('%d %b %Y') if a.created_at else ''),
            })

        ctx.update({
            'announcements': ann_list,
            'total_announcements': len(ann_list),
            'published_count': sum(1 for a in ann_list if a['is_published']),
        })
        return render(request, 'dashboards/admin_announcements.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 18. SUPPORT TICKETS
# ═══════════════════════════════════════════════════════════════
class TicketsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'tickets', 'Support Tickets', 'Communication')

        from communication.models import SupportTicket

        tickets = SupportTicket.objects.all().order_by('-created_at')
        ticket_list = []
        for t in tickets:
            ticket_list.append({
                'id': str(t.id),
                'number': t.ticket_number or '',
                'title': t.title,
                'category': t.category or '',
                'priority': t.priority or 'MEDIUM',
                'status': t.status,
                'submitted_by': t.submitted_by_name or 'Unknown',
                'assigned_to': str(t.assigned_to_id)[:8] if t.assigned_to_id else 'Unassigned',
                'created': t.created_at.strftime('%d %b %Y') if t.created_at else '',
            })

        ctx.update({
            'tickets': ticket_list,
            'total_tickets': len(ticket_list),
            'open_tickets': sum(1 for t in ticket_list if t['status'] in ['OPEN', 'IN_PROGRESS', 'PENDING']),
            'resolved_tickets': sum(1 for t in ticket_list if t['status'] in ['RESOLVED', 'CLOSED']),
        })
        return render(request, 'dashboards/admin_tickets.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 19. TENANTS / CENTERS
# ═══════════════════════════════════════════════════════════════
class TenantsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'tenants', 'Tenants / Centers', 'System')

        tenants = Tenant.objects.all().order_by('name')
        tenant_list = []
        for t in tenants:
            students = Student.objects.filter(tenant=t).count()
            teachers = Teacher.objects.filter(tenant=t).count()
            tenant_list.append({
                'id': str(t.id),
                'name': t.name,
                'code': t.code,
                'students': students,
                'teachers': teachers,
            })

        ctx.update({
            'tenants': tenant_list,
            'total_tenants': len(tenant_list),
        })
        return render(request, 'dashboards/admin_tenants.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 20. SETTINGS
# ═══════════════════════════════════════════════════════════════
class SettingsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'settings', 'Settings', 'System')

        from system_config.models import SystemSetting, FeatureFlag

        settings_list = SystemSetting.objects.filter(is_editable=True).order_by('category', 'setting_key')
        setting_items = []
        for s in settings_list:
            setting_items.append({
                'id': str(s.id),
                'key': s.setting_key,
                'value': s.setting_value or '',
                'category': s.category or 'General',
                'type': s.value_type or 'string',
                'description': (s.description or '')[:100],
                'is_secret': s.is_secret,
            })

        flags = FeatureFlag.objects.all().order_by('flag_key')
        flag_list = []
        for f in flags:
            flag_list.append({
                'id': str(f.id),
                'key': f.flag_key,
                'name': f.flag_name or f.flag_key,
                'description': (f.description or '')[:100],
                'enabled': f.is_enabled,
                'rollout': f.rollout_percentage or 100,
            })

        ctx.update({
            'settings': setting_items,
            'feature_flags': flag_list,
            'total_settings': len(setting_items),
            'total_flags': len(flag_list),
        })
        return render(request, 'dashboards/admin_settings.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 21. AUDIT & GOVERNANCE
# ═══════════════════════════════════════════════════════════════
class AuditView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'audit', 'Audit & Governance', 'System')

        now = timezone.now()
        audits = AuditLog.objects.all().order_by('-created_at')[:100]
        audit_list = []
        for a in audits:
            audit_list.append({
                'id': str(a.id),
                'user': a.username or a.user_type or 'System',
                'user_type': a.user_type or '',
                'action': a.action,
                'description': (a.action_description or '')[:100],
                'resource_type': a.resource_type or '',
                'resource_name': a.resource_name or '',
                'severity': a.severity or 'INFO',
                'ip': a.ip_address or '',
                'time': _time_ago(a.created_at, now),
                'timestamp': a.created_at.strftime('%d %b %Y %H:%M') if a.created_at else '',
            })

        today = now.date()
        ctx.update({
            'audits': audit_list,
            'total_audits': AuditLog.objects.count(),
            'today_audits': AuditLog.objects.filter(created_at__date=today).count(),
            'security_events': AuditLog.objects.filter(is_security_event=True).count(),
        })
        return render(request, 'dashboards/admin_audit.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 22. PROFILE
# ═══════════════════════════════════════════════════════════════
class ProfileView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'profile', 'My Profile')

        user_id = request.session.get('user_id')
        try:
            admin = Admin.objects.get(id=user_id)
            ctx['profile'] = {
                'name': f"{admin.first_name} {admin.last_name}",
                'email': admin.email,
                'phone': admin.phone or '',
                'role': admin.role or 'SUPER_ADMIN',
                'status': admin.status,
                'joined': admin.created_at.strftime('%d %b %Y') if admin.created_at else '',
                'last_login': admin.last_login_at.strftime('%d %b %Y %H:%M') if admin.last_login_at else 'N/A',
            }
        except Admin.DoesNotExist:
            ctx['profile'] = {
                'name': request.session.get('user_name', 'Admin'),
                'email': request.session.get('user_email', ''),
                'phone': '', 'role': 'ADMIN', 'status': 'ACTIVE',
                'joined': '', 'last_login': '',
            }

        return render(request, 'dashboards/admin_profile.html', ctx)


# ═══════════════════════════════════════════════════════════════
# 23. NOTIFICATIONS (full page)
# ═══════════════════════════════════════════════════════════════
class NotificationsView(View):
    def get(self, request):
        auth = _require_admin(request)
        if auth:
            return auth
        ctx = _admin_ctx(request, 'notifications', 'Notifications')

        try:
            from communication.models import Notification
            notif_list = Notification.objects.filter(
                user_type='ADMIN'
            ).order_by('-created_at')[:50]
            items = []
            now = timezone.now()
            for n in notif_list:
                items.append({
                    'id': str(n.id),
                    'title': n.title,
                    'message': (n.message or '')[:150],
                    'type': n.notification_type or '',
                    'is_read': n.is_read,
                    'time': _time_ago(n.created_at, now),
                    'url': n.action_url or '#',
                })
            ctx['all_notifications'] = items
            ctx['unread_count'] = sum(1 for i in items if not i['is_read'])
        except Exception:
            ctx['all_notifications'] = []
            ctx['unread_count'] = 0

        return render(request, 'dashboards/admin_notifications.html', ctx)
