// src/app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getStatutLabel } from '@/lib/statuts'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import Link from 'next/link'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<{
    totalInscriptions: number
    pendingReview: number
    approved: number
    paymentPending: number
    recentInscriptions: any[]
  }>({
    totalInscriptions: 0,
    pendingReview: 0,
    approved: 0,
    paymentPending: 0,
    recentInscriptions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Total inscriptions
      const { count: totalCount } = await supabase
        .from('inscriptions')
        .select('*', { count: 'exact', head: true })

      // Inscriptions en attente
      const { count: pendingCount } = await supabase
        .from('inscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_review')

      // Inscriptions approuvées
      const { count: approvedCount } = await supabase
        .from('inscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

      // Paiements en attente
      const { count: paymentCount } = await supabase
        .from('inscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'payment_pending')

      // Dernières inscriptions
      const { data: recent } = await supabase
        .from('inscriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalInscriptions: totalCount || 0,
        pendingReview: pendingCount || 0,
        approved: approvedCount || 0,
        paymentPending: paymentCount || 0,
        recentInscriptions: recent || []
      })
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#689e4e]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('adminDashboard.title')}</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('adminDashboard.totalInscriptions')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('adminDashboard.pendingReview')}</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/inscriptions?filter=pending_review"
              className="text-sm text-[#689e4e] hover:text-[#527d3e]"
            >
              {t('adminDashboard.viewInscriptionsLink')}
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('adminDashboard.approvedInscriptions')}</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('adminDashboard.paymentsPending')}</p>
              <p className="text-2xl font-bold text-orange-600">{stats.paymentPending}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href="/admin/inscriptions?filter=payment_pending"
              className="text-sm text-[#689e4e] hover:text-[#527d3e]"
            >
              {t('adminDashboard.managePaymentsLink')}
            </Link>
          </div>
        </div>
      </div>

      {/* Dernières inscriptions */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{t('adminDashboard.recentInscriptionsTitle')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminDashboard.tableCode')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminDashboard.tableName')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminDashboard.tableLevel')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminDashboard.tableDate')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminDashboard.tableStatus')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('adminDashboard.tableAction')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentInscriptions.map((inscription) => (
                <tr key={inscription.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{inscription.student_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {inscription.prenom} {inscription.nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded bg-[#689e4e]/15 text-[#527d3e]">
                      {inscription.niveau_suggere}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(inscription.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      inscription.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                      inscription.status === 'approved' ? 'bg-green-100 text-green-800' :
                      inscription.status === 'payment_pending' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatutLabel(inscription.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/admin/inscriptions/${inscription.student_code}`}
                      className="text-[#689e4e] hover:text-[#527d3e]"
                    >
                      {t('adminDashboard.viewLink')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <Link
            href="/admin/inscriptions"
            className="text-[#689e4e] hover:text-[#527d3e] font-medium"
          >
            {t('adminDashboard.viewAllInscriptionsLink')}
          </Link>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="font-bold text-lg mb-4">{t('adminDashboard.quickActionsTitle')}</h3>
          <div className="space-y-3">
            <Link
              href="/admin/inscriptions?filter=pending_review"
              className="block w-full text-left px-4 py-3 bg-[#689e4e]/10 text-[#527d3e] rounded hover:bg-[#689e4e]/20"
            >
              {t('adminDashboard.quickActionValidate')}
            </Link>
            <Link 
              href="/admin/students"
              className="block w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded hover:bg-green-100"
            >
              {t('adminDashboard.quickActionStudents')}
            </Link>
            <Link
              href="/admin/payments"
              className="block w-full text-left px-4 py-3 bg-orange-50 text-orange-700 rounded hover:bg-orange-100"
            >
              {t('adminDashboard.quickActionPayments')}
            </Link>
            <Link
              href="/admin/parametres"
              className="block w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
            >
              {t('adminDashboard.quickActionSettings')}
            </Link>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="font-bold text-lg mb-4">{t('adminDashboard.statsByLevelTitle')}</h3>
          <div className="grid grid-cols-3 gap-4">
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((niveau) => (
              <div key={niveau} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-[#689e4e]">{niveau}</div>
                <div className="text-sm text-gray-600 mt-1">{t('adminDashboard.levelTileLabel')}</div>
                <div className="mt-2 text-lg font-bold">0</div>
                <div className="text-xs text-gray-500">{t('adminDashboard.studentsUnit')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}