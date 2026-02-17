-- ============================================================================
-- LMS Enterprise - PostgreSQL DDL Script
-- Database: LMS_PROD_DB
-- PostgreSQL 18 compatible
-- Converted from legacy MS SQL Server tables to enterprise-grade schema
-- ============================================================================

-- ============================================================================
-- 1. DATABASE & EXTENSIONS
-- ============================================================================
-- Run as superuser / pgadmin
CREATE DATABASE "LMS_PROD_DB"
    WITH OWNER = pgadmin
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

\c "LMS_PROD_DB"

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram for fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- GIN index support

-- ============================================================================
-- 2. APPLICATION ROLE
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'lmsapp') THEN
        CREATE ROLE lmsapp WITH LOGIN PASSWORD 'ChangeMe!Pr0d' NOSUPERUSER NOCREATEDB NOCREATEROLE;
    END IF;
END
$$;

GRANT CONNECT ON DATABASE "LMS_PROD_DB" TO lmsapp;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO lmsapp;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO lmsapp;

-- ============================================================================
-- 3. TENANTS TABLE
-- ============================================================================
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_code     VARCHAR(20) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    subdomain       VARCHAR(63) NOT NULL UNIQUE,
    custom_domain   VARCHAR(255) UNIQUE,
    display_name    VARCHAR(255),
    logo_url        VARCHAR(500),
    favicon_url     VARCHAR(500),
    primary_color   VARCHAR(7) DEFAULT '#1976D2',
    secondary_color VARCHAR(7) DEFAULT '#424242',
    contact_email   VARCHAR(254),
    contact_phone   VARCHAR(20),
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'India',
    pincode         VARCHAR(10),
    youtube_channel_id    VARCHAR(100),
    youtube_api_key       TEXT,
    youtube_client_id     TEXT,
    youtube_client_secret TEXT,
    plan_type       VARCHAR(20) DEFAULT 'STARTER' CHECK (plan_type IN ('STARTER','PROFESSIONAL','ENTERPRISE','CUSTOM')),
    max_students    INTEGER DEFAULT 500,
    max_teachers    INTEGER DEFAULT 50,
    max_storage_gb  INTEGER DEFAULT 100,
    subscription_start DATE,
    subscription_end   DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    is_verified     BOOLEAN DEFAULT FALSE,
    setup_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    default_timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    default_language VARCHAR(10) DEFAULT 'en',
    academic_year_start INTEGER DEFAULT 4,
    settings_json   JSONB DEFAULT '{}'::jsonb,
    data_processing_consent BOOLEAN DEFAULT FALSE,
    privacy_policy_url VARCHAR(500),
    terms_url          VARCHAR(500),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    ext_tenant_1    VARCHAR(500),
    ext_tenant_2    VARCHAR(500),
    ext_tenant_3    JSONB,
    ext_tenant_4    NUMERIC(18,4),
    ext_tenant_5    BOOLEAN
);

CREATE INDEX idx_tenants_active ON tenants(is_active);

-- ============================================================================
-- 4. ACCOUNTS - STUDENTS
-- ============================================================================
CREATE TABLE students (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username        VARCHAR(150) NOT NULL,
    email           VARCHAR(254),
    phone           VARCHAR(20),
    password_hash   TEXT NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    full_name       VARCHAR(200),
    -- Profile
    date_of_birth   DATE,
    gender          VARCHAR(10) CHECK (gender IN ('MALE','FEMALE','OTHER','PREFER_NOT')),
    profile_photo   VARCHAR(500),
    bio             TEXT,
    -- Academic
    enrollment_number VARCHAR(50),
    roll_number     VARCHAR(50),
    class_level     VARCHAR(20) CHECK (class_level IN ('CLASS_9','CLASS_10','CLASS_11','CLASS_12','DROPPER','GRADUATE')),
    exam_target     VARCHAR(15) CHECK (exam_target IN ('JEE_MAINS','JEE_ADVANCED','NEET','BOARDS','FOUNDATION')),
    stream          VARCHAR(15) CHECK (stream IN ('PCM','PCB','PCMB','ARTS','COMMERCE')),
    board           VARCHAR(15) CHECK (board IN ('CBSE','ICSE','STATE','IB','IGCSE')),
    medium          VARCHAR(10) DEFAULT 'ENGLISH',
    academic_year   VARCHAR(10),
    batch_id        UUID,
    -- Location
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'India',
    pincode         VARCHAR(10),
    school_name     VARCHAR(255),
    school_id       UUID,
    -- Parent
    father_name     VARCHAR(200),
    father_phone    VARCHAR(20),
    father_email    VARCHAR(254),
    father_occupation VARCHAR(200),
    mother_name     VARCHAR(200),
    mother_phone    VARCHAR(20),
    mother_email    VARCHAR(254),
    mother_occupation VARCHAR(200),
    guardian_name   VARCHAR(200),
    guardian_phone  VARCHAR(20),
    guardian_relation VARCHAR(50),
    -- Subscription
    package_id      UUID,
    package_name    VARCHAR(200),
    subscription_start DATE,
    subscription_end   DATE,
    is_paid         BOOLEAN DEFAULT FALSE,
    payment_amount  NUMERIC(10,2) DEFAULT 0,
    payment_status  VARCHAR(15) DEFAULT 'PENDING',
    -- Auth
    is_active       BOOLEAN DEFAULT TRUE,
    is_verified     BOOLEAN DEFAULT FALSE,
    email_verified  BOOLEAN DEFAULT FALSE,
    phone_verified  BOOLEAN DEFAULT FALSE,
    mfa_enabled     BOOLEAN DEFAULT FALSE,
    mfa_method      VARCHAR(10),
    mfa_secret      TEXT,
    last_login      TIMESTAMPTZ,
    login_count     INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMPTZ,
    -- Device
    max_devices     INTEGER DEFAULT 3,
    active_devices  INTEGER DEFAULT 0,
    -- Notification prefs
    notification_email BOOLEAN DEFAULT TRUE,
    notification_sms   BOOLEAN DEFAULT TRUE,
    notification_push  BOOLEAN DEFAULT TRUE,
    notification_whatsapp BOOLEAN DEFAULT FALSE,
    -- Status
    admission_date  DATE,
    is_deleted      BOOLEAN DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    student_meta    JSONB,
    ext_student_1   VARCHAR(500),
    ext_student_2   VARCHAR(500),
    ext_student_3   JSONB,
    ext_student_4   NUMERIC(18,4),
    ext_student_5   BOOLEAN,

    CONSTRAINT uq_student_username UNIQUE (tenant_id, username),
    CONSTRAINT uq_student_email UNIQUE (tenant_id, email),
    CONSTRAINT uq_student_phone UNIQUE (tenant_id, phone)
);

