"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import pb from "../../../lib/pocketbase"

// Category data with slugs
const categoryData = [
  { name: "Agriculture", slug: "agriculture", icon: "🌾", description: "Agricultural products and farming equipment" },
  { name: "Automobiles", slug: "automobiles", icon: "🚗", description: "Vehicles, parts, and automotive services" },
  {
    name: "Banking & Finance",
    slug: "banking-finance",
    icon: "🏦",
    description: "Financial services and banking solutions",
  },
  { name: "Chemicals", slug: "chemicals", icon: "⚗️", description: "Chemical products and industrial chemicals" },
  {
    name: "Construction",
    slug: "construction",
    icon: "🏗️",
    description: "Construction materials and building services",
  },
  { name: "Education", slug: "education", icon: "📚", description: "Educational services and learning solutions" },
  { name: "Electronics", slug: "electronics", icon: "💻", description: "Electronic devices and components" },
  { name: "Energy", slug: "energy", icon: "⚡", description: "Energy solutions and power generation" },
  { name: "Food & Beverages", slug: "food-beverages", icon: "🍽️", description: "Food products and beverage solutions" },
  { name: "Healthcare", slug: "healthcare", icon: "🏥", description: "Medical equipment and healthcare services" },
  {
    name: "Information Technology",
    slug: "information-technology",
    icon: "💾",
    description: "IT services and software solutions",
  },
  {
    name: "Manufacturing",
    slug: "manufacturing",
    icon: "🏭",
    description: "Manufacturing equipment and industrial machinery",
  },
  { name: "Real Estate", slug: "real-estate", icon: "🏢", description: "Property and real estate services" },
  { name: "Retail", slug: "retail", icon: "🛍️", description: "Retail products and consumer goods" },
  { name: "Textiles", slug: "textiles", icon: "🧵", description: "Textile products and fabric materials" },
  { name: "Transportation", slug: "transportation", icon: "🚛", description: "Transportation and logistics services" },
  { name: "Other", slug: "other", icon: "📦", description: "Other products and services" },
]

export default function CategoryProductsPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentCategory, setCurrentCategory] = useState(null)

  useEffect(() => {
    // Find category by slug
    const categorySlug = params.category
    const category = categoryData.find((cat) => cat.slug === categorySlug)

    if (category) {
      setCurrentCategory(category)
      fetchProducts(category.name)
    } else {
      setError("Category not found")
      setLoading(false)
    }
  }, [params.category])

  useEffect(() => {
    if (currentCategory) {
      fetchProducts(currentCategory.name)
    }
  }, [searchTerm, currentCategory])

  const fetchProducts = async (categoryName) => {
    try {
      setLoading(true)
      setError("")

      // Build filter conditions
      const filterConditions = ["isPublished = true"]

      // Add category filter
      filterConditions.push(`category = "${categoryName}"`)

      // Add search filter if search term exists
      if (searchTerm.trim()) {
        filterConditions.push(`(name ~ "${searchTerm.trim()}" || description ~ "${searchTerm.trim()}")`)
      }

      const filter = filterConditions.join(" && ")

      console.log("Fetching products for category:", categoryName)
      console.log("Applied filter:", filter)

      const records = await pb.collection("products").getList(1, 50, {
        filter: filter,
        expand: "company",
        sort: "-created",
      })

      console.log(`Found ${records.items.length} products in ${categoryName}`)
      setProducts(records.items)
      setTotalProducts(records.totalItems)
    } catch (error) {
      console.error("Error fetching products:", error)
      setError(`Failed to fetch products: ${error.message}`)
      setProducts([])
      setTotalProducts(0)
    } finally {
      setLoading(false)
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

  const getRelatedCategories = () => {
    return categoryData.filter((cat) => cat.slug !== params.category).slice(0, 6)
  }

  if (error && !currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
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
          <p className="text-gray-500 text-lg mb-2">Category not found</p>
          <p className="text-gray-400 mb-4">The requested category does not exist</p>
          <button
            onClick={() => router.push("/categories")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Browse All Categories
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
            <div className="flex items-center space-x-4">
              {currentCategory && (
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{currentCategory.icon}</span>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{currentCategory.name}</h1>
                    <p className="text-sm text-gray-600">{currentCategory.description}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => router.push("/categories")} className="text-gray-600 hover:text-gray-500">
                All Categories
              </button>
              <button onClick={() => router.push("/")} className="text-blue-600 hover:text-blue-500">
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search in {currentCategory?.name}</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Search ${currentCategory?.name.toLowerCase()} products...`}
            />
          </div>
          {searchTerm && (
            <div className="mt-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-600"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </div>

        {error && currentCategory && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <button
              onClick={() => fetchProducts(currentCategory.name)}
              className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Summary */}
        {!loading && !error && currentCategory && (
          <div className="mb-6">
            <p className="text-gray-600">
              {totalProducts} product{totalProducts !== 1 ? "s" : ""} found in {currentCategory.name}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading {currentCategory?.name.toLowerCase()} products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm
                ? `No products found matching "${searchTerm}" in ${currentCategory?.name}`
                : `No products found in ${currentCategory?.name}`}
            </p>
            <p className="text-gray-400 mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Be the first to add products in this category!"}
            </p>
            <div className="flex justify-center space-x-4">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Clear Search
                </button>
              )}
              <button
                onClick={() => router.push("/categories")}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Browse Other Categories
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Product Image */}
                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {product.images ? (
                    <img
                      src={pb.files.getUrl(product, product.images) || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                {/* Product Info */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                    {product.price && <span className="text-lg font-bold text-blue-600">${product.price}</span>}
                  </div>

                  <p className="text-gray-700 text-sm line-clamp-3 mb-4">{product.description}</p>

                  {product.expand?.company && (
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Company:</strong> {product.expand.company.companyName}
                    </p>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => handleInquiry(product.id, e)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Send Inquiry
                    </button>
                    <button
                      onClick={() => handleProductClick(product.id)}
                      className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Related Categories */}
        {currentCategory && (
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Explore Other Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {getRelatedCategories().map((category) => (
                <div
                  key={category.slug}
                  onClick={() => router.push(`/categories/${category.slug}`)}
                  className="bg-gray-50 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
