"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import ReCAPTCHA from "react-google-recaptcha"

const prefixOptions = [
  "Mr",
  "Ms",
  "Dr",
  "Prof",
  "Admiral",
  "Advocate",
  "Air Chief",
  "Air Cmde",
  "Air Marshal",
  "Amb",
  "Ambassador",
  "Ar",
  "AVM",
  "Brig",
  "Captain",
  "Cdr",
  "CMA",
  "Cmde",
  "Col",
  "Commander",
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
  const { register, requestOTPForUser, verifyOTPForUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1) // 1: Role Selection, 2: Registration Form, 3: Email Verification
  const [selectedRole, setSelectedRole] = useState("")
  const [otpId, setOtpId] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [captchaToken, setCaptchaToken] = useState("")
  const [userRecord, setUserRecord] = useState(null) // Store created user record
  const [formData, setFormData] = useState({
    prefix: "",
    firstName: "",
    lastName: "",
    organizationName: "",
    email: "",
    mobile: "",
    password: "",
    passwordConfirm: "",
    designation: "",
    country: "",
    sectorsOfInterest: [],
    functionalAreas: [],
    linkedin: "",
    userRole: "",
    profileStatus: "pending",
    membershipStatus: "inactive",
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

  const handleRoleSelection = (role) => {
    setSelectedRole(role)
    setFormData((prev) => ({
      ...prev,
      userRole: role,
    }))
    setStep(2)
  }

  const handleRegistrationAndOTP = async () => {
    // Validation
    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (!formData.email || !formData.firstName || !formData.lastName || !formData.organizationName || !formData.country) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Convert arrays to comma-separated strings for PocketBase
      const submitData = {
        ...formData,
        sectorsOfInterest: formData.sectorsOfInterest.join(","),
        functionalAreas: formData.functionalAreas.join(","),
        verified: false, // Will be set to true after OTP verification
      }

      // Step 1: Create user account first
      console.log("Creating user account...")
      const result = await register(submitData)

      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      setUserRecord(result.user)
      console.log("User created successfully:", result.user.email)

      // Step 2: Request OTP for the newly created user
      console.log("Requesting OTP for user...")
      const otpResult = await requestOTPForUser(result.user.email)
      
      if (otpResult.success) {
        setOtpId(otpResult.otpId)
        setStep(3) // Move to OTP verification step
        console.log("OTP sent successfully")
      } else {
        setError(otpResult.error)
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Failed to create account. Please try again.")
    }

    setLoading(false)
  }

  const handleOtpVerification = async () => {
    if (!otpCode) {
      setError("Please enter the OTP code")
      return
    }

    if (!captchaToken) {
      setError("Please complete the CAPTCHA")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Verify the OTP
      const otpResult = await verifyOTPForUser(otpId, otpCode)
      if (!otpResult.success) {
        setError(otpResult.error)
        setLoading(false)
        return
      }

      console.log("OTP verified successfully")

      // Verify CAPTCHA
      const captchaResponse = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: captchaToken }),
      })

      if (!captchaResponse.ok) {
        const captchaData = await captchaResponse.json()
        setError(captchaData.error || "CAPTCHA verification failed")
        setLoading(false)
        return
      }

      console.log("CAPTCHA verified successfully")

      // Registration complete - redirect based on role
      if (selectedRole === "seller") {
        router.push("/company/setup")
      } else {
        router.push("/dashboard/pending")
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      setError("Failed to verify OTP")
    }

    setLoading(false)
  }

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token)
  }

  const handleResendOTP = async () => {
    if (!userRecord) {
      setError("No user record found. Please try registration again.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const otpResult = await requestOTPForUser(userRecord.email)
      
      if (otpResult.success) {
        setOtpId(otpResult.otpId)
        console.log("OTP resent successfully")
        // Show success message briefly
        setError("")
        setTimeout(() => {
          setError("")
        }, 3000)
      } else {
        setError(otpResult.error)
      }
    } catch (error) {
      console.error("Resend OTP error:", error)
      setError("Failed to resend OTP")
    }

    setLoading(false)
  }

  // Step 1: Role Selection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Join Our B2B Marketplace</h1>
              <p className="text-gray-600 mt-2">Choose your account type to get started</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seller Option */}
              <div
                onClick={() => handleRoleSelection("seller")}
                className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Register as Seller</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Perfect for businesses looking to showcase and sell their products/services
                  </p>
                  <ul className="text-left text-sm text-gray-600 space-y-1">
                    <li>• List unlimited products & services</li>
                    <li>• Receive buyer inquiries</li>
                    <li>• Company profile showcase</li>
                    <li>• Advanced analytics</li>
                  </ul>
                </div>
              </div>

              {/* Buyer Option */}
              <div
                onClick={() => handleRoleSelection("buyer")}
                className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Register as Buyer</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Ideal for businesses looking to source products and services
                  </p>
                  <ul className="text-left text-sm text-gray-600 space-y-1">
                    <li>• Browse & search products</li>
                    <li>• Post buying requirements</li>
                    <li>• Connect with suppliers</li>
                    <li>• Access to verified sellers</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
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

  // Step 2: Registration Form
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-xl rounded-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Create Your {selectedRole === "seller" ? "Seller" : "Buyer"} Account
              </h1>
              <p className="text-gray-600 mt-2">Fill in your details to get started</p>
              <div className="mt-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedRole === "seller" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedRole === "seller" ? "Seller Account" : "Buyer Account"}
                </span>
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

            <form className="space-y-6">
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

                {/* Organization Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div className="md:col-span-2">
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
                    placeholder="Enter your email address"
                  />
                  <p className="text-sm text-gray-500 mt-1">We'll send you an OTP to verify your email address after account creation</p>
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

                {/* Designation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
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

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile (Optional)</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/in/yourprofile"
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
              </div>

              {/* Sectors of Interest */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sectors of Interest</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Functional Areas</label>
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

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 font-medium"
                >
                  Back to Role Selection
                </button>
                <button
                  type="button"
                  onClick={handleRegistrationAndOTP}
                  disabled={loading}
                  className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Creating Account..." : "Create Account & Send OTP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Email Verification
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-xl rounded-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
              <p className="text-gray-600 mt-2">
                We've sent a verification code to <strong>{formData.email}</strong>
              </p>
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  ✅ Account created successfully! Please verify your email to complete registration.
                </p>
              </div>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                  placeholder="Enter OTP code"
                  maxLength={8}
                />
              </div>

              {/* reCAPTCHA */}
              <div className="flex justify-center">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  onChange={handleCaptchaChange}
                />
              </div>

              <button
                onClick={handleOtpVerification}
                disabled={loading || !otpCode || !captchaToken}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Verifying..." : "Verify Email & Complete Registration"}
              </button>

              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-500 text-sm"
                >
                  Didn't receive the code? Resend OTP
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setStep(2)}
                  className="text-gray-600 hover:text-gray-500 text-sm"
                >
                  Back to Registration Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
