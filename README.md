# Qurban Management System

> A modern web-based platform designed to simplify and digitize the entire Qurban management process, from participant registration to meat distribution.

The Qurban Management System is a web application that helps Qurban committees manage participants, beneficiaries, livestock, and distribution activities through a centralized dashboard. The platform streamlines administrative workflows by integrating QR Code validation, WhatsApp notifications, AI-assisted features, and automated document generation into a single system.

Developed as an academic project, this application focuses on improving efficiency, reducing manual administrative work, and providing a more organized and transparent Qurban management process.

---

## Features

### Dashboard & Management

* Administrative dashboard
* Participant management
* Beneficiary management
* Livestock management
* Distribution management
* Real-time statistics and analytics

### QR Code System

* Automatic QR Code generation
* QR Code scanning and validation
* Digital voucher verification
* Distribution tracking

### Communication & Automation

* WhatsApp notification integration using Fonte
* Automated participant updates
* Distribution status notifications
* Streamlined administrative workflow

### AI-Assisted Features

* AI-assisted administrative support using Google AI Studio
* Automated content generation for administrative tasks
* Faster information processing for committee members

### Reporting

* PDF receipt generation
* Digital certificates
* Printable reports
* Dashboard analytics

---

## Tech Stack

### Frontend

* React 19
* Vite
* Tailwind CSS
* Framer Motion

### Backend

* Node.js
* Express

### Services

* Google AI Studio
* WhatsApp Gateway (Fonte)

### Libraries

* Recharts
* html5-qrcode
* jsPDF
* html2canvas
* Lucide React

---

## System Architecture

```text
Participants & Beneficiaries
             │
             ▼
     Qurban Management System
             │
 ┌───────────┼──────────────┬──────────────┐
 │           │              │              │
 ▼           ▼              ▼              ▼
QR Code   Google AI     PDF Generator   WhatsApp
Validation   Studio                         Gateway
 │                                           │
 └─────────────────── Dashboard ─────────────┘
```

---

## My Responsibilities

This project was developed independently, covering both interface design and application implementation.

My responsibilities included:

* Designing and developing the complete user interface.
* Building the administrative dashboard.
* Developing participant, beneficiary, livestock, and distribution management features.
* Implementing QR Code generation and scanning for digital validation.
* Integrating Google AI Studio to support AI-assisted administrative features.
* Integrating WhatsApp Gateway (Fonte) for automated notifications.
* Developing dashboard analytics and reporting features.
* Implementing PDF generation for receipts and certificates.
* Connecting frontend components with backend services.
* Testing and refining application workflows to improve usability and reliability.

---

## Challenges

One of the biggest challenges during development was integrating multiple external services into a unified workflow.

The application combines Google AI Studio, WhatsApp Gateway, QR Code validation, and PDF generation while ensuring that each feature works seamlessly together. Designing an intuitive workflow for committee members without increasing operational complexity was another important consideration throughout the project.

Developing this system provided valuable experience in integrating third-party services, building administrative dashboards, and designing digital solutions for real-world operational processes.

---

## Running the Project

### Prerequisites

* Node.js 18 or later
* npm

### Setup

Install project dependencies.

```bash
npm install
```

Configure the required environment variables.

```bash
cp .env.example .env
```

Update the environment file with your project credentials, including the required API keys.

Start the development server.

```bash
npm run dev
```

---

## Future Improvements

Potential future enhancements include:

* Payment gateway integration.
* Multi-role user management.
* Real-time inventory tracking.
* Mobile application support.
* Advanced reporting and analytics.
* Exportable financial reports.
* Email notification support.

---

## Project Status

Academic Project

Developed as a full-stack web application to modernize Qurban administration by integrating digital workflows, automation, and third-party services into a single management platform.
