---
name: react-frontend-guidelines
description: AI-focused guide for frontend (React, UI, CSS, themes)
applyTo: '**/src/**'
---

# React Frontend Guidelines

## Principles

- Use Convex hooks (`useQuery`, `useMutation`, `useSubscription`) for all data access.
- Avoid `useEffect` for fetching/syncing state if Convex hooks suffice.
- Minimize manual state management unless necessary.
- Use real-time updates via Convex subscriptions where possible.

## Styling (Tailwind)

- Prefer utility-first Tailwind classes over inline styles.
- Keep classes readable, maintainable, and composable.
- Ensure responsive design with Tailwind breakpoints.
- Avoid flashy, non-functional aesthetics (e.g., "AI purple gradient").

## Semantic HTML & Accessibility

- Use semantic elements: `<main>`, `<header>`, `<nav>`, `<section>`, `<article>`, `<button>`, `<form>`, `<label>`.
- Avoid "div soup" unless necessary.
- Ensure keyboard navigability for all interactive elements.
- Apply ARIA roles only when semantic HTML is insufficient.
- Meet WCAG AA color contrast standards.
- Support screen readers with proper labels and focus management.

## Modern React Patterns

- Favor composition over inheritance or HOCs.
- Use hooks and context for state management.
- Avoid unnecessary `useEffect`:
  - Never use for data fetching if Convex hooks provide reactive state.
  - Use only for non-Convex side effects (analytics, localStorage, manual subscriptions).
- Optimize for minimal re-renders and maintainable logic.
- Use React suspense and lazy loading for code splitting when appropriate.

## Design & Usability

- Prioritize functional, user-centered design.
- Avoid non-functional "AI-style" visual gimmicks (purple gradients, glows, glass effects).
- Focus on clarity, readability, and accessibility over decoration.
- Make components self-contained, reusable, and composable.

## Full-Stack Awareness

- Write code aware of backend performance and real-time data flow in Convex.
- Consider scalability, maintainability, and separation of concerns.
- Support responsive layouts, accessibility, and mobile-first design by default.

## AI Behavior Guidelines

- Default to semantic HTML and accessibility-first thinking.
- Always prefer Convex hooks over manual state syncing.
- Minimize unnecessary React hooks, especially `useEffect`.
- Keyboard-first and screen-reader accessible code is mandatory.
- Tailwind usage should be composable, maintainable, and responsive.
- Avoid visual clichés; favor clean, functional design.
- When unsure, prioritize accessibility, maintainability, and clarity.
