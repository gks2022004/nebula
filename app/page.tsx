import { StreamGrid } from "@/components/streams/stream-grid";
import { Hero } from "@/components/home/hero";
import { FeaturedStreamers } from "@/components/home/featured-streamers";

export default function Home() {
  return (
    <div className="space-y-12">
      <Hero />
      <section>
        <h2 className="text-3xl font-bold mb-6 text-white">Live Now</h2>
        <StreamGrid liveOnly={true} />
      </section>
      <FeaturedStreamers />
      <section>
        <h2 className="text-3xl font-bold mb-6 text-white">All Streams</h2>
        <StreamGrid />
      </section>
    </div>
  );
}
