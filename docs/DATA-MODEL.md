# Data model (reference for Phase 3+ — do NOT create before Phase 3)

## Principles
- Every event row links to WHO (profile_id) and WHERE (store).
- Identity is the phone (normalized E.164). Email is stored, not matched on.
- Profile id is separate from phone. Money in integer paise. Upserts on unique source IDs so duplicate webhooks are harmless.

## Stage 1 tables
```sql
profiles (
  id bigserial primary key,
  phone text unique not null,          -- +91XXXXXXXXXX
  name text,
  created_at timestamptz default now()
);

profile_emails (
  profile_id bigint references profiles(id),
  email text,                          -- not unique
  venture text,
  last_seen timestamptz,
  primary key (profile_id, email)
);

venture_customers (
  id bigserial primary key,
  profile_id bigint references profiles(id),
  venture text not null,
  store text not null,
  source text not null,                -- shopify | tagmango | ...
  source_customer_id text,
  name text, phone text, email text,   -- exactly as received
  first_seen timestamptz default now(),
  unique (store, source, source_customer_id)
);

orders (
  id bigserial primary key,
  store text not null,
  source_order_id text not null,
  profile_id bigint references profiles(id),
  payment_method text,                 -- cod | prepaid | partial
  status text,
  total_paise bigint,
  placed_at timestamptz,
  source_updated_at timestamptz,
  unique (store, source_order_id)
);

order_items (
  id bigserial primary key,
  order_id bigint references orders(id) on delete cascade,
  sku text, title text, qty int, price_paise bigint
);

checkouts (
  id bigserial primary key,
  store text not null,
  source_checkout_id text not null,
  profile_id bigint references profiles(id),
  cart_value_paise bigint,
  checkout_url text,
  completed boolean default false,
  created_at timestamptz,
  unique (store, source_checkout_id)
);

message_log (
  id bigserial primary key,
  profile_id bigint references profiles(id),
  store text, channel text,            -- whatsapp | email
  type text,                           -- abandoned_cart_1 ...
  related_id text,
  sent_at timestamptz default now()
);
```

## Matching (phone only)
1. Normalize contact/buyer phone (never shipping phone). If missing or blocklisted → save venture_customer with profile_id null.
2. Find profile by phone; create if none.
3. Upsert venture_customer; add email to profile_emails (update last_seen).
4. Wrap in a transaction with an advisory lock on the phone to avoid duplicate profiles from simultaneous webhooks.

## Later additions (only when needed)
shipments, returns_refunds, consents (per venture + channel; WhatsApp opt-in per phone), whatsapp_messages, raw_events, enrollments (TagMango), metrics/segments, shared-phone handling.
