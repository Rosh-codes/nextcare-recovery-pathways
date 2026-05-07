# NextCare Recovery Pathways - Functionalities

This document summarizes the main features and user-facing functionalities of the NextCare Recovery Pathways application.

## 1. Authentication and Access Control
- User registration and login with email and password.
- JWT-based authentication for secure sessions.
- Protected routes for logged-in users.
- Role-based access for patients, admins, doctors.

## 2. Patient Onboarding
- Multi-step onboarding form for new patients.
- Collects basic profile information such as date of birth, gender, phone, and address.
- Collects medical history including conditions, allergies, medications, and hospitalizations.
- Collects lifestyle information such as smoking status, alcohol use, exercise, diet, and sleep.
- Automatically calculates a health score from the onboarding data.

## 3. Patient Profile
- Patients can view and edit their personal details.
- Patients can see updated clinical history and lifestyle information.
- Patients can see their current health score.
- Profile information stays synchronized with the latest server data.

## 4. Dashboard
- Personalized welcome message for the logged-in user.
- Summary cards for key health information.
- Displays health score, upcoming appointments, active care plans, and resources.
- Provides quick access to important parts of the app.

## 5. Appointments
- Patients can view upcoming appointments.
- Users can create, update, and cancel appointments.
- Admins can view all appointments across the system.

## 6. Care Plans
- Patients can view assigned care plans.
- Doctors, admins can create care plans for users.
- Supports tracking recovery progress and treatment goals.

## 7. Health Resources
- Library of health and recovery resources.
- Featured resources are shown on the dashboard.
- Admins can add, edit, and remove resources.

## 8. Admin and Clinical Management
- Admin dashboard for managing users, appointments, and resources.
- View all registered users.
- Update patient clinical details such as medical history, lifestyle, and health score.
- Delete users when needed.

## 9. Doctor and Provider Workflows
- View patient lists for clinical review.
- Update patient health records.


## 10. Data and Backend Features
- REST API built with Express.
- MongoDB database with Mongoose schemas.
- Secure password hashing with bcrypt.
- Centralized API client on the frontend using Axios.
- Seeded sample data for faster setup and demos.

## 11. Presentation Summary
- The app helps manage recovery pathways in one place.
- It combines patient onboarding, health tracking, appointments, care plans, and educational resources.
- Admin and clinical users can update records while patients can see their latest health information in their profile.