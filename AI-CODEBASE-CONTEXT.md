# System Context: Truyện Audio Full Project

This file serves as a high-level overview of the "Truyện Audio Full" codebase to help Large Language Models and AI Assistants quickly understand the architecture, stack, and layout.

## 1. Project Overview
This project is a web application for reading and listening to audio stories. It comprises a frontend built on Next.js 16 and a backend powered by PostgreSQL & Prisma ORM. A key aspect of the project is its extensive data scraping (crawler) capabilities, which automatically extract story contents and chapters from other websites.

## 2. Tech Stack
- **Framework:** Next.js 16.2 (using App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **Database & ORM:** PostgreSQL + Prisma (`@prisma/client` v6.19)
- **Scraping Tools:** Cheerio, Axios
- **External Services:** Cloudinary (for image management)

## 3. Directory Structure

- **/app**: Contains Next.js App Router definitions.
  - Appears to have routing for homepage `/`, categories `/the-loai`, and specific story views `/truyen/[slug]` or `/stories/[slug]`.
- **/components**: Shared React presentational components (e.g., `header.tsx`, `story-card.tsx`, `hero-banner.tsx`, `search-bar.tsx`).
- **/lib**: Core back-end libraries, services, and data access objects.
  - `prisma.ts`: Centralizes PrismaClient initialization.
  - `stories.ts`: Holds abstractions for querying logic interacting with Prisma (fetching stories, chapters).
  - `crawler-*.ts`: Main crawling abstraction files (handling logic on how to parse texts).
  - `cloudinary.ts`: Cloudinary utilities.
- **/prisma**: Prisma Database Schema and migrations.
  - `schema.prisma`: The blueprint of the DB.
- **/scripts**: Standalone Node `mjs` files used to orchestrate site-wide or single-story crawls (e.g., `crawl-site-v3.mjs`, `crawl-one-story.mjs`). These are typically executed via `npm run`.

## 4. Key Database Models (`schema.prisma`)
- `story`: Represents a fiction/book. Contains `id, title, slug, sourceUrl, description, cover, author, status`.
- `chapter`: A chapter of a `story`. Contains `id, storyId, sourceUrl, chapterNumber, title, content`. Notably it also tracks `audioUrl` and `videoUrl` for audio/video playback capabilities. 
- `genre`: Represents a category.
- `storyGenre`: Many-to-many relationship junction between `story` and `genre`.

## 5. Important Scripts (from `package.json`)
- `dev`: `next dev` - Starts the development server.
- `crawl:site`: Executes the main site crawler scripts (v3).
- `crawl:story`: Crawls a single story specifically.
- `prisma:generate`: Updates Prisma client after schema changes.
- `prisma:migrate`: Pushes schema DB changes to the active database.

> *Note to AI Assistants: When implementing changes that interact with Database structure, always modify `prisma/schema.prisma` primarily and instruct the user to run Prisma migration commands. Read the `lib/stories.ts` for database fetching operations.*
