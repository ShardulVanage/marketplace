"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"

const prefixOptions = [
  "Mr",
  "Ms",
  "Admiral",
  "Advocate",
  "Air Chief",
  "Air Cmde",
  "Air Marshal",
  "Amb",
  "Ambassador",
  "Ar",
  "AVM",
  "AVM (Mrs.)",
  "Brig",
  "Brig (Retd)",
  "Captain",
  "Cdr",
  "CMA",
  "Cmde",
  "Col",
  "Commander",
  "Dr",
]

const countries = [
  "India",
  "Pakistan",
  "China",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "South Korea",
  "Singapore",
  "UAE",
  "Saudi Arabia",
  "Brazil",
  "Russia",
  "South Africa",
]

const sectorsOfInterest = [
  "Affirmative Action",
  "Agriculture",
  "Artificial Intelligence",
  "Arts, Heritage & Culture",
  "ASCON",
  "Auto Components",
  "Automobiles",
  "Banking",
  "Bio Fuels",
  "Bioenergy",
  "Biotechnology",
  "Business Process Outsourcing",
  "Capital Goods",
  "Capital Market",
  "Chemicals",
  "Civil Aviation",
  "Climate Change",
  "Competition law",
  "Competitiveness",
  "Corporate Governance",
  "COVID-19",
  "CSR & Community Development",
]

const functionalAreas = [
  "Academic Administration",
  "Celebrity",
  "Chairman / Managing Director / CEO",
  "CII Membership Contact",
  "Corporate Affairs",
  "Corporate Communications",
  "CSR / Sustainable Development",
  "Diplomat",
  "Doctors",
  "Engineering",
  "Export / International Trade",
  "Finance & Accounts",
  "Government",
  "Human Resource Development",
  "Information Technology",
  "Journalist",
  "Law / Judiciary",
  "Manufacturing / Production",
  "Marketing & Business Development",
  "Materials Management",
  "Media",
  "Medical",
  "Other",
  "Politicians",
  "Purchase / Procurement",
  "Quality Management",
  "Research & Development / Technology",
  "Safety / Security",
  "Top Management / COO / CTO / CFO / VPs / Directors",
  "Vendor Development",
]

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    prefix: "",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    passwordConfirm: "",
    designation: "",
    country: "",
    sectorsOfInterest: [],
    functionalAreas: [],
    userType: "non_member",
    membershipStatus: "pending",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleMultiSelectChange = (e, fieldName) => {
    const { value, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [fieldName]: checked ? [...prev[fieldName], value] : prev[fieldName].filter((item) => item !== value),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    // Convert arrays to comma-separated strings for PocketBase
    const submitData = {
      ...formData,
      sectorsOfInterest: formData.sectorsOfInterest.join(","),
      functionalAreas: formData.functionalAreas.join(","),
    }

    const result = await register(submitData)

    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
            <p className="text-gray-600 mt-2">Join our B2B marketplace community</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prefix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prefix <span className="text-red-500">*</span>
                </label>
                <select
                  name="prefix"
                  value={formData.prefix}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Prefix</option>
                  {prefixOptions.map((prefix) => (
                    <option key={prefix} value={prefix}>
                      {prefix}
                    </option>
                  ))}
                </select>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile (Optional)</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sectors of Interest */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sectors of Interest <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                {sectorsOfInterest.map((sector) => (
                  <label key={sector} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={sector}
                      checked={formData.sectorsOfInterest.includes(sector)}
                      onChange={(e) => handleMultiSelectChange(e, "sectorsOfInterest")}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{sector}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Functional Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Functional Areas <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                {functionalAreas.map((area) => (
                  <label key={area} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={area}
                      checked={formData.functionalAreas.includes(area)}
                      onChange={(e) => handleMultiSelectChange(e, "functionalAreas")}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
