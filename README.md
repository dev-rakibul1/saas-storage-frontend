# SaaS Storage Frontend

Next.js dashboard app for the subscription-based SaaS file management platform.

## 1) Requirement Coverage

Implemented frontend modules:

- Auth pages (`/login`, `/register`)
- Protected dashboard layout (auth guard)
- Role-aware sidebar and topbar
- User dashboard summary (folders/files/current package)
- Folder management UI
- File management UI (upload/list/download/rename)
- Subscription selection/switch (User)
- Package management and system overview (Admin)
- Profile update + test-only role switch UI

## 2) App Flow

1. User/Admin logs in from `/login`.
2. Token is stored in local storage and profile is fetched.
3. Unauthenticated users are redirected from `/dashboard/**` to `/login`.
4. Dashboard menu and pages render by user role.
5. UI calls backend endpoints and shows validation/API messages directly.

## 3) Route Map

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Redirect to `/login` |
| `/login` | Public | Login |
| `/register` | Public | Register |
| `/dashboard` | USER/ADMIN | Dashboard home |
| `/dashboard/folders` | USER | Folder management |
| `/dashboard/files` | USER | File management |
| `/dashboard/subscription` | USER/ADMIN | User package switch + admin package CRUD |
| `/dashboard/profile` | USER/ADMIN | Profile info and update |

## 4) UI/UX Design Rules Applied

- Clean SaaS layout with minimal visual noise
- Border-based cards (`1px solid #ddd`)
- Border radius `4px`
- No shadows
- Responsive layout:
  - Desktop: fixed sidebar
  - Tablet: collapsible sidebar
  - Mobile: drawer sidebar + fixed topbar

## 5) Setup

Node requirement: `>=20.9.0`

```bash
npm install
cp .env.example .env.local
npm run dev
```

Frontend URL: `http://localhost:3000`

Lint:

```bash
npm run lint
```

## 6) Environment

| Key | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend base URL (system auto-appends `/api/v1`) |

Example:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## 7) Integration Architecture

Core integration files:

- `components/context/auth-context.tsx`
- `lib/api.ts`
- `app/dashboard/layout.tsx`

Auth behavior:

- Token key: `saas_access_token`
- Session restore on refresh by calling `GET /users/profile`
- Invalid token clears session and sends user to `/login`

## 8) Complete API Integration Matrix

All API calls are made to normalized base URL (auto `/api/v1` suffix).

Examples:

- `NEXT_PUBLIC_API_BASE_URL=https://saas-file-management-api.vercel.app` -> uses `https://saas-file-management-api.vercel.app/api/v1`
- `NEXT_PUBLIC_API_BASE_URL=https://saas-file-management-api.vercel.app/api/v1` -> also works (no duplicate suffix)

### Auth + Profile

| Method | Endpoint | Used In |
| --- | --- | --- |
| `POST` | `/users/register` | Register page |
| `POST` | `/users/login` | Login page |
| `GET` | `/users/profile` | Auth bootstrap, profile page |
| `PATCH` | `/users/profile` | Profile update |
| `PATCH` | `/users/test-role` | Profile page (test-only section) |

### Dashboard Summary

| Method | Endpoint | Used In |
| --- | --- | --- |
| `GET` | `/folders/tree` | User dashboard |
| `GET` | `/files` | User dashboard |
| `GET` | `/subscriptions/current` | User dashboard/profile |
| `GET` | `/admin/overview` | Admin dashboard |

### Folders

| Method | Endpoint | Used In |
| --- | --- | --- |
| `GET` | `/folders/tree` | Folder page, file upload target selector |
| `POST` | `/folders` | Folder create |
| `PATCH` | `/folders/:id` | Folder rename |
| `DELETE` | `/folders/:id` | Folder delete |

### Files

| Method | Endpoint | Used In |
| --- | --- | --- |
| `GET` | `/files` | File list |
| `POST` | `/files/upload` | File upload (base64 payload) |
| `GET` | `/files/:id/download` | File download |
| `PATCH` | `/files/:id` | File rename |
| `DELETE` | `/files/:id` | File delete |

### Subscription + Package

| Method | Endpoint | Used In |
| --- | --- | --- |
| `GET` | `/subscriptions/packages` | User subscription page |
| `POST` | `/subscriptions/select` | User package switch |
| `GET` | `/subscriptions/current` | User current plan card |
| `GET` | `/packages?includeInactive=true` | Admin package table |
| `POST` | `/packages` | Admin package create |
| `PATCH` | `/packages/:id` | Admin package update |
| `DELETE` | `/packages/:id` | Admin package deactivate |

### Admin Monitoring

| Method | Endpoint | Used In |
| --- | --- | --- |
| `GET` | `/admin/users` | Admin user list |
| `GET` | `/admin/users/:id/usage` | Admin user usage details |
| `GET` | `/admin/overview` | Admin overview cards |

## 9) File Upload Integration Notes

- Browser reads file as data URL (`FileReader.readAsDataURL`)
- Frontend sends JSON payload to `POST /files/upload`
- Backend enforces package rules and stores file in Cloudinary
- Large payloads can fail with `413` depending on backend `REQUEST_BODY_LIMIT`

## 10) Test-Only Role Switch Note

Profile page includes a role switch action for local testing:

- Endpoint: `PATCH /users/test-role`
- Warning is shown in UI
- This is not a production requirement

## 11) Related Docs

- Backend docs: `../saas-file-management-api/README.md`
- Backend API reference: `../saas-file-management-api/docs/API_REFERENCE.md`
- Frontend integration details: `docs/FRONTEND_INTEGRATION.md`

## 12) Deploy on Vercel (Frontend)

This repository is Vercel-ready with:

- Next.js preset config: `vercel.json`
- Build script: `npm run vercel-build`

Vercel project settings:

1. Root Directory: `saas-storage-frontend`
2. Framework Preset: `Next.js`
3. Install Command: `npm install`
4. Build Command: `npm run vercel-build`

Required Vercel environment variable:

- `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-vercel-domain>`

After backend deploy URL changes, update `NEXT_PUBLIC_API_BASE_URL` and redeploy frontend.
