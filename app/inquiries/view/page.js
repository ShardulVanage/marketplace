"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../contexts/AuthContext"
import pb from "../../../lib/pocketbase"

export default function ViewInquiriesPage() {
  const router = useRouter()
  const { user, isMember } = useAuth()
  const [loading, setLoading] = useState(true)
  const [inquiries, setInquiries] = useState([])
  const [filter, setFilter] = useState("all") // all, sent, replied, closed
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    if (!isMember) {
      router.push("/dashboard/non-member")
      return
    }
    fetchInquiries()
  }, [user, isMember, router, filter])

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      setError("")

      let filterQuery = `receiver="${user.id}"`

      if (filter !== "all") {
        filterQuery += ` && status="${filter}"`
      }

      // Use a more robust query with proper error handling
      const records = await pb.collection("inquiries").getList(1, 50, {
        filter: filterQuery,
        expand: "sender,product,product.company",
        sort: "-created",
        requestKey: null, // Disable auto-cancellation
      })

      setInquiries(records.items)
    } catch (error) {
      // Only set error if it's not a cancellation
      if (!error.isAbort) {
        setError("Failed to fetch inquiries")
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  const updateInquiryStatus = async (inquiryId, newStatus) => {
    try {
      await pb.collection("inquiries").update(inquiryId, { status: newStatus })
      fetchInquiries() // Refresh the list
    } catch (error) {
      setError("Failed to update inquiry status")
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800"
      case "replied":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user || !isMember) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">Inquiries Received</h1>
            <button onClick={() => router.push("/dashboard/member")} className="text-blue-600 hover:text-blue-500">
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: "all", label: "All Inquiries" },
                { key: "sent", label: "New" },
                { key: "replied", label: "Replied" },
                { key: "closed", label: "Closed" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {/* Inquiries List */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading inquiries...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No inquiries found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {inquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {inquiry.expand?.product?.name || "Product inquiry"}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(inquiry.status)}`}
                        >
                          {inquiry.status}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        <p>
                          <strong>From:</strong> {inquiry.expand?.sender?.firstName} {inquiry.expand?.sender?.lastName}
                        </p>
                        <p>
                          <strong>Email:</strong> {inquiry.expand?.sender?.email}
                        </p>
                        <p>
                          <strong>Date:</strong> {formatDate(inquiry.created)}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-md p-3 mb-4">
                        <p className="text-sm text-gray-700">{inquiry.message}</p>
                      </div>

                      {inquiry.expand?.product && (
                        <div className="text-sm text-gray-600">
                          <p>
                            <strong>Product:</strong> {inquiry.expand.product.name}
                          </p>
                          {inquiry.expand.product.expand?.company && (
                            <p>
                              <strong>Company:</strong> {inquiry.expand.product.expand.company.companyName}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      {inquiry.status === "sent" && (
                        <button
                          onClick={() => updateInquiryStatus(inquiry.id, "replied")}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Mark as Replied
                        </button>
                      )}
                      {inquiry.status !== "closed" && (
                        <button
                          onClick={() => updateInquiryStatus(inquiry.id, "closed")}
                          className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