CREATE INDEX idx_students_tenant_active ON students(tenant_id, is_active);
CREATE INDEX idx_students_tenant_batch ON students(tenant_id, batch_id);
CREATE INDEX idx_students_enrollment ON students(tenant_id, enrollment_number);

-- ============================================================================
-- 5. ACCOUNTS - TEACHERS
-- ============================================================================
CREATE TABLE teachers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username        VARCHAR(150) NOT NULL,
    email           VARCHAR(254),
    phone           VARCHAR(20),
    password_hash   TEXT NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    full_name       VARCHAR(200),
    date_of_birth   DATE,
    gender          VARCHAR(10),
    profile_photo   VARCHAR(500),
    bio             TEXT,
    employee_id     VARCHAR(50),
    designation     VARCHAR(200),
    qualifications  TEXT,
    experience_years INTEGER DEFAULT 0,
    specializations JSONB DEFAULT '[]'::jsonb,
    subjects_taught JSONB DEFAULT '[]'::jsonb,
    youtube_channel_id VARCHAR(100),
    youtube_enabled BOOLEAN DEFAULT FALSE,
    can_go_live     BOOLEAN DEFAULT FALSE,
    max_concurrent_classes INTEGER DEFAULT 1,
    bank_name       VARCHAR(200),
    bank_account    VARCHAR(50),
    ifsc_code       VARCHAR(20),
    pan_number      VARCHAR(20),
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    is_active       BOOLEAN DEFAULT TRUE,
    is_verified     BOOLEAN DEFAULT FALSE,
    mfa_enabled     BOOLEAN DEFAULT FALSE,
    last_login      TIMESTAMPTZ,
    login_count     INTEGER DEFAULT 0,
    max_devices     INTEGER DEFAULT 3,
    joining_date    DATE,
    is_deleted      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    teacher_meta    JSONB,
    ext_teacher_1   VARCHAR(500),
    ext_teacher_2   VARCHAR(500),
    ext_teacher_3   JSONB,

    CONSTRAINT uq_teacher_username UNIQUE (tenant_id, username),
    CONSTRAINT uq_teacher_email UNIQUE (tenant_id, email)
);

CREATE INDEX idx_teachers_tenant_active ON teachers(tenant_id, is_active);

-- ============================================================================
-- 6. ACCOUNTS - ADMINS
-- ============================================================================
CREATE TABLE admins (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username        VARCHAR(150) NOT NULL,
    email           VARCHAR(254),
    phone           VARCHAR(20),
    password_hash   TEXT NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    full_name       VARCHAR(200),
    profile_photo   VARCHAR(500),
    admin_type      VARCHAR(15) DEFAULT 'ADMIN' CHECK (admin_type IN ('SUPER_ADMIN','TENANT_ADMIN','ADMIN','MODERATOR')),
    role_id         UUID,
    department      VARCHAR(200),
    can_manage_tenants BOOLEAN DEFAULT FALSE,
    can_manage_admins  BOOLEAN DEFAULT FALSE,
    can_export_data    BOOLEAN DEFAULT FALSE,
    can_view_financials BOOLEAN DEFAULT FALSE,
    ip_whitelist    JSONB DEFAULT '[]'::jsonb,
    require_vpn     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    mfa_enabled     BOOLEAN DEFAULT FALSE,
    last_login      TIMESTAMPTZ,
    login_count     INTEGER DEFAULT 0,
    is_deleted      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    admin_meta      JSONB,

    CONSTRAINT uq_admin_username UNIQUE (tenant_id, username),
    CONSTRAINT uq_admin_email UNIQUE (tenant_id, email)
);

-- ============================================================================
-- 7. ACCOUNTS - PARENTS
-- ============================================================================
CREATE TABLE parents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username        VARCHAR(150) NOT NULL,
    email           VARCHAR(254),
    phone           VARCHAR(20),
    password_hash   TEXT NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    full_name       VARCHAR(200),
    relation        VARCHAR(50),
    can_view_attendance BOOLEAN DEFAULT TRUE,
    can_view_grades    BOOLEAN DEFAULT TRUE,
    can_view_schedule  BOOLEAN DEFAULT TRUE,
    can_message_teacher BOOLEAN DEFAULT TRUE,
    is_active       BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_parent_username UNIQUE (tenant_id, username)
);

CREATE TABLE parent_students (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id   UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    relation    VARCHAR(50),
    is_primary  BOOLEAN DEFAULT FALSE,
    CONSTRAINT uq_parent_student UNIQUE (parent_id, student_id)
);

-- ============================================================================
-- 8. ROLES & PERMISSIONS
-- ============================================================================
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_name   VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_role_name UNIQUE (tenant_id, role_name)
);

CREATE TABLE permissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_code VARCHAR(100) NOT NULL UNIQUE,
    permission_name VARCHAR(200),
    module          VARCHAR(50),
    description     TEXT
);

CREATE TABLE role_permissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

CREATE TABLE password_change_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    user_type       VARCHAR(10),
    token           VARCHAR(500) NOT NULL UNIQUE,
    is_used         BOOLEAN DEFAULT FALSE,
    used_at         TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ NOT NULL,
    ip_address      INET,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. ACADEMICS
-- ============================================================================
CREATE TABLE academic_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_name    VARCHAR(100) NOT NULL,
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    is_current      BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_session_name UNIQUE (tenant_id, session_name)
);

CREATE TABLE groups (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    group_name      VARCHAR(255) NOT NULL,
    description     TEXT,
    group_type      VARCHAR(20) DEFAULT 'ACADEMIC',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_name   VARCHAR(255) NOT NULL,
    parent_id       UUID REFERENCES categories(id),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subjects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subject_code    VARCHAR(20) NOT NULL,
    subject_name    VARCHAR(255) NOT NULL,
    subject_type    VARCHAR(15) DEFAULT 'THEORY' CHECK (subject_type IN ('THEORY','PRACTICAL','BOTH')),
    description     TEXT,
    icon_url        VARCHAR(500),
    color_code      VARCHAR(7),
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_subject_code UNIQUE (tenant_id, subject_code)
);

