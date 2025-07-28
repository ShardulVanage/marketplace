"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import pb from "@/lib/pocketbase"
import ProductCard from "./common/ProductCard"

export default function LatestProductsSection() {
  const router = useRouter()
  const [latestProducts, setLatestProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestProducts()
  }, [])

  const fetchLatestProducts = async () => {
    try {
      const records = await pb.collection("products").getList(1, 6, {
        filter: "isPublished = true",
        expand: "company",
        sort: "-created",
        requestKey: null,
      })
      setLatestProducts(records.items)
    } catch (error) {
      console.error("Failed to fetch latest products:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Products Added</h2>
        <p className="text-xl text-gray-600">Discover the newest products and services</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} showCompanyButton={true} />
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push("/products")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View All Products
            </button>
          </div>
        </>
      )}
    </div>
  )
}
