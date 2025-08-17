#!/usr/bin/env node

/**
 * Database verification script for Krismini
 * This script checks if the database tables were created successfully
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl, supabaseAnonKey;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1];
    }
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyTables() {
  console.log('🔍 Verifying database tables...\n');

  try {
    // Check profiles table
    console.log('Checking profiles table...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      console.error('❌ profiles table:', profilesError.message);
    } else {
      console.log('✅ profiles table exists and is accessible');
    }

    // Check chat_messages table
    console.log('Checking chat_messages table...');
    const { data: messagesData, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .limit(1);

    if (messagesError) {
      console.error('❌ chat_messages table:', messagesError.message);
    } else {
      console.log('✅ chat_messages table exists and is accessible');
    }

    // Check if RLS is working (should get no data without auth)
    console.log('\nChecking Row Level Security...');
    const profileCount = profilesData ? profilesData.length : 0;
    const messageCount = messagesData ? messagesData.length : 0;
    
    console.log(`📊 Profiles accessible without auth: ${profileCount}`);
    console.log(`📊 Messages accessible without auth: ${messageCount}`);
    
    if (profileCount === 0 && messageCount === 0) {
      console.log('✅ Row Level Security appears to be working correctly');
    } else {
      console.log('⚠️  Warning: RLS might not be configured correctly');
    }

  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
  }
}

verifyTables();