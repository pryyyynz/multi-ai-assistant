"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="relative z-10">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="text-2xl font-bold">
          Multi AI Assistant
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 focus:outline-none"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex gap-8">
          <Link href="/" className="text-xl font-medium">
            Home
          </Link>
          <Link href="/tools" className="text-xl font-medium">
            Tools
          </Link>
          <Link href="/about" className="text-xl font-medium">
            About
          </Link>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md rounded-b-lg p-4 border-t">
          <div className="flex flex-col space-y-4">
            <Link
              href="/"
              className="text-xl font-medium py-2 px-4 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/tools"
              className="text-xl font-medium py-2 px-4 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Tools
            </Link>
            <Link
              href="/about"
              className="text-xl font-medium py-2 px-4 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
