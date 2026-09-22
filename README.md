# Zendo – Productivity & Task Management App

Zendo is a productivity and task management project designed to help users
organize daily tasks, notes, events, categories, and focused work sessions
through a clean and interactive interface.

The repository contains a React/TypeScript web application and an Android
application built with Kotlin.

## ✨ Features

- Task management
- Task priorities, categories, tags, due dates, and subtasks
- Dashboard for productivity overview
- Calendar and event management
- Notes management
- Focus / Pomodoro timer
- Category and folder organization
- Authentication flow
- AI-powered assistant for productivity tasks
- AI-assisted creation of tasks, events, notes, and folders
- Responsive and animated user interface

## 🛠️ Tech Stack

### Web Application

- React
- TypeScript
- Vite
- Express.js
- Node.js
- Tailwind CSS
- Motion
- Lucide React
- Google Gemini API

### Android Application

- Kotlin
- Android SDK
- AndroidX
- Material Components
- RecyclerView
- Room Database
- View Binding
- Lifecycle / ViewModel
- Gradle

## 📁 Project Structure

```text
zendo-task-manager/
│
├── app/                     # Android application
│   └── src/main/
│       ├── java/
│       └── res/
│
├── src/                     # React / TypeScript application
│   ├── components/
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
│
├── server.ts                # Express + Vite server and AI API
├── package.json             # Web dependencies and scripts
├── build.gradle.kts         # Android/Gradle configuration
├── settings.gradle.kts
├── .env.example             # Environment variable template
└── README.md