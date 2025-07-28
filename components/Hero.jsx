"use client"

export default function HeroSection() {
  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Connect. Trade. Grow.</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Join our comprehensive B2B marketplace where buyers and sellers connect to drive business growth. List your
        products, find suppliers, and expand your network.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/register"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Get Started
        </a>
        <a
          href="/login"
          className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-colors"
        >
          Sign In
        </a>
      </div>
    </div>
  )
}
