# Store Ratings Platform

A web app where people can browse stores and rate them from 1 to 5. Built for
the FullStack Intern coding challenge.

Three roles share one login system:

- **System Administrator** - adds users and stores, sees platform-wide stats
- **Normal User** - signs up, browses/searches stores, submits or edits ratings
- **Store Owner** - sees who rated their store and the average rating

## Stack

- Backend: Node.js + Express
- Database: PostgreSQL
- Frontend: React (Vite) + React Router
- Auth: JWT, passwords hashed with bcrypt

## Project layout

```
backend/     Express API, talks to Postgres
frontend/    React app (Vite dev server, proxies /api to the backend)
```

## Getting it running

### 1. Database

Create a database and load the schema:

```bash
createdb store_ratings
psql -U postgres -d store_ratings -f backend/src/db/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in your Postgres credentials and a JWT secret
npm install
npm run seed            # creates a first admin account (prints the login)
npm run dev              # starts the API on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # starts on http://localhost:5173
```

Open http://localhost:5173, log in with the admin account printed by `npm run
seed`, and start adding users/stores.

## A few implementation notes

- Ratings are stored one row per (user, store) with a unique constraint, so
  "submit" and "modify" a rating are literally the same upsert query - the
  UI just shows a filled-in star widget if you've already rated a store.
- Sorting on the admin tables is done server-side via `sortBy`/`order` query
  params, but the column name is matched against a small allow-list before
  it ever reaches the SQL string, since you can't parameterize a column name.
- Validation (name length, password rules, email format) lives in one small
  `validators.js` file on the backend and is mirrored with field hints in
  the frontend forms, so the same rules are enforced both places.
- Store owners are matched to a store via `stores.owner_id`, set either when
  the store is created or left blank if no owner account exists yet.

## What I'd add with more time

- Automated tests (Jest + supertest for the API, React Testing Library for
  the frontend) - the project has none right now.
- Pagination on the admin user/store tables once the data set gets large.
- A way for the admin to reassign a store's owner after creation.
