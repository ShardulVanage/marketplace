"use client"

import { useRouter } from "next/navigation"

const categoryData = [
  { name: "Agriculture", slug: "agriculture", icon: "🌾" },
  { name: "Automobiles", slug: "automobiles", icon: "🚗" },
  { name: "Banking & Finance", slug: "banking-finance", icon: "🏦" },
  { name: "Chemicals", slug: "chemicals", icon: "⚗️" },
  { name: "Construction", slug: "construction", icon: "🏗️" },
  { name: "Education", slug: "education", icon: "📚" },
  { name: "Electronics", slug: "electronics", icon: "💻" },
  { name: "Energy", slug: "energy", icon: "⚡" },
  { name: "Food & Beverages", slug: "food-beverages", icon: "🍽️" },
  { name: "Healthcare", slug: "healthcare", icon: "🏥" },
  { name: "Information Technology", slug: "information-technology", icon: "💾" },
  { name: "Manufacturing", slug: "manufacturing", icon: "🏭" },
]

export default function ProductCategoriesSection() {
  const router = useRouter()

  const handleCategoryClick = (categorySlug) => {
    // Navigate to category-specific page using slug
    router.push(`/categories/${categorySlug}`)
  }

  return (
    <div className="mt-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Categories</h2>
        <p className="text-xl text-gray-600">Explore products by industry</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        {categoryData.map((category) => (
          <div
            key={category.slug}
            onClick={() => handleCategoryClick(category.slug)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer p-6 text-center group hover:scale-105"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">{category.icon}</div>
            <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => router.push("/categories")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          View All Categories
        </button>
      </div>
    </div>
  )
}
