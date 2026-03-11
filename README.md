# NextCare Recovery Pathways

A full-stack healthcare recovery management platform that helps patients track appointments, care plans, health resources, and their overall recovery journey.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [How the API is Fetched](#how-the-api-is-fetched)
- [How the API is Used in the App](#how-the-api-is-used-in-the-app)
- [Authentication Flow](#authentication-flow)
- [Available Routes](#available-routes)

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev/) | UI library |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [React Router v6](https://reactrouter.com/) | Client-side routing |
| [Chakra UI v2](https://chakra-ui.com/) | Component library & design system |
| [Axios](https://axios-http.com/) | HTTP client for API calls |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [React Hook Form](https://react-hook-form.com/) | Form state management & validation |
| [React Icons](https://react-icons.github.io/react-icons/) | Icon library |
| [date-fns](https://date-fns.org/) | Date formatting & manipulation |

### Backend

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime environment |
| [Express](https://expressjs.com/) | Web framework / REST API |
| [MongoDB](https://www.mongodb.com/) | NoSQL database |
| [Mongoose](https://mongoosejs.com/) | MongoDB ODM / schema modeling |
| [JSON Web Token (JWT)](https://jwt.io/) | Stateless authentication |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |
| [express-validator](https://express-validator.github.io/) | Request validation |
| [cors](https://github.com/expressjs/cors) | Cross-origin resource sharing |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable management |
| [nodemon](https://nodemon.io/) | Dev auto-restart |

---

## Project Structure

```
nextcare-recovery-pathways/
├── src/                        # Frontend source
│   ├── App.jsx                 # Root component & route definitions
│   ├── main.jsx                # Entry point
│   ├── theme.js                # Chakra UI theme config
│   ├── components/             # Shared UI components
│   ├── contexts/
│   │   └── AuthContext.jsx     # Global auth state & helpers
│   ├── pages/                  # Page-level components
│   ├── services/
│   │   └── api.js              # Axios instance + all API modules
│   └── utils/
│       └── riskScoreCalculator.js
├── server/                     # Backend source
│   ├── server.js               # Express app entry point
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── controllers/            # Route handler logic
│   ├── middleware/
│   │   └── auth.js             # JWT protect + admin guards
│   ├── models/                 # Mongoose schemas
│   └── routes/                 # Express route definitions
├── public/
├── .env                        # Frontend env vars (VITE_*)
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- A running MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Install frontend dependencies

```sh
npm install
```

### 2. Install backend dependencies

```sh
cd server && npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root (frontend):

```env
VITE_API_URL=http://localhost:8000/api
```

Create a `.env` file inside `server/`:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/nextcare
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### 4. (Optional) Seed the database

```sh
cd server && npm run seed
```

### 5. Start both servers

```sh
# From the project root — runs frontend + backend concurrently
npm run dev:full
```

Or start them separately:

```sh
# Frontend (port 3000)
npm run dev

# Backend (port 8000)
npm run server
```

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `VITE_API_URL` | `.env` (root) | Base URL consumed by the Axios client |
| `PORT` | `server/.env` | Express server port |
| `MONGODB_URI` | `server/.env` | MongoDB connection string |
| `JWT_SECRET` | `server/.env` | Secret used to sign/verify JWT tokens |
| `NODE_ENV` | `server/.env` | `development` or `production` |

---

## API Overview

The backend exposes a RESTful API under the `/api` prefix. All protected routes require a `Bearer` token in the `Authorization` header.

| Resource | Base Path | Auth Required |
|---|---|---|
| Auth | `/api/auth` | Partial |
| Users | `/api/users` | Yes |
| Appointments | `/api/appointments` | Yes |
| Care Plans | `/api/care-plans` | Yes |
| Health Resources | `/api/health-resources` | Yes |
| Doctors | `/api/doctors` | Yes |
| Health Check | `/api/health` | No |

### Endpoint Reference

#### Auth — `/api/auth`
| Method | Path | Description |
|---|---|---|
| `POST` | `/register` | Create a new user account |
| `POST` | `/login` | Authenticate and receive a JWT |
| `GET` | `/me` | Get the currently authenticated user |

#### Users — `/api/users`
| Method | Path | Description |
|---|---|---|
| `GET` | `/profile` | Get logged-in user profile |
| `PUT` | `/profile` | Update logged-in user profile |
| `GET` | `/` | List all users (admin only) |
| `DELETE` | `/:id` | Delete a user (admin only) |

#### Appointments — `/api/appointments`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Get appointments for current user |
| `GET` | `/admin/all` | Get all appointments (admin only) |
| `GET` | `/:id` | Get a single appointment |
| `POST` | `/` | Book a new appointment |
| `PUT` | `/:id` | Update an appointment |
| `DELETE` | `/:id` | Cancel an appointment |

#### Care Plans — `/api/care-plans`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Get care plans for current user |
| `GET` | `/:id` | Get a single care plan |
| `POST` | `/` | Create a new care plan |
| `PUT` | `/:id` | Update a care plan |
| `DELETE` | `/:id` | Delete a care plan |

#### Health Resources — `/api/health-resources`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List resources (supports query params e.g. `?featured=true`) |
| `GET` | `/:id` | Get a single resource |
| `POST` | `/` | Create a resource (admin only) |
| `PUT` | `/:id` | Update a resource (admin only) |
| `DELETE` | `/:id` | Delete a resource (admin only) |

#### Doctors — `/api/doctors`
| Method | Path | Description |
|---|---|---|
| `GET` | `/` | List doctors (supports query params) |
| `POST` | `/` | Add a doctor (admin only) |
| `PUT` | `/:id` | Update a doctor (admin only) |
| `DELETE` | `/:id` | Delete a doctor (admin only) |

---

## How the API is Fetched

All API communication is handled through a single Axios instance defined in `src/services/api.js`.

### Axios Instance Setup

```js
// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});
```

The base URL is read from the `VITE_API_URL` environment variable at build time via Vite's `import.meta.env`.

### Request Interceptor (Auto-Auth)

A request interceptor is attached to the instance so every outgoing request automatically includes the JWT stored in `localStorage`:

```js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

This means no page or component needs to manually attach the auth header — it is handled centrally.

### Domain-Scoped API Modules

The API calls are grouped into named export objects, one per resource domain:

```js
export const authAPI     = { register, login, getMe };
export const userAPI     = { getProfile, updateProfile, getAllUsers, deleteUser };
export const appointmentAPI = { getAll, getAllAdmin, getOne, create, update, delete };
export const carePlanAPI = { getAll, getOne, create, update, delete };
export const healthResourceAPI = { getAll, getOne, create, update, delete };
export const doctorAPI   = { getAll, create, update, delete };
```

---

## How the API is Used in the App

### Importing in a page

Pages import only the modules they need:

```js
import { appointmentAPI, carePlanAPI, healthResourceAPI } from '../services/api';
```

### Calling the API

API calls are made inside `useEffect` hooks or event handlers. Parallel requests are batched with `Promise.all` to reduce waterfall loading:

```jsx
// src/pages/Dashboard.jsx
const fetchDashboardData = async () => {
  const [appointmentsRes, carePlansRes, resourcesRes] = await Promise.all([
    appointmentAPI.getAll(),
    carePlanAPI.getAll(),
    healthResourceAPI.getAll({ featured: true })
  ]);

  setAppointments(appointmentsRes.data);
  setCarePlans(carePlansRes.data);
  setHealthResources(resourcesRes.data);
};
```

### Error handling pattern

All API calls follow a consistent try/catch pattern, surfacing errors via Chakra UI's `useToast`:

```jsx
try {
  const res = await appointmentAPI.create(formData);
  // handle success
} catch (error) {
  toast({
    title: 'Error',
    description: error.response?.data?.message || 'Something went wrong',
    status: 'error',
    duration: 5000,
    isClosable: true,
  });
}
```

---

## Authentication Flow

1. **Register / Login** — `POST /api/auth/register` or `/api/auth/login` returns a JWT and user object.
2. **Token storage** — The token is stored in `localStorage` by `AuthContext`.
3. **Session restore** — On app load, `AuthContext` reads the token from `localStorage` and calls `GET /api/auth/me` to rehydrate the user state.
4. **Auto-attach** — The Axios request interceptor attaches the token to every subsequent request.
5. **Server verification** — The `protect` middleware on the backend verifies the JWT signature using `JWT_SECRET` and attaches the decoded user to `req.user`.
6. **Role guard** — The `admin` middleware additionally checks `req.user.role === 'admin'` for admin-only endpoints.
7. **Logout** — The token is removed from `localStorage` and user state is cleared.

---

## Available Routes

| Path | Component | Protected |
|---|---|---|
| `/login` | `Login` | No |
| `/register` | `Register` | No |
| `/dashboard` | `Dashboard` | Yes |
| `/onboarding` | `Onboarding` | Yes |
| `/profile` | `Profile` | Yes |
| `/appointments` | `Appointments` | Yes |
| `/care-plans` | `CarePlans` | Yes |
| `/resources` | `HealthResources` | Yes |
| `/admin` | `Admin` | Yes (admin role) |
| `*` | `NotFound` | No |
