"use client"

import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const { user, loading, isMember, isNonMember } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    console.log("📊 Dashboard effect:", {
      user: user ? user.email : null,
      loading,
      isMember,
      isNonMember,
      redirecting,
    })

    // Wait for loading to complete and avoid double redirects
    if (!loading && !redirecting) {
      if (!user) {
        console.log("🔄 No user found, redirecting to login")
        setRedirecting(true)
        router.push("/login")
      } else if (isMember) {
        console.log("🔄 Member user, redirecting to member dashboard")
        setRedirecting(true)
        router.push("/dashboard/member")
      } else if (isNonMember) {
        console.log("🔄 Non-member user, redirecting to non-member dashboard")
        setRedirecting(true)
        router.push("/dashboard/non-member")
      }
    }
  }, [user, loading, isMember, isNonMember, router, redirecting])

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
        {user && (
          <p className="mt-2 text-sm text-gray-500">Welcome back, {user.firstName}! Redirecting to your dashboard...</p>
        )}
      </div>
    </div>
  )
}
