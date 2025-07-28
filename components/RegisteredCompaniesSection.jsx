    "use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import pb from "@/lib/pocketbase"
import CompanyCard from "./common/CompanyCard"

export default function RegisteredCompaniesSection() {
  const router = useRouter()
  const [registeredCompanies, setRegisteredCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRegisteredCompanies()
  }, [])

  const fetchRegisteredCompanies = async () => {
    try {
      const records = await pb.collection("companies").getList(1, 6, {
        filter: "isPublished = true",
        sort: "-created",
        requestKey: null,
      })
      setRegisteredCompanies(records.items)
    } catch (error) {
      console.error("Failed to fetch companies:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Registered Companies</h2>
        <p className="text-xl text-gray-600">Connect with verified business partners</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading companies...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {registeredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push("/companies")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View All Companies
            </button>
          </div>
        </>
      )}
    </div>
  )
}
