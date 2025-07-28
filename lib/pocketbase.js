import PocketBase from "pocketbase"

// Use the environment variable for PocketBase URL
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090")

// Disable auto cancellation for requests
pb.autoCancellation(false)

// Enable auth store persistence (this should be enabled by default, but let's be explicit)
if (typeof window !== "undefined") {
  // Only run in browser
  console.log("PocketBase initialized in browser")
  console.log("Initial auth state:", {
    isValid: pb.authStore.isValid,
    model: !!pb.authStore.model,
    token: !!pb.authStore.token,
  })

  // Force load auth from localStorage if it exists
  try {
    const storedAuth = localStorage.getItem("pocketbase_auth")
    if (storedAuth) {
      console.log("Found stored auth data:", !!storedAuth)
    }
  } catch (error) {
    console.log("Error checking stored auth:", error)
  }
}

export default pb
