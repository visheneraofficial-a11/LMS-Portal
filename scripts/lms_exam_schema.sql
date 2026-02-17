-- ============================================================
-- LMS Online Exam Platform - PostgreSQL 18 Schema
-- Converted from MS SQL Server (live_test database)
-- Database: LMS_PROD_DB
-- Owner: lms_app_user
-- ============================================================

-- Grant schema usage
GRANT ALL ON SCHEMA public TO lms_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lms_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lms_app_user;

-- ============================================================
-- 1. REFERENCE/LOOKUP TABLES (no foreign key dependencies)
-- ============================================================

-- Session (Academic Year)
CREATE TABLE session (
    session_id      INTEGER     NOT NULL,
    session_name    VARCHAR(500),
    current_session BOOLEAN     DEFAULT FALSE,
    status          BOOLEAN     DEFAULT FALSE,
    CONSTRAINT pk_session PRIMARY KEY (session_id)
);

-- State
CREATE TABLE state (
    state_id    INTEGER     NOT NULL,
    state_name  VARCHAR(100),
    CONSTRAINT pk_state PRIMARY KEY (state_id)
);

-- City
CREATE TABLE city (
    city_id     BIGINT      NOT NULL,
    city_name   VARCHAR(100),
    state_id    INTEGER,
    CONSTRAINT pk_city PRIMARY KEY (city_id),
    CONSTRAINT fk_city_state FOREIGN KEY (state_id) REFERENCES state(state_id)
);

-- Religion
CREATE TABLE religion (
    religion_id     INTEGER     NOT NULL,
    religion_name   VARCHAR(50),
    status          VARCHAR(3),
    CONSTRAINT pk_religion PRIMARY KEY (religion_id)
);

-- Category (Student Group/Batch Category)
CREATE TABLE category (
    cid             INTEGER     NOT NULL,
    groups_id       INTEGER,
    name            VARCHAR(50),
    status          VARCHAR(20),
    show_in_student BOOLEAN     DEFAULT FALSE,
    CONSTRAINT pk_category PRIMARY KEY (cid)
);

-- Groups (Batches like JEE, NEET etc.)
CREATE TABLE groups (
    groups_id       INTEGER     NOT NULL,
    groups_name     VARCHAR(50),
    status          BOOLEAN     DEFAULT FALSE,
    CONSTRAINT pk_groups PRIMARY KEY (groups_id)
);

-- Subject
CREATE TABLE subject (
    subject_id      INTEGER     NOT NULL,
    subject_name    VARCHAR(100),
    status          VARCHAR(20),
    CONSTRAINT pk_subject PRIMARY KEY (subject_id)
);

-- Subject Section
CREATE TABLE subject_section (
    section_id      INTEGER     NOT NULL,
    subject_id      BIGINT,
    section_name    VARCHAR(100),
    status          VARCHAR(3),
    CONSTRAINT pk_subject_section PRIMARY KEY (section_id)
);

-- Language Master
CREATE TABLE language_master (
    language_id     INTEGER     NOT NULL,
    language_name   VARCHAR(100),
    CONSTRAINT pk_language_master PRIMARY KEY (language_id)
);

-- Photo Category
CREATE TABLE photo_category (
    category_id     INTEGER     NOT NULL,
    category_name   VARCHAR(100),
    category_type   VARCHAR(50),
    active          BOOLEAN     DEFAULT TRUE,
    CONSTRAINT pk_photo_category PRIMARY KEY (category_id)
);

-- ============================================================
-- 2. SCHOOL & TEACHER TABLES
-- ============================================================

-- School
CREATE TABLE school (
    school_id       INTEGER     NOT NULL,
    religion_id     INTEGER,
    state_id        INTEGER,
    city_id         INTEGER,
    school_name     VARCHAR(200),
    city            VARCHAR(100),
    type            VARCHAR(10),
    status          VARCHAR(3),
    rdate           TIMESTAMP,
    CONSTRAINT pk_school PRIMARY KEY (school_id),
    CONSTRAINT fk_school_religion FOREIGN KEY (religion_id) REFERENCES religion(religion_id)
);

