# Veltech Mentoring Portal

A web application designed for mentoring management, featuring a React frontend and an Express/MongoDB backend.

## Environment Variables and Setup Requirements

To run this project, you need to configure the following services and secrets:

### Backend `.env`

The backend expects these credentials to be present in `backend/.env`:

```env
DATABASE_URL="mongodb+srv://mentorshipmanagementvtmt_db_user:6JmdswO66xn0zA2I@veltech-mentoring-porta.h2zkuhq.mongodb.net/?appName=veltech-mentoring-portal"
JWT_SECRET="THIS_IS_A_VERY_SECRET_KEY_FOR_YOUR_APP"
PORT=5000
```
> **Note**: These values are required for the application to function properly and correspond to the MongoDB cluster.

### Frontend `.env`

The frontend communicates with the backend via this variable in `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```
> Make sure to switch it back to `https://veltech-mentoring-backend.onrender.com` when deploying to production.

---

## How to Run the Project Locally

To run the project on your machine, open two terminals and execute the following commands in the project root:

### 1. Run the Backend API
```bash
cd backend
npm install
npm run dev
```
> The API will start and listen at `http://localhost:5000`

### 2. Run the Frontend Dashboard
```bash
cd frontend
npm install
npm start
```
> The application will automatically open in your browser at `http://localhost:3000`

## UI Theme & Alignment Features
The user interface has been completely updated to a modern, dynamic Light Theme emphasizing readability, polished contrast, consistent grid/flex alignment, and an enhanced premium user experience.
