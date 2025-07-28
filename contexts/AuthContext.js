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
      const record = await pb.collection("users").create(userData)
      return { success: true, user: record }
    } catch (error) {
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
    logout,
    loading,
    isAuthenticated: !!user,
    isMember: user?.userType === "member",
    isNonMember: user?.userType === "non_member",
  }

  // Debug logging
  console.log("🔍 Auth context state:", {
    user: user ? user.email : null,
    loading,
    initialized,
    isAuthenticated: !!user,
    userType: user?.userType,
  })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