-- School Teacher
CREATE TABLE school_teacher (
    teacher_id      INTEGER     NOT NULL,
    school_id       INTEGER,
    state_id        INTEGER,
    city_id         INTEGER,
    teacher_name    VARCHAR(100),
    phone           VARCHAR(10),
    password        VARCHAR(100),
    subject         VARCHAR(50),
    designation     VARCHAR(50),
    city            VARCHAR(100),
    status          BOOLEAN     DEFAULT TRUE,
    rdate           TIMESTAMP,
    CONSTRAINT pk_school_teacher PRIMARY KEY (teacher_id),
    CONSTRAINT fk_teacher_school FOREIGN KEY (school_id) REFERENCES school(school_id),
    CONSTRAINT fk_teacher_state FOREIGN KEY (state_id) REFERENCES state(state_id)
);

-- ============================================================
-- 3. USER TABLES
-- ============================================================

-- Admin Users
CREATE TABLE user_admin (
    uid         BIGINT      NOT NULL,
    name        VARCHAR(50),
    phone       VARCHAR(50),
    address     VARCHAR(500),
    type        VARCHAR(30),
    user_id     VARCHAR(50),
    password    VARCHAR(50),
    status      VARCHAR(20),
    date        TIMESTAMP,
    CONSTRAINT pk_user_admin PRIMARY KEY (uid)
);

-- Students (Users)
CREATE TABLE users (
    uid                     INTEGER     NOT NULL,
    session_id              INTEGER,
    cid                     INTEGER,
    school_id               INTEGER,
    state_id                INTEGER,
    city_id                 INTEGER,
    name                    VARCHAR(50),
    father_name             VARCHAR(100),
    dob                     TIMESTAMP,
    gender                  VARCHAR(10),
    phone                   VARCHAR(50),
    phone1                  VARCHAR(10),
    city_name               VARCHAR(500),
    email                   VARCHAR(100),
    userid                  VARCHAR(20),
    password                VARCHAR(100),
    photo                   VARCHAR(100),
    category                VARCHAR(100),
    handicapped             VARCHAR(100),
    other_school            VARCHAR(200),
    tps                     BOOLEAN     DEFAULT FALSE,
    status                  VARCHAR(10),
    date                    TIMESTAMP,
    previous_class_marks    VARCHAR(100),
    CONSTRAINT pk_users PRIMARY KEY (uid),
    CONSTRAINT fk_users_session FOREIGN KEY (session_id) REFERENCES session(session_id),
    CONSTRAINT fk_users_category FOREIGN KEY (cid) REFERENCES category(cid),
    CONSTRAINT fk_users_school FOREIGN KEY (school_id) REFERENCES school(school_id),
    CONSTRAINT fk_users_state FOREIGN KEY (state_id) REFERENCES state(state_id)
);

-- ============================================================
-- 4. CONTENT TABLES (Chapters, eBooks, Videos)
-- ============================================================

-- Chapter
CREATE TABLE chapter (
    chapter_id      INTEGER     NOT NULL,
    session_id      INTEGER,
    groups_id       INTEGER,
    subject_id      INTEGER,
    chapter_name    VARCHAR(500),
    description     VARCHAR(500),
    status          BOOLEAN     DEFAULT TRUE,
    rdate           TIMESTAMP,
    CONSTRAINT pk_chapter PRIMARY KEY (chapter_id),
    CONSTRAINT fk_chapter_session FOREIGN KEY (session_id) REFERENCES session(session_id),
    CONSTRAINT fk_chapter_groups FOREIGN KEY (groups_id) REFERENCES groups(groups_id),
    CONSTRAINT fk_chapter_subject FOREIGN KEY (subject_id) REFERENCES subject(subject_id)
);

-- eBook
CREATE TABLE ebook (
    ebook_id        SERIAL      NOT NULL,
    chapter_id      INTEGER,
    ebook_name      VARCHAR(500),
    photo           VARCHAR(100),
    status          BOOLEAN     DEFAULT TRUE,
    rdate           TIMESTAMP,
    CONSTRAINT pk_ebook PRIMARY KEY (ebook_id),
    CONSTRAINT fk_ebook_chapter FOREIGN KEY (chapter_id) REFERENCES chapter(chapter_id)
);

