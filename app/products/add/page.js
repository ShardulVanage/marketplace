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

export default function AddProductPage() {
  const router = useRouter()
  const { user, isMember } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userCompany, setUserCompany] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    contact: "",
    isPublished: false,
  })
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (!isMember) {
      router.push("/dashboard/non-member")
      return
    }
    fetchUserCompany()
  }, [user, isMember, router])

  const fetchUserCompany = async () => {
    try {
      const company = await pb.collection("companies").getFirstListItem(`user="${user.id}"`)
      setUserCompany(company)
    } catch (error) {
      console.log("No company found for user")
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const formDataToSubmit = new FormData()

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "price") {
          formDataToSubmit.append(key, Number.parseFloat(formData[key]) || 0)
        } else {
          formDataToSubmit.append(key, formData[key])
        }
      })

      // Add company relation if exists
      if (userCompany) {
        formDataToSubmit.append("company", userCompany.id)
      }

      // Add image if selected
      if (imageFile) {
        formDataToSubmit.append("images", imageFile)
      }

      const record = await pb.collection("products").create(formDataToSubmit)

      setSuccess("Product added successfully!")
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        contact: "",
        isPublished: false,
      })
      setImageFile(null)

      // Reset file input
      const fileInput = document.getElementById("image")
      if (fileInput) fileInput.value = ""
    } catch (error) {
      setError(error.message || "Failed to add product")
    }

    setLoading(false)
  }

  if (!user || !isMember) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Add Product/Service</h1>
            <button onClick={() => router.push("/dashboard/member")} className="text-blue-600 hover:text-blue-500">
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg p-8">
          {!userCompany && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
              <p>
                <strong>Note:</strong> You need to create a company profile first to add products.{" "}
                <button onClick={() => router.push("/company/manage")} className="underline hover:no-underline">
                  Create Company Profile
                </button>
              </p>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product/Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product or service name"
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

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (Optional)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter price"
                />
              </div>

              {/* Contact Information */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number, email, or other contact details"
                />
              </div>

              {/* Product Image */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">Upload an image of your product or service</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide a detailed description of your product or service"
              />
            </div>

            {/* Publish Option */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublished"
                id="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
                Publish immediately (make visible to buyers)
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || !userCompany}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Adding Product..." : "Add Product/Service"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
