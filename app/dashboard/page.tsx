import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.isStreamer) {
    redirect('/')
  }

  const stream = await prisma.stream.findFirst({
    where: { streamerId: session.user.id },
    include: {
      streamer: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
          isStreamer: true
        }
      }
    }
  })

  if (!stream) {
    redirect('/')
  }

  return <DashboardContent stream={stream} user={session.user} />
}
