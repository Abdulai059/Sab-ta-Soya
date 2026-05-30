# Profile Feature Documentation

## Overview
Complete user profile management system with avatar upload, profile editing, and real-time updates.

## Features
- View and edit personal information
- Upload profile pictures (max 2MB)
- Real-time updates with toast notifications
- Responsive design for mobile and desktop
- Role-based information display
- Secure avatar storage via Supabase

## Setup

### 1. Run SQL Migration
Execute `supabase-migration-add-avatar-url.sql` in your Supabase SQL Editor to:
- Create the `profile-images` storage bucket
- Set up storage policies for secure avatar uploads
- Add RLS policy for profile updates

### 2. Verify Storage Bucket
- Go to Supabase Dashboard → Storage
- Confirm bucket `profile-images` exists and is public

### 3. Access Profile Page
Users can access their profile via:
- **Sidebar**: Click "Profile" under the "Account" section
- **Navbar**: Click profile dropdown → "View Profile"

## Architecture

### 3-Layer Design
1. **API Layer** (`lib/apiProfile.js`)
   - `uploadAvatar()` - Uploads image to Supabase Storage
   - `saveAvatarUrl()` - Saves the public URL to the database
   - `updateProfile()` - Updates profile text fields
   - `getProfile()` - Fetches profile data

2. **Hook Layer** (`hooks/useProfile.js`)
   - `saveProfile()` - Orchestrates the save process
   - Handles avatar upload, database updates, and context refresh

3. **UI Layer** (`components/profile/ProfilePage.js`)
   - Displays profile information
   - Handles form state and validation
   - Shows upload progress and notifications

### Data Flow
```
User clicks "Save Changes"
    ↓
ProfilePage calls saveProfile()
    ↓
useProfile.saveProfile() orchestrates:
    1. uploadAvatar() → Storage
    2. saveAvatarUrl() → Database
    3. updateProfile() → Database
    4. refreshProfile() → Updates AuthContext
    ↓
UI automatically re-renders with new data
```

## Profile Fields

### Editable
- Full Name
- Email
- Phone Number
- Organization

### Read-Only
- Role (with color-coded badge)
- Member Since (account creation date)

## Security

### RLS Policies
- Users can only edit their own profile
- Avatar uploads restricted to authenticated users
- Public read access for profile images

### Validation
- **Client-side**: File type (images only), size (<2MB), required fields
- **Server-side**: Supabase RLS policies enforce data access rules

## Storage Structure
```
profile-images/
  └── avatars/
      └── {user_id}-{timestamp}.{ext}
```

## Troubleshooting

### Upload Fails
- Check storage bucket exists and is public
- Verify file is under 2MB and is an image type
- Check browser console for errors
- Ensure SQL migration was run

### Profile Won't Save
- Verify user is logged in
- Check required fields are filled
- Check browser console for errors
- Verify Supabase connection

### Avatar Doesn't Show
- Check `avatar_url` in database
- Try opening the URL directly in browser
- Verify storage bucket is public
- Clear browser cache

## Debugging

### Console Logging
The profile page logs every step:
- File selection and validation
- Upload progress
- Database updates
- Error details

### Check Network Tab
Monitor requests to:
- `storage/v1/object/profile-images/avatars/...` (upload)
- `rest/v1/profiles` (database update)

### Verify Storage Setup
```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'profile-images';

-- Check storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

## Performance Tips
1. Compress images before uploading (target: 200-500KB)
2. Use appropriate formats (JPG for photos, PNG for graphics)
3. Resize images (recommended: 400x400px or 512x512px max)

## Files
- `/components/profile/ProfilePage.js` - Main profile component
- `/hooks/useProfile.js` - Profile state management
- `/hooks/useProfileForm.js` - Form state management
- `/lib/apiProfile.js` - API service layer
- `/context/AuthContext.js` - Auth context with refreshProfile
- `supabase-migration-add-avatar-url.sql` - Database migration

---

**Status**: Production Ready  
**Last Updated**: 2024
