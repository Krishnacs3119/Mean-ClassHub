# ClassHub - Complete Educational Platform

ClassHub is a premium, feature-rich educational platform designed for teachers and students to manage classrooms, share materials, and interact in real-time.

## 🚀 Key Features

### 👨‍🏫 For Teachers
- **Class Management**: Create classes with unique, auto-generated codes (SUBJ-XXX-YYYY).
- **Content Stream**: Post study materials, announcements, and notes.
- **Student Monitoring**: View and manage enrolled students.
- **Post Interaction**: Pin important announcements, like and comment on student discussions.

### 🎓 For Students
- **Easy Enrollment**: Join classes instantly using a class code.
- **Interactive Stream**: Access all classroom materials, ask doubts in comments, and like posts.
- **Organized Dashboard**: View all joined classes in a sleek, modern interface.

### 🛡️ Core Features
- **JWT Authentication**: Secure login and registration with Role-Based Access Control (RBAC).
- **Premium UI/UX**: Built with Angular 21, featuring glassmorphism, responsive design, and smooth animations.
- **Real-time Toasts**: Instant feedback for all actions using ngx-toastr.
- **Skeleton Loading**: Optimized perceived performance.

## 🛠️ Technology Stack

- **Frontend**: Angular 21.2.0, RxJS, Bootstrap 5.3
- **Backend**: Node.js v24.11.1, Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT, BcryptJS

## 🚦 Getting Started

### Prerequisites
- Node.js (v20+)
- MongoDB (Running locally or on Atlas)

### Installation

1. **Clone the project**
2. **Install Root Dependencies**
   ```bash
   npm run install:all
   ```
3. **Configure Environment**
   - Create a `.env` file in the `server` directory (see `.env.example`).
4. **Run the Application**
   - Start Backend: `npm run dev:server` (Port 5000)
   - Start Frontend: `npm run dev:client` (Port 4200)

## 📁 Project Structure

```
ClassHub/
├── client/          # Angular 21 Frontend
│   ├── src/app/
│   │   ├── components/
│   │   ├── services/
│   │   └── interceptors/
├── server/          # Node.js/Express Backend
│   ├── models/      # Mongoose Schemas
│   ├── routes/      # API Endpoints
│   ├── controllers/ # Business Logic
│   └── middleware/  # Auth & Role guards
```

## 📜 Database Schemas

- **User**: name, email, password, role, classes.
- **Class**: className, classCode, teacher, students, subject.
- **Post**: title, content, type, author, likes, comments.
- **Comment**: text, author, post.
