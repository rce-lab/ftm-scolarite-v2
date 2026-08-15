// app/admin/students/page.tsx
'use client'

import { useTranslation } from '@/lib/i18n/LanguageContext'

export default function StudentsPage() {
  const { t } = useTranslation()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('students.title')}</h1>
      <div className="bg-white p-6 rounded shadow">
        <p>{t('students.underConstructionMessage')}</p>
      </div>
    </div>
  )
}
