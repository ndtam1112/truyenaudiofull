# Story Architecture Starter

Next.js App Router starter built with TypeScript and TailwindCSS, structured for scalability with a clean-architecture split between routes, application logic, domain models, and infrastructure.

## Stack

- Next.js 16 with App Router
- TypeScript
- TailwindCSS 4
- Metadata API for SEO

## Routes

- `/` home page
- `/stories/[storySlug]` story detail page
- `/stories/[storySlug]/chapters/[chapterSlug]` chapter detail page

## Folder Structure

```text
app/
  layout.tsx
  page.tsx
  stories/
    [storySlug]/page.tsx
    [storySlug]/chapters/[chapterSlug]/page.tsx
src/
  features/
    stories/
      application/
      domain/
      infrastructure/
      presentation/
  shared/
    config/
    lib/
```

## Clean Architecture Notes

- `app/` contains route entry points and route-level metadata.
- `application/` contains use cases that orchestrate the feature.
- `domain/` contains entities and repository contracts.
- `infrastructure/` contains the in-memory repository and example data source.
- `presentation/` contains reusable UI views and components.
- `shared/` contains cross-cutting configuration and metadata helpers.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Check

```bash
npm run lint
npm run build
```

## SEO Setup

- Global metadata is defined in `app/layout.tsx`.
- Route-specific metadata is defined with `metadata` and `generateMetadata`.
- Update `src/shared/config/site.ts` with your production domain and site copy before deployment.