CREATE TABLE subject_sections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    section_name    VARCHAR(255) NOT NULL,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE chapters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subject_id      UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    section_id      UUID REFERENCES subject_sections(id),
    chapter_code    VARCHAR(20),
    chapter_name    VARCHAR(255) NOT NULL,
    class_level     VARCHAR(20),
    description     TEXT,
    weightage       NUMERIC(5,2) DEFAULT 0,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE topics (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    chapter_id      UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    topic_name      VARCHAR(255) NOT NULL,
    description     TEXT,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE batches (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    batch_code      VARCHAR(50) NOT NULL,
    batch_name      VARCHAR(255) NOT NULL,
    academic_session_id UUID REFERENCES academic_sessions(id),
    class_level     VARCHAR(20),
    exam_target     VARCHAR(15),
    stream          VARCHAR(15),
    max_students    INTEGER DEFAULT 100,
    start_date      DATE,
    end_date        DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_batch_code UNIQUE (tenant_id, batch_code)
);

CREATE TABLE batch_students (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id    UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    is_active   BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_batch_student UNIQUE (batch_id, student_id)
);

CREATE TABLE batch_teachers (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id    UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    teacher_id  UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id  UUID REFERENCES subjects(id),
    is_primary  BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_batch_teacher_subject UNIQUE (batch_id, teacher_id, subject_id)
);

CREATE TABLE languages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    language_code   VARCHAR(10) NOT NULL,
    language_name   VARCHAR(100) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_language_code UNIQUE (tenant_id, language_code)
);

