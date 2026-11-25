# Enlite Education website

Marketing and catalogue site for Enlite Education (React + Vite + TypeScript + Tailwind), with a small PHP backend for the contact form, admin inbox and PDF proxy.

## Local development

```sh
npm install
npm run dev        # Vite dev server on http://localhost:8080
```

### XAMPP (as served at http://localhost/enliteeducations/)

Run `rebuild-xampp.bat`. It builds the site into `dist/`, which XAMPP serves.
For the contact form locally, create a MySQL database named `enliteeducations`
and import `public/sql/contact_submissions.sql`.

## Configuration

`public/api/config.php` holds local settings and is git-ignored. On a server,
copy `public/api/config.example.php` to `api/config.local.php` and fill in the
database details and a strong `admin_password`. The admin inbox is at
`/admin/messages.php`.

## Deployment (Hostinger)

Pushing to `main` runs `.github/workflows/deploy-branch.yml`, which builds the
site for the domain root and commits the result to the `deploy` branch.
Hostinger Git should deploy the **`deploy`** branch into `public_html`.
