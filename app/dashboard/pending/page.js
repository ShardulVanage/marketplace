"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"

export default function PendingDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isPending, logout } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // If user is approved, redirect to appropriate dashboard
    if (!isPending) {
      if (user?.userRole === "seller") {
        router.push("/dashboard")
      } else {
        router.push("/dashboard/member")
      }
    }
  }, [isAuthenticated, isPending, user, router])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">B2B Marketplace</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.firstName} {user.lastName}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Status Header */}
          <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">Account Pending Approval</h3>
                <p className="text-sm text-yellow-700">
                  Your account is currently under review by our admin team.
                </p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-gray-900">{user.prefix} {user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Organization:</span>
                    <p className="text-gray-900">{user.organizationName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Country:</span>
                    <p className="text-gray-900">{user.country}</p>
                  </div>
                  {user.designation && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Designation:</span>
                      <p className="text-gray-900">{user.designation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Account Type:</span>
                    <div className="flex items-center mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.userRole === "seller"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.userRole === "seller" ? "Seller" : "Buyer"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Profile Status:</span>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email Verification:</span>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Membership Status:</span>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <strong>Admin Review:</strong> Our team will review your account details and verify your information.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">2</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <strong>Email Notification:</strong> You'll receive an email once your account is approved or if we need additional information.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">3</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700">
                      <strong>Full Access:</strong> Once approved, you'll have full access to all marketplace features.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  If you have any questions about your account status or need assistance, please contact our support team.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="mailto:support@b2bmarketplace.com"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Email Support
                  </a>
                  <a
                    href="tel:+1234567890"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    Call Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
