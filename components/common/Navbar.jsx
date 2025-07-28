"use client"

import { useAuth } from "../../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Navbar() {
  const { user, logout, isMember, isNonMember } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const navigation = [
    { name: "Home", href: "/", show: true },
    { name: "Products", href: "/products", show: true },
    { name: "Companies", href: "/companies", show: true },
    { name: "Categories", href: "/categories", show: true },
    { name: "Requirements", href: "/requirements", show: true },
  ]

  const userNavigation = user
    ? [
        { name: "Dashboard", href: "/dashboard", show: true },
        { name: "Add Product", href: "/products/add", show: isMember },
        { name: "Manage Company", href: "/company/manage", show: isMember },
        { name: "View Inquiries", href: "/inquiries/view", show: isMember },
        { name: "Post Requirement", href: "/requirements/post", show: true },
        { name: "Browse Requirements", href: "/requirements", show: true },
      ].filter((item) => item.show)
    : []

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => router.push("/")} className="text-2xl font-bold text-blue-600 hover:text-blue-700">
              B2B Marketplace
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Main Navigation */}
            <div className="flex items-center space-x-6">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-4">
                {/* User Navigation Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <span>
                      {user.firstName} {user.lastName}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isMember ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {isMember ? "Member" : "Buyer"}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        {userNavigation.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => {
                              router.push(item.href)
                              setIsMenuOpen(false)
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {item.name}
                          </button>
                        ))}
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/login")}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700 hover:text-blue-600 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href)
                    setIsMenuOpen(false)
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md text-base font-medium"
                >
                  {item.name}
                </button>
              ))}

              {user ? (
                <>
                  <hr className="my-2" />
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                        isMember ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {isMember ? "Member" : "Buyer"}
                    </span>
                  </div>
                  {userNavigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        router.push(item.href)
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md text-base font-medium"
                    >
                      {item.name}
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md text-base font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      router.push("/login")
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md text-base font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      router.push("/register")
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-base font-medium"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
