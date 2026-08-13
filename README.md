# Aura — No-Code Content Editor

Aura is a modern, responsive no-code editor built with React, TypeScript, Vite, Bootstrap, and MUI.
It enables users to drag components onto a canvas, edit styles in real time, preview desktop and mobile layouts, and export clean HTML.

## Key Features

- Drag-and-drop component palette
- Live canvas editing with selection and movement
- Editable text, image, button, and textarea components
- Real-time style editing via the properties panel
- Undo / redo history using a reusable hook
- Desktop and mobile preview modes
- Clipboard HTML export
- Persistent editor state in `localStorage`
- Responsive interface with Bootstrap + MUI

## Technology Stack

- React 19
- TypeScript 6
- Vite
- Bootstrap 5
- React-Bootstrap
- MUI 5
- ESLint

## Setup

```bash
npm install
npm run start
```

Open the local development URL shown by Vite.

## Project Structure

- `src/App.tsx` — app shell, editor state, drag/drop behavior, and panel composition
- `src/components/PalettePanel.tsx` — palette UI for inserting canvas components
- `src/components/CanvasPanel.tsx` — canvas rendering, item interactions, and drag ghost UI
- `src/components/PropertiesPanel.tsx` — selected item style and preview controls
- `src/hooks/useHistoryState.ts` — undo/redo history hook with past/present/future state
- `src/lib/htmlSerializer.ts` — safe HTML generation for preview and export
- `src/types.ts` — shared canvas item and editor state types

## UI Design

The application uses Bootstrap grid layout for responsive columns and MUI components for polished controls and interactions.
Panels are designed to adapt cleanly from desktop to mobile widths.

## Documentation

- `PROJECT_STRUCTURE.md` — detailed source tree and module responsibilities
- `ARCHITECTURE.md` — architecture overview with Mermaid component diagram
- `CHAT_HISTORY.md` — task summary and session notes

## Notes

- The editor persists state automatically to preserve user work between refreshes.
- The live preview updates immediately whenever canvas items change.
- The codebase is modular and ready for future extension with new components and styling panels.
