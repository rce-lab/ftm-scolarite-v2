export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin FTM</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-bold text-lg">Étudiants</h2>
          <p className="text-3xl mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-bold text-lg">Enseignants</h2>
          <p className="text-3xl mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-bold text-lg">Paiements</h2>
          <p className="text-3xl mt-2">0</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-bold text-lg mb-4">Actions rapides</h2>
        <div className="space-y-2">
          <a href="/inscription" className="block p-3 bg-blue-50 rounded hover:bg-blue-100">
            📝 Ajouter un étudiant
          </a>
          <a href="#" className="block p-3 bg-green-50 rounded hover:bg-green-100">
            👨‍🏫 Ajouter un enseignant
          </a>
          <a href="#" className="block p-3 bg-yellow-50 rounded hover:bg-yellow-100">
            📊 Voir les statistiques
          </a>
        </div>
      </div>
    </div>
  );
}