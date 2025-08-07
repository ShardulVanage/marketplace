"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import pb from "../../../lib/pocketbase"

const businessTypes = [
  "Private Limited Company",
  "Public Limited Company",
  "Partnership",
  "LLP (Limited Liability Partnership)",
  "Sole Proprietorship",
  "Trust",
  "Society",
  "NGO",
  "Government Organization",
  "Other",
]

const industries = [
  "Agriculture & Food Processing",
  "Automotive",
  "Banking & Financial Services",
  "Chemicals & Petrochemicals",
  "Construction & Real Estate",
  "Education",
  "Electronics & IT",
  "Energy & Power",
  "Healthcare & Pharmaceuticals",
  "Manufacturing",
  "Mining & Metals",
  "Oil & Gas",
  "Retail & E-commerce",
  "Telecommunications",
  "Textiles",
  "Transportation & Logistics",
  "Other",
]

export default function CompanySetupPage() {
  const router = useRouter()
  const { user, isAuthenticated, isSeller } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState("")

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Information
    companyName: "",
    businessType: "",
    industry: "",
    establishedYear: "",
    employeeCount: "",
    annualTurnover: "",
    website: "",
    description: "",

    // Address Information
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    phone: "",
    fax: "",

    // Company Details
    cinNumber: "",
    gstNumber: "",
    panNumber: "",
    importExportCode: "",
    certifications: "",

    // JV Details (JSON)
    jvDetails: {
      lookingForJV: false,
      jvTypes: [],
      preferredRegions: [],
      investmentRange: "",
      jvDescription: "",
    },

    // Collaboration Details (JSON)
    collaborationDetails: {
      lookingForCollaboration: false,
      collaborationTypes: [],
      areasOfInterest: [],
      collaborationDescription: "",
    },

    // Standard Details (JSON)
    standardDetails: {
      qualityCertifications: [],
      complianceStandards: [],
      awards: [],
      memberships: [],
    },
  })

  // Dynamic arrays for adding/removing items
  const [jvTypes, setJvTypes] = useState([""])
  const [preferredRegions, setPreferredRegions] = useState([""])
  const [collaborationTypes, setCollaborationTypes] = useState([""])
  const [areasOfInterest, setAreasOfInterest] = useState([""])
  const [qualityCertifications, setQualityCertifications] = useState([""])
  const [complianceStandards, setComplianceStandards] = useState([""])
  const [awards, setAwards] = useState([""])
  const [memberships, setMemberships] = useState([""])

  useEffect(() => {
    if (!isAuthenticated || !isSeller) {
      router.push("/login")
      return
    }

    // Pre-fill some data from user profile
    if (user) {
      setFormData((prev) => ({
        ...prev,
        companyName: user.organizationName || "",
        country: user.country || "",
      }))
    }
  }, [isAuthenticated, isSeller, user, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (section, field) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field],
      },
    }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Dynamic array handlers
  const addArrayItem = (setter, array) => {
    setter([...array, ""])
  }

  const removeArrayItem = (setter, array, index) => {
    setter(array.filter((_, i) => i !== index))
  }

  const updateArrayItem = (setter, array, index, value) => {
    const newArray = [...array]
    newArray[index] = value
    setter(newArray)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Prepare the data with JSON fields
      const submitData = {
        ...formData,
        userId: user.id,
        jvDetails: JSON.stringify({
          ...formData.jvDetails,
          jvTypes: jvTypes.filter((item) => item.trim() !== ""),
          preferredRegions: preferredRegions.filter((item) => item.trim() !== ""),
        }),
        collaborationDetails: JSON.stringify({
          ...formData.collaborationDetails,
          collaborationTypes: collaborationTypes.filter((item) => item.trim() !== ""),
          areasOfInterest: areasOfInterest.filter((item) => item.trim() !== ""),
        }),
        standardDetails: JSON.stringify({
          qualityCertifications: qualityCertifications.filter((item) => item.trim() !== ""),
          complianceStandards: complianceStandards.filter((item) => item.trim() !== ""),
          awards: awards.filter((item) => item.trim() !== ""),
          memberships: memberships.filter((item) => item.trim() !== ""),
        }),
        status: "pending", // Company profile pending approval
      }

      // Create company record
      const companyRecord = await pb.collection("companies").create(submitData)

      // Upload logo if provided
      if (logoFile) {
        const formData = new FormData()
        formData.append("logo", logoFile)

        await pb.collection("companies").update(companyRecord.id, formData)
      }

      console.log("✅ Company profile created successfully")

      // Redirect to pending dashboard
      router.push("/dashboard/pending")
    } catch (error) {
      console.error("❌ Company setup error:", error)
      setError(error.message || "Failed to create company profile")
    }

    setLoading(false)
  }

  if (!isAuthenticated || !isSeller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Only sellers can access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Company Profile</h1>
            <p className="text-gray-600 mt-2">Provide detailed information about your company</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Business Type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Established Year</label>
                  <input
                    type="number"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleInputChange}
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee Count</label>
                  <select
                    name="employeeCount"
                    value={formData.employeeCount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Employee Count</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="501-1000">501-1000</option>
                    <option value="1000+">1000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Annual Turnover</label>
                  <select
                    name="annualTurnover"
                    value={formData.annualTurnover}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Annual Turnover</option>
                    <option value="Under 1 Crore">Under 1 Crore</option>
                    <option value="1-5 Crores">1-5 Crores</option>
                    <option value="5-25 Crores">5-25 Crores</option>
                    <option value="25-100 Crores">25-100 Crores</option>
                    <option value="100-500 Crores">100-500 Crores</option>
                    <option value="500+ Crores">500+ Crores</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your company, products, and services..."
                  />
                </div>
              </div>
            </div>

            {/* Company Logo */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Logo</h2>
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  {logoPreview ? (
                    <img className="h-20 w-20 object-cover rounded-lg" src={logoPreview || "/placeholder.svg"} alt="Logo preview" />
                  ) : (
                    <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 2MB</p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fax</label>
                  <input
                    type="tel"
                    name="fax"
                    value={formData.fax}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CIN Number</label>
                  <input
                    type="text"
                    name="cinNumber"
                    value={formData.cinNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Import Export Code</label>
                  <input
                    type="text"
                    name="importExportCode"
                    value={formData.importExportCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                  <textarea
                    name="certifications"
                    value={formData.certifications}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List your company certifications..."
                  />
                </div>
              </div>
            </div>

            {/* JV Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Joint Venture Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lookingForJV"
                    checked={formData.jvDetails.lookingForJV}
                    onChange={() => handleCheckboxChange("jvDetails", "lookingForJV")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="lookingForJV" className="ml-2 block text-sm text-gray-900">
                    Looking for Joint Ventures
                  </label>
                </div>

                {formData.jvDetails.lookingForJV && (
                  <div className="space-y-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">JV Types</label>
                      {jvTypes.map((type, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={type}
                            onChange={(e) => updateArrayItem(setJvTypes, jvTypes, index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter JV type"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem(setJvTypes, jvTypes, index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem(setJvTypes, jvTypes)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add JV Type
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Regions</label>
                      {preferredRegions.map((region, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={region}
                            onChange={(e) => updateArrayItem(setPreferredRegions, preferredRegions, index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter preferred region"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem(setPreferredRegions, preferredRegions, index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem(setPreferredRegions, preferredRegions)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Region
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Investment Range</label>
                      <input
                        type="text"
                        value={formData.jvDetails.investmentRange}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            jvDetails: { ...prev.jvDetails, investmentRange: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., $1M - $5M"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">JV Description</label>
                      <textarea
                        value={formData.jvDetails.jvDescription}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            jvDetails: { ...prev.jvDetails, jvDescription: e.target.value },
                          }))
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your JV requirements..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Collaboration Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Collaboration Details</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lookingForCollaboration"
                    checked={formData.collaborationDetails.lookingForCollaboration}
                    onChange={() => handleCheckboxChange("collaborationDetails", "lookingForCollaboration")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="lookingForCollaboration" className="ml-2 block text-sm text-gray-900">
                    Looking for Collaborations
                  </label>
                </div>

                {formData.collaborationDetails.lookingForCollaboration && (
                  <div className="space-y-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Collaboration Types</label>
                      {collaborationTypes.map((type, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={type}
                            onChange={(e) => updateArrayItem(setCollaborationTypes, collaborationTypes, index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter collaboration type"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem(setCollaborationTypes, collaborationTypes, index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem(setCollaborationTypes, collaborationTypes)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Collaboration Type
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Areas of Interest</label>
                      {areasOfInterest.map((area, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={area}
                            onChange={(e) => updateArrayItem(setAreasOfInterest, areasOfInterest, index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter area of interest"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem(setAreasOfInterest, areasOfInterest, index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem(setAreasOfInterest, areasOfInterest)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Area
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Collaboration Description</label>
                      <textarea
                        value={formData.collaborationDetails.collaborationDescription}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            collaborationDetails: { ...prev.collaborationDetails, collaborationDescription: e.target.value },
                          }))
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your collaboration requirements..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Standard Details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Standards & Achievements</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quality Certifications</label>
                  {qualityCertifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={cert}
                        onChange={(e) => updateArrayItem(setQualityCertifications, qualityCertifications, index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter certification"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(setQualityCertifications, qualityCertifications, index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem(setQualityCertifications, qualityCertifications)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Certification
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Standards</label>
                  {complianceStandards.map((standard, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={standard}
                        onChange={(e) => updateArrayItem(setComplianceStandards, complianceStandards, index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter compliance standard"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(setComplianceStandards, complianceStandards, index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem(setComplianceStandards, complianceStandards)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Standard
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Awards & Recognition</label>
                  {awards.map((award, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={award}
                        onChange={(e) => updateArrayItem(setAwards, awards, index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter award or recognition"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(setAwards, awards, index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem(setAwards, awards)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Award
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Memberships</label>
                  {memberships.map((membership, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={membership}
                        onChange={(e) => updateArrayItem(setMemberships, memberships, index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter membership"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(setMemberships, memberships, index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem(setMemberships, memberships)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Membership
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-3 px-8 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {loading ? "Creating Company Profile..." : "Complete Company Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
