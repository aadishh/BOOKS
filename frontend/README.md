# Bookstore Frontend - Next.js

This is a Next.js 14+ application with TypeScript, migrated from React.

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Context API** - State management

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (authenticated)/    # Protected routes
│   │   │   ├── books/
│   │   │   ├── cart/
│   │   │   ├── contact/
│   │   │   ├── myBook/
│   │   │   ├── profile/
│   │   │   ├── admin/
│   │   │   └── layout.tsx
│   │   ├── login/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/             # React components
│   │   ├── admin/
│   │   ├── Books/
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Profile/
│   │   ├── SingleBook/
│   │   └── ...
│   ├── context/                # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── GlobalContext.tsx
│   │   └── Providers.tsx
│   ├── lib/                    # Utilities
│   │   ├── api.ts             # API functions
│   │   ├── constants.ts       # Constants
│   │   └── helpers.ts         # Helper functions
│   └── types/                  # TypeScript types
│       └── index.ts
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Features

- **Authentication** - Login/Signup with JWT
- **Book Browsing** - View and search books
- **User Profile** - Manage user information
- **Shopping Cart** - Add books to cart
- **Admin Panel** - Upload new books
- **Responsive Design** - Mobile-friendly UI

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://bookstore-backend-gyz6.onrender.com
```

## Key Differences from React

1. **File-based Routing** - Pages are created in `app/` directory
2. **Server Components** - Components are server-side by default (use `'use client'` for client components)
3. **Image Optimization** - Use `next/image` instead of `<img>`
4. **Link Component** - Use `next/link` for navigation
5. **API Routes** - Can create API endpoints in `app/api/`

## TypeScript Types

All types are defined in `src/types/index.ts`:
- User types
- Book types
- Form data types
- API response types
- Context types

## API Integration

API functions are in `src/lib/api.ts`:
- `getBooks()` - Fetch all books
- `loginUser()` - User login
- `signUpUser()` - User registration
- `profileBuild()` - Update profile
- `uploadBook()` - Upload new book

## Deployment

Deploy to Vercel:

```bash
npm run build
```

Or use the Vercel CLI:

```bash
vercel
```
