"use client";

import { getStreamByUsername } from "@/lib/stream-service";
import { notFound } from "next/navigation";
import { Broadcaster } from "@/components/streaming/broadcaster";
import { Viewer } from "@/components/streaming/viewer";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Stream, User } from "@prisma/client";

type StreamWithUser = Stream & { streamer: User };

interface StreamPageProps {
  params: {
    username: string;
  };
}

export default function StreamPage({ params }: StreamPageProps) {
  const { data: session } = useSession();
  const [stream, setStream] = useState<StreamWithUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStream() {
      const streamData = await getStreamByUsername(params.username);
      if (!streamData) {
        return notFound();
      }
      setStream(streamData);
      setLoading(false);
    }

    fetchStream();
  }, [params.username]);

  if (loading) {
    return <div className="text-center">Loading stream...</div>;
  }

  if (!stream) {
    return notFound();
  }

  const isBroadcaster = session?.user?.id === stream?.streamer.id;

  return (
    <div className="container mx-auto p-4">
      {isBroadcaster ? (
        <Broadcaster stream={stream} />
      ) : (
        <Viewer stream={stream} />
      )}
    </div>
  );
}
