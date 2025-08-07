"use client"

import { createContext, useContext, useEffect, useState } from "react"
import pb from "../lib/pocketbase"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    // Initialize auth state from stored data
    const initializeAuth = async () => {
      try {
        console.log("=== AUTH INITIALIZATION START ===")
        console.log("Auth store valid:", pb.authStore.isValid)
        console.log("Auth store model:", !!pb.authStore.model)
        console.log("Auth store token:", !!pb.authStore.token)

        // Wait a bit for PocketBase to fully initialize
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Check again after waiting
        console.log("After wait - Auth store valid:", pb.authStore.isValid)
        console.log("After wait - Auth store model:", !!pb.authStore.model)

        if (pb.authStore.isValid && pb.authStore.model) {
          console.log("✅ Valid auth found, setting user:", pb.authStore.model.email)
          setUser(pb.authStore.model)
        } else {
          console.log("❌ No valid auth found")

          // Try to manually check localStorage
          try {
            const storedAuth = localStorage.getItem("pocketbase_auth")
            if (storedAuth) {
              console.log("📦 Found stored auth in localStorage, trying to parse...")
              const authData = JSON.parse(storedAuth)
              if (authData && authData.model && authData.token) {
                console.log("✅ Valid stored auth data found, setting user")
                // Manually restore the auth store
                pb.authStore.save(authData.token, authData.model)
                setUser(authData.model)
              }
            }
          } catch (error) {
            console.log("❌ Error parsing stored auth:", error)
          }

          if (!user) {
            setUser(null)
          }
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error)
        setUser(null)
      } finally {
        setLoading(false)
        setInitialized(true)
        console.log("=== AUTH INITIALIZATION END ===")
      }
    }

    // Only initialize once
    if (!initialized) {
      initializeAuth()
    }

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      console.log("🔄 Auth store changed:", { token: !!token, model: !!model })
      setUser(model)
    })

    return unsubscribe
  }, [initialized, user])

  const login = async (email, password) => {
    try {
      console.log("🔐 Attempting login for:", email)
      const authData = await pb.collection("users").authWithPassword(email, password)
      console.log("✅ Login successful:", authData.record.email)
      setUser(authData.record)

      // Manually save to ensure persistence
      try {
        localStorage.setItem(
          "pocketbase_auth",
          JSON.stringify({
            token: authData.token,
            model: authData.record,
          }),
        )
        console.log("💾 Auth data saved to localStorage")
      } catch (error) {
        console.log("❌ Error saving auth to localStorage:", error)
      }

      return { success: true, user: authData.record }
    } catch (error) {
      console.error("❌ Login error:", error)
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      console.log("👤 Creating user account with data:", {
        ...userData,
        password: "[HIDDEN]",
        passwordConfirm: "[HIDDEN]"
      })

      // Ensure email is properly set
      if (!userData.email || !userData.email.trim()) {
        throw new Error("Email is required")
      }

      const record = await pb.collection("users").create(userData)
      console.log("✅ User registration successful:", record.email)
      
      return { success: true, user: record }
    } catch (error) {
      console.error("❌ Registration error:", error)
      return { success: false, error: error.message }
    }
  }

  const requestOTPForUser = async (email) => {
    try {
      console.log("📧 Requesting OTP for existing user:", email)
      
      if (!email || !email.trim()) {
        throw new Error("Email is required")
      }

      const result = await pb.collection("users").requestOTP(email.trim().toLowerCase())
      console.log("✅ OTP request successful:", result.otpId)
      return { success: true, otpId: result.otpId }
    } catch (error) {
      console.error("❌ OTP request error:", error)
      return { success: false, error: error.message }
    }
  }

  const verifyOTPForUser = async (otpId, otpCode) => {
    try {
      console.log("🔐 Verifying OTP:", otpId)
      
      if (!otpId || !otpCode) {
        throw new Error("OTP ID and code are required")
      }

      const authData = await pb.collection("users").authWithOTP(otpId, otpCode)
      console.log("✅ OTP verification successful:", authData.record.email)
      
      // Update user's verified status
      try {
        await pb.collection("users").update(authData.record.id, { verified: true })
        console.log("✅ User verified status updated")
      } catch (updateError) {
        console.error("❌ Error updating verified status:", updateError)
      }
      
      // Set the authenticated user
      setUser(authData.record)
      
      return { success: true, authData }
    } catch (error) {
      console.error("❌ OTP verification error:", error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    console.log("🚪 Logging out...")
    pb.authStore.clear()

    // Also clear localStorage manually
    try {
      localStorage.removeItem("pocketbase_auth")
      console.log("🗑️ Cleared localStorage auth data")
    } catch (error) {
      console.log("❌ Error clearing localStorage:", error)
    }

    setUser(null)
  }

  const value = {
    user,
    login,
    register,
    requestOTPForUser,
    verifyOTPForUser,
    logout,
    loading,
    isAuthenticated: !!user,
    isSeller: user?.userRole === "seller",
    isBuyer: user?.userRole === "buyer",
    isApproved: user?.profileStatus === "approved",
    isPending: user?.profileStatus === "pending",
    isRejected: user?.profileStatus === "rejected",
    hasMembership: user?.membershipStatus === "active",
  }

  // Debug logging
  console.log("🔍 Auth context state:", {
    user: user ? user.email : null,
    loading,
    initialized,
    isAuthenticated: !!user,
    userRole: user?.userRole,
    profileStatus: user?.profileStatus,
    membershipStatus: user?.membershipStatus,
  })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
