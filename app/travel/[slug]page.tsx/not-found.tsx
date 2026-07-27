import Link from "next/link";

export default function TravelNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-6">
      <div className="max-w-lg text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
          Destination not found
        </p>

        <h1 className="mt-5 font-serif text-5xl font-medium">
          This journey has not begun yet.
        </h1>

        <p className="mt-6 leading-7 text-neutral-500">
          找不到這個城市，或城市目前還沒有發布。
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex rounded-full bg-neutral-900 px-7 py-3 text-sm text-white transition hover:bg-neutral-700"
        >
          Back Home
        </Link>
      </div>
    </main>
  );
}