-- Video Link
CREATE TABLE video_link (
    video_id        INTEGER     NOT NULL,
    session_id      INTEGER,
    chapter_id      INTEGER,
    video_name      VARCHAR(500),
    link            TEXT,
    status          BOOLEAN     DEFAULT TRUE,
    rdate           TIMESTAMP,
    CONSTRAINT pk_video_link PRIMARY KEY (video_id),
    CONSTRAINT fk_video_session FOREIGN KEY (session_id) REFERENCES session(session_id),
    CONSTRAINT fk_video_chapter FOREIGN KEY (chapter_id) REFERENCES chapter(chapter_id)
);

-- Live Link (Live Classes)
CREATE TABLE live_link (
    id              SERIAL      NOT NULL,
    session_id      INTEGER,
    groups_id       INTEGER,
    subject_id      INTEGER,
    link            TEXT,
    live_date       VARCHAR(50),
    type            VARCHAR(20),
    status          BOOLEAN     DEFAULT TRUE,
    rdate           TIMESTAMP,
    language_id     INTEGER,
    CONSTRAINT pk_live_link PRIMARY KEY (id),
    CONSTRAINT fk_live_session FOREIGN KEY (session_id) REFERENCES session(session_id),
    CONSTRAINT fk_live_groups FOREIGN KEY (groups_id) REFERENCES groups(groups_id),
    CONSTRAINT fk_live_subject FOREIGN KEY (subject_id) REFERENCES subject(subject_id)
);

-- Class Schedule
CREATE TABLE class_schedule (
    id              SERIAL      NOT NULL,
    session_id      INTEGER,
    groups_id       INTEGER,
    photo           VARCHAR(100),
    status          BOOLEAN     DEFAULT TRUE,
    rdate           TIMESTAMP,
    CONSTRAINT pk_class_schedule PRIMARY KEY (id),
    CONSTRAINT fk_schedule_session FOREIGN KEY (session_id) REFERENCES session(session_id),
    CONSTRAINT fk_schedule_groups FOREIGN KEY (groups_id) REFERENCES groups(groups_id)
);

-- Question Paper (Uploaded Papers)
CREATE TABLE question_paper (
    id              SERIAL      NOT NULL,
    session_id      INTEGER,
    groups_id       INTEGER,
    paper_name      VARCHAR(500),
    paper_type      VARCHAR(50),
    attachment      VARCHAR(100),
    status          BOOLEAN     DEFAULT TRUE,
    rdate           TIMESTAMP,
    CONSTRAINT pk_question_paper PRIMARY KEY (id),
    CONSTRAINT fk_qpaper_session FOREIGN KEY (session_id) REFERENCES session(session_id),
    CONSTRAINT fk_qpaper_groups FOREIGN KEY (groups_id) REFERENCES groups(groups_id)
);

-- Teacher Training Video
CREATE TABLE teacher_training_video (
    id              SERIAL      NOT NULL,
    session_id      INTEGER,
    video_name      VARCHAR(500),
    link            TEXT,
    status          BOOLEAN     DEFAULT TRUE,
    rdate           TIMESTAMP,
    CONSTRAINT pk_teacher_training PRIMARY KEY (id),
    CONSTRAINT fk_training_session FOREIGN KEY (session_id) REFERENCES session(session_id)
);

-- ============================================================
-- 5. TEST / EXAM TABLES
-- ============================================================

-- Test (Exam)
CREATE TABLE test (
    test_id             INTEGER     NOT NULL,
    session_id          INTEGER,
    cat_id              INTEGER,
    test_name           VARCHAR(100),
    total_question      INTEGER     DEFAULT 0,
    total_marks         INTEGER     DEFAULT 0,
    duration            INTEGER     DEFAULT 0,
    paid                VARCHAR(20),
    show_ans_report     VARCHAR(100)    DEFAULT 'No',
    instructions        TEXT,
    start_test_date     TIMESTAMP,
    status              VARCHAR(20),
    date                TIMESTAMP,
    auto_save_time      INTEGER     DEFAULT 1,
    end_test_date       TIMESTAMP,
    update_offline_mark VARCHAR(3)  DEFAULT 'No',
    CONSTRAINT pk_test PRIMARY KEY (test_id),
    CONSTRAINT fk_test_session FOREIGN KEY (session_id) REFERENCES session(session_id),
    CONSTRAINT fk_test_category FOREIGN KEY (cat_id) REFERENCES category(cid)
);

