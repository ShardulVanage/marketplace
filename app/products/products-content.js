"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import pb from "../../lib/pocketbase"
import Navbar from "../../components/common/Navbar"

export default function ProductsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [error, setError] = useState("")
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    // Get category from URL params
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      setSelectedCategory(decodeURIComponent(categoryParam))
    } else {
      setSelectedCategory("")
    }
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError("")

      // Build filter conditions step by step
      const filterConditions = []

      // Always filter for published products
      filterConditions.push("isPublished = true")

      // Add search filter if search term exists
      if (searchTerm.trim()) {
        filterConditions.push(`(name ~ "${searchTerm.trim()}" || description ~ "${searchTerm.trim()}")`)
      }

      // Add category filter if category is selected
      if (selectedCategory.trim()) {
        filterConditions.push(`category = "${selectedCategory.trim()}"`)
      }

      const filter = filterConditions.join(" && ")

      console.log("Applying filter:", filter)
      console.log("Selected category:", selectedCategory)

      const records = await pb.collection("products").getList(1, 50, {
        filter: filter,
        expand: "company",
        sort: "-created",
      })

      console.log(`Found ${records.items.length} products`)
      console.log(
        "Sample product categories:",
        records.items.slice(0, 3).map((p) => ({ name: p.name, category: p.category })),
      )

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

  const clearCategoryFilter = () => {
    setSelectedCategory("")
    router.push("/products")
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
    router.push("/products")
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
              <h1 className="text-xl font-semibold text-gray-900">Browse Products & Services</h1>
              {selectedCategory && (
                <p className="text-sm text-gray-600">
                  Category: <span className="font-medium text-blue-600">{selectedCategory}</span>
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => router.push("/categories")} className="text-gray-600 hover:text-gray-500">
                All Categories
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Active Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {/* Active Filters */}
          {(selectedCategory || searchTerm) && (
            <div className="mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Category: {selectedCategory}
                    <button
                      onClick={clearCategoryFilter}
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

          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by product name or description..."
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
            <button onClick={fetchProducts} className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded">
              Try Again
            </button>
          </div>
        )}

        {/* Results Summary */}
        {!loading && !error && (
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              {totalProducts} product{totalProducts !== 1 ? "s" : ""} found
              {selectedCategory && ` in "${selectedCategory}"`}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
            {selectedCategory && (
              <button
                onClick={() => router.push("/categories")}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-700"
              >
                Browse Other Categories
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              {selectedCategory ? `Loading ${selectedCategory} products...` : "Loading products..."}
            </p>
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
            <p className="text-gray-500 text-lg mb-2">Failed to load products</p>
            <p className="text-gray-400 mb-4">Please check your connection and try again</p>
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
              {selectedCategory ? `No products found in "${selectedCategory}"` : "No products found"}
            </p>
            <p className="text-gray-400 mb-4">
              {selectedCategory || searchTerm
                ? "Try browsing other categories or adjusting your search"
                : "No products are currently available"}
            </p>
            <div className="flex justify-center space-x-4">
              {selectedCategory && (
                <button
                  onClick={() => router.push("/categories")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Browse Other Categories
                </button>
              )}
              {(selectedCategory || searchTerm) && (
                <button
                  onClick={clearAllFilters}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  View All Products
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                  <p className="text-sm text-gray-600 mb-2">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{product.category}</span>
                  </p>

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
      </div>
    </div>
  )
}
