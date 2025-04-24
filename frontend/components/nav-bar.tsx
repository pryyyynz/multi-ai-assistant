import Link from "next/link"

export default function NavBar() {
  return (
    <nav className="flex justify-between items-center mb-8">
      <Link href="/" className="text-2xl font-bold">
        Multi AI Assistant
      </Link>
      <div className="flex gap-8">
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
    </nav>
  )
}
