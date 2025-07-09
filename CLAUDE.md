# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application called "dealsletter-platform" built with TypeScript and Tailwind CSS v4. The project follows the modern Next.js App Router structure and is configured for development with Turbopack.

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Development Server
The dev server runs on `http://localhost:3000` by default with Turbopack enabled for faster builds.

## Project Structure

```
src/
├── app/                 # App Router directory
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Home page component
│   ├── globals.css     # Global CSS with Tailwind imports
│   └── favicon.ico     # App favicon
```

## Tech Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono (Google Fonts)
- **Linting**: ESLint with Next.js configuration
- **Build Tool**: Turbopack (development)

## Key Configuration

### TypeScript
- Path mapping: `@/*` maps to `./src/*`
- Strict mode enabled
- Next.js plugin configured

### Tailwind CSS
- Uses new v4 syntax with `@import "tailwindcss"`
- Theme customization via CSS variables
- Dark mode support via `prefers-color-scheme`

### ESLint
- Extends `next/core-web-vitals` and `next/typescript`
- Uses flat config format with compatibility layer

## Development Notes

- The app uses React 19 with Next.js 15
- Font optimization is handled via `next/font/google`
- CSS custom properties define theme colors with dark mode support
- All components should be placed in appropriate directories under `src/app/`
- The project uses absolute imports via the `@/` alias