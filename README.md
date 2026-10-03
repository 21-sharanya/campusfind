# CampusFind: Campus Lost & Found Portal

A full-stack MERN web app where students report lost and found items, search them, get automatic match
suggestions, and safely return items using claim verification.

## Features

- Post lost or found items with category, campus location and date
- Browse with search, type, category, location and status filters (debounced search)
- **Smart Match**: suggests likely lost/found pairs using category, location, title keywords and dates
- **Claim verification**: the finder sets a question and the owner must answer it; the finder reviews claims
- PIN-protected edit, delete, view claims and mark returned (PIN is stored hashed, never returned by the API)
- Responsive UI built with Tailwind CSS

## Tech stack

React (Vite), React Router, Tailwind CSS, Node.js, Express.js, MongoDB (Atlas) with Mongoose, bcryptjs

## Setup

Requirements: Node.js 20.19+ and a MongoDB Atlas connection string.

```bash
# 1. API
cd server
npm install
cp .env.example .env     # then fill in MONGO_URI
npm run seed             # optional: loads sample data (deletes existing items!)
npm run dev              # http://localhost:5000

# 2. Client (in a second terminal)
cd client
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

## Environment variables

| File | Variable | Meaning |
|---|---|---|
| `server/.env` | `PORT` | API port (default 5000) |
| `server/.env` | `MONGO_URI` | MongoDB connection string |
| `client/.env` | `VITE_API_URL` | API base URL, e.g. `http://localhost:5000/api` |

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/items` | List items (`q`, `type`, `category`, `location`, `status`) |
| POST | `/api/items` | Create an item |
| GET | `/api/items/:id` | One item |
| PUT | `/api/items/:id` | Update (PIN header `x-item-pin`) |
| DELETE | `/api/items/:id` | Delete (PIN) |
| GET | `/api/items/:id/matches` | Smart Match suggestions |
| POST | `/api/items/:id/claims` | Claim a found item |
| GET | `/api/items/:id/claims` | Read claims (PIN) |

## Project structure

```
server/  config/  controllers/  middleware/  models/  routes/  utils/  seed.js  index.js
client/src/  components/  pages/  api.js  constants.js  App.jsx  main.jsx
```

## Tutorial reference

Built by following: https://www.freecodecamp.org/news/mern-stack-crash-course/ 
https://www.youtube.com/watch?v=DJ5iIo4AWDg 