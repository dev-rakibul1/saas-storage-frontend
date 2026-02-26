# SaaS Storage Frontend - Dashboard Integration Guide

## 1. Route Structure

- `/` -> redirects to `/login`
- `/login` -> login page
- `/register` -> register page
- `/dashboard` -> dashboard home
- `/dashboard/folders` -> folder module
- `/dashboard/files` -> file module
- `/dashboard/subscription` -> subscription module
- `/dashboard/profile` -> profile module

## 2. Auth Guard System

Implemented with client-side provider + protected dashboard layout.

Key files:

- `components/context/auth-context.tsx`
- `components/providers.tsx`
- `app/dashboard/layout.tsx`

Behavior:

- Not logged in -> redirected to `/login`
- Logged in -> dashboard access allowed
- Refresh-safe: token from `localStorage` is re-validated using `GET /users/profile`

Token storage key:

- `saas_access_token`

## 3. Layout System

Dashboard shell follows doc requirements:

- Left sidebar: width `240px`, border-right `1px solid #ddd`, radius `4px`
- Topbar: height `60px`, border-bottom `1px solid #ddd`, radius `4px`
- Main content cards: border `1px solid #ddd`, radius `4px`, no shadow

Sidebar menu:

- Dashboard
- Folders
- Files
- Subscription
- Profile
- Logout

## 4. Responsive Behavior

- Desktop: sidebar visible/fixed layout
- Tablet: sidebar collapses
- Mobile: sidebar drawer + topbar menu toggle + fixed topbar
- Grids stack to single-column on small screens

## 5. API Integration Mapping

## 5.1 Login/Register

- `POST /users/login`
- `POST /users/register`
- Session check: `GET /users/profile`

## 5.2 Dashboard Summary

USER:

- `GET /folders/tree`
- `GET /files`
- `GET /subscriptions/current`

ADMIN:

- `GET /admin/overview`

## 5.3 Folder Page (`/dashboard/folders`)

- `GET /folders/tree`
- `POST /folders`
- `PATCH /folders/:id`
- `DELETE /folders/:id`

## 5.4 File Page (`/dashboard/files`)

- `GET /files`
- `GET /folders/tree`
- `POST /files/upload`
- `PATCH /files/:id`
- `GET /files/:id/download`

## 5.5 Subscription Page (`/dashboard/subscription`)

USER:

- `GET /subscriptions/packages`
- `GET /subscriptions/current`
- `POST /subscriptions/select`

ADMIN package management on same page:

- `GET /packages?includeInactive=true`
- `POST /packages`
- `PATCH /packages/:id`
- `DELETE /packages/:id`

## 5.6 Profile Page (`/dashboard/profile`)

- `PATCH /users/profile`
- `GET /subscriptions/current` (for USER package info)
- `PATCH /users/test-role` (test-purpose only, warning shown in UI)

## 6. UI Rules Applied

- Border radius: `4px`
- No shadows
- Light border: `#ddd`
- Neutral background
- Clean spacing and readable typography

## 7. Files Updated

Core implementation files:

- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/dashboard/layout.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/folders/page.tsx`
- `app/dashboard/files/page.tsx`
- `app/dashboard/subscription/page.tsx`
- `app/dashboard/profile/page.tsx`
- `components/context/auth-context.tsx`
- `app/globals.css`
