# Project: Pegah Product Editor

## Overview
- **Type**: Next.js client-review catalog with inline editing
- **Stack**: Next.js 16, React 19, Tailwind v4, TypeScript, Airtable SDK, Axios, CVA
- **Package Manager**: bun
- **Started**: 2026-05-05

## Architecture Decisions
- Airtable is single source of truth. Page uses `force-dynamic` to always read fresh data.
- Inline editing via `contentEditable` + debounced PATCH (`/api/products/[handle]`) — no forms, no submit button.
- Server-only Airtable access. PAT never exposed to client. API route validates field whitelist.
- Images live in `public/product-pictures/{section-dir}/{handle}/{filename}`.
- Section dirs: engraving → engraving, Gemstone → gemstone, For Him → men, Name Necklaces → named, Pearl → pearl.

## Preferences & Rules
- oklch only for all colors — no hex, no rgb
- Tailwind v4 `@theme` block in globals.css — all tokens defined there
- CVA for all primitive components (Button etc.)
- axios not fetch for HTTP
- No comments unless WHY is non-obvious
- bun not npm
- Locality of behavior: feature code in `app/_components`, `app/_lib`, `app/_types`; only truly shared code in root `components/`, `lib/`

## Patterns & Conventions
- `EditableField` — single reusable component for all editable fields. Pass `field`, `handle`, `value`, `as`.
- Tags stored in Airtable as comma-separated string, parsed to string[] in `parseProduct`.
- Section assigned by tag priority: Engraving > For Him > Name Necklaces > Green Pearl (→Pearl) > Gemstone.

## Learnings & Corrections
- ❌ Started writing Next.js files in docs/ folder → ✅ always work in pegah-product-editor/

## Dependencies & Tooling
- `airtable` ^0.12.2 — Airtable SDK (server-side only)
- `axios` ^1.x — HTTP client
- `class-variance-authority` ^0.7.1 + `clsx` + `tailwind-merge` — primitive components
- Seed script: `bun run seed` — reads `../docs/shopify-products.csv`, upserts to Airtable

## Component Registry
- `app/_components/header.tsx` — sticky dark header with brand + product count
- `app/_components/section-nav.tsx` — horizontal section anchor nav
- `app/_components/product-card.tsx` — card with image gallery + editable fields
- `app/_components/editable-field.tsx` — contentEditable + debounced Airtable PATCH
- `components/button.tsx` — CVA button primitive

## API & Data Layer
- `GET /` — server-side renders all products grouped by section from Airtable
- `PATCH /api/products/[handle]` — updates title/description/type/tags in Airtable
- Airtable table: `Products` — fields: handle, section, title, description, type, tags, primaryImage, thumbs, order

## Current State
- ✅ Project scaffolded with all components, API route, seed script
- ✅ Images copied to public/product-pictures/
- ⏳ Need: create Airtable base, set env vars, run seed, then `bun dev`
- ⏳ Deploy to Vercel after local verification
