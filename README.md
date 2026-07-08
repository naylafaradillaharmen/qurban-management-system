# Qurban Management System

## Overview
The Qurban Management System is a comprehensive web-based application designed to streamline and manage the entire workflow of the Qurban process. From registration to distribution, this application provides an intuitive dashboard for administrators and stakeholders to track progress, manage logistics, and ensure transparency.

## Key Features
- **Dashboard & Analytics:** Visual representations of Qurban data, including livestock statistics, participant demographics, and financial summaries using Recharts.
- **Smart QR Code Integration:** Built-in QR code generation and scanning (via html5-qrcode) to track livestock, distribution vouchers, and participant registration seamlessly.
- **Automated Document Generation:** Generate downloadable PDF certificates and receipts dynamically using jsPDF and html2canvas.
- **AI-Powered Insights:** Integrated with Google Gemini AI to assist with predictive analytics, data summarization, and automated reporting.
- **Fluid UI/UX:** Smooth animations and transitions powered by Framer Motion, with responsive styling through Tailwind CSS.

## Technology Stack
- **Frontend Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Backend Service:** Express + Node.js (via tsx)
- **AI Integration:** Google GenAI SDK
- **Icons & UI:** Lucide React

## Prerequisites
Ensure you have the following installed on your local environment:
- Node.js (v18.x or newer recommended)
- npm package manager

## Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```

2. Install dependencies
```bash
npm install
```

3. Environment Configuration
Copy the example environment file and update it with your credentials:
```bash
cp .env.example .env
```
Ensure you provide a valid `GEMINI_API_KEY` in your `.env` file for the AI features to function properly.

4. Start the Development Server
```bash
npm run dev
```
This will start the development environment.

## Production Build

To build the application for production deployment, run:
```bash
npm run build
```
This command compiles the React frontend and bundles the Express backend server into the `dist` directory. You can test the production build locally by running:
```bash
npm start
```

## Contributing
Contributions to improve the Qurban Management System are highly encouraged. Please follow standard pull request workflows:
1. Fork the project.
2. Create a feature branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License.
