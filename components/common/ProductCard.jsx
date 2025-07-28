"use client"

import { useRouter } from "next/navigation"
import pb from "../../lib/pocketbase"

export default function ProductCard({ product, showCompanyButton = false }) {
  const router = useRouter()

  const handleProductClick = () => {
    router.push(`/products/${product.id}`)
  }

  const handleCompanyClick = (e) => {
    e.stopPropagation()
    if (product.expand?.company) {
      router.push(`/companies/${product.expand.company.id}`)
    }
  }

  const handleInquiry = (e) => {
    e.stopPropagation()
    router.push(`/inquiries/post?product=${product.id}`)
  }

  return (
    <div
      onClick={handleProductClick}
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

        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
        <p className="text-gray-700 text-sm line-clamp-2 mb-4">{product.description}</p>

        {product.expand?.company && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              <strong>Company:</strong> {product.expand.company.companyName}
            </p>
            {showCompanyButton && (
              <button
                onClick={handleCompanyClick}
                className="text-xs bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
              >
                About Company
              </button>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleInquiry}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
          >
            Send Inquiry
          </button>
          <button
            onClick={handleProductClick}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}
