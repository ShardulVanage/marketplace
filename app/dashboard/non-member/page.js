"use client"

import { useAuth } from "../../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import pb from "../../../lib/pocketbase"
import Navbar from "../../../components/common/Navbar"

export default function NonMemberDashboard() {
  const { user, logout, isNonMember, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    console.log("👤 Non-member dashboard effect:", {
      user: user ? user.email : null,
      loading,
      isNonMember,
      redirecting,
    })

    // Wait for loading to complete and avoid double redirects
    if (!loading && !redirecting) {
      if (!user) {
        console.log("🔄 No user in non-member dashboard, redirecting to login")
        setRedirecting(true)
        router.push("/login")
      } else if (!isNonMember) {
        console.log("🔄 Not a non-member, redirecting to member dashboard")
        setRedirecting(true)
        router.push("/dashboard/member")
      }
    }
  }, [user, isNonMember, loading, router, redirecting])

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading buyer dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or not a non-member
  if (!user || !isNonMember) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Buyer Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Buyer</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Success message for staying logged in */}
        
        {/* Membership Upgrade Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Upgrade to Member</h2>
              <p className="text-blue-100">Unlock seller features and list your products/services</p>
            </div>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100">
              Upgrade Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {user.prefix} {user.firstName} {user.lastName}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-medium">Designation:</span> {user.designation}
              </p>
              <p>
                <span className="font-medium">Country:</span> {user.country}
              </p>
              <p>
                <span className="font-medium">User Type:</span>{" "}
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">Non-Member</span>
              </p>
            </div>
          </div>

          {/* Available Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Available Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/products")}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Browse Products
              </button>
              <button
                onClick={() => router.push("/requirements/post")}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
              >
                Post Requirement
              </button>
              <button
                onClick={() => router.push("/requirements")}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
              >
                Browse Requirements
              </button>
              <button
                onClick={() => router.push("/companies")}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
              >
                Search Companies
              </button>
              <button className="w-full bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed" disabled>
                Add Products (Members Only)
              </button>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Activity Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Requirements Posted:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inquiries Sent:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Products Viewed:</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Refresh Button */}
        {/* <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Test Authentication Persistence</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              🔄 Refresh Page (Should Stay Logged In)
            </button>
            <button
              onClick={() => {
                console.log("Current auth state:", {
                  isValid: pb.authStore.isValid,
                  model: !!pb.authStore.model,
                  token: !!pb.authStore.token,
                })
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              🔍 Check Auth State (Console)
            </button>
          </div>
        </div> */}

        {/* Non-Member Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What You Can Do</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Browse and search products/services
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Post buying requirements
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Contact sellers for inquiries
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                View company profiles
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Member Benefits</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">⭐</span>
                List unlimited products and services
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">⭐</span>
                Receive buyer inquiries directly
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">⭐</span>
                Priority in search results
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 mr-2">⭐</span>
                Advanced analytics and insights
              </li>
            </ul>
          </div>
        </div>

        {/* Recent Requirements */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Your Requirements</h2>
              <button
                onClick={() => router.push("/requirements/post")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                Post New Requirement
              </button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center">
              No requirements posted yet. Start by posting your first requirement!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
