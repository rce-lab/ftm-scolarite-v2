// app/teacher/layout.tsx
import Link from 'next/link'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Enseignants */}
      <nav className="bg-green-700 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/teacher/deliberation" className="text-xl font-bold">
            Conseil des Enseignants FTM
          </Link>
          <div className="space-x-4">
            <Link href="/teacher/deliberation" className="hover:text-green-200">
              Délibération
            </Link>
            <Link href="/teacher/classes" className="hover:text-green-200">
              Classes
            </Link>
            <Link href="/" className="hover:text-green-200">
              Accueil public
            </Link>
          </div>
        </div>
      </nav>

      {/* Contenu */}
      <div className="container mx-auto p-6">
        {children}
      </div>
    </div>
  )
}