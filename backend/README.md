# ATL TRAVELS — Backend Blueprint

This folder contains everything needed to stand the project up on
**Vercel + Supabase** with real authentication, Postgres data, and storage.

## What's included

| Piece | Where | Notes |
| --- | --- | --- |
| Database schema + RLS + triggers | `backend/schema.sql` | Run once in the Supabase SQL editor |
| Env vars | `backend/.env.example` | Add to Vercel → Settings → Environment Variables |
| Admin account | — | Sign up with `atltravels@hotmail.com`; the `handle_new_user` trigger grants it the `admin` role automatically |

## Data model

- **profiles** – extends `auth.users` (name, phone, role). Created automatically on signup.
- **destinations** – vacation packages with editable price/metadata. `price = 0` renders as "On Request".
- **flights** – admin-managed flight deals. `departure_date`, `arrival_date` and `price` are optional.
- **media** – references files in the public `media` storage bucket (images + videos).
- **bookings** – full traveler details (`full_name`, `dob`, `phone`, `passport`, `country`, `state`, `address`, `reason`, `emergency_*`, `special_requests`), `payment_method`
  (`cashapp` / `venmo` / `zelle` / `cryptocurrency` / `bank_transfer` / **`paypal`**),
  and `payment_instructions` written by the admin on approval.
- **chat_threads / chat_messages** – a thread is auto-created by the `open_thread_on_approval`
  trigger when a booking moves to `approved`, seeded with the payment instructions.

## Workflow

1. Traveler picks a flight/package → fills the booking form → chooses a payment method →
   booking is stored as `pending` (user sees "Booking Submitted — confirmation pending").
2. Admin sees the booking (with its chosen payment method) in the admin dashboard,
   pastes/selects the matching payment details (Cash App, Venmo, Zelle, crypto, bank wire,
   or PayPal) and clicks **Approve & Send Payment Details** — or rejects with a note.
3. On approval the database trigger opens the support chat thread and posts the payment
   instructions; the traveler sees the instructions in their dashboard and can chat back.

## Security

All tables have RLS enabled: catalog tables are world-readable, travelers only see their own
bookings/threads, and `is_admin()` gates all write/review actions. Admin-only operations can
also be performed from serverless API routes using the **service role** key (kept
server-side only — never ship it to the browser).