CREATE TABLE states (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    state_name  VARCHAR(200) NOT NULL,
    state_code  VARCHAR(10),
    country     VARCHAR(100) DEFAULT 'India',
    is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE cities (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    city_name   VARCHAR(200) NOT NULL,
    state_id    UUID REFERENCES states(id),
    is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE religions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    religion_name   VARCHAR(200) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE schools (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    school_name     VARCHAR(500) NOT NULL,
    board           VARCHAR(15),
    city_id         UUID REFERENCES cities(id),
    state_id        UUID REFERENCES states(id),
    address         TEXT,
    principal_name  VARCHAR(200),
    contact_phone   VARCHAR(20),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. YOUTUBE CHANNELS
-- ============================================================================
CREATE TABLE youtube_channels (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    channel_id      VARCHAR(100) NOT NULL,
    channel_name    VARCHAR(255),
    channel_url     VARCHAR(500),
    client_id       TEXT,
    client_secret   TEXT,
    access_token    TEXT,
    refresh_token   TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes          JSONB DEFAULT '[]'::jsonb,
    owned_by_tenant BOOLEAN DEFAULT TRUE,
    primary_channel BOOLEAN DEFAULT FALSE,
    daily_quota_limit INTEGER DEFAULT 10000,
    quota_used_today  INTEGER DEFAULT 0,
    quota_reset_at  TIMESTAMPTZ,
    status          VARCHAR(20) DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','REVOKED','QUOTA_EXCEEDED')),
    last_verified_at TIMESTAMPTZ,
    verification_status VARCHAR(10) DEFAULT 'PENDING',
    assigned_teacher_id UUID REFERENCES teachers(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    channel_meta    JSONB
);

CREATE INDEX idx_yt_channel_status ON youtube_channels(tenant_id, status);

-- ============================================================================
-- 11. SCHEDULED CLASSES
-- ============================================================================
CREATE TABLE scheduled_classes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    class_code      VARCHAR(50) NOT NULL,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    thumbnail_url   VARCHAR(500),
    scheduled_date  DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    duration_minutes INTEGER,
    timezone        VARCHAR(50) DEFAULT 'Asia/Kolkata',
    subject         VARCHAR(20),
    chapter_id      UUID REFERENCES chapters(id),
    topic_id        UUID REFERENCES topics(id),
    topics_covered  JSONB DEFAULT '[]'::jsonb,
    learning_objectives JSONB DEFAULT '[]'::jsonb,
    youtube_channel_id UUID REFERENCES youtube_channels(id),
    youtube_broadcast_id VARCHAR(100),
    youtube_stream_id VARCHAR(100),
    youtube_stream_key TEXT,
    youtube_stream_url VARCHAR(500),
    youtube_watch_url  VARCHAR(500),
    youtube_embed_url  VARCHAR(500),
    youtube_recording_id VARCHAR(100),
    youtube_recording_url VARCHAR(500),
    privacy_status  VARCHAR(10) DEFAULT 'UNLISTED' CHECK (privacy_status IN ('PRIVATE','UNLISTED')),
    access_type     VARCHAR(15) DEFAULT 'BATCH_ONLY',
    allowed_batches JSONB DEFAULT '[]'::jsonb,
    allowed_students JSONB DEFAULT '[]'::jsonb,
    requires_enrollment_check BOOLEAN DEFAULT TRUE,
    access_token    VARCHAR(500) UNIQUE,
    access_token_expires_at TIMESTAMPTZ,
    attendance_mode VARCHAR(10) DEFAULT 'AUTO' CHECK (attendance_mode IN ('AUTO','MANUAL','HYBRID')),
    auto_attendance_threshold_minutes INTEGER DEFAULT 15,
    min_watch_percent_for_present INTEGER DEFAULT 70,
    status          VARCHAR(15) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SCHEDULED','LIVE','COMPLETED','CANCELLED','RESCHEDULED')),
    created_by_id   UUID,
    created_by_type VARCHAR(10),
    actual_start_time TIMESTAMPTZ,
    actual_end_time   TIMESTAMPTZ,
    started_by_id   UUID REFERENCES teachers(id),
    ended_by_id     UUID REFERENCES teachers(id),
    expected_students INTEGER,
    peak_live_viewers INTEGER,
    total_unique_viewers INTEGER,
    average_watch_duration_seconds INTEGER,
    total_chat_messages INTEGER,
    cancelled_at    TIMESTAMPTZ,
    cancelled_by    UUID,
    cancellation_reason TEXT,
    rescheduled_from_id UUID REFERENCES scheduled_classes(id),
    reschedule_count INTEGER DEFAULT 0,
    attached_materials JSONB DEFAULT '[]'::jsonb,
    teacher_id      UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    batch_id        UUID REFERENCES batches(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    published_at    TIMESTAMPTZ,
    class_meta      JSONB,
    ext_class_1     VARCHAR(500),
    ext_class_2     VARCHAR(500),
    ext_class_3     JSONB,
    ext_class_4     NUMERIC(18,4),
    ext_class_5     BOOLEAN,

    CONSTRAINT uq_class_code_per_tenant UNIQUE (tenant_id, class_code)
);

CREATE INDEX idx_class_date ON scheduled_classes(tenant_id, scheduled_date);
CREATE INDEX idx_class_status ON scheduled_classes(tenant_id, status);
CREATE INDEX idx_class_teacher ON scheduled_classes(tenant_id, teacher_id);
CREATE INDEX idx_class_batch ON scheduled_classes(tenant_id, batch_id);

-- ============================================================================
-- 12. CLASS ACCESS TOKENS
-- ============================================================================
CREATE TABLE class_access_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    scheduled_class_id UUID NOT NULL REFERENCES scheduled_classes(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    token           VARCHAR(500) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    used            BOOLEAN DEFAULT FALSE,
    used_at         TIMESTAMPTZ,
    used_device_id  UUID,
    used_ip         INET,
    revoked         BOOLEAN DEFAULT FALSE,
    revoked_at      TIMESTAMPTZ,
    revoked_reason  VARCHAR(500),
    token_meta      JSONB
);

CREATE INDEX idx_cat_class_student ON class_access_tokens(scheduled_class_id, student_id);

-- ============================================================================
-- 13. CLASS WATCH TIMES
-- ============================================================================
CREATE TABLE class_watch_times (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    scheduled_class_id UUID NOT NULL REFERENCES scheduled_classes(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    session_id      UUID,
    watch_session_id VARCHAR(200) NOT NULL UNIQUE,
    joined_at       TIMESTAMPTZ NOT NULL,
    left_at         TIMESTAMPTZ,
    total_watch_seconds INTEGER DEFAULT 0,
    video_progress_percent NUMERIC(5,2),
    max_timestamp_reached INTEGER,
    rewind_count    INTEGER DEFAULT 0,
    forward_count   INTEGER DEFAULT 0,
    pause_count     INTEGER DEFAULT 0,
    playback_speed  NUMERIC(3,1) DEFAULT 1.0,
    average_quality VARCHAR(10),
    buffering_count INTEGER DEFAULT 0,
    buffering_duration_seconds INTEGER DEFAULT 0,
    chat_messages_sent INTEGER DEFAULT 0,
    questions_asked INTEGER DEFAULT 0,
    polls_participated INTEGER DEFAULT 0,
    tab_switches    INTEGER DEFAULT 0,
    idle_periods    INTEGER DEFAULT 0,
    device_id       UUID,
    device_type     VARCHAR(50),
    is_live_watch   BOOLEAN DEFAULT TRUE,
    completion_status VARCHAR(15) DEFAULT 'PARTIAL',
    watch_meta      JSONB,
    engagement_score NUMERIC(5,2)
);

CREATE INDEX idx_cwt_class_student ON class_watch_times(tenant_id, scheduled_class_id, student_id);

-- ============================================================================
-- 14. TESTS (ASSESSMENTS)
-- ============================================================================
CREATE TABLE tests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    test_code       VARCHAR(50) NOT NULL,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    instructions    TEXT,
    test_type       VARCHAR(20) DEFAULT 'PRACTICE',
    exam_target     VARCHAR(15) DEFAULT 'GENERAL',
    difficulty_level VARCHAR(10) DEFAULT 'MEDIUM',
    subject_id      UUID REFERENCES subjects(id),
    chapter_id      UUID REFERENCES chapters(id),
    batch_id        UUID REFERENCES batches(id),
    total_duration_minutes INTEGER DEFAULT 60,
    start_datetime  TIMESTAMPTZ,
    end_datetime    TIMESTAMPTZ,
    late_submission_allowed BOOLEAN DEFAULT FALSE,
    late_submission_penalty_percent INTEGER DEFAULT 0,
    buffer_time_minutes INTEGER DEFAULT 0,
    show_timer      BOOLEAN DEFAULT TRUE,
    total_marks     NUMERIC(8,2) DEFAULT 0,
    passing_marks   NUMERIC(8,2) DEFAULT 0,
    passing_percent NUMERIC(5,2) DEFAULT 33.00,
    positive_marks_per_question NUMERIC(5,2) DEFAULT 4,
    negative_marks_per_question NUMERIC(5,2) DEFAULT -1,
    partial_marking BOOLEAN DEFAULT FALSE,
    max_attempts    INTEGER DEFAULT 1,
    shuffle_questions BOOLEAN DEFAULT FALSE,
    shuffle_options BOOLEAN DEFAULT FALSE,
    allow_review    BOOLEAN DEFAULT TRUE,
    allow_backward  BOOLEAN DEFAULT TRUE,
    access_mode     VARCHAR(15) DEFAULT 'BATCH_ONLY',
    access_password VARCHAR(255),
    result_display_mode VARCHAR(15) DEFAULT 'IMMEDIATE',
    result_release_datetime TIMESTAMPTZ,
    show_correct_answers BOOLEAN DEFAULT TRUE,
    show_explanations BOOLEAN DEFAULT TRUE,
    show_rank       BOOLEAN DEFAULT TRUE,
    show_percentile BOOLEAN DEFAULT TRUE,
    enable_proctoring BOOLEAN DEFAULT FALSE,
    prevent_tab_switch BOOLEAN DEFAULT TRUE,
    max_tab_switches INTEGER DEFAULT 3,
    prevent_copy_paste BOOLEAN DEFAULT TRUE,
    prevent_screenshot BOOLEAN DEFAULT TRUE,
    webcam_required BOOLEAN DEFAULT FALSE,
    full_screen_required BOOLEAN DEFAULT FALSE,
    status          VARCHAR(15) DEFAULT 'DRAFT',
    published_at    TIMESTAMPTZ,
    published_by    UUID,
    created_by      UUID,
    created_by_type VARCHAR(10),
    teacher_id      UUID REFERENCES teachers(id),
    total_questions INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    is_deleted      BOOLEAN DEFAULT FALSE,
    test_meta       JSONB,
    ext_test_1      VARCHAR(500),
    ext_test_2      VARCHAR(500),
    ext_test_3      JSONB,
    ext_test_4      NUMERIC(18,4),
    ext_test_5      BOOLEAN,

    CONSTRAINT uq_test_code_per_tenant UNIQUE (tenant_id, test_code)
);

CREATE INDEX idx_test_status ON tests(tenant_id, status);
CREATE INDEX idx_test_type ON tests(tenant_id, test_type);
CREATE INDEX idx_test_schedule ON tests(tenant_id, start_datetime);

-- ============================================================================
-- 15. TEST SECTIONS
-- ============================================================================
CREATE TABLE test_sections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    test_id         UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    section_name    VARCHAR(255) NOT NULL,
    section_order   INTEGER DEFAULT 1,
    subject_id      UUID REFERENCES subjects(id),
    total_questions INTEGER DEFAULT 0,
    mandatory_questions INTEGER DEFAULT 0,
    max_marks       NUMERIC(8,2) DEFAULT 0,
    duration_minutes INTEGER,
    instructions    TEXT
);

-- ============================================================================
-- 16. QUESTIONS
-- ============================================================================
CREATE TABLE questions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    question_code   VARCHAR(50),
    question_text   TEXT NOT NULL,
    question_text_html TEXT,
    question_image  VARCHAR(500),
    question_type   VARCHAR(20) DEFAULT 'MCQ_SINGLE',
    difficulty      VARCHAR(10) DEFAULT 'MEDIUM',
    option_a        TEXT,
    option_a_image  VARCHAR(500),
    option_b        TEXT,
    option_b_image  VARCHAR(500),
    option_c        TEXT,
    option_c_image  VARCHAR(500),
    option_d        TEXT,
    option_d_image  VARCHAR(500),
    option_e        TEXT,
    option_e_image  VARCHAR(500),
    correct_answer  VARCHAR(100) NOT NULL,
    correct_answer_value NUMERIC(20,6),
    numerical_tolerance NUMERIC(10,6),
    answer_explanation TEXT,
    positive_marks  NUMERIC(5,2) DEFAULT 4,
    negative_marks  NUMERIC(5,2) DEFAULT -1,
    partial_marks   NUMERIC(5,2),
    subject_id      UUID REFERENCES subjects(id),
    chapter_id      UUID REFERENCES chapters(id),
    topic_id        UUID REFERENCES topics(id),
    tags            JSONB DEFAULT '[]'::jsonb,
    test_id         UUID REFERENCES tests(id),
    section_id      UUID REFERENCES test_sections(id),
    question_order  INTEGER DEFAULT 1,
    parent_question_id UUID REFERENCES questions(id),
    total_attempts  INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    success_rate    NUMERIC(5,2),
    average_time_seconds INTEGER,
    is_active       BOOLEAN DEFAULT TRUE,
    is_deleted      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    question_meta   JSONB,
    ext_question_1  VARCHAR(500),
    ext_question_2  VARCHAR(500),
    ext_question_3  JSONB
);

CREATE INDEX idx_question_test ON questions(tenant_id, test_id);
CREATE INDEX idx_question_subject ON questions(tenant_id, subject_id);
CREATE INDEX idx_question_difficulty ON questions(tenant_id, difficulty);

-- ============================================================================
-- 17. TEST ATTEMPTS
-- ============================================================================
CREATE TABLE test_attempts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    test_id         UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attempt_number  INTEGER DEFAULT 1,
    started_at      TIMESTAMPTZ NOT NULL,
    submitted_at    TIMESTAMPTZ,
    time_taken_seconds INTEGER,
    remaining_time_seconds INTEGER,
    time_limit_reached BOOLEAN DEFAULT FALSE,
    total_questions INTEGER DEFAULT 0,
    attempted       INTEGER DEFAULT 0,
    correct         INTEGER DEFAULT 0,
    incorrect       INTEGER DEFAULT 0,
    skipped         INTEGER DEFAULT 0,
    marked_for_review INTEGER DEFAULT 0,
    raw_score       NUMERIC(8,2),
    total_marks     NUMERIC(8,2),
    percentage      NUMERIC(5,2),
    rank            INTEGER,
    percentile      NUMERIC(5,2),
    result          VARCHAR(10) CHECK (result IN ('PASS','FAIL','PENDING')),
    section_scores  JSONB DEFAULT '[]'::jsonb,
    status          VARCHAR(15) DEFAULT 'IN_PROGRESS',
    tab_switch_count INTEGER DEFAULT 0,
    copy_paste_attempts INTEGER DEFAULT 0,
    proctoring_violations JSONB DEFAULT '[]'::jsonb,
    auto_terminated BOOLEAN DEFAULT FALSE,
    termination_reason VARCHAR(500),
    ip_address      INET,
    user_agent      TEXT,
    device_id       UUID,
    attempt_meta    JSONB,

    CONSTRAINT uq_test_attempt UNIQUE (test_id, student_id, attempt_number)
);

CREATE INDEX idx_attempt_test_student ON test_attempts(tenant_id, test_id, student_id);
CREATE INDEX idx_attempt_student_date ON test_attempts(tenant_id, student_id, started_at);

-- ============================================================================
-- 18. TEST ATTEMPT ANSWERS
-- ============================================================================
CREATE TABLE test_attempt_answers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    attempt_id      UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    student_answer  VARCHAR(500),
    student_answer_value NUMERIC(20,6),
    student_answer_text TEXT,
    status          VARCHAR(15) DEFAULT 'NOT_VISITED',
    is_correct      BOOLEAN,
    marks_awarded   NUMERIC(5,2),
    time_spent_seconds INTEGER DEFAULT 0,
    visit_count     INTEGER DEFAULT 0,
    answer_change_count INTEGER DEFAULT 0,
    first_answered_at TIMESTAMPTZ,
    last_answered_at TIMESTAMPTZ,
    answer_meta     JSONB,

    CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

-- ============================================================================
-- 19. TEST FEEDBACKS
-- ============================================================================
CREATE TABLE test_feedbacks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    test_id         UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attempt_id      UUID REFERENCES test_attempts(id),
    overall_rating  INTEGER DEFAULT 0,
    difficulty_rating INTEGER DEFAULT 0,
    clarity_rating  INTEGER DEFAULT 0,
    comments        TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 20. OFFLINE TEST MARKS
-- ============================================================================
CREATE TABLE offline_test_marks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id      UUID REFERENCES subjects(id),
    test_name       VARCHAR(500) NOT NULL,
    test_date       DATE,
    total_marks     NUMERIC(8,2) NOT NULL,
    marks_obtained  NUMERIC(8,2) NOT NULL,
    percentage      NUMERIC(5,2),
    grade           VARCHAR(10),
    remarks         TEXT,
    entered_by      UUID,
    entered_at      TIMESTAMPTZ DEFAULT NOW(),
    verified_by     UUID,
    verified_at     TIMESTAMPTZ
);

