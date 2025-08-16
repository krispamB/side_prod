# Supabase Database Setup

This directory contains the database migrations for the Krismini user authentication and chat persistence feature.

## Setup Instructions

### 1. Install Supabase CLI (if not already installed)

```bash
npm install -g supabase
```

### 2. Initialize Supabase in your project (if not already done)

```bash
supabase init
```

### 3. Link to your Supabase project

```bash
supabase link --project-ref your-project-ref
```

### 4. Run the migrations

```bash
supabase db push
```

Alternatively, you can run the SQL files directly in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file in order:
   - `001_create_profiles_table.sql`
   - `002_create_chat_messages_table.sql`
4. Execute each migration

## Database Schema

### Tables Created

1. **profiles** - Extends auth.users with additional user information
   - `id` (UUID, references auth.users.id)
   - `email` (TEXT)
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **chat_messages** - Stores all chat conversations
   - `id` (UUID, primary key)
   - `user_id` (UUID, references auth.users.id)
   - `role` ('user' | 'ai')
   - `content` (TEXT)
   - `created_at` (TIMESTAMP)

### Security

- Row Level Security (RLS) is enabled on both tables
- Users can only access their own data
- Automatic profile creation trigger when users sign up

### Indexes

- `idx_chat_messages_user_created` - Optimizes queries for user chat history

## Environment Variables

Make sure your `.env.local` file contains:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```