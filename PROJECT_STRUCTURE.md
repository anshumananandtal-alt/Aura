# Project Structure

This project follows a modular React + TypeScript architecture with clear separation between UI components, hooks, utilities, and type definitions.

## Root files

- `package.json` — project dependencies and scripts.
- `vite.config.ts` — Vite application bundling config.
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` — TypeScript configuration.
- `eslint.config.js` — linting rules for the project.
- `README.md` — project overview and setup instructions.

## src/

- `src/App.tsx` — application shell that composes panels, manages editor state, and provides drag/drop logic.
- `src/main.tsx` — application entry point that renders the React app and imports global styles.
- `src/types.ts` — shared TypeScript types for canvas items, editor state, preview mode, and component props.
- `src/hooks/useHistoryState.ts` — reusable custom hook for undo/redo state management.
- `src/lib/htmlSerializer.ts` — serialization utility that converts canvas state into safe HTML output.
- `src/components/PalettePanel.tsx` — palette UI for component insertion.
- `src/components/CanvasPanel.tsx` — canvas rendering and item interactions.
- `src/components/PropertiesPanel.tsx` — live style controls, preview mode switches, and HTML export actions.

## Styling

- `src/App.css` — component-specific styles for the app shell, canvas, panels, and preview.
- `src/index.css` — global CSS reset, base typography, and body styling.

## Architecture principles

- Reusability: core editor state and history logic are isolated from visual components.
- Separation of concerns: UI panels handle rendering and interaction while `App.tsx` manages orchestration.
- Type safety: all shared data shapes are expressed in `src/types.ts`.
- Responsiveness: Bootstrap grid and custom CSS ensure the interface adapts across device widths.
