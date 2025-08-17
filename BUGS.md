# Known Bugs and Issues

## Authentication Issues

### 🐛 Sign-up Error Handling (PARTIALLY FIXED)
**Status:** In Progress  
**Priority:** Medium  
**Description:** When a user tries to sign up with an existing email address, the error message is not displayed properly and the user gets redirected back to the welcome page instead of seeing the error.

**Root Cause:** The AuthWrapper component was intercepting ALL auth errors (including form-level errors like "User already registered") and showing its own error screen instead of letting individual auth forms handle their own errors.

**Fix Applied:** Modified AuthWrapper to only show error screens for critical system errors (network, session, server issues) and let form-level errors be handled by the individual auth forms.

**Current Status:** Fix has been implemented but needs testing to confirm it resolves the issue.

**Steps to Reproduce:**
1. Go to sign-up page
2. Enter an email that already exists in the system (e.g., chrystopam@gmail.com)
3. Enter a valid password
4. Click "Create Account"
5. Expected: Error message should appear in the sign-up form
6. Actual (before fix): User gets redirected to welcome page

**Files Modified:**
- `src/components/auth/AuthWrapper.tsx` - Modified error handling logic
- `src/components/auth/SignUpForm.tsx` - Added debugging logs
- `src/contexts/AuthContext.tsx` - Added debugging logs
- `src/components/auth/AuthContainer.tsx` - Added debugging logs

---

### ✅ Sign-out Hanging Issue (FIXED)
**Status:** Resolved  
**Priority:** High  
**Description:** When users clicked the sign-out button in the user profile dropdown, the button would show "Signing out..." indefinitely without actually signing the user out.

**Root Cause:** The Supabase client was configured with PKCE flow which can sometimes cause issues with sign-out operations.

**Fix Applied:** 
1. Changed Supabase client configuration from PKCE to implicit flow
2. Improved error handling and debugging in sign-out process
3. Added timeout handling to prevent indefinite hanging

**Files Modified:**
- `src/lib/supabase.ts` - Changed flowType from 'pkce' to 'implicit'
- `src/components/UserProfile.tsx` - Improved error handling and debugging
- `src/contexts/AuthContext.tsx` - Added comprehensive debugging logs

---

## Development Tools

### 🛠️ Debug Components Added
**Status:** Active  
**Description:** Added debugging components to help troubleshoot authentication issues during development.

**Components Added:**
- `src/components/AuthDebug.tsx` - Shows current auth state and provides manual sign-out testing
- Debug panel appears in bottom-left corner during development
- Shows user, profile, session, loading, and error states
- Includes "Test Sign Out" button for debugging

**Usage:** Only visible in development mode (NODE_ENV !== 'production')

---

## Task Completion Status

### ✅ Task 5: Extend chat interface with user account features (COMPLETED)
- ✅ 5.1 Add user profile display to header
- ✅ 5.2 Implement secure sign-out functionality

**Implementation Details:**
- Created UserProfile component with dropdown menu
- Shows user avatar (first letter of email) and email in header
- Includes sign-out functionality with proper error handling
- Matches existing Krismini design patterns
- Responsive design that hides email on small screens

---

## Notes for Future Development

1. **Testing Needed:** The sign-up error handling fix needs to be tested to confirm it works properly
2. **Debug Components:** Remember to remove or disable debug components before production deployment
3. **Error Handling:** Consider implementing more granular error categorization for better user experience
4. **Flow Type:** Monitor the implicit flow change to ensure it doesn't cause other authentication issues

---

## How to Report New Bugs

When reporting new bugs, please include:
1. **Description:** Clear description of the issue
2. **Steps to Reproduce:** Detailed steps to recreate the bug
3. **Expected Behavior:** What should happen
4. **Actual Behavior:** What actually happens
5. **Environment:** Browser, device, etc.
6. **Console Logs:** Any relevant error messages
7. **Screenshots:** If applicable

---

*Last Updated: August 16, 2025*