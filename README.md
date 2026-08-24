# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # ATL Travels

  ATL Travels is a travel booking web application for browsing vacation destinations and flight deals, submitting traveler details, choosing a payment method, and communicating with an administrator about a booking.

  The frontend is a React single-page application backed by Supabase for authentication, Postgres data, row-level security, and media storage. It is configured for deployment to Vercel.

  ## Features

  - Browse vacation packages and flight deals.
  - Submit bookings with traveler, emergency-contact, address, date, and trip-reason details.
  - Choose Cash App, Venmo, Zelle, cryptocurrency, bank transfer, or PayPal as the intended payment method.
  - Track booking status and payment instructions from the user dashboard.
  - Chat with an administrator about approved bookings.
  - Admin management for destinations, flights, gallery media, bookings, and custom trip requests.
  - Responsive gallery with image and video support.

  ## Tech Stack

  - React 19 and TypeScript
  - Vite 7
  - React Router
  - Tailwind CSS 4
  - Framer Motion
  - Lucide React
  - Supabase JavaScript client
  - Vercel Analytics

  ## Routes

  | Path | Access | Purpose |
  | --- | --- | --- |
  | `/` | Public | Home page and featured travel content |
  | `/destinations` | Public | Vacation packages |
  | `/bookings` | Public | Booking entry point and available deals |
  | `/gallery` | Public | Travel media gallery |
  | `/login` | Public | Sign in and registration |
  | `/profile` | Signed in | User profile |
  | `/user/dashboard` | Signed in | User bookings and trip requests |
  | `/chat` | Signed in | Booking support conversations |
  | `/admin/dashboard` | Admin | Administrative management console |

  ## Prerequisites

  - Node.js 20 or newer
  - npm
  - A Supabase project for authentication and application data

  ## Local Development

  1. Install dependencies:

     ```bash
     npm install
     ```

  2. Create a local `.env` file in the project root:

     ```dotenv
     VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
     ```

     Only `VITE_` variables are exposed to the browser. Never put a Supabase service-role key in this file or in any client-side environment variable.

  3. Start the development server:

     ```bash
     npm run dev
     ```

     Vite prints the local URL, normally `http://localhost:5173`.

  ## Supabase Setup

  1. Create a Supabase project.
  2. Open the Supabase SQL Editor and run [`backend/schema.sql`](backend/schema.sql). This creates the tables, authentication profile trigger, booking approval trigger, RLS policies, and media storage policies.
  3. If an existing database was created before the address field was added, also run [`backend/migrations/20260824_add_bookings_address.sql`](backend/migrations/20260824_add_bookings_address.sql).
  4. Copy the project URL and anon or publishable key into the root `.env` file.
  5. Create a user through the application’s registration screen.
  6. Promote the account to an administrator from the Supabase SQL Editor. The schema trigger creates new profiles with the `user` role by default:

     ```sql
     update public.profiles
     set role = 'admin'
     where id = (
       select id from auth.users where email = 'your-admin@example.com'
     );
     ```

  The schema enables RLS so users can create and read their own bookings, while administrators can manage catalog data and review bookings. When an admin approves a booking, a database trigger creates a support thread with the payment instructions.

  ## Available Commands

  ```bash
  npm run dev       # Start the Vite development server
  npm run build     # Type-check and create a production build
  npm run lint      # Run ESLint
  npm run preview   # Preview the production build locally
  ```

## Deployment to Vercel

  1. Import the repository into Vercel.
  2. Use the default Vite settings, or set the build command to `npm run build`.
  3. Add these environment variables in the Vercel project settings for the environments you deploy:

     ```text
     VITE_SUPABASE_URL
     VITE_SUPABASE_ANON_KEY
     ```

  4. Deploy the project.

The [`vercel.json`](vercel.json) rewrite sends application routes to `index.html`, allowing React Router routes to work on direct navigation and page refresh.

## Project Structure

  ```text
  src/
    components/   Shared UI and booking/admin modals
    lib/           Supabase client, store, data, types, and utilities
    pages/         Route-level screens
  backend/
    schema.sql     Supabase schema, triggers, and RLS policies
    migrations/    Follow-up database migrations
  public/          Static destination and gallery assets
  ```

## Notes for Contributors

- Keep payment IDs aligned with the database constraint in `backend/schema.sql`; bank transfer is persisted as `bank_transfer`.
- Keep the Supabase service-role key server-side only. The current browser application uses the publishable/anon key with RLS.
- Run `npm run lint` and `npm run build` before opening a pull request.
