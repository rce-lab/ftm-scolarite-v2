import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="bg-blue-800 text-white p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">FTM - Enseignement du Malagasy</h1>
          <p className="mt-2">Association d'enseignement à distance de la langue malagasy</p>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Inscription aux cours</h2>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <p className="mb-4">Inscrivez-vous pour apprendre le malagasy en ligne</p>
            <Link 
              href="/public/inscription"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
            >
              S'inscrire maintenant
            </Link>
            <div className="mt-4 text-sm text-gray-600">
              <p>• Pour tous niveaux (A1 à C3)</p>
              <p>• De 6 à 80 ans</p>
              <p>• 30€ par année scolaire</p>
            </div>
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Accès interne FTM</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/admin/dashboard"
              className="p-4 bg-blue-50 rounded hover:bg-blue-100"
            >
              <h3 className="font-bold">Administration</h3>
              <p className="text-sm">Gestion des étudiants et paiements</p>
            </Link>
            <Link 
              href="/teacher/deliberation"
              className="p-4 bg-green-50 rounded hover:bg-green-100"
            >
              <h3 className="font-bold">Enseignants</h3>
              <p className="text-sm">Gestion des classes et présence</p>
            </Link>
            <Link 
              href="/communication"
              className="p-4 bg-purple-50 rounded hover:bg-purple-100"
            >
              <h3 className="font-bold">Communication</h3>
              <p className="text-sm">Envoi d'emails et informations</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}