-- ============================================================================
-- 21. ATTENDANCE
-- ============================================================================
CREATE TABLE attendance (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_type       VARCHAR(10) NOT NULL CHECK (user_type IN ('STUDENT','TEACHER')),
    user_id         UUID NOT NULL,
    batch_id        UUID REFERENCES batches(id),
    attendance_date DATE NOT NULL,
    month           INTEGER NOT NULL,
    year            INTEGER NOT NULL,
    academic_session_id UUID REFERENCES academic_sessions(id),
    status          VARCHAR(10) DEFAULT 'ABSENT',
    check_in_time   TIME,
    check_out_time  TIME,
    source          VARCHAR(15) DEFAULT 'MANUAL',
    source_reference_id UUID,
    live_class_id   UUID REFERENCES scheduled_classes(id),
    watch_duration_seconds INTEGER,
    watch_percentage NUMERIC(5,2),
    marked_by       UUID,
    marked_by_type  VARCHAR(10),
    marked_at       TIMESTAMPTZ DEFAULT NOW(),
    is_corrected    BOOLEAN DEFAULT FALSE,
    original_status VARCHAR(10),
    corrected_by    UUID,
    corrected_at    TIMESTAMPTZ,
    correction_reason TEXT,
    remarks         VARCHAR(500),
    attendance_meta JSONB,

    CONSTRAINT uq_attendance_per_user_per_day UNIQUE (tenant_id, user_type, user_id, attendance_date)
);

