import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "../contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "B2B Marketplace",
  description: "A comprehensive B2B marketplace for buyers and sellers",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
