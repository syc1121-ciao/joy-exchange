import FlightManager from "@/components/flights/FlightManager";

export default function FlightsPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 py-12 sm:px-6 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <FlightManager />
      </div>
    </main>
  );
}