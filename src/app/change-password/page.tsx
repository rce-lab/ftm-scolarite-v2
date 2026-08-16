'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase/client'
import { LanguageProvider, useTranslation } from '@/lib/i18n/LanguageContext'
import logo from '../public/logo FTM officiel 2024.jpeg'

function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/login'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert(t('changePassword.errorMismatch'))
      return
    }

    if (newPassword.length < 8) {
      alert(t('changePassword.errorTooShort'))
      return
    }

    setLoading(true)

    const { data: { user }, error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (updateError) {
      alert(t('changePassword.errorPrefix').replace('{message}', updateError.message))
      setLoading(false)
      return
    }

    if (user) {
      await supabase
        .from('utilisateurs')
        .update({ must_change_password: false })
        .eq('auth_user_id', user.id)
    }

    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow border-t-4 border-[#b03c2d]">
        <div className="flex justify-center mb-4">
          <Image src={logo} alt={t('login.logoAlt')} className="h-20 w-auto" priority />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center text-[#689e4e]">{t('changePassword.title')}</h1>
        <p className="text-sm text-gray-600 text-center mb-6">{t('changePassword.subtitle')}</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm">{t('changePassword.newPasswordLabel')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#689e4e] focus:border-[#689e4e]"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm">{t('changePassword.confirmPasswordLabel')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#689e4e] focus:border-[#689e4e]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#689e4e] text-white p-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t('changePassword.loadingButton') : t('changePassword.submitButton')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ChangePasswordPage() {
  return (
    <LanguageProvider>
      <ChangePasswordForm />
    </LanguageProvider>
  )
}
