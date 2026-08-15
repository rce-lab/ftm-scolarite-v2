'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import logo from '../public/logo FTM officiel 2024.jpeg'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const emailReel = email.includes('@') ? email : `${email}@ftm.local`

    const { error } = await supabase.auth.signInWithPassword({
      email: emailReel,
      password
    })

    if (error) {
      alert('Erreur : ' + error.message)
    } else {
      window.location.href = '/admin'
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow border-t-4 border-[#b03c2d]">
        <div className="flex justify-center mb-4">
          <Image src={logo} alt="Logo FTM" className="h-20 w-auto" priority />
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center text-[#689e4e]">FTM - Connexion</h1>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-2 text-sm">Identifiant</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#689e4e] focus:border-[#689e4e]"
              placeholder="prenom.nom"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#689e4e] focus:border-[#689e4e]"
              placeholder="Admin123!"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#689e4e] text-white p-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
