# Store Ratings Platform

A small full-stack app where people can browse registered stores and rate them
from 1 to 5. There are three kinds of accounts - system administrator, normal
user, and store owner - and each sees a different slice of the app once they
log in.

## Stack

- **Backend:** Express + PostgreSQL (plain SQL through `pg`, no ORM)
- **Frontend:** React (Vite) + React Router + Axios
- **Auth:** JWT, one login form for every role

## Project layout

```
backend/     Express API, database schema, seed script
frontend/    React app (Vite)
```

## Getting it running locally

### 1. Database

Create a Postgres database and run the schema against it:

```bash
createdb store_ratings
psql -U postgres -d store_ratings -f backend/src/db/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # then fill in your Postgres credentials + a JWT secret
npm install
npm run seed               # creates the first admin account (prints the password once)
npm run dev                # starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173, proxies /api to the backend
```

Open `http://localhost:5173` and log in with the admin account the seed
script created (check your terminal output for the generated password), or
sign up as a normal user from the login screen.

## How the roles work

- **Anyone** can sign up as a normal user from `/signup`.
- **Admin and store-owner accounts can only be created by an existing admin**,
  from the "Add a user" screen after logging in.
- A store only shows up on a store owner's dashboard once an admin creates
  the store and assigns that owner to it.

## API overview

| Method | Route                     | Who            | What it does                          |
|--------|---------------------------|----------------|----------------------------------------|
| POST   | /api/auth/signup          | anyone         | register a normal user                 |
| POST   | /api/auth/login           | anyone         | log in                                 |
| PUT    | /api/auth/password        | logged in      | change your own password               |
| GET    | /api/admin/dashboard      | admin          | user/store/rating counts               |
| POST   | /api/admin/users          | admin          | create a user of any role              |
| GET    | /api/admin/users          | admin          | list + filter + sort users             |
| GET    | /api/admin/users/:id      | admin          | user detail (includes store rating for owners) |
| POST   | /api/admin/stores         | admin          | register a store                       |
| GET    | /api/admin/stores         | admin          | list + filter + sort stores            |
| GET    | /api/stores               | normal user    | browse/search stores + your ratings    |
| POST   | /api/stores/:id/rating    | normal user    | submit or update your rating           |
| GET    | /api/owner/dashboard      | store owner    | your store's raters + average          |

## Validation rules

These are enforced on the backend (and mirrored as hints in the frontend
forms):

- **Name:** 20-60 characters
- **Address:** up to 400 characters
- **Password:** 8-16 characters, at least one uppercase letter and one special character
- **Email:** standard email format
- **Rating:** whole number from 1 to 5

## Notes on a few design decisions

- Ratings use a Postgres `UNIQUE (user_id, store_id)` constraint with an
  upsert (`ON CONFLICT ... DO UPDATE`), so "submit" and "modify" a rating are
  the same API call - simpler than maintaining two separate code paths.
- Sorting on the admin tables only accepts a small whitelist of column names
  server-side, since you can't safely parameterize an `ORDER BY` column the
  normal way.
- A store owner is currently tied to a store through `stores.owner_id`, so
  each owner account maps to one store, matching what the brief describes.
