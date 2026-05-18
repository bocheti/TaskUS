# TaskUs: Dual-Client Agile Management Platform

TaskUs is an enterprise-grade, full-stack project management and Kanban application suite. This project was developed as a comprehensive thesis to architect, deploy, and benchmark a modern web ecosystem, culminating in a rigorous comparative analysis of the industry's leading frontend frameworks: React and Angular.

## Project Overview

The TaskUs ecosystem is designed around a highly decoupled, containerized architecture. A single, robust backend serves two distinct, feature-identical Single Page Applications (SPAs). This structure allows for a direct, 1-to-1 evaluation of Developer Experience (DX), rendering performance, and architectural trade-offs between React and Angular in a production environment.

### Core Features
* **Role-Based Access Control (RBAC):** Secure authentication and authorization using JWT, separating Admin and Member privileges.
* **Organization & Project Management:** Create workspaces, invite members, and manage complex project hierarchies.
* **Interactive Kanban Board:** Real-time, drag-and-drop task management with status toggling and deadline tracking.
* **Fully Responsive UI:** Seamless mobile-to-desktop fluid design implemented via Tailwind CSS (React) and SCSS Media Queries (Angular).

---

## Tech Stack

### Backend Architecture
* **Runtime:** Node.js / Express.js
* **Database:** PostgreSQL (Hosted on Azure)
* **ORM/ODM:** Prisma (with comprehensive Jest test coverage)
* **Containerization:** Docker

### Frontend Clients (Dual-Implementation)
* **Client A (React):** Built with Vite, React Router, and utility-first styling via Tailwind CSS.
* **Client B (Angular):** Built with Angular CLI, RxJS, Dependency Injection, and Angular Material/SCSS.

### DevOps & CI/CD
* **Pipeline:** GitHub Actions (Automated building, testing, and container pushing)
* **Registry:** GitHub Container Registry (GHCR)
* **Deployment (Backend):** Microsoft Azure App Service (Dockerized)
* **Deployment (Frontend):** Vercel Edge Network
* **E2E Testing:** Playwright

---

## Repository Structure

/taskus-root
├── /backend                 # Node.js/Express API & Prisma Schema
├── /frontend-react          # React/Tailwind SPA
├── /frontend-angular        # Angular/SCSS SPA
├── /docs                    # API Contracts, Architecture Diagrams, Thesis PDF
├── .github/workflows        # CI/CD Deployment Pipelines
└── README.md

---

## Getting Started (Local Development)

### Prerequisites
* Node.js (v18+)
* Docker Desktop (optional, for local DB)
* PostgreSQL

### 1. Backend Setup
Navigate to the backend directory, install dependencies, and configure your environment:
npm install

Create a .env file in the /backend directory:
DATABASE_URL="postgresql://user:password@localhost:5432/taskus"
JWT_SECRET="your_super_secret_key"
PORT=3000
NODE_ENV="development"

Run the database migrations and start the server:
npx prisma migrate dev
npm run dev

### 2. Frontend Setup (React)
Open a new terminal and boot the React client:
cd frontend-react
npm install
npm run dev

### 3. Frontend Setup (Angular)
Open a new terminal and boot the Angular client:
cd frontend-angular
npm install
ng serve

---

## Production Deployment

The application utilizes a fully automated CI/CD pipeline. 
1. Pushing to the main branch triggers **GitHub Actions**.
2. The backend is containerized, pushed to **GHCR**, and deployed to an **Azure App Service**.
3. Both frontends are automatically built and deployed to **Vercel**, consuming the live Azure API.

**Live URLs:**
* React Client: https://taskus.app
* Angular Client: https://angular.taskus.app
* API Endpoint: taskus-api-docker-d4g7a9adb3d0e7bv.francecentral-01.azurewebsites.net

---

## 📄 License & Academic Integrity

This project was developed as a university thesis. All source code, architectural documentation, and quantitative benchmarks are the intellectual property of Salvador Ramón Espinosa Merino.