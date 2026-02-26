# SaaS Storage Frontend

Next.js frontend integrated with the backend API for:

- User registration/login
- Package selection and switching
- Folder create/rename/delete and tree view
- File upload/list/download/rename/delete
- Admin package CRUD and monitoring
- Auth-guarded dashboard layout with sidebar + topbar

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Default frontend URL: `http://localhost:3000`

## Environment

`NEXT_PUBLIC_API_BASE_URL` should point to backend base URL:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

## Notes

- File uploads are sent as base64 to backend `POST /files/upload`.
- Download endpoint uses authenticated request headers.
- Dashboard routes are protected (`/dashboard/**` -> redirect to `/login` if no session).
- Profile page includes a test-only role switch panel (`PATCH /users/test-role`).

Detailed frontend integration guide:

- `docs/FRONTEND_INTEGRATION.md`
# saas-storage-frontend
# saas-storage-frontend
