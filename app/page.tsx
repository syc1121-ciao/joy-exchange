import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WorldMapLoader from "@/components/world-map/WorldMapLoader";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <WorldMapLoader />
    </>
  );
}