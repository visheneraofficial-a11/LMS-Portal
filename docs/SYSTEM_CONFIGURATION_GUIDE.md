# System Configuration Guide
## ENABLE PROGRAM — Admin Console

This guide provides comprehensive documentation for all features under **System Configuration** in the admin panel. Each section explains the purpose, use cases, real-time scenarios, and step-by-step configuration instructions.

---

## Table of Contents

1. [AI Features](#1-ai-features)
2. [Attendance Rules](#2-attendance-rules)
3. [Class Link Configurations](#3-class-link-configurations)
4. [Enquiry Forms](#4-enquiry-forms)
5. [Feature Flags](#5-feature-flags)
6. [Integration Configs](#6-integration-configs)
7. [MFA Policies](#7-mfa-policies)
8. [Maintenance Windows](#8-maintenance-windows)
9. [Report Templates](#9-report-templates)
10. [System Settings](#10-system-settings)
11. [Website Settings](#11-website-settings)
12. [Website News](#12-website-news)
13. [Testimonials](#13-testimonials)
14. [Footer Configs](#14-footer-configs)
15. [Announcements](#15-announcements)
16. [Direct Messages](#16-direct-messages)
17. [Notifications](#17-notifications)
18. [Support Tickets](#18-support-tickets)

---

## 1. AI Features

### Purpose
Manage AI/ML-powered capabilities integrated into the LMS platform, including intelligent summarization, doubt resolution, and predictive analytics.

### Use Cases
- **Intelligent Summarization**: Auto-generate summaries of lecture videos for quick revision
- **Adaptive Learning Paths**: Personalize study recommendations based on student performance
- **24×7 AI Doubt Resolution**: ChatGPT-style doubt solving available round the clock
- **Predictive Analytics**: Forecast student performance and identify at-risk students
- **Auto Assessment Engine**: AI-powered quiz generation and evaluation

### Real-Time Scenarios

**Scenario 1: Enabling AI Doubt Resolution**
A coaching center wants to provide 24/7 doubt support without hiring night-shift faculty.

**Scenario 2: Predictive Analytics for Parents**
Parents receive weekly AI-generated reports predicting their child's exam performance.

### Configuration Steps

1. Navigate to: **Admin → System Configuration → AI Features**
2. Click **Add AI Feature** or edit existing
3. Fill in:
   - **Feature Name**: e.g., "AI Doubt Solver"
   - **Feature Key**: Unique identifier (e.g., `ai_doubt_solver`)
   - **Description**: What the feature does
   - **Icon Class**: FontAwesome icon (e.g., `fas fa-robot`)
   - **Integration Scope**: 
     - `ALL` - Available to all users
     - `ADMIN` - Admin panel only
     - `TEACHER` - Teachers only
     - `STUDENT` - Students only
   - **Is Enabled**: Toggle on/off
   - **Configuration JSON**: API keys, model settings
4. Click **Save**

### Configuration JSON Example
```json
{
  "model": "gpt-4",
  "api_key_setting": "OPENAI_API_KEY",
  "max_tokens": 2000,
  "temperature": 0.7,
  "rate_limit_per_user": 50
}
```

---

## 2. Attendance Rules

### Purpose
Define automated rules for attendance tracking, including marking criteria, late arrival policies, and minimum attendance requirements.

### Use Cases
- **Automatic Attendance Marking**: Mark present based on live class join time
- **Late Arrival Penalties**: Deduct partial attendance for late joiners
- **Minimum Attendance Threshold**: Alert when student falls below 75%
- **Holiday Exclusions**: Skip attendance for declared holidays

### Real-Time Scenarios

**Scenario 1: Live Class Attendance**
Students joining a Zoom class within 10 minutes of start time are marked "Present", 10-20 minutes is "Late", beyond 20 minutes is "Absent".

**Scenario 2: Exam Eligibility**
Students with less than 75% attendance are flagged as "Not Eligible" for final exams.

### Configuration Steps

1. Navigate to: **Admin → System Configuration → Attendance Rules**
2. Click **Add Attendance Rule**
3. Fill in:
   - **Rule Name**: e.g., "Live Class Attendance"
   - **Rule Type**:
     - `LIVE_CLASS` - For online live classes
     - `RECORDED` - For video watching
     - `PHYSICAL` - For offline classes
     - `EXAM` - For test attendance
   - **Grace Period Minutes**: Time allowed after scheduled start (e.g., 10)
   - **Late Threshold Minutes**: When to mark as "Late" (e.g., 20)
   - **Minimum Percentage**: Required attendance % (e.g., 75)
   - **Auto Mark Present After**: Minutes of video watched to auto-mark (e.g., 30)
   - **Is Active**: Enable/disable rule
4. Click **Save**

### Sample Configuration
| Rule Name | Type | Grace Period | Late Threshold | Min % |
|-----------|------|--------------|----------------|-------|
| JEE Live Class | LIVE_CLASS | 10 min | 20 min | 80% |
| NEET Recorded | RECORDED | N/A | N/A | 70% |

---

## 3. Class Link Configurations

### Purpose
Manage meeting platform integrations (Zoom, Google Meet, Microsoft Teams) for live classes, including API credentials and default settings.

### Use Cases
- **Zoom Integration**: Auto-create Zoom meetings for scheduled classes
- **Google Meet**: Generate Meet links directly from admin panel
- **Microsoft Teams**: Integrate with school's O365 infrastructure

### Real-Time Scenarios

**Scenario 1: Auto-Generated Zoom Links**
When a teacher schedules a class, the system automatically creates a Zoom meeting and sends the link to enrolled students.

**Scenario 2: Recurring Classes**
Weekly Physics classes automatically get recurring Zoom links.

### Configuration Steps

1. Navigate to: **Admin → System Configuration → Class Link Configurations**
2. Click **Add Class Link Config**
3. Fill in:
   - **Platform**: ZOOM / GOOGLE_MEET / TEAMS / CUSTOM
   - **API Key**: Platform's API key
   - **API Secret**: Platform's secret key
   - **Account Email**: Admin account email
   - **Default Settings JSON**:
     ```json
     {
       "waiting_room": true,
       "mute_on_entry": true,
       "recording": "cloud",
       "max_duration": 120
     }
     ```
   - **Is Default**: Make this the primary platform
   - **Is Active**: Enable/disable
4. Click **Save**

### Zoom API Setup
1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Create a Server-to-Server OAuth app
3. Copy API Key, API Secret, Account ID
4. Add to Class Link Configuration

---

## 4. Enquiry Forms

### Purpose
Manage and track enquiries/leads from the public website contact forms, demo requests, and admission queries.

### Use Cases
- **Admission Enquiries**: Track prospective student leads
- **Demo Requests**: Schedule demo classes
- **General Queries**: Support questions from website visitors
- **Lead Management**: Follow up and convert leads to enrollments

### Real-Time Scenarios

**Scenario 1: Website Contact Form**
A parent fills the contact form on the website. The enquiry appears in admin with status "NEW" for follow-up.

**Scenario 2: Lead Conversion**
Enquiries are tracked from NEW → CONTACTED → DEMO_SCHEDULED → CONVERTED stages.

### Configuration (View/Manage)

1. Navigate to: **Admin → System Configuration → Enquiry Forms**
2. View all enquiries with filters:
   - **Status**: NEW, CONTACTED, DEMO_SCHEDULED, CONVERTED, CLOSED
   - **Source**: WEBSITE, REFERRAL, SOCIAL_MEDIA, WALK_IN
3. Click on an enquiry to:
   - Add follow-up notes
   - Change status
   - Assign to team member
   - View contact history

### Status Flow
```
NEW → CONTACTED → DEMO_SCHEDULED → CONVERTED/CLOSED
```

---

## 5. Feature Flags

### Purpose
Enable/disable features dynamically without code deployment. Control feature rollouts, A/B testing, and temporary feature toggles.

### Use Cases
- **Gradual Rollouts**: Enable new features for 10% users first
- **Beta Testing**: Enable features only for beta testers
- **Seasonal Features**: Enable exam prep mode during exam season
- **Kill Switch**: Instantly disable problematic features

### Real-Time Scenarios

**Scenario 1: New Dashboard Rollout**
Enable new student dashboard for 20% of users to gather feedback before full rollout.

**Scenario 2: Exam Season Mode**
Enable "Exam Countdown" and "Mock Test Marathon" features 30 days before JEE.

### Configuration Steps

1. Navigate to: **Admin → System Configuration → Feature Flags**
2. Click **Add Feature Flag**
3. Fill in:
   - **Flag Key**: Unique key (e.g., `new_dashboard_v2`)
   - **Flag Name**: Display name (e.g., "New Dashboard V2")
   - **Description**: What this flag controls
   - **Is Enabled**: Master on/off toggle
   - **Rollout Percentage**: 0-100% of users (e.g., 20)
   - **User Types**: Which user types see this feature
   - **Start Date / End Date**: Optional time-based activation
4. Click **Save**

### Code Usage Example
```python
from system_config.models import FeatureFlag

if FeatureFlag.is_enabled('new_dashboard_v2', user_id=user.id):
    # Show new dashboard
else:
    # Show old dashboard
```

---

## 6. Integration Configs

### Purpose
Configure external service integrations including YouTube, LLM/AI models, cloud storage, and third-party APIs.

### Integration Types

| Type | Purpose |
|------|---------|
| YOUTUBE | Video hosting, live streaming |
| LLM | AI models (OpenAI, Claude, etc.) |
| STORAGE | Cloud storage (S3, GDrive) |
| MEETING | Video conferencing |
| PAYMENT | Payment gateways |
| SMS | SMS providers |
| EMAIL | Email services |

### Real-Time Scenarios

**Scenario 1: YouTube Channel Integration**
Connect coaching institute's YouTube channel for automatic video sync to course materials.

**Scenario 2: AWS S3 for Study Materials**
Store and serve PDFs, images from S3 bucket with signed URLs.

### Configuration Steps

1. Navigate to: **Admin → System Configuration → Integration Configs**
2. Click **Add Integration Config**
3. Fill in:
   - **Integration Type**: Select from dropdown
   - **Name**: e.g., "Main YouTube Channel"
   - **API Key**: Service API key
   - **API Secret**: Service secret
   - **Endpoint URL**: API endpoint (if required)
   - **Config JSON**: Additional settings
   - **Is Active**: Enable/disable
4. Click **Save**

### YouTube Integration Example
```json
{
  "channel_id": "UCxxxxx",
  "playlist_id": "PLxxxxx",
  "auto_sync": true,
  "sync_interval_hours": 6
}
```

### AWS S3 Integration Example
```json
{
  "bucket_name": "enf-study-materials",
  "region": "ap-south-1",
  "access_key_id": "AKIAXXXXX",
  "secret_access_key": "xxxxx",
  "signed_url_expiry": 3600
}
```

---

## 7. MFA Policies

### Purpose
Configure Multi-Factor Authentication requirements for different user types and scenarios.

### Use Cases
- **Admin MFA**: Require 2FA for all admin logins
- **Teacher MFA**: Optional 2FA for teachers
- **Exam Mode**: Force MFA during exam submissions
- **Trusted Devices**: Skip MFA for registered devices

### Real-Time Scenarios

**Scenario 1: Admin Security**
All admin users must verify with OTP on every login from a new device.

**Scenario 2: Exam Integrity**
Students must verify identity with OTP before starting an important exam.

### Configuration Steps

1. Navigate to: **Admin → System Configuration → MFA Policies**
2. Click **Add MFA Policy**
3. Fill in:
   - **Policy Name**: e.g., "Admin Login MFA"
   - **User Types**: ADMIN, TEACHER, STUDENT, ALL
   - **MFA Method**: SMS, EMAIL, TOTP (Authenticator App)
   - **Is Required**: Force MFA or optional
   - **Trusted Device Days**: How long to trust a device (e.g., 30)
   - **Bypass Conditions**: JSON rules for skipping MFA
4. Click **Save**

### Bypass Conditions Example
```json
{
  "ip_whitelist": ["192.168.1.0/24"],
  "trusted_device": true,
  "office_hours_only": false
}
```

---

## 8. Maintenance Windows

### Purpose
Schedule planned maintenance periods with automatic notifications and system behavior adjustments.

### Use Cases
- **Database Upgrades**: Schedule weekend maintenance
- **API Downtime**: Warn users before third-party maintenance
- **Exam Blackouts**: Prevent maintenance during exam periods

### Real-Time Scenarios

**Scenario 1: Saturday Night Maintenance**
Schedule 2-hour maintenance every Saturday 2-4 AM with auto-notification to all users 24 hours before.

**Scenario 2: Emergency Maintenance**
Quickly schedule immediate maintenance with admin notification.

### Configuration Steps

1. Navigate to: **Admin → System Configuration → Maintenance Windows**
2. Click **Add Maintenance Window**
3. Fill in:
   - **Title**: e.g., "Database Optimization"
   - **Description**: What will be done
   - **Start Time**: When maintenance begins
   - **End Time**: When maintenance ends
   - **Maintenance Type**: PLANNED, EMERGENCY, PARTIAL
   - **Affected Services**: Which services will be down
   - **Notification Settings**:
     ```json
     {
       "notify_before_hours": 24,
       "notify_via": ["EMAIL", "IN_APP", "SMS"],
       "user_types": ["ALL"]
     }
     ```
   - **Is Active**: Schedule active
4. Click **Save**

---

## 9. Report Templates

### Purpose
Create and save custom report configurations for quick generation of attendance, student, teacher, and financial reports.

### Use Cases
- **Monthly Attendance Report**: Pre-configured monthly report for all batches
- **Fee Defaulters List**: Quick report of pending fee students
- **Teacher Performance**: Subject-wise teacher analytics
- **Scheduled Reports**: Auto-email reports weekly to management

### Real-Time Scenarios

**Scenario 1: Daily Attendance Email**
Auto-generate attendance report at 6 PM daily and email to principal.

**Scenario 2: Fee Reminder List**
Generate list of students with pending fees > 30 days for accounts team.

### Configuration Steps

1. Navigate to: **Admin → System Configuration → Report Templates**
2. Click **Add Report Template**
3. Fill in:
   - **Name**: e.g., "Monthly Attendance Summary"
   - **Description**: What this report shows
   - **Report Type**: STUDENT, TEACHER, ATTENDANCE, EXAM, FINANCIAL
   - **Filters JSON**: Pre-set filters
     ```json
     {
       "date_range": "last_month",
       "status": "ACTIVE",
       "batch": null
     }
     ```
   - **Columns JSON**: Which columns to include
     ```json
     ["name", "email", "batch", "attendance_percentage", "last_login"]
     ```
   - **Group By**: Aggregation fields
   - **Default Format**: CSV, EXCEL, PDF, JSON
   - **Is Scheduled**: Enable auto-generation
   - **Schedule Cron**: Cron expression (e.g., `0 18 * * *` for 6 PM daily)
   - **Recipients Email**: JSON array of emails
4. Click **Save**

### Cron Expression Examples
| Schedule | Cron |
|----------|------|
| Daily 6 PM | `0 18 * * *` |
| Weekly Monday 9 AM | `0 9 * * 1` |
| Monthly 1st 8 AM | `0 8 1 * *` |

---

## 10. System Settings

### Purpose
Key-value store for application-wide configuration settings that can be changed without code deployment.

### Use Cases
- **Contact Email**: Support email displayed on website
- **Pagination Limits**: Default page sizes
- **Session Timeout**: Auto-logout duration
- **Upload Limits**: Maximum file sizes
- **API Rate Limits**: Throttling configurations

### Real-Time Scenarios

**Scenario 1: Changing Support Email**
Update support email from old@coaching.com to new@coaching.com without code change.

**Scenario 2: Exam Mode Settings**
Increase session timeout during exams from 30 to 120 minutes.

### Configuration Steps

1. Navigate to: **Admin → System Configuration → System Settings**
2. Click **Add System Setting**
3. Fill in:
   - **Setting Key**: Unique key (e.g., `support_email`)
   - **Value Type**: STRING, NUMBER, BOOLEAN, JSON
   - **Category**: GENERAL, SECURITY, NOTIFICATION, LIMITS
   - **String/Number/Boolean/JSON Value**: The actual value
   - **Is Secret**: Hide value in logs (for API keys)
   - **Is Editable**: Allow runtime editing
4. Click **Save**

### Common Settings
| Key | Value Type | Example |
|-----|-----------|---------|
| `support_email` | STRING | support@enf.com |
| `session_timeout_minutes` | NUMBER | 30 |
| `enable_registrations` | BOOLEAN | true |
| `allowed_file_types` | JSON | `["pdf","doc","jpg"]` |

---

## 11. Website Settings

### Purpose
Configure public website sections including hero, about, programs, testimonials, founders, footer, SEO, and branding.

### Section Types

| Section | Purpose |
|---------|---------|
| HERO | Homepage banner/hero section |
| ABOUT | About us page content |
| PROGRAMS | Course/program listings |
| TESTIMONIALS | Student success stories |
| FOUNDER | Founders & management team |
| FOOTER | Footer links and info |
| SEO | Meta tags, OG images |
| SOCIAL | Social media links |
| BRANDING | Logo, colors, themes |
| CONTACT | Contact information |
| NEWS | News & updates |
| CUSTOM | Custom sections |

### Configuration Steps

1. Navigate to: **Admin → System Configuration → Website Settings**
2. Click **Add Website Setting**
3. Fill in:
   - **Section**: Select from dropdown
   - **Setting Key**: e.g., `hero_title`
   - **Setting Value**: Text content
   - **Setting JSON**: Complex data
   - **Media URL**: Image/video URL
   - **Sort Order**: Display order
   - **Is Active**: Enable/disable
4. Click **Save**

### Hero Section Example
```
Section: HERO
Setting Key: hero_title
Setting Value: "Crack JEE/NEET with India's Best Faculty"
Setting JSON: {
  "subtitle": "15000+ selections",
  "cta_text": "Start Free Trial",
  "cta_url": "/register"
}
Media URL: https://cdn.enf.com/hero-bg.jpg
```

### Founder Section Example
```
Section: FOUNDER
Setting Key: founder_1
Setting JSON: {
  "name": "Dr. Rajesh Kumar",
  "designation": "Founder & CEO",
  "photo_url": "https://cdn.enf.com/founder1.jpg",
  "bio": "IIT Delhi alumnus with 20 years experience",
  "linkedin": "https://linkedin.com/in/rajesh"
}
```

---

## 12. Website News

### Purpose
Manage news items, announcements, and priority alerts displayed on the public website.

### News Types
- **ANNOUNCEMENT**: General announcements
- **NEWS**: News articles
- **EVENT**: Upcoming events
- **ALERT**: Priority/urgent alerts
- **UPDATE**: Platform updates

### Real-Time Scenarios

**Scenario 1: JEE Result Announcement**
Create urgent news banner: "Congratulations! 500+ students selected in JEE Advanced 2026"

**Scenario 2: Holiday Notice**
Publish news about Diwali vacation dates with medium priority.

### Configuration Steps

1. Navigate to: **Admin → System Configuration → Website News**
2. Click **Add Website News**
3. Fill in:
   - **Title**: News headline
   - **Slug**: URL-friendly version (auto-generated)
   - **Summary**: Short preview (500 chars)
   - **Content**: Full HTML content
   - **News Type**: ANNOUNCEMENT, NEWS, EVENT, ALERT, UPDATE
   - **Priority**: LOW, NORMAL, HIGH, URGENT
   - **Featured Image**: Banner image URL
   - **Show on Homepage**: Display on main page
   - **Show as Banner**: Display as top banner
   - **Publish Date**: When to show
   - **Expiry Date**: When to hide
   - **Is Published**: Publish immediately
4. Click **Save**

---

## 13. Testimonials

### Purpose
Manage success stories and testimonials from students, parents, teachers, and alumni for display on the website.

### Author Types
- **STUDENT**: Current student testimonials
- **PARENT**: Parent feedback
- **TEACHER**: Faculty testimonials
- **ALUMNI**: Past student success stories
- **OTHER**: Other sources

### Real-Time Scenarios

**Scenario 1: JEE Topper Story**
Add testimonial from AIR 45 student with photo, achievement, and quote.

**Scenario 2: Parent Appreciation**
Publish parent feedback about their child's improvement.

### Configuration Steps

1. Navigate to: **Admin → System Configuration → Testimonials**
2. Click **Add Testimonial**
3. Fill in:
   - **Author Name**: e.g., "Priya Sharma"
   - **Author Type**: STUDENT, PARENT, TEACHER, ALUMNI
   - **Author Designation**: e.g., "Class 12, JEE 2025"
   - **Author Photo**: Photo URL
   - **Content**: Testimonial text
   - **Rating**: 1-5 stars
   - **Achievement**: e.g., "AIR 45 in JEE Advanced"
   - **Batch Year**: e.g., "2024-25"
   - **Is Featured**: Show prominently
   - **Sort Order**: Display order
   - **Is Published**: Publish on website
4. Click **Save**

---

## 14. Footer Configs

### Purpose
Configure website footer sections including quick links, resources, contact info, social media, and legal links.

### Section Types

| Section | Purpose |
|---------|---------|
| QUICK_LINKS | Navigation links |
| RESOURCES | Study resources links |
| CONTACT | Contact information |
| SOCIAL | Social media icons |
| LEGAL | Privacy, Terms links |
| NEWSLETTER | Newsletter signup |
| CUSTOM | Custom footer section |

### Configuration Steps

1. Navigate to: **Admin → System Configuration → Footer Configs**
2. Click **Add Footer Config**
3. Fill in:
   - **Section**: Select type
   - **Section Title**: e.g., "Quick Links"
   - **Links JSON** (for link sections):
     ```json
     [
       {"label": "About Us", "url": "/about"},
       {"label": "Courses", "url": "/courses"},
       {"label": "Contact", "url": "/contact"}
     ]
     ```
   - **Contact Email/Phone/Address** (for contact section)
   - **Social Links JSON** (for social section):
     ```json
     {
       "facebook": "https://fb.com/enf",
       "twitter": "https://twitter.com/enf",
       "youtube": "https://youtube.com/enf",
       "instagram": "https://instagram.com/enf"
     }
     ```
   - **Copyright Text**: e.g., "© 2026 ENABLE PROGRAM"
   - **Sort Order**: Section order
   - **Is Active**: Enable section
4. Click **Save**

---

## 15. Announcements

### Purpose
Internal announcements for students, teachers, and staff within the platform (different from website news).

### Announcement Types
- **GENERAL**: General information
- **ACADEMIC**: Academic updates
- **EXAM**: Exam-related notices
- **EVENT**: Event announcements
- **MAINTENANCE**: System maintenance notices
- **URGENT**: Priority alerts

### Target Audiences
- **ALL**: All users
- **STUDENTS**: Students only
- **TEACHERS**: Teachers only
- **BATCH**: Specific batch
- **CUSTOM**: Selected users

### Configuration Steps

1. Navigate to: **Admin → System Configuration → Announcements**
2. Click **Add Announcement**
3. Fill in:
   - **Title**: Announcement headline
   - **Content**: Full text/HTML content
   - **Announcement Type**: Select type
   - **Target Audience**: Who should see this
   - **Target Batches**: (If BATCH selected)
   - **Is Pinned**: Keep at top
   - **Is Published**: Publish now
   - **Expires At**: Auto-hide date
   - **Acknowledgement Required**: Require users to confirm reading
4. Click **Save**

---

## 16. Direct Messages

### Purpose
Monitor and manage internal messaging between users (student-teacher, admin-teacher communications).

### Use Cases
- **Message Moderation**: Review flagged messages
- **Audit Trail**: Track important communications
- **Support Escalation**: View conversation history

### Management Features

1. Navigate to: **Admin → System Configuration → Direct Messages**
2. View all messages with filters:
   - **Is Read**: Filter by read status
   - **Date Range**: Filter by date
3. View conversation details:
   - Sender and recipient
   - Message content
   - Timestamps
   - Attachments

---

## 17. Notifications

### Purpose
View and manage system notifications sent to users via in-app, email, SMS, or push channels.

### Notification Types
- **INFO**: Informational
- **WARNING**: Warnings
- **SUCCESS**: Success confirmations
- **ERROR**: Error alerts
- **ACTION_REQUIRED**: Actions needed

### Channels
- **IN_APP**: In-app notification bell
- **EMAIL**: Email notifications
- **SMS**: SMS alerts
- **PUSH**: Mobile push notifications
- **WHATSAPP**: WhatsApp messages

### Management Features

1. Navigate to: **Admin → System Configuration → Notifications**
2. View notification history with filters:
   - **Type**: Filter by notification type
   - **Is Read**: Read/unread status
   - **Channel**: Delivery channel
3. Click on notification to see:
   - Full message
   - Delivery status
   - Read timestamp

---

## 18. Support Tickets

### Purpose
Manage helpdesk/support tickets submitted by students, teachers, and parents.

### Ticket Categories
- **TECHNICAL**: Technical issues
- **ACCOUNT**: Account problems
- **PAYMENT**: Payment/fee issues
- **CONTENT**: Content queries
- **EXAM**: Exam-related issues
- **GENERAL**: General support
- **FEEDBACK**: Feedback

### Ticket Status Flow
```
OPEN → IN_PROGRESS → WAITING → RESOLVED → CLOSED
                            ↓
                        REOPENED
```

### Priority Levels
- **LOW**: Can wait
- **MEDIUM**: Normal priority
- **HIGH**: Needs attention
- **CRITICAL**: Urgent action required

### Management Steps

1. Navigate to: **Admin → System Configuration → Support Tickets**
2. View tickets with filters:
   - **Status**: Filter by status
   - **Priority**: Filter by priority
   - **Category**: Filter by category
3. Click on ticket to:
   - View full description
   - Add staff replies
   - Change status
   - Assign to team member
   - View ticket history
4. Track metrics:
   - Response time
   - Resolution time
   - SLA compliance

---

## Summary

| Feature | Primary Use |
|---------|-------------|
| AI Features | AI/ML integrations |
| Attendance Rules | Automated attendance |
| Class Link Configs | Meeting platforms |
| Enquiry Forms | Lead management |
| Feature Flags | Feature rollouts |
| Integration Configs | Third-party APIs |
| MFA Policies | 2FA security |
| Maintenance Windows | Scheduled downtime |
| Report Templates | Custom reports |
| System Settings | App configuration |
| Website Settings | Website content |
| Website News | Public announcements |
| Testimonials | Success stories |
| Footer Configs | Footer content |
| Announcements | Internal notices |
| Direct Messages | User messaging |
| Notifications | Alert system |
| Support Tickets | Helpdesk |

---

*Last Updated: February 2026*
*ENABLE PROGRAM Admin Console v4.0*
