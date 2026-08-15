import InternalNav from '@/components/InternalNav'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <InternalNav />
      <div className="container mx-auto p-6">
        {children}
      </div>
    </div>
  )
}
