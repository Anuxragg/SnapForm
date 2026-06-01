# ⚡ SnapForm Studio

> A premium, high-fidelity developer workspace and SaaS compilation engine designed to eliminate form boilerplate. Compile beautiful, type-safe React forms, Zod validation models, and Next.js backend API routes with a single click.

---

## 🚀 The Three-Layer Architecture

SnapForm doesn't just build UI; it compiles complete full-stack form pipelines directly into a downloadable structure:

```
📁 form-bundle.zip/
├── ⚛ FormComponent.tsx   # React Frontend Component (Tailwind UI + React Hook Form)
├── 🛡 schema.ts          # Zod Validation Schema (Type safety declarations)
└── ⚡ route.ts           # Next.js Route Handler (Secure server-side API endpoint)
```

---

## ✨ Features

* **⚡ Interactive Studio Builder (`/builder`)**: Customize input fields, toggle validation constraints, and choose form aesthetics in real-time.
* **🎨 Premium Visual Themes**: Switch styles instantly with design layouts:
  * **Modern Glassmorphism**: Translucent backdrops, ambient shadows, and vibrant glowing border states.
  * **Stark Minimalist**: Clean monochrome aesthetics, fine border lines, and sophisticated typography.
  * **Business Corporate**: Professional rigid borders, high contrast ratios, and structural solid styling.
* **📊 Developer Dashboard (`/dashboard`)**: Save, manage, edit, and duplicate your compiled form packages under a secure profile.
* **🛡 Full-Stack Zod Verification**: Real-time TypeScript schema generations supporting strict type inference (`z.infer<typeof FormSchema>`) shared between client and server layers.
* **🔐 Built-in Authentication**: Custom state management, silent session restoration, and secure password encryption using MongoDB.

---

## 🛠 Tech Stack

* **Framework**: [Next.js App Router](https://nextjs.org/) (React 18+)
* **Styling**: Vanilla [Tailwind CSS](https://tailwindcss.com/) with a curated Sand-Charcoal brand palette
* **State & Form Management**: [React Hook Form](https://react-hook-form.com/) & [@hookform/resolvers](https://github.com/react-hook-form/resolvers)
* **Validation Schema**: [Zod](https://zod.dev/)
* **Database & Authentication**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) with cookie-based session handling
* **Visual Assets**: [Lucide React Icons](https://lucide.dev/) & [Sonner Toasts](https://sonner.dev/)

---

## 📂 Project Directory Structure

```
SnapForm/
├── app/                  # Next.js App Router Paths
│   ├── api/              # Core API Endpoints
│   │   ├── auth/         # Login, Signup, and Silent Session verification routes
│   │   ├── generate/     # AI / prompt-driven form generation
│   │   └── templates/    # Developer saved templates CRUD endpoints
│   ├── builder/          # SnapForm Studio (Main visual workspace)
│   ├── dashboard/        # Dev Console (Template manager)
│   ├── docs/             # Documentation Center & Integration Guides
│   └── page.tsx          # High-impact landing page featuring active terminal demos
├── components/           # Custom Reusable React Elements
│   ├── auth/             # Secure Auth modals & state boundaries
│   ├── form-builder/     # Main workspace components (Preview, Customizers, Output)
│   └── ui/               # Core design system tokens (buttons, inputs, badges)
├── lib/                  # Helper classes, database connections, and validation bridges
├── models/               # MongoDB / Mongoose Mapped Data Schemas
└── public/               # Static media, icons, and logo assets
```

---

## 🏁 Quickstart Guide

Follow these steps to run SnapForm Studio locally in development mode:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18.x or greater) and a running [MongoDB](https://www.mongodb.com/) instance (either local or MongoDB Atlas cloud cluster).

### 2. Clone the Repository
```bash
git clone https://github.com/Anuxragg/FormCraft.git
cd SnapForm
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create a `.env.local` or `.env` file in the root directory:
```env
# MongoDB Connection URI (Local or Atlas)
MONGODB_URI=mongodb://localhost:27017/snapform
```

### 5. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to experience SnapForm.

---

## 📦 Deployment

The project is structured for effortless hosting on the Vercel cloud platform:

1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Configure the `MONGODB_URI` environment variable inside your project settings.
3. Deploy! Vercel will automatically build the Next.js target build and serve your API serverless handlers.
