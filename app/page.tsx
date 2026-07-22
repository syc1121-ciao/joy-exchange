import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WorldMapLoader from "@/components/world-map/WorldMapLoader";
import UpcomingFlight from "@/components/flights/UpcomingFlight";
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <section className="bg-[#faf8f5] px-4 pb-14 sm:px-6 md:px-10 md:pb-24">
        <div className="mx-auto max-w-5xl">
          <UpcomingFlight />
        </div>
      </section>
      <WorldMapLoader/>
    </>
  );
}