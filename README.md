# CUET Resource Management System

A comprehensive, role-based web application designed to streamline the booking and management of campus resources at Chittagong University of Engineering & Technology (CUET).

## 🚀 Features

*   **Role-Based Dashboards**: Tailored interfaces for Students, Teachers, and Administrators.
*   **Visual Slot Picker**: Students can easily view available, booked, and selected time slots for any resource on a given date to prevent scheduling conflicts.
*   **Approval Workflow**: 
    1.  Student requests a hold on a resource.
    2.  Student assigns a Reference Teacher to the booking.
    3.  Reference Teacher approves the request.
    4.  Admin / Teacher-in-Charge gives the final confirmation.
*   **Real-time Availability**: Resources display live "AVAILABLE" or "IN USE" badges based on active bookings.
*   **Beautiful UI**: Premium glassmorphism design with custom animations, gradient accents, and responsive layouts.
*   **Custom Notifications**: Built-in, animated toast notification system for alerts and errors.

## 🛠️ Tech Stack

### Frontend
*   **React + Vite**: For fast and modern UI rendering.
*   **Tailwind CSS**: For utility-first styling and responsive design.
*   **Axios**: For making API requests to the backend.

### Backend
*   **Spring Boot (Java)**: robust backend framework for handling business logic and REST APIs.
*   **Spring Security & JWT**: Secure authentication and authorization for different user roles (STUDENT, TEACHER, ADMIN).
*   **Hibernate / JPA**: ORM for database operations.
*   **MySQL**: Relational database for persistent storage.

## ⚙️ Running the Project Locally

### Prerequisites
*   Node.js & npm
*   Java Development Kit (JDK) 17+
*   Maven (or use the included local Maven wrapper/installation)
*   MySQL Server (running locally on port 3306)

### 1. Database Setup
Ensure you have a local MySQL server running. The backend is configured to connect to `cuet_booking_db` using the `root` user. You can change these credentials in `backend/src/main/resources/application.properties` if needed.
The system will automatically create the schema and seed the initial data (users and resources) on startup.

### 2. Start the Backend (Spring Boot)
Open a terminal in the `backend/` directory and run:
```bash
mvn spring-boot:run
```
*(Note: If Maven is not globally installed, you can use the included local `apache-maven-3.9.6` installation)*

### 3. Start the Frontend (Vite)
Open a new terminal in the root directory and run:
```bash
npm install
npm run dev
```

### 4. Access the Application
Open your browser and navigate to `http://localhost:5173`.

## 🧪 Default Test Accounts
Upon starting the backend, the following accounts are automatically seeded into the database:
*   **Admin**: `admin@cuet.ac.bd` / `password`
*   **Teacher**: `teacher1@cuet.ac.bd` / `password`

*(Note: All registered emails must end with `@cuet.ac.bd`)*

## 📂 Project Structure

*   `/src`: Frontend React source code (Components, API hooks, Dashboards, CSS).
*   `/backend/src`: Spring Boot Java source code (Controllers, Services, Repositories, Security, DTOs).
*   `/backend/src/main/resources`: Application properties and `data.sql` seeder script.
