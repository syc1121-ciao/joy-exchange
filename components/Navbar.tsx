import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-6 border-b bg-white">
      {/* 左邊 Logo */}
      <div>
        <h1 className="text-2xl font-serif italic">
          Joy's Exchange Adventure
        </h1>
      </div>

      {/* 中間選單 */}
      <ul className="flex items-center gap-8 text-sm uppercase tracking-widest">
  <li>
    <Link href="/" className="transition hover:text-slate-500">
      Home
    </Link>
  </li>

  <li>
    <Link
      href="/dashboard"
      className="transition hover:text-slate-500"
    >
      Dashboard
    </Link>
  </li>

  <li>
    <Link href="/cities" className="transition hover:text-slate-500">
      Travel
    </Link>
  </li>

  <li>
    <Link href="/journal" className="transition hover:text-slate-500">
      Journal
    </Link>
  </li>

  <li>
    <Link href="/gallery" className="transition hover:text-slate-500">
      Gallery
    </Link>
  </li>

  <li>
    <Link href="/memo" className="transition hover:text-slate-500">
      Memo
    </Link>
  </li>
</ul>

      {/* 右邊 Icon */}
      <div className="flex gap-4 text-xl">
        <button>🌙</button>
        <button>🔍</button>
      </div>
    </nav>
  );
}