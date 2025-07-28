"use client"

import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import HeroSection from "@/components/Hero"
import ProductCategoriesSection from "@/components/ProductCategoriesSection"
import LatestProductsSection from "@/components/LatestProductsSection"
import RegisteredCompaniesSection from "@/components/RegisteredCompaniesSection"
import FeaturesSection from "@/components/FeaturesSection"
import Navbar from "@/components/common/Navbar"

export default function HomePage() {
  const { loading } = useAuth()

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <HeroSection />

        {/* Product Categories Section */}
        <ProductCategoriesSection />

        {/* Latest Products Section */}
        <LatestProductsSection />

        {/* Registered Companies Section */}
        <RegisteredCompaniesSection />

        {/* Features Section */}
        <FeaturesSection />
      </main>
    </div>
  )
}
