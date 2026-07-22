import Link from "next/link";
import UpcomingFlight from "@/components/flights/UpcomingFlight";
import CountdownCard from "@/components/dashboard/CountdownCard";
import MemoCard from "@/components/dashboard/MemoCard";
import CitiesCard from "@/components/dashboard/CitiesCard";
import AchievementCard from "@/components/dashboard/AchievementCard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f2] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* 頁面標題 */}
        <div className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-slate-500">
            Exchange Student 2027
          </p>

          <h1 className="font-serif text-4xl text-slate-900 md:text-5xl">
            Welcome back, Joy.
          </h1>

          <p className="mt-3 text-slate-500">
            Your exchange journey, all in one place.
          </p>
        </div>

        {/* Dashboard 卡片 */}
        <section className="px-4 py-12 sm:px-6 md:px-10 md:py-20">
  <div className="mx-auto max-w-7xl">
    <UpcomingFlight variant="dashboard" />
  </div>
</section>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          
          <CountdownCard />

          <MemoCard />

          <CitiesCard />

          <AchievementCard />
        </div>

        {/* 回首頁 */}
        <div className="mt-10">
          <Link
            href="/"
            className="text-sm text-slate-600 transition hover:text-slate-950"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}