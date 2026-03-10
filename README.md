# Auralis
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/PheonixCodder/auralis)

Auralis is an open-source, AI-powered customer support platform. It provides businesses with an embeddable chat widget that facilitates intelligent conversations through text and voice, backed by a powerful operator dashboard and a flexible knowledge base.

## Key Features

- **AI-Powered Support**: Leverages an AI agent (built with Convex Agent and AI SDK) to answer user queries by searching a knowledge base.
- **Embeddable Widget**: A lightweight, customizable widget that can be easily embedded into any website using a simple script tag.
- **Voice Assistant Integration**: Seamlessly integrates with Vapi to provide AI-powered voice conversations directly within the widget.
- **Knowledge Base (RAG)**: Upload documents (PDFs, text files) to create a searchable knowledge base that the AI uses to provide accurate answers.
- **Operator Dashboard**: A comprehensive web application for operators to manage live conversations, handle escalations, customize the widget, and manage knowledge base files.
- **Multi-Tenancy**: Built-in support for multiple organizations and teams using Clerk for authentication and authorization.
- **Monorepo Architecture**: A clean, scalable project structure using Turborepo for efficient development and dependency management.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Jotai
- **Backend**: Convex (Serverless Backend Platform)
- **Authentication**: Clerk
- **AI**: Vercel AI SDK, OpenAI, Convex Agent, Convex RAG
- **Voice**: Vapi
- **Tooling**: Turborepo, Bun, Vite, Sentry

## Getting Started

### Prerequisites

- Node.js (>= 20.x)
- Bun (>= 1.3.x)
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account

### 1. Clone the Repository

```bash
git clone https://github.com/PheonixCodder/auralis.git
cd auralis
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set up Environment Variables

Create a `.env` file in the root of the project and add the following environment variables. You can obtain these from your Convex and Clerk dashboards.

```env
# Convex environment variables
CONVEX_DEPLOY_KEY="your_convex_deploy_key"
NEXT_PUBLIC_CONVEX_URL="your_convex_project_url"

# Clerk environment variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"

# This should be the "Issuer URL" from the JWT template you created for Convex in your Clerk dashboard
CLERK_JWT_ISSUER_DOMAIN="your_clerk_jwt_issuer_domain"

# Sentry (Optional)
SENTRY_AUTH_TOKEN="your_sentry_auth_token"
```

### 4. Set up the Convex Backend

Push the backend schema and functions to your Convex project.

```bash
npx convex dev
```

When prompted, follow the instructions to connect the CLI to your Convex project. The command will keep running to sync your files.

### 5. Run the Project

In a new terminal window, run the development server for all applications:

```bash
bun dev
```

- The main dashboard will be available at `http://localhost:3000`.
- The widget will be available at `http://localhost:3001`.

## Project Structure

Auralis is a monorepo managed by Turborepo.

-   **`apps/`**
    -   **`web`**: The main dashboard application where operators can manage conversations, files, integrations, and customize the widget.
    -   **`widget`**: The customer-facing chat interface that gets embedded on external sites. It handles authentication, chat, and voice calls.
    -   **`embed`**: A Vite project that compiles the `embed.ts` script into a single Javascript file (`widget.js`) for easy embedding.

-   **`packages/`**
    -   **`backend`**: Holds all the Convex backend logic. This includes the database schema, queries, mutations, and actions for managing conversations, users, AI agents, and integrations.
    -   **`ui`**: A shared React component library based on shadcn/ui, used by both the `web` and `widget` apps.
    -   **`eslint-config` & `typescript-config`**: Shared configurations to ensure consistent code quality and style across the monorepo.

## How It Works

### Widget Embedding

The `apps/embed` project builds a simple JavaScript file. When included on a website, this script creates an iframe that loads the `apps/widget` application. It handles the creation of the floating action button and communication between the host page and the widget iframe.

### Conversation Flow

1.  A user on an external website interacts with the widget.
2.  If it's their first time, they are prompted for their name and email, which creates a `contactSession` in the Convex backend. This session is stored locally to persist their identity.
3.  When a new chat is started, a `conversation` and an associated `thread` are created.
4.  Messages from the user are sent to the AI `supportAgent`.
5.  The agent uses tools like `searchTool` to query the knowledge base (built with Convex RAG) or `escalateConversationTool` to flag the conversation for a human operator.

### Operator Dashboard

The `apps/web` dashboard provides a real-time view of all conversations. Operators can:
- View ongoing and past conversations.
- Take over conversations escalated by the AI.
- Send messages directly to customers.
- Manage knowledge base files, integrations with services like Vapi, and customize the widget's appearance and behavior.
