"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import pb from "../../../lib/pocketbase"
import Navbar from "../../../components/common/Navbar"

export default function PostInquiryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [product, setProduct] = useState(null)
  const [formData, setFormData] = useState({
    message: "",
  })

  const productId = searchParams.get("product")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (productId) {
      fetchProduct()
    }
  }, [user, productId, router])

  const fetchProduct = async () => {
    try {
      const productRecord = await pb.collection("products").getOne(productId, {
        expand: "company,company.user",
      })
      setProduct(productRecord)
    } catch (error) {
      setError("Product not found")
    }
  }

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

    if (!product) {
      setError("No product selected")
      setLoading(false)
      return
    }

    try {
      const inquiryData = {
        sender: user.id,
        receiver: product.expand?.company?.expand?.user?.id || product.expand?.company?.user,
        product: product.id,
        message: formData.message,
        status: "sent",
      }

      await pb.collection("inquiries").create(inquiryData)

      setSuccess("Inquiry sent successfully!")
      setFormData({ message: "" })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      setError(error.message || "Failed to send inquiry")
    }

    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please login to send inquiries.</p>
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!productId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-600">No product selected for inquiry.</p>
            <button
              onClick={() => router.push("/products")}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Send Inquiry</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg p-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              {success}
              <p className="text-sm mt-1">Redirecting to dashboard...</p>
            </div>
          )}

          {/* Product Information */}
          {product && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Product Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p>
                    <strong>Product:</strong> {product.name}
                  </p>
                  <p>
                    <strong>Category:</strong> {product.category}
                  </p>
                  {product.price && (
                    <p>
                      <strong>Price:</strong> ${product.price}
                    </p>
                  )}
                </div>
                <div>
                  {product.expand?.company && (
                    <>
                      <p>
                        <strong>Company:</strong> {product.expand.company.companyName}
                      </p>
                      <p>
                        <strong>Contact:</strong> {product.contact}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <p>
                  <strong>Description:</strong>
                </p>
                <p className="text-gray-700 mt-1">{product.description}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inquiry Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Inquiry Message <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please provide details about your inquiry, including:
- Quantity required
- Delivery timeline
- Specific requirements
- Any questions about the product/service"
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
              <p className="text-xs text-blue-700 mt-2">This information will be shared with the seller.</p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || !product}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Sending Inquiry..." : "Send Inquiry"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