CREATE INDEX idx_att_user_date ON attendance(tenant_id, user_type, user_id, attendance_date);
CREATE INDEX idx_att_date_status ON attendance(tenant_id, attendance_date, status);
CREATE INDEX idx_att_batch_date ON attendance(tenant_id, batch_id, attendance_date);

CREATE TABLE attendance_correction_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    attendance_id   UUID NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
    requested_by    UUID NOT NULL,
    requested_by_type VARCHAR(10),
    requested_status VARCHAR(10),
    reason          TEXT NOT NULL,
    supporting_document VARCHAR(500),
    status          VARCHAR(10) DEFAULT 'PENDING',
    reviewed_by     UUID,
    reviewed_at     TIMESTAMPTZ,
    review_comment  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attendance_summaries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_type       VARCHAR(10) NOT NULL,
    user_id         UUID NOT NULL,
    batch_id        UUID REFERENCES batches(id),
    academic_session_id UUID REFERENCES academic_sessions(id),
    month           INTEGER NOT NULL,
    year            INTEGER NOT NULL,
    total_working_days INTEGER DEFAULT 0,
    present_days    INTEGER DEFAULT 0,
    absent_days     INTEGER DEFAULT 0,
    late_days       INTEGER DEFAULT 0,
    half_days       INTEGER DEFAULT 0,
    leave_days      INTEGER DEFAULT 0,
    holiday_days    INTEGER DEFAULT 0,
    attendance_percentage NUMERIC(5,2),
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_attendance_summary_monthly UNIQUE (tenant_id, user_type, user_id, month, year)
);

-- ============================================================================
-- 22. COMMUNICATION
-- ============================================================================
CREATE TABLE support_tickets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    ticket_number   VARCHAR(50) NOT NULL UNIQUE,
    title           VARCHAR(500) NOT NULL,
    description     TEXT NOT NULL,
    category        VARCHAR(15) DEFAULT 'GENERAL',
    priority        VARCHAR(10) DEFAULT 'MEDIUM',
    status          VARCHAR(15) DEFAULT 'OPEN',
    submitted_by_id UUID NOT NULL,
    submitted_by_type VARCHAR(10),
    submitted_by_name VARCHAR(200),
    submitted_by_email VARCHAR(254),
    assigned_to_id  UUID,
    assigned_to_type VARCHAR(10),
    assigned_at     TIMESTAMPTZ,
    attachments     JSONB DEFAULT '[]'::jsonb,
    resolved_at     TIMESTAMPTZ,
    resolved_by     UUID,
    resolution_note TEXT,
    satisfaction_rating INTEGER,
    first_response_at TIMESTAMPTZ,
    sla_breached    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    ticket_meta     JSONB
);

CREATE INDEX idx_ticket_status ON support_tickets(tenant_id, status);

CREATE TABLE ticket_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    ticket_id       UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL,
    sender_type     VARCHAR(10),
    sender_name     VARCHAR(200),
    message         TEXT NOT NULL,
    attachments     JSONB DEFAULT '[]'::jsonb,
    is_internal_note BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    content         TEXT NOT NULL,
    content_html    TEXT,
    summary         VARCHAR(500),
    thumbnail       VARCHAR(500),
    announcement_type VARCHAR(15) DEFAULT 'GENERAL',
    target_audience VARCHAR(10) DEFAULT 'ALL',
    target_batches  JSONB DEFAULT '[]'::jsonb,
    target_user_ids JSONB DEFAULT '[]'::jsonb,
    is_pinned       BOOLEAN DEFAULT FALSE,
    is_published    BOOLEAN DEFAULT FALSE,
    published_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_by_id   UUID NOT NULL,
    created_by_type VARCHAR(10),
    created_by_name VARCHAR(200),
    attachments     JSONB DEFAULT '[]'::jsonb,
    view_count      INTEGER DEFAULT 0,
    acknowledgement_required BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    is_deleted      BOOLEAN DEFAULT FALSE
);

CREATE TABLE announcement_reads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    user_type       VARCHAR(10),
    read_at         TIMESTAMPTZ DEFAULT NOW(),
    acknowledged    BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    CONSTRAINT uq_announcement_read UNIQUE (announcement_id, user_id)
);

CREATE TABLE direct_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL,
    sender_type     VARCHAR(10),
    sender_name     VARCHAR(200),
    recipient_id    UUID NOT NULL,
    recipient_type  VARCHAR(10),
    recipient_name  VARCHAR(200),
    subject         VARCHAR(500),
    message         TEXT NOT NULL,
    attachments     JSONB DEFAULT '[]'::jsonb,
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    parent_message_id UUID REFERENCES direct_messages(id),
    thread_id       UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    is_deleted_by_sender BOOLEAN DEFAULT FALSE,
    is_deleted_by_recipient BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_dm_recipient ON direct_messages(tenant_id, recipient_id, is_read);
CREATE INDEX idx_dm_sender ON direct_messages(tenant_id, sender_id);

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    user_type       VARCHAR(10),
    notification_type VARCHAR(20) DEFAULT 'INFO',
    channel         VARCHAR(10) DEFAULT 'IN_APP',
    title           VARCHAR(500) NOT NULL,
    message         TEXT NOT NULL,
    action_url      VARCHAR(500),
    action_data     JSONB,
    source_type     VARCHAR(50),
    source_id       UUID,
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    is_delivered    BOOLEAN DEFAULT FALSE,
    delivered_at    TIMESTAMPTZ,
    delivery_error  TEXT,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user_read ON notifications(tenant_id, user_id, is_read);

