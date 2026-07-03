# 🤖 AI Inventory Management Agent

A modern, intelligent inventory management system built with Next.js and powered by **Google Gemini 2.5 Flash**. Users can manage their stock, check quantities, and update inventory entirely through a conversational AI interface, with real-time sync to a live dashboard via Firebase Firestore.

## ✨ Key Features

- **Conversational Interface**: Chat naturally with the AI to add, remove, or query inventory (e.g., *"We just received 50kg of coffee beans"*, *"How much sugar is left?"*).
- **Real-time Dashboard**: Instantly see stock levels update without reloading the page, powered by Framer Motion animations and a glassmorphic UI.
- **AI Tool Orchestration**: Uses the Vercel AI SDK to grant the LLM direct, controlled access to read and write from the database.
- **Unit Conversion**: The AI can dynamically convert units (e.g., kg to lbs) upon request without changing the underlying database.
- **Cloud Database**: Persistent, real-time data storage using Firebase Firestore.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + Framer Motion
- **AI Orchestration**: [Vercel AI SDK](https://sdk.vercel.ai/docs) (`@ai-sdk/react`, `@ai-sdk/google`)
- **LLM**: Google Gemini 2.5 Flash
- **Database**: Firebase Firestore (`firebase-admin`)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/inventory-management-ai-agent.git
cd inventory-management-ai-agent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory and add the following keys. You will need a Google AI Studio API key and a Firebase Service Account key.

```env
# Gemini API Key (Get from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Admin Credentials (Get from Firebase Console -> Project Settings -> Service Accounts)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

> **Note:** Ensure your `FIREBASE_PRIVATE_KEY` is wrapped in quotes and contains literal `\n` characters for newlines.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🌐 Deployment (Vercel)

This project is optimized for deployment on Vercel. 

1. Push your code to GitHub.
2. Import the project in Vercel.
3. In the Vercel Dashboard, go to **Settings > Environment Variables**.
4. Add all the keys from your `.env` file.
5. Deploy!

*Note: Since Vercel Serverless Functions cannot read local files, this project uses environment-variable-based initialization for the Firebase Admin SDK.*
