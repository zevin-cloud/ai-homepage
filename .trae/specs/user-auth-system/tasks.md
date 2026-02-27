# Tasks

- [ ] Task 1: Design and Implement Data Storage
  - [ ] SubTask 1.1: Define JSON schema for Users, Roles, and Permissions (e.g., `users.json`, `permissions.json`).
  - [ ] SubTask 1.2: Create utility functions to read/write these files safely.

- [ ] Task 2: Implement MaxKB User Sync
  - [ ] SubTask 2.1: Create a service to fetch users from MaxKB API (`/admin/api/system/chat_user/user_manage`).
  - [ ] SubTask 2.2: Implement logic to merge/update fetched users into local storage.
  - [ ] SubTask 2.3: Add an API endpoint to trigger user sync manually (Admin only).

- [ ] Task 3: Implement SSO Authentication
  - [ ] SubTask 3.1: Configure OIDC/OAuth2 client (using a library like `openid-client` or `passport`).
  - [ ] SubTask 3.2: Implement Login endpoint (redirect to SSO).
  - [ ] SubTask 3.3: Implement Callback endpoint (handle SSO response, create/update user session/token).
  - [ ] SubTask 3.4: Implement Logout endpoint.

- [ ] Task 4: Implement Permission Management API (Admin)
  - [ ] SubTask 4.1: API to list all users and their current roles/permissions.
  - [ ] SubTask 4.2: API to assign/revoke 'Admin' role.
  - [ ] SubTask 4.3: API to grant/revoke App access for a specific user.

- [ ] Task 5: Implement Auth Middleware
  - [ ] SubTask 5.1: Create middleware to verify Auth Token/Session.
  - [ ] SubTask 5.2: Create middleware to check for 'Admin' role.
  - [ ] SubTask 5.3: Create middleware to check App access permission for specific app routes.

- [ ] Task 6: Frontend - Login and Auth State
  - [ ] SubTask 6.1: Create a Login page.
  - [ ] SubTask 6.2: Implement global Auth Store (Pinia/Vuex) to hold user info and permissions.
  - [ ] SubTask 6.3: Add Route Guards to protect pages.

- [ ] Task 7: Frontend - Admin Management UI
  - [ ] SubTask 7.1: Create a 'User Management' page (Admin only).
  - [ ] SubTask 7.2: Display user list with sync status.
  - [ ] SubTask 7.3: UI to assign apps to users (e.g., a modal with checkboxes for available apps).

- [ ] Task 8: Integration and Verification
  - [ ] SubTask 8.1: Apply Auth Middleware to existing MaxKB proxy routes.
  - [ ] SubTask 8.2: Verify end-to-end flow: Login -> Sync Users -> Assign Permission -> Access App.

# Task Dependencies
- Task 4 depends on Task 1 and Task 2.
- Task 5 depends on Task 3.
- Task 7 depends on Task 4.
- Task 8 depends on all previous tasks.
