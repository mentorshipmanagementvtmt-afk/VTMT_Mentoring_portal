# Vel Tech Mentoring Portal

A comprehensive, role-based mentorship management system designed for Vel Tech. The application streamlines academic oversight and mentor-mentee relationships through a centralized backend and distinct, role-specific frontend portals.

## 🌟 Key Features

- **Role-Based Portals:** Independent, secure interfaces tailored for Admins, HODs, and Mentors.
- **Admin Dashboard:** Global management of all HODs, Faculty, and system settings.
- **HOD Dashboard:** Department-specific insights, mentoring data aggregation, and faculty management.
- **Mentor (Faculty) Dashboard:** Dedicated workspace for managing assigned mentees, tracking student profiles, and logging activities.
- **Modern UI/UX:** Premium, responsive design built with React, Tailwind CSS, and Ant Design, featuring dynamic data visualization (Recharts).
- **Secure Backend:** RESTful API powered by Node.js, Express, and secured with JWT over a MongoDB database.

---

## 🏗️ Project Architecture

The project adopts a micro-frontend-like structure with isolated portals for clear conceptual boundaries:

| Directory | Type | Port | Description |
|-----------|---|---|---|
| `/backend` | Node.js / Express API | `5000` | Centralized data layer and authentication. Uses MongoDB. |
| `/admin` | React App | `3001` | Portal for high-level administration and global overrides. |
| `/hod` | React App | `3002` | Portal for Heads of Departments. |
| `/mentor` | React App | `3003` | Portal for Faculty members to handle day-to-day mentoring. |
| `/scripts` | Utilities | N/A | Contains DB seeding and scaffolding tools (e.g., student activities). |

*(Note: The `frontend_old` folder contains a legacy, monolithic application that has been deprecated in favor of the specialized portals.)*

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16.0.0 or higher recommended)
- A running MongoDB instance or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

### 1. Environment Configurations

Make sure to create `.env` files in the respective directories before running the application.

#### Backend (`/backend/.env`)
```bash
PORT=5000
DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/?appName=veltech-mentoring-portal"
JWT_SECRET="YOUR_SUPER_SECRET_JWT_KEY"
```

#### Frontend Portals (`/admin/.env`, `/hod/.env`, `/mentor/.env`)
For each portal, configure the API URL so it knows where to send requests:
```bash
REACT_APP_API_URL=http://localhost:5000
```
*(Switch this to your production backend URL during deployment, e.g., `https://api.yourdomain.com`)*

---

### 2. Running Locally

It is recommended to run the backend and the specific portal you are currently working on in separate terminal instances.

**A. Start the Backend API**
```bash
cd backend
npm install
npm run dev
```
> The API will serve at `http://localhost:5000`

**B. Start a Frontend Portal (e.g., Admin)**
```bash
cd admin
npm install
npm start
```
> The Admin portal will automatically open at `http://localhost:3001` (HOD is `3002`, Mentor is `3003`).

---

## 🎨 UI & Design Principles
The standard interface adopts a polished, **Light Theme** utilizing:
- **Tailwind CSS** for layout, spacing, and micro-interactions.
- **Ant Design** & **Radix UI** for stable, accessible complex components (Tables, Dialogs, Tooltips, etc).
- **Framer Motion** for subtle route and state transition animations.

---

## 📜 License
*Proprietary code - Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology.*
