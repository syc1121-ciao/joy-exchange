const exchangeDate = new Date("2026-09-15");

export default function CountdownCard() {
  const today = new Date();

  const difference = exchangeDate.getTime() - today.getTime();

  const daysLeft = Math.max(
    0,
    Math.ceil(difference / (1000 * 60 * 60 * 24)),
  );

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-7 text-white shadow-sm">
      <div className="relative z-10">
        <p className="text-sm uppercase tracking-[0.2em] text-white/50">
          Countdown
        </p>

        <h2 className="mt-2 font-serif text-2xl">
          Until the Adventure
        </h2>

        <div className="mt-8">
          <p className="font-serif text-7xl">{daysLeft}</p>
          <p className="mt-2 text-white/60">Days Left</p>
        </div>

        <p className="mt-8 text-sm text-white/50">
          February 15, 2027
        </p>
      </div>

      <div className="absolute -bottom-12 -right-8 text-[150px] opacity-10">
        ✈️
      </div>
    </section>
  );
}