"use client"

import { useRouter } from "next/navigation"
import Navbar from "../../components/common/Navbar"

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

export default function CategoriesPage() {
  const router = useRouter()

  const handleCategoryClick = (categorySlug) => {
    // Navigate to category-specific page using slug
    router.push(`/categories/${categorySlug}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Product Categories</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
          <p className="text-xl text-gray-600">Find products and services in your industry</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryData.map((category) => (
            <div
              key={category.slug}
              onClick={() => handleCategoryClick(category.slug)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer p-6 text-center group hover:scale-105"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
              <div className="mt-3 text-sm text-blue-600 group-hover:text-blue-700 transition-colors font-medium">
                Browse Products →
              </div>
            </div>
          ))}
        </div>

        {/* Browse All Products */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push("/products")}
            className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Browse All Products
          </button>
        </div>
      </main>
    </div>
  )
}
