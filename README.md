# Santrack Frontend

A comprehensive sanitation tracking and management system for Northern Ghana, built with Next.js and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

```bash
# Clone and install
git clone <repository-url>
cd Santrack-fontend
npm install

# Configure environment
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📋 Features

- **Multi-Role Dashboard System** - Admin, Health Officer, District Officer, Community Officer, NGO, Operator, and Sanitation Worker roles
- **Issue Reporting & Tracking** - Report and track sanitation issues with location, severity, and type classification
- **Work Assignment System** - Assign work to sanitation workers with accept/decline workflow
- **Work Verification** - Supervisors can verify completed work before closing reports
- **Interactive Maps** - Leaflet-based mapping for visualizing issues and locations
- **Analytics Dashboard** - Comprehensive metrics, charts, and insights
- **User Management** - Role-based access control with profile management
- **Real-time Updates** - Live notifications and status updates via Supabase Realtime

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Maps**: Leaflet
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime

## 📁 Project Structure

```
Santrack-fontend/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   └── (dashboard)/       # Protected dashboard pages
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
├── context/               # React context providers
├── docs/                  # Documentation
└── public/                # Static assets
```

## 🔐 User Roles

| Role | Description |
|------|-------------|
| **Admin** | Full system access, user management, analytics |
| **District Officer** | District-level oversight and management |
| **Health Officer** | Health-related issue management |
| **Community Officer** | Community engagement and reporting |
| **Supervisor** | Team oversight and work verification |
| **Sanitation Worker** | Field operations and issue resolution |
| **NGO** | Partner organization access |
| **Operator** | System operations and monitoring |

## 🗄️ Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 Documentation

Detailed documentation is available in the `/docs` folder:

- **[RBAC System](docs/RBAC_SYSTEM.md)** - Role-based access control implementation
- **[Profile Feature](docs/PROFILE-FEATURE.md)** - User profile management
- **[Realtime Setup](docs/REALTIME.md)** - Supabase Realtime configuration
- **[Dashboard Containment](docs/DASHBOARD-CONTAINMENT.md)** - Dashboard navigation system
- **[Navigation Flow](docs/NAVIGATION-FLOW.md)** - User journey and routing
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🚢 Deployment

The app can be deployed to:
- **Vercel** (recommended)
- Netlify
- AWS Amplify
- Any platform supporting Next.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For issues and questions:
- Check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md)
- Review documentation in `/docs`
- Check browser console for errors

---

**Version**: 1.0.0  
**Last Updated**: 2024  
Built with ❤️ by the Santrack development team
