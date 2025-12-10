# English Fullbright Admin Dashboard

This is the admin dashboard for the English Fullbright application. It provides an interface for managing courses, lessons, users, and other content.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=English Fullbright Admin
```

3. Start the development server:

```bash
npm run dev
```

## API Integration

The admin dashboard integrates with the backend API using service modules. These services handle all API calls and provide a clean interface for interacting with the backend.

For detailed information about the API integration, see [API_INTEGRATION.md](./API_INTEGRATION.md).

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check for code quality issues
- `npm run preview` - Preview the production build locally

## Technologies Used

- React
- Vite
- Axios for API calls
- React Router for routing
- React Icons for icons

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
