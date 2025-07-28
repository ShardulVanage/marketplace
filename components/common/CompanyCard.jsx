"use client"

import { useRouter } from "next/navigation"
import pb from "../../lib/pocketbase"

export default function CompanyCard({ company }) {
  const router = useRouter()

  const handleCompanyClick = () => {
    router.push(`/companies/${company.id}`)
  }

  return (
    <div
      onClick={handleCompanyClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Company Logo */}
      <div className="h-32 bg-gray-200 rounded-t-lg overflow-hidden">
        {company.companyLogo ? (
          <img
            src={pb.files.getUrl(company, company.companyLogo) || "/placeholder.svg"}
            alt={company.companyName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Company Info */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{company.companyName}</h3>

        {company.description && <p className="text-gray-700 text-sm line-clamp-2 mb-4">{company.description}</p>}

        <div className="space-y-1 text-sm text-gray-600">
          {company.city && company.country && (
            <p>
              📍 {company.city}, {company.country}
            </p>
          )}
          {company.companyType && <p>🏢 {company.companyType}</p>}
        </div>

        <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm">
          View Company Profile
        </button>
      </div>
    </div>
  )
}
