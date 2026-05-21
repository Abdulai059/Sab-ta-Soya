'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (allowedRoles.length > 0 && profile?.role && !allowedRoles.includes(profile.role)) {
      // Redirect to their own dashboard instead of /unauthorized
      const roleRoutes = {
        admin:            '/admin',
        district_officer: '/district-officer',
        ngo:              '/ngo',
      }
      router.push(roleRoutes[profile.role] ?? '/operator')
    }
  }, [user, profile, loading, allowedRoles, router])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    )
  }

  if (!user) return null
  if (allowedRoles.length > 0 && profile?.role && !allowedRoles.includes(profile.role)) return null

  return children
}
