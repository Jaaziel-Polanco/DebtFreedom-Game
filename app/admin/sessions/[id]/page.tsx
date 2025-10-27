import { SessionDetails } from "@/components/session-details"

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <SessionDetails sessionId={id} />
    </div>
  )
}
