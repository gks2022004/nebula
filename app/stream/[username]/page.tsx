import { getStreamByUsername } from "@/lib/stream-service";
import { notFound } from "next/navigation";
import { StreamPage } from "@/components/streams/stream-page";
import { auth } from "@/auth";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function StreamByUsernamePage({ params }: PageProps) {
  const { username } = await params;
  const session = await auth();
  const stream = await getStreamByUsername(username, session?.user?.id);

  if (!stream) {
    notFound();
  }

  const serializedStream = {
    ...stream,
    createdAt: stream.createdAt.toISOString(),
    updatedAt: stream.updatedAt.toISOString(),
    startedAt: stream.startedAt?.toISOString() || null,
    endedAt: stream.endedAt?.toISOString() || null,
  };

  return (
    <div className="min-h-screen bg-[#faf6eb] py-8 px-4">
      <StreamPage stream={serializedStream as any} />
    </div>
  );
}