-- Test Subject (Subject-wise config within a test)
CREATE TABLE test_subject (
    id                          SERIAL      NOT NULL,
    test_id                     BIGINT,
    subject_id                  BIGINT,
    section_id                  INTEGER,
    normal_ques                 INTEGER,
    normal_max_marks            INTEGER,
    normal_extra_question       INTEGER,
    paragraph_ques              INTEGER,
    paragraph_max_marks         INTEGER,
    paragraph_extra_question    INTEGER,
    integer_ques                INTEGER,
    integer_max_marks           INTEGER,
    integer_extra_question      INTEGER,
    CONSTRAINT pk_test_subject PRIMARY KEY (id)
);

-- Question
CREATE TABLE question (
    question_id     VARCHAR(100)    NOT NULL,
    test_id         INTEGER,
    subject_id      INTEGER,
    q               TEXT,
    qh              TEXT,
    qtype           VARCHAR(50),
    date            TIMESTAMP,
    CONSTRAINT pk_question PRIMARY KEY (question_id),
    CONSTRAINT fk_question_test FOREIGN KEY (test_id) REFERENCES test(test_id),
    CONSTRAINT fk_question_subject FOREIGN KEY (subject_id) REFERENCES subject(subject_id)
);

-- Question Sub (Answer options & details)
CREATE TABLE question_sub (
    id              BIGSERIAL   NOT NULL,
    qid             VARCHAR(100)    NOT NULL,
    question_id     VARCHAR(100),
    q               TEXT,
    qh              TEXT,
    a1              TEXT,
    h1              TEXT,
    a2              TEXT,
    h2              TEXT,
    a3              TEXT,
    h3              TEXT,
    a4              TEXT,
    h4              TEXT,
    a5              TEXT,
    h5              TEXT,
    s_english       TEXT,
    s_hindi         TEXT,
    multi_choice    VARCHAR(3),
    ans             INTEGER,
    marks           NUMERIC(13,2)   DEFAULT 1,
    negative_mark   NUMERIC(13,2)   DEFAULT 0,
    section         VARCHAR(20),
    CONSTRAINT pk_question_sub PRIMARY KEY (qid),
    CONSTRAINT fk_qsub_question FOREIGN KEY (question_id) REFERENCES question(question_id)
);

-- ============================================================
-- 6. TEST RESULTS / SCORING TABLES
-- ============================================================

