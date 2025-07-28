"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import pb from "../../../lib/pocketbase"

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const record = await pb.collection("products").getOne(params.id, {
        expand: "company,company.user",
        requestKey: null,
      })
      setProduct(record)
    } catch (error) {
      setError("Product not found")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleInquiry = () => {
    if (!user) {
      router.push("/login")
      return
    }
    router.push(`/inquiries/post?product=${product.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{error || "Product not found"}</p>
          <button
            onClick={() => router.push("/products")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Products
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
            <h1 className="text-xl font-semibold text-gray-900">Product Details</h1>
            <button onClick={() => router.push("/products")} className="text-blue-600 hover:text-blue-500">
              Back to Products
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div>
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                {product.images ? (
                  <img
                    src={pb.files.getUrl(product, product.images) || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>

            {/* Product Information */}
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-lg text-gray-600">{product.category}</p>
                {product.price && <p className="text-2xl font-bold text-blue-600 mt-2">${product.price}</p>}
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h2>
                <p className="text-gray-700">{product.contact}</p>
              </div>

              {/* Company Information */}
              {product.expand?.company && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Company Information</h2>
                  <div className="space-y-2">
                    <p>
                      <strong>Company:</strong> {product.expand.company.companyName}
                    </p>
                    {product.expand.company.description && (
                      <p>
                        <strong>About:</strong> {product.expand.company.description}
                      </p>
                    )}
                    {product.expand.company.website && (
                      <p>
                        <strong>Website:</strong>{" "}
                        <a
                          href={product.expand.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {product.expand.company.website}
                        </a>
                      </p>
                    )}
                    {product.expand.company.city && product.expand.company.country && (
                      <p>
                        <strong>Location:</strong> {product.expand.company.city}, {product.expand.company.country}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleInquiry}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-medium"
                >
                  Send Inquiry to Seller
                </button>
                <button
                  onClick={() => router.push("/products")}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 font-medium"
                >
                  Browse More Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
