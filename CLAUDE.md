# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prodom is a real estate listing application for apartment complexes in Kazakhstan (Astana area). The app displays apartment listings with filtering capabilities and includes an admin panel for managing listings. Data is stored in Firebase Firestore.

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Tech Stack

- **React 19** with Vite 7
- **React Router DOM** for client-side routing
- **Firebase Firestore** for database
- **Tailwind CSS** for styling
- **ESLint** with React hooks and refresh plugins

## Architecture

### File Structure

```
/
├── src/
│   ├── App.jsx          # Main app with routes, filters, and list/detail views
│   ├── main.jsx         # Entry point
│   ├── index.css        # Global styles (Tailwind directives)
│   └── components/      # Unused sample filter component
├── AdminPanel.jsx       # Admin interface for CRUD operations
├── fetcher.jsx          # useApartments() hook for fetching data
├── firebase.js          # Firebase configuration and Firestore instance
```

### Key Components

- **App.jsx**: Contains the main application logic including:
  - `useFilters()` hook - manages all filter state (district, price, payment methods, etc.)
  - `SidebarFilters` - filter UI component
  - `Card` - apartment listing card with inline comment editing
  - `ListPage` / `DetailPage` - list and detail views
  - Routes: `/` (list), `/:id` (detail), `/admin` (admin panel)

- **AdminPanel.jsx**: Standalone admin interface for:
  - Adding new apartment listings
  - Deleting listings
  - Generating test data (20 random cards)

- **fetcher.jsx**: Exports `useApartments()` hook that fetches from Firestore `cards` collection

### Data Model

Apartments are stored in Firestore `cards` collection with Russian field names:
- `Название` (name), `Район` (district), `Класс` (class), `Цена` (price)
- `Способы` (payment methods array), `готов` (ready status), `срок_сдачи` (completion date)
- `Паркинг`, `Коммерция`, `Состояние`, `Этажность`, `Потолок`, etc.

### Filter Options (hardcoded in App.jsx)

- Districts: Зеленый квартал, Талдыкол, Экспо, Мечеть, Нурлы жол, etc.
- Construction types: кирпич, монолит
- Classes: стандарт, комфорт, комфорт+, бизнес
- States: Черновая, Улучшенная черновая, Предчистовая, Чистовая
- Payment options: ст.Ипотека, Отбасы 30/70, Рассрочка, Trade in, etc.

## Notes

- UI text is in Russian
- Some files at root level (AdminPanel.jsx, fetcher.jsx, firebase.js) are imported from src/ using relative paths (`../`)
- Firebase config is hardcoded in firebase.js (consider using environment variables)
