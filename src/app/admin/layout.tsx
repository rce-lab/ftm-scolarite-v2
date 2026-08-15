import InternalNav from '@/components/InternalNav'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        <InternalNav />
        <div className="container mx-auto p-6">
          {children}
        </div>
      </div>
    </LanguageProvider>
  )
}
