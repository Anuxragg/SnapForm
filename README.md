# SnapForm

SnapForm is a web app for building, validating, and hosting forms without having to hand-write the usual form boilerplate. Create forms in the visual builder, generate a ready-to-use React component and Zod schema, then save, host, and monitor submissions from your dashboard.

## What you can do

- **Build forms visually** — configure fields, validation, appearance, and form settings in the builder.
- **Generate usable code** — export a ZIP containing a React form component, a Zod schema, and a Next.js route handler. AI-assisted generation is optional; the core generator works without an AI key.
- **Save and manage forms** — create and edit form templates in your dashboard.
- **Host forms and collect responses** — use hosted form pages and submission endpoints, with server-side validation and spam/rate-limit protections.
- **Review submissions and analytics** — inspect responses, view form activity, and export submissions as CSV.
- **Manage an account** — sign up and sign in with email verification, reset passwords, and optionally configure Google or GitHub OAuth.

## Tech stack

- [Next.js](https://nextjs.org/) 16 App Router and React 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [MongoDB](https://www.mongodb.com/) with Mongoose
- [Zod](https://zod.dev/) and [React Hook Form](https://react-hook-form.com/)
- [Upstash Redis](https://upstash.com/) for shared production rate limits

## Run locally

### Requirements

- Node.js compatible with Next.js 16
- A MongoDB database (local or MongoDB Atlas)
- An SMTP account for email verification and password reset

### Setup

```bash
git clone https://github.com/Anuxragg/SnapForm.git
cd SnapForm
npm install
```

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/snapform
SESSION_SECRET=replace-with-a-long-random-secret

# Email verification and password reset
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password
SMTP_FROM=SnapForm <your-email@example.com>

# Shared rate limits (configure for production and multi-instance hosting)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Optional: AI-assisted code generation
GEMINI_API_KEY=your-gemini-api-key

# Optional: Google and GitHub sign-in
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Optional: canonical public URL, useful for OAuth and email links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate a strong session secret, for example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`MONGODB_URI` and `SESSION_SECRET` are required. Configure SMTP to enable email verification and password reset. Configure Upstash Redis for persistent, shared rate limits in production; local development can use the in-memory fallback. The Gemini and OAuth variables are optional.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Useful routes

| Route | Description |
| --- | --- |
| `/` | Product landing page |
| `/builder` | Visual form builder and code generation |
| `/dashboard` | Saved forms, submissions, and analytics |
| `/docs` | Documentation and integration guidance |
| `/form/[formId]` | Hosted public form |
| `/login` and `/signup` | Account access |

## Commands

```bash
npm run dev     # Start the local development server
npm run build   # Create a production build
npm run start   # Serve the production build
npm run lint    # Run ESLint
```

## Deployment

SnapForm can be deployed to Vercel or another platform that supports Next.js. Set the required environment variables in the deployment environment, use a reachable MongoDB database, and configure Upstash Redis for shared rate limiting across serverless instances. Add SMTP credentials to enable verification and password-reset emails. Set OAuth callback URLs to your deployed domain when enabling Google or GitHub sign-in.
