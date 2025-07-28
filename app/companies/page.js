"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import pb from "../../lib/pocketbase"
import Navbar from "../../components/common/Navbar"

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCompanies()
  }, [searchTerm])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      let filter = "isPublished = true"

      if (searchTerm) {
        filter += ` && (companyName ~ "${searchTerm}" || description ~ "${searchTerm}")`
      }

      const records = await pb.collection("companies").getList(1, 50, {
        filter: filter,
        sort: "-created",
        requestKey: null,
      })

      setCompanies(records.items)
    } catch (error) {
      if (!error.isAbort) {
        setError("Failed to fetch companies")
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCompanyClick = (companyId) => {
    router.push(`/companies/${companyId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Registered Companies</h1>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Companies</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by company name or description..."
            />
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {/* Companies Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No companies found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                onClick={() => handleCompanyClick(company.id)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Company Logo */}
                <div className="h-32 bg-gray-200 rounded-t-lg overflow-hidden">
                  {company.companyLogo ? (
                    <img
                      src={pb.files.getUrl(company, company.companyLogo) || "/placeholder.svg"}
                      alt={company.companyName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{company.companyName}</h3>

                  {company.description && (
                    <p className="text-gray-700 text-sm line-clamp-3 mb-4">{company.description}</p>
                  )}

                  <div className="space-y-1 text-sm text-gray-600">
                    {company.city && company.country && (
                      <p>
                        📍 {company.city}, {company.country}
                      </p>
                    )}
                    {company.companyType && <p>🏢 {company.companyType}</p>}
                    {company.foundedYear && <p>📅 Founded {company.foundedYear}</p>}
                  </div>

                  <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm">
                    View Company Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
