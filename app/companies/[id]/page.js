"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import pb from "../../../lib/pocketbase"

export default function CompanyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState(null)
  const [products, setProducts] = useState([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchCompany()
      fetchCompanyProducts()
    }
  }, [params.id])

  const fetchCompany = async () => {
    try {
      const record = await pb.collection("companies").getOne(params.id, {
        requestKey: null,
      })
      setCompany(record)
    } catch (error) {
      setError("Company not found")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanyProducts = async () => {
    try {
      const records = await pb.collection("products").getList(1, 20, {
        filter: `company = "${params.id}" && isPublished = true`,
        sort: "-created",
        requestKey: null,
      })
      setProducts(records.items)
    } catch (error) {
      console.error("Failed to fetch company products:", error)
    }
  }

  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`)
  }

  const handleInquiry = (productId, e) => {
    e.stopPropagation()
    if (!user) {
      router.push("/login")
      return
    }
    router.push(`/inquiries/post?product=${productId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading company...</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{error || "Company not found"}</p>
          <button
            onClick={() => router.push("/companies")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Companies
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Company Profile</h1>
            <button onClick={() => router.push("/companies")} className="text-blue-600 hover:text-blue-500">
              Back to Companies
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Company Header */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>

          <div className="relative px-8 pb-8">
            {/* Company Logo */}
            <div className="absolute -top-16 left-8">
              <div className="w-32 h-32 bg-white rounded-lg shadow-lg overflow-hidden border-4 border-white">
                {company.companyLogo ? (
                  <img
                    src={pb.files.getUrl(company, company.companyLogo) || "/placeholder.svg"}
                    alt={company.companyName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>

            {/* Company Info */}
            <div className="pt-20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.companyName}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {company.companyType && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{company.companyType}</span>
                    )}
                    {company.foundedYear && <span>📅 Founded {company.foundedYear}</span>}
                    {company.employeeCount && <span>👥 {company.employeeCount} employees</span>}
                  </div>
                </div>

                {company.website && (
                  <div className="mt-4 lg:mt-0">
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-block"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {company.description && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About Company</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{company.description}</p>
              </div>
            )}

            {/* Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Products & Services ({products.length})</h2>

              {products.length === 0 ? (
                <p className="text-gray-500">No products listed yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images ? (
                            <img
                              src={pb.files.getUrl(product, product.images) || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          {product.price && <p className="text-sm font-medium text-blue-600">${product.price}</p>}
                          <button
                            onClick={(e) => handleInquiry(product.id, e)}
                            className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Send Inquiry
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {company.email && (
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">📧</span>
                    <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                      {company.email}
                    </a>
                  </div>
                )}

                {company.phone && (
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">📞</span>
                    <a href={`tel:${company.phone}`} className="text-blue-600 hover:underline">
                      {company.phone}
                    </a>
                  </div>
                )}

                {(company.address || company.city || company.country) && (
                  <div className="flex items-start space-x-3">
                    <span className="text-gray-400 mt-1">📍</span>
                    <div>
                      {company.address && <p>{company.address}</p>}
                      <p>{[company.city, company.state, company.country].filter(Boolean).join(", ")}</p>
                      {company.pincode && <p>{company.pincode}</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Details</h2>
              <div className="space-y-3">
                {company.foundedYear && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Founded:</span>
                    <span className="font-medium">{company.foundedYear}</span>
                  </div>
                )}

                {company.employeeCount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employees:</span>
                    <span className="font-medium">{company.employeeCount}</span>
                  </div>
                )}

                {company.annualTurnover && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annual Turnover:</span>
                    <span className="font-medium">{company.annualTurnover}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Products Listed:</span>
                  <span className="font-medium">{products.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
