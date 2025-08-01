import { Suspense } from "react"
import Navbar from "../../components/common/Navbar"
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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navbar />

      <Suspense fallback={<ProductsPageFallback />}>
        <ProductsPageContent />
      </Suspense>
    </div>
  )
}