-- ============================================================================
-- 23. STUDY MATERIALS
-- ============================================================================
CREATE TABLE study_materials (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    material_code   VARCHAR(50),
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    thumbnail_url   VARCHAR(500),
    material_type   VARCHAR(20) DEFAULT 'EBOOK',
    file_url        VARCHAR(1000),
    file_name       VARCHAR(500),
    file_size_bytes BIGINT,
    file_mime_type  VARCHAR(100),
    file_hash       VARCHAR(128),
    video_url       VARCHAR(1000),
    video_embed_url VARCHAR(1000),
    video_duration_seconds INTEGER,
    youtube_video_id VARCHAR(50),
    subject_id      UUID REFERENCES subjects(id),
    chapter_id      UUID REFERENCES chapters(id),
    topic_id        UUID REFERENCES topics(id),
    batch_id        UUID REFERENCES batches(id),
    tags            JSONB DEFAULT '[]'::jsonb,
    target_audience VARCHAR(10) DEFAULT 'STUDENT',
    difficulty_level VARCHAR(15),
    is_free         BOOLEAN DEFAULT FALSE,
    is_downloadable BOOLEAN DEFAULT TRUE,
    requires_enrollment BOOLEAN DEFAULT TRUE,
    allowed_batches JSONB DEFAULT '[]'::jsonb,
    uploaded_by_id  UUID,
    uploaded_by_type VARCHAR(10),
    uploaded_by_name VARCHAR(200),
    view_count      INTEGER DEFAULT 0,
    download_count  INTEGER DEFAULT 0,
    rating          NUMERIC(3,2),
    rating_count    INTEGER DEFAULT 0,
    is_published    BOOLEAN DEFAULT FALSE,
    published_at    TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT TRUE,
    is_deleted      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    material_meta   JSONB
);

CREATE INDEX idx_material_type ON study_materials(tenant_id, material_type);
CREATE INDEX idx_material_subject ON study_materials(tenant_id, subject_id);

CREATE TABLE material_accesses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    material_id     UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    user_type       VARCHAR(10),
    action          VARCHAR(10) DEFAULT 'VIEW',
    accessed_at     TIMESTAMPTZ DEFAULT NOW(),
    duration_seconds INTEGER,
    progress_percent NUMERIC(5,2)
);

CREATE TABLE photo_gallery (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category        VARCHAR(255) NOT NULL,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    image_url       VARCHAR(1000) NOT NULL,
    thumbnail_url   VARCHAR(1000),
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    uploaded_by_id  UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scholarships (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    eligibility     TEXT,
    amount          NUMERIC(10,2),
    discount_percent NUMERIC(5,2),
    apply_url       VARCHAR(1000),
    documents_required JSONB DEFAULT '[]'::jsonb,
    valid_from      DATE,
    valid_until     DATE,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE topper_students (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    student_id      UUID REFERENCES students(id),
    student_name    VARCHAR(200) NOT NULL,
    photo_url       VARCHAR(1000),
    exam_name       VARCHAR(200) NOT NULL,
    year            INTEGER NOT NULL,
    rank            INTEGER,
    score           VARCHAR(100),
    testimonial     TEXT,
    is_featured     BOOLEAN DEFAULT FALSE,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- 24. SESSION TRACKING
-- ============================================================================
CREATE TABLE user_devices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    user_type       VARCHAR(10),
    device_fingerprint VARCHAR(500) NOT NULL UNIQUE,
    device_name     VARCHAR(200),
    device_type     VARCHAR(10),
    os_name         VARCHAR(100),
    os_version      VARCHAR(50),
    browser_name    VARCHAR(100),
    browser_version VARCHAR(50),
    screen_resolution VARCHAR(20),
    user_agent      TEXT,
    is_trusted      BOOLEAN DEFAULT FALSE,
    is_blocked      BOOLEAN DEFAULT FALSE,
    blocked_reason  VARCHAR(500),
    first_seen      TIMESTAMPTZ DEFAULT NOW(),
    last_seen       TIMESTAMPTZ DEFAULT NOW(),
    total_sessions  INTEGER DEFAULT 0,
    push_token      TEXT,
    push_platform   VARCHAR(20),
    device_meta     JSONB
);

CREATE INDEX idx_device_user ON user_devices(tenant_id, user_id, user_type);

CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL,
    user_type       VARCHAR(10),
    session_token   VARCHAR(500) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(500),
    device_id       UUID REFERENCES user_devices(id),
    ip_address      INET,
    geo_city        VARCHAR(100),
    geo_state       VARCHAR(100),
    geo_country     VARCHAR(100),
    geo_coordinates VARCHAR(50),
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) DEFAULT 'ACTIVE',
    ended_at        TIMESTAMPTZ,
    end_reason      VARCHAR(500),
    total_active_seconds INTEGER DEFAULT 0,
    concurrent_session_check BOOLEAN DEFAULT TRUE,
    is_primary_session BOOLEAN DEFAULT TRUE,
    session_meta    JSONB
);

CREATE INDEX idx_session_user_status ON user_sessions(tenant_id, user_id, status);
CREATE INDEX idx_session_token ON user_sessions(session_token);
CREATE INDEX idx_session_expiry ON user_sessions(tenant_id, status, expires_at);

CREATE TABLE login_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID,
    user_type       VARCHAR(10),
    username_attempted VARCHAR(200) NOT NULL,
    result          VARCHAR(20) NOT NULL,
    failure_reason  VARCHAR(500),
    ip_address      INET,
    device_id       UUID REFERENCES user_devices(id),
    user_agent      TEXT,
    geo_city        VARCHAR(100),
    geo_country     VARCHAR(100),
    session_id      UUID,
    attempted_at    TIMESTAMPTZ DEFAULT NOW(),
    is_suspicious   BOOLEAN DEFAULT FALSE,
    risk_score      NUMERIC(5,2),
    risk_factors    JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX idx_login_user_time ON login_history(tenant_id, user_id, attempted_at);
CREATE INDEX idx_login_ip ON login_history(tenant_id, ip_address);

CREATE TABLE user_activities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id      UUID REFERENCES user_sessions(id),
    user_id         UUID NOT NULL,
    user_type       VARCHAR(10),
    activity_type   VARCHAR(25) NOT NULL,
    activity_description VARCHAR(500),
    resource_type   VARCHAR(50),
    resource_id     UUID,
    resource_name   VARCHAR(500),
    page_url        VARCHAR(1000),
    referrer_url    VARCHAR(1000),
    ip_address      INET,
    duration_seconds INTEGER,
    activity_data   JSONB,
    occurred_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user_time ON user_activities(tenant_id, user_id, occurred_at);

-- ============================================================================
-- 25. AUDIT
-- ============================================================================
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID,
    user_type       VARCHAR(20),
    username        VARCHAR(200),
    ip_address      INET,
    user_agent      TEXT,
    session_id      UUID,
    action          VARCHAR(20) NOT NULL,
    action_description VARCHAR(1000),
    resource_type   VARCHAR(100),
    resource_id     UUID,
    resource_name   VARCHAR(500),
    http_method     VARCHAR(10),
    request_path    VARCHAR(1000),
    request_body    JSONB,
    response_status INTEGER,
    old_values      JSONB,
    new_values      JSONB,
    changed_fields  JSONB DEFAULT '[]'::jsonb,
    severity        VARCHAR(10) DEFAULT 'INFO',
    is_security_event BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    audit_meta      JSONB
);

