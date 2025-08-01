"use client"

import { Suspense } from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import pb from "../../lib/pocketbase"
import ProductsPageContent from "./products-content"

function ProductsPageFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading products...</p>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [error, setError] = useState("")
  const [totalProducts, setTotalProducts] = useState(0)

  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`)
  }

  const handleInquiry = (productId) => {
    // Logic to handle inquiry
    console.log(`Inquiry for product ID: ${productId}`)
  }

  const clearCategoryFilter = () => {
    setSelectedCategory("")
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}

      <Suspense fallback={<ProductsPageFallback />}>
        <ProductsPageContent
          products={products}
          loading={loading}
          error={error}
          totalProducts={totalProducts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          handleProductClick={handleProductClick}
          handleInquiry={handleInquiry}
          clearCategoryFilter={clearCategoryFilter}
          clearAllFilters={clearAllFilters}
        />
      </Suspense>
    </div>
  )
}
