"use client"

import { useAuth } from "../../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import pb from "../../../lib/pocketbase"
import Navbar from "../../../components/common/Navbar"

export default function MemberDashboard() {
  const { user, logout, isMember, loading } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    console.log("👤 Member dashboard effect:", {
      user: user ? user.email : null,
      loading,
      isMember,
      redirecting,
    })

    // Wait for loading to complete and avoid double redirects
    if (!loading && !redirecting) {
      if (!user) {
        console.log("🔄 No user in member dashboard, redirecting to login")
        setRedirecting(true)
        router.push("/login")
      } else if (!isMember) {
        console.log("🔄 Not a member, redirecting to non-member dashboard")
        setRedirecting(true)
        router.push("/dashboard/non-member")
      }
    }
  }, [user, isMember, loading, router, redirecting])

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading member dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated or not a member
  if (!user || !isMember) {
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
              <h1 className="text-xl font-semibold text-gray-900">Member Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Member</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
       
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
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Member</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/products/add")}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Add Product/Service
              </button>
              <button
                onClick={() => router.push("/company/manage")}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Manage Company Profile
              </button>
              <button
                onClick={() => router.push("/inquiries/view")}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
              >
                View Inquiries
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
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Products Listed:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inquiries Received:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Requirements Posted:</span>
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

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center">No recent activity to display.</p>
          </div>
        </div>

        {/* Member Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Seller Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• List unlimited products and services</li>
              <li>• Receive and manage buyer inquiries</li>
              <li>• Access to detailed buyer information</li>
              <li>• Priority listing in search results</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Buyer Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Post detailed requirements</li>
              <li>• Connect directly with sellers</li>
              <li>• Access to member-only products</li>
              <li>• Advanced search and filtering</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