CREATE INDEX idx_audit_action_time ON audit_logs(tenant_id, action, created_at);
CREATE INDEX idx_audit_user ON audit_logs(tenant_id, user_id);
CREATE INDEX idx_audit_resource ON audit_logs(tenant_id, resource_type, resource_id);
CREATE INDEX idx_audit_security ON audit_logs(tenant_id, is_security_event, created_at);

-- Partition audit_logs by month for performance
-- (Optional: enable if data volume requires it)
-- CREATE TABLE audit_logs_y2025m01 PARTITION OF audit_logs
--     FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE audit_purge_policies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    resource_type   VARCHAR(100) NOT NULL,
    retention_days  INTEGER DEFAULT 365,
    action_on_expiry VARCHAR(20) DEFAULT 'ARCHIVE',
    archive_location VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    last_purge_at   TIMESTAMPTZ,
    next_purge_at   TIMESTAMPTZ,
    records_purged  BIGINT DEFAULT 0
);

CREATE TABLE backup_policies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_name     VARCHAR(200) NOT NULL UNIQUE,
    backup_type     VARCHAR(15) DEFAULT 'FULL',
    schedule_cron   VARCHAR(100) DEFAULT '0 2 * * *',
    retention_days  INTEGER DEFAULT 30,
    hot_backup_path VARCHAR(500) DEFAULT '/backup/hot',
    cold_backup_path VARCHAR(500) DEFAULT '/backup/cold',
    compression_enabled BOOLEAN DEFAULT TRUE,
    encryption_enabled BOOLEAN DEFAULT FALSE,
    encryption_key_id VARCHAR(200),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE backup_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id       UUID NOT NULL REFERENCES backup_policies(id) ON DELETE CASCADE,
    status          VARCHAR(10) DEFAULT 'RUNNING',
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    duration_seconds INTEGER,
    backup_size_bytes BIGINT,
    backup_path     VARCHAR(1000),
    checksum        VARCHAR(128),
    error_message   TEXT,
    tables_backed_up INTEGER,
    rows_backed_up  BIGINT,
    verified        BOOLEAN DEFAULT FALSE,
    verified_at     TIMESTAMPTZ
);

-- ============================================================================
-- 26. SYSTEM CONFIGURATION
-- ============================================================================
CREATE TABLE system_settings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    setting_key     VARCHAR(200) NOT NULL,
    setting_value   TEXT,
    setting_json    JSONB,
    value_type      VARCHAR(10) DEFAULT 'STRING',
    category        VARCHAR(100),
    description     TEXT,
    is_secret       BOOLEAN DEFAULT FALSE,
    is_editable     BOOLEAN DEFAULT TRUE,
    updated_by_id   UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_system_setting_key UNIQUE (tenant_id, setting_key)
);

CREATE TABLE feature_flags (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    flag_key        VARCHAR(200) NOT NULL,
    flag_name       VARCHAR(500),
    description     TEXT,
    is_enabled      BOOLEAN DEFAULT FALSE,
    rollout_percentage INTEGER DEFAULT 0,
    allowed_user_types JSONB DEFAULT '[]'::jsonb,
    allowed_user_ids JSONB DEFAULT '[]'::jsonb,
    start_date      TIMESTAMPTZ,
    end_date        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_feature_flag_key UNIQUE (tenant_id, flag_key)
);

CREATE TABLE mfa_policies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    mfa_type        VARCHAR(10) DEFAULT 'EMAIL',
    is_mandatory    BOOLEAN DEFAULT FALSE,
    applies_to_user_types JSONB DEFAULT '[]'::jsonb,
    otp_length      INTEGER DEFAULT 6,
    otp_expiry_seconds INTEGER DEFAULT 300,
    max_attempts    INTEGER DEFAULT 5,
    lockout_duration_minutes INTEGER DEFAULT 30,
    resend_cooldown_seconds INTEGER DEFAULT 60,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE maintenance_windows (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    is_active       BOOLEAN DEFAULT FALSE,
    scope           VARCHAR(10) DEFAULT 'FULL',
    affected_features JSONB DEFAULT '[]'::jsonb,
    notification_sent BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE founder_info (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    member_type     VARCHAR(15) DEFAULT 'FOUNDER',
    name            VARCHAR(200) NOT NULL,
    designation     VARCHAR(200),
    photo_url       VARCHAR(1000),
    bio             TEXT,
    qualifications  VARCHAR(500),
    contact_email   VARCHAR(254),
    social_links    JSONB DEFAULT '{}'::jsonb,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE
);

CREATE TABLE enquiry_forms (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    email           VARCHAR(254),
    phone           VARCHAR(20),
    subject         VARCHAR(500),
    message         TEXT NOT NULL,
    source          VARCHAR(10) DEFAULT 'WEBSITE',
    status          VARCHAR(10) DEFAULT 'NEW',
    assigned_to     UUID,
    follow_up_date  DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 27. REALTIME EVENTS
-- ============================================================================
CREATE TABLE realtime_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
    event_type      VARCHAR(25) NOT NULL,
    event_key       VARCHAR(200),
    target_type     VARCHAR(20),
    target_id       UUID,
    target_channel  VARCHAR(500),
    payload         JSONB DEFAULT '{}'::jsonb,
    priority        INTEGER DEFAULT 5,
    is_delivered    BOOLEAN DEFAULT FALSE,
    delivered_at    TIMESTAMPTZ,
    delivery_attempts INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ
);

CREATE INDEX idx_rt_event_delivery ON realtime_events(tenant_id, event_type, is_delivered);

-- ============================================================================
-- 28. ROW-LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Application user can only see data for their tenant
CREATE POLICY tenant_isolation_students ON students
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY tenant_isolation_teachers ON teachers
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY tenant_isolation_admins ON admins
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY tenant_isolation_classes ON scheduled_classes
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY tenant_isolation_tests ON tests
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY tenant_isolation_questions ON questions
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY tenant_isolation_attempts ON test_attempts
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY tenant_isolation_attendance ON attendance
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY tenant_isolation_tickets ON support_tickets
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY tenant_isolation_announcements ON announcements
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY tenant_isolation_materials ON study_materials
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY tenant_isolation_sessions ON user_sessions
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
CREATE POLICY tenant_isolation_audit ON audit_logs
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- ============================================================================
-- 29. UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
            tbl, tbl
        );
    END LOOP;
END
$$;

-- ============================================================================
-- 30. GRANT PERMISSIONS TO APPLICATION USER
-- ============================================================================
GRANT USAGE ON SCHEMA public TO lmsapp;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lmsapp;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lmsapp;

-- Done
SELECT 'LMS_PROD_DB schema created successfully' AS status;
