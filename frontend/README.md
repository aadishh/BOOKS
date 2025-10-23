# BookStore Frontend

A modern, responsive Next.js frontend for the BookStore microservices backend.

## 🚀 Features

- **Responsive Design**: Works seamlessly on all devices (mobile, tablet, desktop)
- **Modern UI**: Built with Tailwind CSS and custom components
- **Authentication**: Login/signup with 2FA support
- **Shopping Cart**: Add, update, remove items with real-time updates
- **Wishlist**: Save books for later and move to cart
- **Book Search**: Advanced search with filters and pagination
- **Admin Panel**: User management and analytics (for admin users)
- **Real-time Notifications**: Toast notifications for user feedback

## 🛠 Tech Stack

- **Next.js 14** - React framework with SSR/SSG
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **React Hook Form** - Form handling and validation
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Notifications

## 📦 Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your backend API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:2000
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
frontend/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   └── layout/         # Layout components (Header, Footer)
├── hooks/              # Custom React hooks
├── lib/                # API clients and utilities
├── pages/              # Next.js pages
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Components

### UI Components
- **Button** - Versatile button with multiple variants
- **Input** - Form input with validation support
- **Modal** - Accessible modal dialogs
- **Card** - Flexible card container
- **Badge** - Status indicators
- **LoadingSpinner** - Loading states

### Layout Components
- **Header** - Navigation with search, cart, and user menu
- **Footer** - Site footer with links and newsletter
- **Layout** - Main layout wrapper with SEO

## 🔐 Authentication

The app supports:
- Username/email login
- User registration
- Two-factor authentication (2FA)
- Password reset (planned)
- Profile management

## 🛒 Shopping Features

- **Product Catalog**: Browse books with search and filters
- **Shopping Cart**: Add/remove items, update quantities
- **Wishlist**: Save items for later
- **Checkout**: Complete purchase flow (planned)
- **Order History**: View past orders (planned)

## 📱 Responsive Design

The frontend is built mobile-first and includes:
- Responsive navigation with mobile menu
- Touch-friendly interfaces
- Optimized layouts for all screen sizes
- Proper accessibility support

## 🔌 API Integration

The frontend integrates with the backend microservices:
- **Authentication Service** (Port 2000)
- **Books Service** (Port 2003)
- **Orders/Cart Service** (Port 2001)
- **Shipping Service** (Port 2002)

## 🐛 Bug Fixes Applied

1. **Type Safety**: Fixed TypeScript errors in book filters
2. **Memory Leaks**: Added cleanup in useEffect hooks
3. **Form Integration**: Fixed react-hook-form compatibility
4. **Click Outside**: Improved user menu behavior
5. **JSX Syntax**: Fixed React import issues
6. **Input Validation**: Added proper form validation

## 🚀 Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Deploy to Vercel (recommended):**
   ```bash
   npx vercel
   ```

## 🔮 Future Enhancements

- [ ] Book detail pages
- [ ] Complete checkout flow
- [ ] Order tracking
- [ ] User reviews and ratings
- [ ] Advanced search filters
- [ ] Dark mode support
- [ ] PWA features
- [ ] Performance optimizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.