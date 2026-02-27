# 用户管理与权限控制系统 Spec

## Why
当前系统缺乏用户身份验证和权限控制机制，所有用户均可访问所有应用。为了提高安全性并满足企业级管理需求，需要引入用户管理、角色权限控制（RBAC）以及单点登录（SSO）功能，确保只有经过授权的用户才能访问特定的 AI 应用。

## What Changes

### 1. 用户管理模块 (User Management)
- **用户来源同步**: 从 MaxKB 系统同步用户数据。
  - **API 端点**: `GET /admin/api/system/chat_user/user_manage/{page}/{size}`
  - **说明**: MaxKB 的用户本身也来自于单点登录（SSO）系统，本系统将作为下游同步这些用户身份。
- **本地存储**: 在本地存储用户的基础信息（如 ID、用户名、邮箱）以及扩展的权限信息。

### 2. 单点登录集成 (SSO Integration)
- **SSO 登录**: 集成统一身份认证系统（支持 OIDC 或 OAuth2 协议）。
- **登录流程**: 用户点击登录 -> 跳转 SSO 认证 -> 回调处理 -> 生成本地 Session/Token。

### 3. 权限控制体系 (RBAC)
- **角色管理**:
  - **管理员 (Admin)**: 拥有系统最高权限，可管理用户和应用授权。
  - **普通用户 (User)**: 默认角色，仅能访问被授权的应用。
- **权限验证**: 在 API 层和前端路由层添加权限验证。

### 4. 应用授权功能 (App Authorization)
- **授权管理**: 管理员可以对用户进行应用维度的授权。
  - **授权**: 允许某用户访问某应用。
  - **取消授权**: 收回访问权限。
  - **查询**: 查看某用户已获得授权的应用列表。

## Impact
- **Affected Specs**: 新增用户认证与授权能力。
- **Affected Code**:
  - `api/`: 新增 `auth` 路由、`user` 路由、中间件 `authMiddleware`。
  - `src/`: 新增登录页、管理后台页（仅管理员可见）、全局状态管理（User Store）。
  - `data/`: 新增 `users.json` 或类似存储结构用于持久化用户权限数据。

## ADDED Requirements

### Requirement: User Synchronization
The system SHALL sync users from MaxKB API.
- **Source**: `https://mk2.zevin.xin:20000/admin/api/system/chat_user/user_manage/1/20` (Example)
- **Token**: Uses a configured API Token (e.g., `user-e231ba6ec07aa0a491117a2a7abae662`).

### Requirement: Role-Based Access Control
The system SHALL enforce role-based access.
- **Admin**: Can access `/admin` routes and manage permissions.
- **User**: Can only access `/chat` or app routes they are authorized for.

### Requirement: App Authorization
The system SHALL allow Admins to grant/revoke app access for Users.
- **Granularity**: Per App ID.

## MODIFIED Requirements
### Requirement: API Access
**Before**: All APIs were public or unprotected.
**After**: Sensitive APIs (e.g., MaxKB sync, App proxy) require a valid Auth Token.
