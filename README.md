# Santrack Frontend

A comprehensive sanitation tracking and management system built with Next.js, Supabase, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account and project
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Santrack-fontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Features

### Core Functionality
- **Multi-role Dashboard System**: Admin, Health Officer, District Officer, Community Officer, NGO, and Operator roles
- **Issue Reporting & Tracking**: Report sanitation issues with location, severity, and type classification
- **Interactive Maps**: Leaflet-based mapping for visualizing issues and locations
- **Analytics Dashboard**: Comprehensive metrics, charts, and insights
- **User Management**: Role-based access control and user administration
- **Profile Management**: User profiles with avatar upload and information editing

### Dashboard Features
- **Real-time Statistics**: Track issues, resolutions, and trends
- **Risk Assessment**: Automated risk scoring and compliance monitoring
- **Issue Type Analysis**: Categorized tracking (water, waste, hygiene, infrastructure)
- **Severity Tracking**: Critical, high, medium, and low priority classification
- **Resolution Metrics**: Monitor resolution rates and response times
- **Trend Visualization**: Historical data analysis with interactive charts

### User Profile System
- View and edit personal information
- Upload profile pictures (max 2MB)
- Real-time updates with toast notifications
- Responsive design for mobile and desktop
- Role-based information display
- Secure avatar storage via Supabase

## 🏗️ Project Structure

```
Santrack-fontend/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── admin/
│   │   ├── health-officer/
│   │   ├── district-officer/
│   │   ├── community-officer/
│   │   ├── ngo/
│   │   └── operator/
│   ├── maps/                     # Map visualization
│   ├── reports/                  # Issue reports
│   └── reporteissue/             # Issue submission
├── components/                   # React components
│   ├── admin/                    # Admin dashboard components
│   ├── auth/                     # Authentication components
│   ├── maps/                     # Map-related components
│   ├── profile/                  # Profile management
│   ├── reports/                  # Report components
│   └── ui/                       # Shared UI components
├── context/                      # React context providers
│   └── AuthContext.js
├── hooks/                        # Custom React hooks
│   ├── useProfile.js
│   └── useProfileForm.js
├── lib/                          # Utility libraries
│   ├── api.js
│   ├── apiProfile.js
│   └── supabase.js
├── public/                       # Static assets
└── styles/                       # Global styles
```

## 🔐 Authentication & Authorization

### Roles
- **Admin**: Full system access, user management, analytics
- **Health Officer**: Health-related issue management
- **District Officer**: District-level oversight
- **Community Officer**: Community engagement and reporting
- **NGO**: Partner organization access
- **Operator**: Field operations and issue resolution

### Protected Routes
All dashboard routes are protected by the `ProtectedRoute` component, which:
- Verifies user authentication
- Checks role-based permissions
- Redirects unauthorized users
- Maintains session state

## 🗄️ Database Setup

### Supabase Configuration

1. **Create required tables** in your Supabase project:
   - `profiles` - User profile information
   - `issues` - Sanitation issue reports
   - `users` - User authentication data

2. **Set up storage bucket** for profile images:
   - Bucket name: `profile-images`
   - Folder: `avatars`
   - Access: Public

3. **Run SQL migrations** (if provided):
```sql
-- See supabase-migration-add-avatar-url.sql for profile setup
```

### Storage Policies
Ensure proper Row Level Security (RLS) policies are configured:
- Users can only edit their own profiles
- Avatar uploads are restricted to authenticated users
- Public read access for profile images

## 🎨 Styling

This project uses:
- **Tailwind CSS 4**: Utility-first CSS framework
- **Custom Design System**: Consistent colors, spacing, and components
- **Responsive Design**: Mobile-first approach
- **Dark Mode Support**: (if implemented)

### Color Palette
- Primary: Blue tones for main actions
- Success: Green for completed/resolved states
- Warning: Yellow/Orange for medium priority
- Danger: Red for critical issues
- Neutral: Gray scale for backgrounds and text

## 📊 Analytics & Reporting

### Available Metrics
- Total issues reported
- Resolution rate and time
- Issue distribution by type
- Severity breakdown
- Geographic distribution
- Trend analysis over time
- Risk assessment scores

### Chart Types
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Gauge charts for metrics
- Heat maps for geographic data

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 🔧 Configuration

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Next.js Configuration
See `next.config.js` for custom configurations including:
- Image optimization
- API routes
- Redirects and rewrites

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Support & Troubleshooting

### Common Issues

**Profile upload fails:**
- Check storage bucket exists and is public
- Verify file is under 2MB
- Ensure file is an image type
- Check browser console for errors

**Authentication issues:**
- Verify Supabase credentials in `.env.local`
- Check Supabase project is active
- Clear browser cache and cookies

**Build errors:**
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Check Node.js version compatibility

### Getting Help
- Check existing documentation in `/docs`
- Review component comments and JSDoc
- Check browser console for errors
- Verify Supabase connection and policies

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics and AI insights
- [ ] Multi-language support
- [ ] Offline mode support
- [ ] Push notifications
- [ ] Export functionality (PDF, CSV)
- [ ] Advanced filtering and search
- [ ] Integration with external systems

## 👥 Team

Built with ❤️ by the Santrack development team.

---

**Version**: 0.1.0  
**Last Updated**: 2024  
**Status**: Active Development
