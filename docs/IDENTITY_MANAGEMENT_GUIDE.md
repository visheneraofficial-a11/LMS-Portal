# Identity Management Guide
## ENABLE PROGRAM — Admin Console

This guide explains the Identity Management features in simple terms with real-world examples and step-by-step instructions.

---

## Table of Contents
1. [Overview: What is Identity Management?](#overview)
2. [Permissions](#permissions)
3. [Roles](#roles)
4. [Staff Roles](#staff-roles)
5. [User Role Assignments](#user-role-assignments)
6. [User Groups](#user-groups)
7. [Group Memberships](#group-memberships)
8. [Group Role Assignments](#group-role-assignments)
9. [Real-World Scenarios](#real-world-scenarios)

---

## Overview: What is Identity Management? <a name="overview"></a>

Think of Identity Management like a security system in a large office building:

- **Permissions** = Individual keys that open specific doors
- **Roles** = Key cards that combine multiple permissions
- **Staff Roles** = Special admin key cards with elevated access
- **User Groups** = Teams of people working together
- **Group Memberships** = Adding people to teams
- **Group Role Assignments** = Giving the entire team access rights

### Why Do We Need This?

In a coaching institute with hundreds of teachers and thousands of students:
- Not everyone should see everything
- Some teachers should only see their own batches
- Admins need different levels of access
- Groups help manage permissions at scale

---

## 1. Permissions <a name="permissions"></a>

### What Are Permissions?

**Simple Explanation:** A permission is like a single key that opens one specific door.

For example:
- `view_student` = Permission to see student list
- `edit_student` = Permission to modify student details
- `delete_student` = Permission to remove students
- `view_attendance` = Permission to see attendance records

### Permission Structure

Each permission has:
| Field | Description | Example |
|-------|-------------|---------|
| Code | Unique identifier | `student.view` |
| Name | Readable name | "View Students" |
| Module | Which feature it belongs to | ACCOUNTS |
| Category | Type of permission | READ |
| Action | What it allows | VIEW |
| Scope | Who can use it | ALL (everyone), TENANT (school-specific), PERSONAL (own data) |

### How to Create a Permission

**Step 1:** Go to Admin Console → Identity Management → Permissions

**Why?** This is where all permissions are managed centrally.

**Step 2:** Click "+ Add Permission"

**Why?** You're creating a new "key" for a specific feature.

**Step 3:** Fill in the details:
- **Code:** `reports.view_analytics` (use format: module.action_resource)
- **Name:** "View Analytics Reports"
- **Module:** Select "ANALYTICS"
- **Category:** Select "READ"
- **Action:** Select "VIEW"
- **Scope:** Select "TENANT" (so teachers can only see their school's analytics)

**Why?** The scope limits access - TENANT means users can only access data within their school.

**Step 4:** Enable "Is Active" checkbox

**Why?** Inactive permissions are disabled system-wide.

**Step 5:** Click "Save"

### Real Example: Creating "Download Reports" Permission

```
Code: reports.download
Name: Download Reports as PDF/Excel
Module: REPORTS
Category: READ
Action: EXPORT
Scope: TENANT
Is Active: ✓
```

---

## 2. Roles <a name="roles"></a>

### What Are Roles?

**Simple Explanation:** A role is a bundle of permissions, like a key card that opens multiple doors at once.

Instead of giving each teacher 50 individual permissions, you create a "Teacher" role with all needed permissions, then assign that role.

### Role Structure

| Field | Description | Example |
|-------|-------------|---------|
| Name | Role name | "Senior Teacher" |
| Code | Unique identifier | `senior_teacher` |
| Description | What this role is for | "Teachers with 5+ years experience" |
| Level | Hierarchy (1 = highest) | 3 |
| Scope | Access boundary | TENANT |
| Is Active | Whether role works | Yes |

### How to Create a Role

**Step 1:** Go to Admin Console → Identity Management → Roles

**Why?** This is the central role management area.

**Step 2:** Click "+ Add Role"

**Step 3:** Fill in basic information:
- **Name:** "Senior Teacher"
- **Code:** `senior_teacher`
- **Description:** "Experienced teachers who can mentor juniors and access advanced reports"
- **Level:** 3 (lower number = more access, like a hotel floor)

**Why Level Matters:** Level determines what you can manage. Level 3 can manage Level 4, 5, but not Level 1, 2.

**Step 4:** Set Scope to "TENANT"

**Why?** This ensures Senior Teachers can only access data from their own school/center.

**Step 5:** In the Permissions section, select permissions to include:
- ✓ View Students
- ✓ Edit Students
- ✓ View Attendance
- ✓ Mark Attendance
- ✓ Create Assessments
- ✓ View Reports
- ✓ Download Reports

**Why?** These are the exact capabilities this role should have.

**Step 6:** Click "Save"

### Role Hierarchy Example

```
Level 1: Super Admin (sees everything)
Level 2: Tenant Admin (full access to one school)
Level 3: Senior Teacher (advanced features)
Level 4: Teacher (standard features)
Level 5: Teaching Assistant (limited features)
```

---

## 3. Staff Roles <a name="staff-roles"></a>

### What Are Staff Roles?

**Simple Explanation:** Staff Roles are special roles for admin panel users (not students). They control what admins, teachers, and support staff can do in the Admin Console itself.

Regular Roles = What you can do with student/class data  
Staff Roles = What you can do in the Admin Console

### When to Use Staff Roles

Use Staff Roles when you want to control:
- Who can add/remove teachers
- Who can modify system settings
- Who can access financial reports
- Who can manage batches

### Staff Role Structure

| Field | Description | Example |
|-------|-------------|---------|
| Name | Role name | "HR Manager" |
| Level | Access level | ADMIN, SUPERVISOR, OPERATOR, VIEWER |
| Permissions | JSON list | ["accounts.manage_teachers", "reports.view_salary"] |
| Allowed Modules | Sections accessible | ["accounts", "reports"] |
| Allowed Actions | Operations allowed | ["view", "create", "edit"] |

### How to Create a Staff Role

**Step 1:** Go to Admin Console → Identity Management → Staff Roles

**Why?** Staff Roles are separate from regular Roles because they control admin panel access.

**Step 2:** Click "+ Add Staff Role"

**Step 3:** Fill in details:
- **Name:** "Academic Coordinator"
- **Level:** SUPERVISOR
- **Description:** "Manages academic schedules and teacher assignments"

**Why?** The level determines the base access level.

**Step 4:** Set Allowed Modules:
```json
["academics", "classes", "attendance", "assessments"]
```

**Why?** This restricts the admin sidebar to only these sections.

**Step 5:** Set Allowed Actions:
```json
["view", "create", "edit"]
```

**Why?** This means they can view, create, and edit but NOT delete.

**Step 6:** Set Permissions:
```json
[
  "academics.manage_programs",
  "classes.manage_batches",
  "classes.manage_schedule",
  "attendance.view_reports",
  "assessments.create_tests"
]
```

**Step 7:** Click "Save"

---

## 4. User Role Assignments <a name="user-role-assignments"></a>

### What Are User Role Assignments?

**Simple Explanation:** This is where you actually give a role to a specific user.

Think of it like this:
- You created the "Senior Teacher" role (the key card design)
- Now you need to issue that key card to specific teachers

### When to Use User Role Assignments

Use when:
- A teacher gets promoted and needs more access
- A new admin joins and needs specific permissions
- Someone temporarily needs elevated access

### How to Assign a Role to a User

**Step 1:** Go to Admin Console → Identity Management → User Role Assignments

**Why?** This is the assignment ledger showing who has what role.

**Step 2:** Click "+ Add User Role Assignment"

**Step 3:** Select the User:
- **User Type:** Teacher
- **Search and select:** "Dr. Sharma"

**Why?** You're specifying who gets this role.

**Step 4:** Select the Role:
- **Role:** "Senior Teacher"

**Why?** You're specifying which role they receive.

**Step 5:** Set the Scope (IMPORTANT):
- **Scope Type:** TENANT
- **Scope ID:** (select their school)

**Why?** This limits the role to a specific school. If Dr. Sharma works at "Delhi NCR Center", they can only use Senior Teacher permissions for that center.

**Step 6:** Set Duration (optional):
- **Valid From:** Today
- **Valid Until:** Leave blank (permanent) or set end date

**Why?** Useful for temporary assignments like "Acting HOD while the real HOD is on leave."

**Step 7:** Add Notes:
- "Promoted to Senior Teacher based on 8 years experience"

**Why?** Creates an audit trail explaining why this was assigned.

**Step 8:** Click "Save"

### Assignment Example

```
User: Dr. Priya Sharma (Teacher)
Role: Senior Teacher
Scope: Delhi NCR Center
Valid From: Feb 19, 2026
Valid Until: (no end date)
Assigned By: Admin
Notes: Promoted based on performance review
```

---

## 5. User Groups <a name="user-groups"></a>

### What Are User Groups?

**Simple Explanation:** A User Group is like a team or department. Instead of assigning permissions to individuals one by one, you put people in a group and assign permissions to the entire group.

### Why Use Groups?

Without Groups:
- Assign permissions to Teacher 1
- Assign same permissions to Teacher 2
- Assign same permissions to Teacher 3
- ... (repeat 100 times)

With Groups:
- Create "Physics Department" group
- Add all physics teachers to the group
- Assign permissions once to the group
- Done!

### Group Structure

| Field | Description | Example |
|-------|-------------|---------|
| Name | Group name | "Class 12 NEET Faculty" |
| Code | Unique identifier | `cls12_neet_faculty` |
| Type | Category | DEPARTMENT, BATCH, PROJECT, CUSTOM |
| Description | Purpose | "All teachers handling Class 12 NEET batches" |
| Parent Group | Hierarchy | (optional parent group) |

### How to Create a User Group

**Step 1:** Go to Admin Console → Identity Management → User Groups

**Why?** This is where you manage all groups.

**Step 2:** Click "+ Add User Group"

**Step 3:** Fill in basic info:
- **Name:** "NEET Biology Faculty"
- **Code:** `neet_bio_faculty`
- **Type:** DEPARTMENT
- **Description:** "Biology teachers for NEET preparation batches"

**Why?** Clear naming helps in future management.

**Step 4:** Set Tenant (school/center):
- Select "All Centers" or a specific center

**Why?** Determines which school this group belongs to.

**Step 5:** Set Parent Group (optional):
- If there's a parent group like "All NEET Faculty", select it

**Why?** Creates hierarchy. Child groups can inherit parent permissions.

**Step 6:** Set Owner (optional):
- Select the HOD or department head

**Why?** The owner can manage group members.

**Step 7:** Configure Settings:
- **Allow Self-Registration:** ✗ (teachers can't add themselves)
- **Require Approval:** ✓ (admins must approve joins)
- **Max Members:** 20

**Step 8:** Click "Save"

---

## 6. Group Memberships <a name="group-memberships"></a>

### What Are Group Memberships?

**Simple Explanation:** A membership is the record of a person being in a group. It's like the employee badge showing "Member of Marketing Team."

### Membership Structure

| Field | Description | Example |
|-------|-------------|---------|
| Group | The group | "NEET Biology Faculty" |
| User | The person | "Dr. Amit Kumar" |
| Member Type | User type | TEACHER |
| Role in Group | Position | MEMBER / LEADER / ADMIN |
| Joined At | When added | Feb 19, 2026 |
| Status | Active/Inactive | ACTIVE |

### How to Add Someone to a Group

**Step 1:** Go to Admin Console → Identity Management → Group Memberships

**Why?** This is the master list of all memberships.

**Step 2:** Click "+ Add Group Membership"

**Step 3:** Select the Group:
- **Group:** "NEET Biology Faculty"

**Why?** Specify which group you're adding them to.

**Step 4:** Select the User:
- **Member Type:** Teacher
- **Teacher:** Dr. Amit Kumar

**Why?** Specify who is being added.

**Step 5:** Set their Role in Group:
- **Role:** MEMBER (regular member), LEADER (team lead), or ADMIN (group manager)

**Why?** Leaders might have additional group-level permissions.

**Step 6:** Set Join Date:
- **Joined At:** Today's date

**Why?** Records when they became a member.

**Step 7:** Click "Save"

### Alternative Method: From the User Groups Page

**Step 1:** Go to User Groups → Click on "NEET Biology Faculty"

**Step 2:** Scroll to "Members" section

**Step 3:** Click "+ Add Member"

**Step 4:** Select teacher and save

---

## 7. Group Role Assignments <a name="group-role-assignments"></a>

### What Are Group Role Assignments?

**Simple Explanation:** This gives a role to an entire group at once. Instead of assigning "Senior Teacher" role to each teacher individually, you assign it to the group, and everyone in that group automatically gets it.

### Think of it as:

"Everyone in the NEET Biology Faculty group should have the 'Content Creator' role."

Result: When Dr. Amit joins the group, he automatically gets 'Content Creator' permissions. When he leaves, he automatically loses them.

### How to Assign a Role to a Group

**Step 1:** Go to Admin Console → Identity Management → Group Role Assignments

**Why?** This is where you connect groups to roles.

**Step 2:** Click "+ Add Group Role Assignment"

**Step 3:** Select the Group:
- **Group:** "NEET Biology Faculty"

**Why?** Specify which group gets this role.

**Step 4:** Select the Role:
- **Role:** "Content Creator"

**Why?** Specify which role the entire group should have.

**Step 5:** Set Scope (IMPORTANT):
- **Scope Type:** TENANT
- **Scope ID:** Select the relevant school/center

**Why?** Even though they have "Content Creator" role, it only applies to their school's content.

**Step 6:** Set Priority:
- **Priority:** 10 (lower number = higher priority)

**Why?** If a user has conflicting roles from multiple groups, higher priority wins.

**Step 7:** Click "Save"

### Result

Every member of "NEET Biology Faculty" now has:
- Content Creator permissions
- Applied to their tenant/school only
- Automatically added/removed as they join/leave the group

---

## 8. Real-World Scenarios <a name="real-world-scenarios"></a>

### Scenario 1: New School Branch Opens

**Situation:** ENF opens a new center in Mumbai. You need to set up staff access.

**Step-by-Step:**

1. **Create Permission Sets** (if new ones needed)
   - Go to Permissions
   - Add any Mumbai-specific permissions if needed

2. **Create Roles**
   - Go to Roles
   - Create "Mumbai Center Admin" role
   - Add all administrative permissions
   - Set scope to TENANT

3. **Create User Groups**
   - Create "Mumbai Teaching Staff" group
   - Create "Mumbai Admin Staff" group
   - Create "Mumbai Support Staff" group

4. **Assign Group Roles**
   - Assign "Teacher" role to "Mumbai Teaching Staff" group
   - Assign "Support Staff" role to "Mumbai Support Staff" group

5. **Add Staff to Groups**
   - As teachers are hired, add them to "Mumbai Teaching Staff"
   - They automatically get Teacher permissions for Mumbai center

---

### Scenario 2: Temporary HOD Assignment

**Situation:** Physics HOD Dr. Sharma is going on 3-month leave. Dr. Verma will act as HOD.

**Step-by-Step:**

1. **Go to User Role Assignments**

2. **Add New Assignment:**
   - User: Dr. Verma
   - Role: HOD (Department Head)
   - Valid From: March 1, 2026
   - Valid Until: May 31, 2026
   - Notes: "Acting HOD during Dr. Sharma's leave"

3. **Result:**
   - Dr. Verma automatically gets HOD permissions on March 1
   - Permissions automatically removed on June 1
   - No manual intervention needed

---

### Scenario 3: Restricting Test Paper Access

**Situation:** Only 3 teachers should see upcoming exam papers before the test.

**Step-by-Step:**

1. **Create a Permission:**
   - Code: `exams.view_unreleased_papers`
   - Name: "View Unreleased Exam Papers"
   - Scope: PERSONAL (they can only see papers they're assigned to)

2. **Create a Role:**
   - Name: "Exam Paper Accessor"
   - Add the permission created above

3. **Create a User Group:**
   - Name: "March 2026 Exam Committee"
   - Type: PROJECT
   - Description: "Teachers responsible for March 2026 final exams"

4. **Add Members:**
   - Add the 3 teachers to this group

5. **Assign Group Role:**
   - Assign "Exam Paper Accessor" role to "March 2026 Exam Committee"

6. **Result:**
   - Only these 3 teachers can see unreleased papers
   - After exams, delete the group (automatically removes access)

---

### Scenario 4: Student Batch Access Control

**Situation:** Teachers should only see students in their assigned batches.

**Step-by-Step:**

1. **Create Batch-Specific Groups:**
   - "JEE Batch A Faculty"
   - "JEE Batch B Faculty"
   - "NEET Batch A Faculty"

2. **Create a Role with Scoped Permission:**
   - Name: "Batch Teacher"
   - Permission: "View Students" with scope="BATCH"

3. **Assign Group Role:**
   - Assign "Batch Teacher" to each batch faculty group
   - Set scope to the specific batch

4. **Add Teachers:**
   - Add teachers to their respective batch groups

5. **Result:**
   - Mr. Singh in "JEE Batch A Faculty" can only see JEE Batch A students
   - He cannot see other batch students
   - If assigned to another batch, add him to that group too

---

### Scenario 5: Multi-Level Admin Hierarchy

**Situation:** You want a hierarchy where:
- Super Admin sees everything
- Center Admin sees their center
- Department Head sees their department
- Teachers see their batches

**Step-by-Step:**

1. **Create Staff Roles with Levels:**
   ```
   Super Admin     - Level: ADMIN
   Center Admin    - Level: ADMIN (with Tenant scope)
   Department Head - Level: SUPERVISOR
   Senior Teacher  - Level: OPERATOR
   Teacher         - Level: VIEWER
   ```

2. **Create Regular Roles with Levels:**
   ```
   Level 1: Super Admin
   Level 2: Center Admin
   Level 3: Department Head
   Level 4: Senior Teacher
   Level 5: Teacher
   ```

3. **Assign Staff Roles to Admin Users:**
   - Admin Console → Admins → Edit → Set Staff Role

4. **Result:**
   - Each level can only manage users at lower levels
   - Center Admin cannot modify Super Admin settings
   - Teachers cannot access admin functions

---

## Quick Reference: When to Use What

| You Want To... | Use This Feature |
|----------------|------------------|
| Create a single access right | Permission |
| Bundle multiple permissions | Role |
| Control admin panel access | Staff Role |
| Give a role to one person | User Role Assignment |
| Create a team/department | User Group |
| Add someone to a team | Group Membership |
| Give permissions to entire team | Group Role Assignment |

---

## Troubleshooting

### Q: User can't access a feature they should have
1. Check their User Role Assignments - is the assignment active?
2. Check the Role - is it active? Does it have the permission?
3. Check Group Memberships - are they in the right group?
4. Check Group Role Assignments - does the group have the role?
5. Check Scope - is the scope limiting their access?

### Q: User has too much access
1. Review all their User Role Assignments
2. Review all their Group Memberships
3. Check if any role has GLOBAL or ALL scope (gives broad access)
4. Look for Group Role Assignments giving elevated access

### Q: Temporary access isn't expiring
1. Check the "Valid Until" date on the User Role Assignment
2. Ensure dates are in correct format
3. Check server timezone settings

---

**Document Version:** 1.0  
**Last Updated:** February 19, 2026  
**Author:** ENF Admin Team
