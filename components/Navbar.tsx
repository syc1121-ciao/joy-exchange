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
      <ul className="flex gap-10 text-sm uppercase tracking-widest">

        <li>Home</li>

        <li>Journal</li>

        <li>Destinations</li>

        <li>Gallery</li>

        <li>About Me</li>
        <a href="/memo">
  Memo
</a>

      </ul>

      {/* 右邊 Icon */}
      <div className="flex gap-4 text-xl">

        <button>🌙</button>

        <button>🔍</button>

      </div>

    </nav>
  );
}