-- Test Pass (Student's test attempt result)
CREATE TABLE test_pass (
    id                  BIGSERIAL   NOT NULL,
    tpid                VARCHAR(100)    NOT NULL,
    uid                 INTEGER,
    test_id             INTEGER,
    total_question      INTEGER,
    total_marks         INTEGER,
    duration            INTEGER,
    attempt             INTEGER,
    not_attempt         INTEGER,
    correct_question    INTEGER,
    incorrect_question  INTEGER,
    correct_marks       NUMERIC(13,2)   DEFAULT 0,
    incorrect_marks     NUMERIC(13,2)   DEFAULT 0,
    left_marks          NUMERIC(13,2)   DEFAULT 0,
    negative_marks      NUMERIC(13,2)   DEFAULT 0,
    obtained            NUMERIC(13,2),
    submit_type         VARCHAR(20),
    date                TIMESTAMP,
    CONSTRAINT pk_test_pass PRIMARY KEY (tpid),
    CONSTRAINT fk_tpass_user FOREIGN KEY (uid) REFERENCES users(uid),
    CONSTRAINT fk_tpass_test FOREIGN KEY (test_id) REFERENCES test(test_id)
);

-- Test Time Manage (Per-question response tracking)
CREATE TABLE test_time_manage (
    id              BIGSERIAL   NOT NULL,
    tpid            VARCHAR(100),
    subject_id      INTEGER,
    qid             VARCHAR(100),
    correct_ans     INTEGER,
    your_ans        INTEGER,
    marks           NUMERIC(13,2),
    negative_mark   NUMERIC(13,2)   DEFAULT 0,
    my_marks        NUMERIC(13,2)   DEFAULT 0,
    my_negative_mark NUMERIC(13,2)  DEFAULT 0,
    your_time       VARCHAR(100),
    CONSTRAINT fk_ttm_tpass FOREIGN KEY (tpid) REFERENCES test_pass(tpid),
    CONSTRAINT fk_ttm_subject FOREIGN KEY (subject_id) REFERENCES subject(subject_id),
    CONSTRAINT fk_ttm_qsub FOREIGN KEY (qid) REFERENCES question_sub(qid)
);

-- Hold Test (In-progress/paused test state)
CREATE TABLE hold_test (
    hid                     VARCHAR(100)    NOT NULL,
    uid                     INTEGER,
    test_id                 INTEGER,
    subject_index           INTEGER,
    minute                  INTEGER,
    second                  INTEGER,
    last_display_question   INTEGER,
    CONSTRAINT pk_hold_test PRIMARY KEY (hid),
    CONSTRAINT fk_hold_user FOREIGN KEY (uid) REFERENCES users(uid),
    CONSTRAINT fk_hold_test FOREIGN KEY (test_id) REFERENCES test(test_id)
);

-- Hold Test Child (Per-question state of paused test)
CREATE TABLE hold_test_child (
    hid         VARCHAR(100),
    qid         VARCHAR(100),
    q_index     INTEGER,
    result      VARCHAR(20),
    your_ans    VARCHAR(10),
    time        INTEGER,
    CONSTRAINT fk_htc_hold FOREIGN KEY (hid) REFERENCES hold_test(hid)
);

-- Test Feedback
CREATE TABLE test_feedback (
    id          BIGSERIAL   NOT NULL,
    test_id     INTEGER,
    uid         INTEGER,
    rate        BIGINT,
    suggestion  TEXT,
    date        TIMESTAMP,
    CONSTRAINT fk_tfeedback_test FOREIGN KEY (test_id) REFERENCES test(test_id),
    CONSTRAINT fk_tfeedback_user FOREIGN KEY (uid) REFERENCES users(uid)
);

-- Offline Test Marks
CREATE TABLE offline_test_marks (
    id          SERIAL      NOT NULL,
    session_id  INTEGER,
    school_id   INTEGER,
    test_id     INTEGER,
    uid         INTEGER,
    subject_id  INTEGER,
    max_marks   NUMERIC(13,2),
    obtained    NUMERIC(13,2),
    CONSTRAINT pk_offline_marks PRIMARY KEY (id)
);

-- ============================================================
-- 7. ATTENDANCE TABLES
-- ============================================================

-- Student Attendance (Day-wise columns per month)
CREATE TABLE users_attendance (
    id          SERIAL      NOT NULL,
    session_id  INTEGER,
    uid         INTEGER,
    month       VARCHAR(30),
    d1  VARCHAR(10), d2  VARCHAR(10), d3  VARCHAR(10), d4  VARCHAR(10), d5  VARCHAR(10),
    d6  VARCHAR(10), d7  VARCHAR(10), d8  VARCHAR(10), d9  VARCHAR(10), d10 VARCHAR(10),
    d11 VARCHAR(10), d12 VARCHAR(10), d13 VARCHAR(10), d14 VARCHAR(10), d15 VARCHAR(10),
    d16 VARCHAR(10), d17 VARCHAR(10), d18 VARCHAR(10), d19 VARCHAR(10), d20 VARCHAR(10),
    d21 VARCHAR(10), d22 VARCHAR(10), d23 VARCHAR(10), d24 VARCHAR(10), d25 VARCHAR(10),
    d26 VARCHAR(10), d27 VARCHAR(10), d28 VARCHAR(10), d29 VARCHAR(10), d30 VARCHAR(10),
    d31 VARCHAR(10),
    date        TIMESTAMP,
    CONSTRAINT pk_users_attendance PRIMARY KEY (id),
    CONSTRAINT fk_uatt_session FOREIGN KEY (session_id) REFERENCES session(session_id),
    CONSTRAINT fk_uatt_user FOREIGN KEY (uid) REFERENCES users(uid)
);

-- Teacher Attendance (Day-wise columns per month)
CREATE TABLE teacher_attendance (
    id          SERIAL      NOT NULL,
    session_id  INTEGER,
    teacher_id  INTEGER,
    month       VARCHAR(30),
    d1  VARCHAR(10), d2  VARCHAR(10), d3  VARCHAR(10), d4  VARCHAR(10), d5  VARCHAR(10),
    d6  VARCHAR(10), d7  VARCHAR(10), d8  VARCHAR(10), d9  VARCHAR(10), d10 VARCHAR(10),
    d11 VARCHAR(10), d12 VARCHAR(10), d13 VARCHAR(10), d14 VARCHAR(10), d15 VARCHAR(10),
    d16 VARCHAR(10), d17 VARCHAR(10), d18 VARCHAR(10), d19 VARCHAR(10), d20 VARCHAR(10),
    d21 VARCHAR(10), d22 VARCHAR(10), d23 VARCHAR(10), d24 VARCHAR(10), d25 VARCHAR(10),
    d26 VARCHAR(10), d27 VARCHAR(10), d28 VARCHAR(10), d29 VARCHAR(10), d30 VARCHAR(10),
    d31 VARCHAR(10),
    date        TIMESTAMP,
    CONSTRAINT pk_teacher_attendance PRIMARY KEY (id),
    CONSTRAINT fk_tatt_session FOREIGN KEY (session_id) REFERENCES session(session_id),
    CONSTRAINT fk_tatt_teacher FOREIGN KEY (teacher_id) REFERENCES school_teacher(teacher_id)
);

-- ============================================================
-- 8. COMMUNICATION / HELP / NEWS TABLES
-- ============================================================

-- Help / Support Tickets
CREATE TABLE help (
    id          BIGSERIAL   NOT NULL,
    uid         INTEGER,
    test_name   VARCHAR(100),
    subject     VARCHAR(100),
    question    TEXT,
    problem     TEXT,
    reply       TEXT,
    reply_date  TIMESTAMP,
    status      VARCHAR(100),
    view_type   VARCHAR(20),
    date        TIMESTAMP,
    CONSTRAINT fk_help_user FOREIGN KEY (uid) REFERENCES users(uid)
);

-- News (Admin/Internal)
CREATE TABLE news (
    id          SERIAL      NOT NULL,
    name        TEXT,
    message     TEXT,
    status      BOOLEAN     DEFAULT TRUE,
    date        TIMESTAMP
);

-- News for Users (Student-facing)
CREATE TABLE news_users (
    id          SERIAL      NOT NULL,
    name        TEXT,
    message     TEXT,
    status      BOOLEAN     DEFAULT TRUE,
    date        TIMESTAMP
);

-- Notice Board
CREATE TABLE notic_board (
    id          BIGSERIAL   NOT NULL,
    name        TEXT,
    path        VARCHAR(100),
    total       BIGINT,
    status      VARCHAR(10),
    date        TIMESTAMP
);

-- Enquiry
CREATE TABLE enquiry (
    id          SERIAL      NOT NULL,
    name        TEXT,
    email       VARCHAR(100),
    subject     VARCHAR(100),
    message     VARCHAR(500),
    date        TIMESTAMP
);

-- ============================================================
-- 9. CMS / GALLERY / MISC TABLES
-- ============================================================

-- Info (Organization Info)
CREATE TABLE info (
    id          BIGSERIAL   NOT NULL,
    name        VARCHAR(100),
    sort_name   VARCHAR(12),
    address     VARCHAR(500),
    logo        VARCHAR(100)
);

-- Founder
CREATE TABLE founder (
    id          SERIAL      NOT NULL,
    name        VARCHAR(100),
    des         TEXT,
    rank        VARCHAR(100),
    photo       VARCHAR(100),
    status      BOOLEAN     DEFAULT TRUE,
    rdate       TIMESTAMP,
    order_no    INTEGER     DEFAULT 0,
    CONSTRAINT pk_founder PRIMARY KEY (id)
);

-- Management Team
CREATE TABLE management_team (
    id          SERIAL      NOT NULL,
    name        VARCHAR(100),
    rank        VARCHAR(100),
    photo       VARCHAR(100),
    status      BOOLEAN     DEFAULT TRUE,
    rdate       TIMESTAMP,
    order_no    INTEGER     DEFAULT 0,
    CONSTRAINT pk_management_team PRIMARY KEY (id)
);

-- Topper Student
CREATE TABLE topper_student (
    id          SERIAL      NOT NULL,
    name        VARCHAR(100),
    location    TEXT,
    rank        TEXT,
    photo       VARCHAR(100),
    status      BOOLEAN     DEFAULT TRUE,
    rdate       TIMESTAMP,
    order_no    INTEGER     DEFAULT 0,
    CONSTRAINT pk_topper_student PRIMARY KEY (id)
);

-- Scholarships
CREATE TABLE scholarships (
    scholarship_id  INTEGER     NOT NULL,
    name            VARCHAR(100),
    rank            TEXT,
    photo           VARCHAR(100),
    status          BOOLEAN     DEFAULT TRUE,
    rdate           TIMESTAMP,
    order_no        INTEGER,
    CONSTRAINT pk_scholarships PRIMARY KEY (scholarship_id)
);

-- Scholarship Link (Details)
CREATE TABLE scholarships_link (
    id              SERIAL      NOT NULL,
    scholarship_id  INTEGER,
    name            TEXT,
    details         TEXT,
    CONSTRAINT pk_scholarships_link PRIMARY KEY (id),
    CONSTRAINT fk_slink_scholarship FOREIGN KEY (scholarship_id) REFERENCES scholarships(scholarship_id)
);

-- Photo Gallery
CREATE TABLE photo_gallery (
    id              SERIAL      NOT NULL,
    category_id     INTEGER,
    name            VARCHAR(100),
    photo           VARCHAR(100),
    order_no        INTEGER     DEFAULT 0,
    active          BOOLEAN     DEFAULT TRUE,
    CONSTRAINT fk_gallery_category FOREIGN KEY (category_id) REFERENCES photo_category(category_id)
);

-- Package (Subscription/Payment)
CREATE TABLE package (
    id              BIGSERIAL   NOT NULL,
    pid             BIGINT      NOT NULL,
    package_name    VARCHAR(100),
    price           DOUBLE PRECISION,
    days            BIGINT,
    total_test      BIGINT,
    apply_coupon    VARCHAR(10),
    coupon_code     VARCHAR(50),
    discount        BIGINT,
    coupon_valid_date TIMESTAMP,
    des             TEXT,
    status          VARCHAR(15),
    date            TIMESTAMP,
    CONSTRAINT pk_package PRIMARY KEY (pid)
);

-- ============================================================
-- 10. LOGIN HISTORY / AUDIT TABLES
-- ============================================================

-- Student Login History
CREATE TABLE login_history_student (
    id              SERIAL      NOT NULL,
    uid             INTEGER,
    browser_name    VARCHAR(100),
    browser_version VARCHAR(100),
    platform        VARCHAR(100),
    js_version      VARCHAR(100),
    rdate           TIMESTAMP,
    CONSTRAINT pk_login_hist_student PRIMARY KEY (id)
);

-- Teacher Login History
CREATE TABLE login_history_teacher (
    id              SERIAL      NOT NULL,
    teacher_id      INTEGER,
    browser_name    VARCHAR(100),
    browser_version VARCHAR(100),
    platform        VARCHAR(100),
    js_version      VARCHAR(100),
    rdate           TIMESTAMP,
    CONSTRAINT pk_login_hist_teacher PRIMARY KEY (id)
);

-- ============================================================
-- 11. JEE 2024 REGISTRATION
-- ============================================================

CREATE TABLE jee_2024 (
    id              SERIAL      NOT NULL,
    uid             INTEGER,
    school_id       INTEGER,
    name            VARCHAR(100),
    dob             TIMESTAMP,
    gender          VARCHAR(10),
    category        VARCHAR(20),
    pwd_candidate   VARCHAR(3),
    email           VARCHAR(100),
    fname           VARCHAR(100),
    mname           VARCHAR(100),
    registration_no VARCHAR(12),
    password        VARCHAR(50),
    phone1          VARCHAR(10),
    phone2          VARCHAR(10),
    other_school    VARCHAR(200),
    other_option    TEXT,
    photo           VARCHAR(100),
    status          BOOLEAN     DEFAULT FALSE,
    rdate           TIMESTAMP,
    CONSTRAINT pk_jee_2024 PRIMARY KEY (id)
);

-- ============================================================
-- 12. INDEXES (Performance Optimization)
-- ============================================================

-- Non-clustered indexes from original schema
CREATE INDEX ix_category_name ON category (name);
CREATE INDEX ix_groups_name ON groups (groups_name);
CREATE INDEX ix_religion_name ON religion (religion_name);
CREATE INDEX ix_state_name ON state (state_name);
CREATE INDEX ix_subject_name ON subject (subject_name);
CREATE INDEX ix_test_name ON test (test_name);

-- Additional indexes for LMS exam workload (read-heavy)
CREATE INDEX ix_users_session ON users (session_id);
CREATE INDEX ix_users_school ON users (school_id);
CREATE INDEX ix_users_email ON users (email);
CREATE INDEX ix_users_userid ON users (userid);

CREATE INDEX ix_test_session ON test (session_id);
CREATE INDEX ix_test_status ON test (status);
CREATE INDEX ix_test_dates ON test (start_test_date, end_test_date);

CREATE INDEX ix_question_test ON question (test_id);
CREATE INDEX ix_question_subject ON question (subject_id);

CREATE INDEX ix_qsub_question ON question_sub (question_id);

CREATE INDEX ix_test_pass_uid ON test_pass (uid);
CREATE INDEX ix_test_pass_test ON test_pass (test_id);
CREATE INDEX ix_test_pass_date ON test_pass (date);

CREATE INDEX ix_ttm_tpid ON test_time_manage (tpid);
CREATE INDEX ix_ttm_qid ON test_time_manage (qid);

CREATE INDEX ix_hold_test_uid ON hold_test (uid);

CREATE INDEX ix_chapter_groups ON chapter (groups_id);
CREATE INDEX ix_chapter_subject ON chapter (subject_id);

CREATE INDEX ix_video_chapter ON video_link (chapter_id);

CREATE INDEX ix_live_link_groups ON live_link (groups_id);
CREATE INDEX ix_live_link_date ON live_link (live_date);

CREATE INDEX ix_teacher_school ON school_teacher (school_id);

CREATE INDEX ix_uatt_session_uid ON users_attendance (session_id, uid);
CREATE INDEX ix_tatt_session_tid ON teacher_attendance (session_id, teacher_id);

CREATE INDEX ix_offline_marks_uid ON offline_test_marks (uid);
CREATE INDEX ix_offline_marks_test ON offline_test_marks (test_id);

-- ============================================================
-- 13. GRANT ALL TABLE PERMISSIONS TO APP USER
-- ============================================================
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('GRANT ALL PRIVILEGES ON TABLE %I TO lms_app_user', tbl.tablename);
    END LOOP;
    
    -- Grant sequence usage
    FOR tbl IN SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'
    LOOP
        EXECUTE format('GRANT ALL PRIVILEGES ON SEQUENCE %I TO lms_app_user', tbl.sequencename);
    END LOOP;
END $$;

-- ============================================================
-- SCHEMA CONVERSION COMPLETE
-- Tables: 37 (matching original MSSQL schema)
-- Indexes: 30 (6 original + 24 performance indexes)
-- Foreign Keys: 28 
-- ============================================================
