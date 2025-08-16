#!/usr/bin/env node

/**
 * Database setup script for Krismini
 * This script helps set up the database schema for user authentication and chat persistence
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Krismini Database Setup');
console.log('==========================');

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

if (!fs.existsSync(migrationsDir)) {
  console.error('❌ Migrations directory not found. Please ensure the supabase/migrations directory exists.');
  process.exit(1);
}

const migrations = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

console.log('\n📋 Available migrations:');
migrations.forEach((migration, index) => {
  console.log(`  ${index + 1}. ${migration}`);
});

console.log('\n📖 To set up your database:');
console.log('');
console.log('Option 1 - Using Supabase CLI (Recommended):');
console.log('  1. Install Supabase CLI: npm install -g supabase');
console.log('  2. Link your project: supabase link --project-ref YOUR_PROJECT_REF');
console.log('  3. Push migrations: supabase db push');
console.log('');
console.log('Option 2 - Manual setup via Supabase Dashboard:');
console.log('  1. Go to your Supabase project dashboard');
console.log('  2. Navigate to SQL Editor');
console.log('  3. Run each migration file in order:');
migrations.forEach((migration, index) => {
  console.log(`     ${index + 1}. Copy and run: supabase/migrations/${migration}`);
});

console.log('');
console.log('✅ After running migrations, your database will have:');
console.log('  - profiles table (extends auth.users)');
console.log('  - chat_messages table (stores conversations)');
console.log('  - Row Level Security policies');
console.log('  - Automatic profile creation trigger');
console.log('');
console.log('🔐 Make sure your .env.local file contains:');
console.log('  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url');
console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key');
console.log('');
console.log('📚 For more details, see: supabase/README.md');