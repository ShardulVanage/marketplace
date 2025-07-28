"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import pb from "../../lib/pocketbase"
import Navbar from "../../components/common/Navbar"

export default function RequirementsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [requirements, setRequirements] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [error, setError] = useState("")
  const [totalRequirements, setTotalRequirements] = useState(0)
  const [selectedRequirement, setSelectedRequirement] = useState(null)
  const [showBuyerModal, setShowBuyerModal] = useState(false)

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

  useEffect(() => {
    fetchRequirements()
  }, [searchTerm, selectedCategory])

  const fetchRequirements = async () => {
    try {
      setLoading(true)
      setError("")

      // Build filter conditions
      const filterConditions = []

      // Add search filter if search term exists
      if (searchTerm.trim()) {
        filterConditions.push(`(title ~ "${searchTerm.trim()}" || description ~ "${searchTerm.trim()}")`)
      }

      // Add category filter if category is selected
      if (selectedCategory.trim()) {
        filterConditions.push(`category = "${selectedCategory.trim()}"`)
      }

      const filter = filterConditions.length > 0 ? filterConditions.join(" && ") : ""

      console.log("Fetching requirements with filter:", filter)

      const records = await pb.collection("requirements").getList(1, 50, {
        filter: filter,
        expand: "user",
        sort: "-created",
        requestKey: null,
      })

      console.log(`Found ${records.items.length} requirements`)
      setRequirements(records.items)
      setTotalRequirements(records.totalItems)
    } catch (error) {
      console.error("Error fetching requirements:", error)
      if (!error.isAbort) {
        setError(`Failed to fetch requirements: ${error.message}`)
        setRequirements([])
        setTotalRequirements(0)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleContactUser = (requirement) => {
    if (!user) {
      router.push("/login")
      return
    }

    // Create mailto link with pre-filled content
    const subject = `Regarding your requirement: ${requirement.title}`
    const body = `Hello ${requirement.expand?.user?.firstName || "there"},

I saw your requirement "${requirement.title}" and would like to discuss how I can help.

Requirement Details:
- Category: ${requirement.category}
- Posted: ${new Date(requirement.created).toLocaleDateString()}

Please let me know if you'd like to discuss further.

Best regards,
${user.firstName} ${user.lastName}
${user.email}`

    const mailtoLink = `mailto:${requirement.expand?.user?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoLink
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
  }

  const handleShowBuyerInfo = (requirement) => {
    setSelectedRequirement(requirement)
    setShowBuyerModal(true)
  }

  const closeBuyerModal = () => {
    setShowBuyerModal(false)
    setSelectedRequirement(null)
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
              <h1 className="text-xl font-semibold text-gray-900">Browse Requirements</h1>
              <p className="text-sm text-gray-600">Find buying requirements from potential customers</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/requirements/post")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                Post Requirement
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Requirements</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by title or description..."
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory || searchTerm) && (
            <div className="mt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Category: {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                      title="Remove category filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
                      title="Clear search"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button onClick={clearAllFilters} className="text-sm text-gray-500 hover:text-gray-700 underline">
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <button onClick={fetchRequirements} className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded">
              Try Again
            </button>
          </div>
        )}

        {/* Results Summary */}
        {!loading && !error && (
          <div className="mb-4">
            <p className="text-gray-600">
              {totalRequirements} requirement{totalRequirements !== 1 ? "s" : ""} found
              {selectedCategory && ` in "${selectedCategory}"`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* Requirements List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading requirements...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">Failed to load requirements</p>
            <p className="text-gray-400 mb-4">Please check your connection and try again</p>
          </div>
        ) : requirements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">
              {selectedCategory || searchTerm
                ? "No requirements found matching your criteria"
                : "No requirements found"}
            </p>
            <p className="text-gray-400 mb-4">
              {selectedCategory || searchTerm
                ? "Try adjusting your search or filters"
                : "Be the first to post a requirement!"}
            </p>
            <div className="flex justify-center space-x-4">
              {(selectedCategory || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => router.push("/requirements/post")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Post Your Requirement
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {requirements.map((requirement) => (
              <div key={requirement.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{requirement.title}</h3>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {requirement.category}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-4">
                          <span>
                            <strong>Posted by:</strong>
                            <button
                              onClick={() => handleShowBuyerInfo(requirement)}
                              className="text-blue-600 hover:text-blue-800 hover:underline ml-1"
                            >
                              {requirement.expand?.user?.firstName} {requirement.expand?.user?.lastName}
                            </button>
                          </span>
                          <span>
                            <strong>Date:</strong> {formatDate(requirement.created)}
                          </span>
                          {requirement.expand?.user?.country && (
                            <span>
                              <strong>Location:</strong> {requirement.expand.user.country}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-md p-4 mb-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{requirement.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleShowBuyerInfo(requirement)}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View Buyer Details →
                        </button>
                        {requirement.expand?.user && (
                          <div className="text-sm text-gray-600">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {requirement.expand.user.designation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <button
                        onClick={() => handleContactUser(requirement)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm whitespace-nowrap"
                      >
                        Contact Buyer
                      </button>
                      <button
                        onClick={() => handleShowBuyerInfo(requirement)}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 text-sm whitespace-nowrap"
                      >
                        View Profile
                      </button>
                      {!user && <p className="text-xs text-gray-500 text-center">Login to contact</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!loading && requirements.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Have Products to Offer?</h2>
            <p className="text-blue-100 mb-6">
              Connect with buyers looking for your products and services. Post your offerings to reach more customers.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push("/products/add")}
                className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100"
              >
                Add Your Products
              </button>
              <button
                onClick={() => router.push("/requirements/post")}
                className="bg-blue-500 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-400"
              >
                Post Your Requirement
              </button>
            </div>
          </div>
        )}
        {/* Buyer Information Modal */}
        {showBuyerModal && selectedRequirement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Buyer Information</h2>
                <button onClick={closeBuyerModal} className="text-gray-400 hover:text-gray-600 text-2xl">
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Requirement Summary */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Requirement</h3>
                  <p className="text-blue-800 font-medium">{selectedRequirement.title}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-blue-700">
                    <span className="bg-blue-200 px-2 py-1 rounded">{selectedRequirement.category}</span>
                    <span>Posted: {formatDate(selectedRequirement.created)}</span>
                  </div>
                </div>

                {/* Buyer Details */}
                {selectedRequirement.expand?.user && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Personal Information</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium text-gray-600">Name:</span>{" "}
                          {selectedRequirement.expand.user.prefix} {selectedRequirement.expand.user.firstName}{" "}
                          {selectedRequirement.expand.user.lastName}
                        </p>
                        <p>
                          <span className="font-medium text-gray-600">Email:</span>{" "}
                          <a
                            href={`mailto:${selectedRequirement.expand.user.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {selectedRequirement.expand.user.email}
                          </a>
                        </p>
                        {selectedRequirement.expand.user.mobile && (
                          <p>
                            <span className="font-medium text-gray-600">Mobile:</span>{" "}
                            <a
                              href={`tel:${selectedRequirement.expand.user.mobile}`}
                              className="text-blue-600 hover:underline"
                            >
                              {selectedRequirement.expand.user.mobile}
                            </a>
                          </p>
                        )}
                        <p>
                          <span className="font-medium text-gray-600">Designation:</span>{" "}
                          {selectedRequirement.expand.user.designation}
                        </p>
                        <p>
                          <span className="font-medium text-gray-600">Country:</span>{" "}
                          {selectedRequirement.expand.user.country}
                        </p>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Professional Information</h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium text-gray-600">User Type:</span>{" "}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedRequirement.expand.user.userType === "member"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {selectedRequirement.expand.user.userType === "member" ? "Member" : "Buyer"}
                          </span>
                        </p>

                        {selectedRequirement.expand.user.sectorsOfInterest && (
                          <div>
                            <span className="font-medium text-gray-600">Sectors of Interest:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {selectedRequirement.expand.user.sectorsOfInterest
                                .split(",")
                                .slice(0, 3)
                                .map((sector, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                    {sector.trim()}
                                  </span>
                                ))}
                              {selectedRequirement.expand.user.sectorsOfInterest.split(",").length > 3 && (
                                <span className="text-gray-500 text-xs">
                                  +{selectedRequirement.expand.user.sectorsOfInterest.split(",").length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedRequirement.expand.user.functionalAreas && (
                          <div>
                            <span className="font-medium text-gray-600">Functional Areas:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {selectedRequirement.expand.user.functionalAreas
                                .split(",")
                                .slice(0, 3)
                                .map((area, index) => (
                                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                    {area.trim()}
                                  </span>
                                ))}
                              {selectedRequirement.expand.user.functionalAreas.split(",").length > 3 && (
                                <span className="text-gray-500 text-xs">
                                  +{selectedRequirement.expand.user.functionalAreas.split(",").length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Requirement Description */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Requirement Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedRequirement.description}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => {
                      handleContactUser(selectedRequirement)
                      closeBuyerModal()
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Contact Buyer
                  </button>
                  <button
                    onClick={closeBuyerModal}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
