"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import pb from "../../../lib/pocketbase"

const categories = [
  "Agriculture",
  "Automobiles",
  "Banking & Finance",
  "Chemicals",
  "Construction",
  "Education",
  "Electronics",
  "Energy",
  "Food & Beverages",
  "Healthcare",
  "Information Technology",
  "Manufacturing",
  "Real Estate",
  "Retail",
  "Textiles",
  "Transportation",
  "Other",
]

export default function PostRequirementPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  })

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
  }, [user, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const requirementData = {
        ...formData,
        user: user.id,
      }

      await pb.collection("requirements").create(requirementData)

      setSuccess("Requirement posted successfully!")
      setFormData({
        title: "",
        description: "",
        category: "",
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      setError(error.message || "Failed to post requirement")
    }

    setLoading(false)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Post Requirement</h1>
            <button onClick={() => router.push("/dashboard")} className="text-blue-600 hover:text-blue-500">
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Your Requirement</h2>
            <p className="text-gray-600">
              Describe what you&apos;re looking for and let sellers reach out to you with their offerings.
            </p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              {success}
              <p className="text-sm mt-1">Redirecting to dashboard...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirement Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Looking for Industrial Machinery Supplier"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide detailed information about your requirement including:
- Specific product/service needed
- Quantity required
- Quality specifications
- Delivery timeline
- Budget range (optional)
- Any other relevant details"
              />
            </div>

            {/* Contact Information Display */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Your Contact Information</h3>
              <p className="text-sm text-blue-800">
                <strong>Name:</strong> {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {user.email}
              </p>
              {user.mobile && (
                <p className="text-sm text-blue-800">
                  <strong>Mobile:</strong> {user.mobile}
                </p>
              )}
              <p className="text-xs text-blue-700 mt-2">
                This information will be visible to sellers who respond to your requirement.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Posting Requirement..." : "Post Requirement"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
