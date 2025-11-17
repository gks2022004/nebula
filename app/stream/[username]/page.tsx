import { getStreamByUsername } from "@/lib/stream-service";
import { notFound } from "next/navigation";
import { StreamPage } from "@/components/streams/stream-page";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function StreamByUsernamePage({ params }: PageProps) {
  const { username } = await params;
  const stream = await getStreamByUsername(username);

  if (!stream) {
    notFound();
  }

  // Serialize dates for client component
  const serializedStream = {
    ...stream,
    createdAt: stream.createdAt.toISOString(),
    updatedAt: stream.updatedAt.toISOString(),
    startedAt: stream.startedAt?.toISOString() || null,
    endedAt: stream.endedAt?.toISOString() || null,
  };

  return <StreamPage stream={serializedStream as any} />;
}
