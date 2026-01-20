import Link from "next/link";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <Header />

      {/* Decorative confetti on left side */}
      <div className="absolute left-8 top-[20%] hidden lg:block space-y-6">
        <span className="block w-5 h-5 bg-red-500 rotate-12 shadow-md"></span>
        <span className="block w-5 h-5 bg-yellow-400 -rotate-12 shadow-md"></span>
        <span className="block w-5 h-5 bg-lime-500 rotate-45 shadow-md"></span>
        <span className="block w-5 h-5 bg-cyan-400 -rotate-45 shadow-md"></span>
        <span className="block w-5 h-5 bg-orange-500 rotate-12 shadow-md"></span>
        <span className="block w-5 h-5 bg-pink-500 -rotate-12 shadow-md"></span>
        <span className="block w-5 h-5 bg-purple-500 rotate-45 shadow-md"></span>
        <span className="block w-5 h-5 bg-emerald-500 -rotate-12 shadow-md"></span>
        <span className="block w-5 h-5 bg-rose-500 rotate-12 shadow-md"></span>
        <span className="block w-5 h-5 bg-blue-500 -rotate-45 shadow-md"></span>
      </div>

      {/* Decorative confetti on right side */}
      <div className="absolute right-8 top-[20%] hidden lg:block space-y-6">
        <span className="block w-5 h-5 bg-emerald-500 -rotate-12 shadow-md"></span>
        <span className="block w-5 h-5 bg-cyan-500 rotate-12 shadow-md"></span>
        <span className="block w-5 h-5 bg-purple-500 -rotate-45 shadow-md"></span>
        <span className="block w-5 h-5 bg-rose-500 rotate-45 shadow-md"></span>
        <span className="block w-5 h-5 bg-blue-500 -rotate-12 shadow-md"></span>
        <span className="block w-5 h-5 bg-amber-500 rotate-12 shadow-md"></span>
        <span className="block w-5 h-5 bg-red-500 -rotate-45 shadow-md"></span>
        <span className="block w-5 h-5 bg-yellow-400 rotate-12 shadow-md"></span>
        <span className="block w-5 h-5 bg-lime-500 -rotate-12 shadow-md"></span>
        <span className="block w-5 h-5 bg-pink-500 rotate-45 shadow-md"></span>
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        <div className="text-center mb-8">
          <p className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
            Hello! This is the Amiibo Explorer
          </p>
          <p className="text-xs md:text-sm text-gray-600 max-w-xl mx-auto">
            Explore all about the Amiibos and how to use them.
          </p>
          <p className="text-xs md:text-sm text-gray-600 max-w-xl mx-auto">
            You can also create amiibo lists and generate printable coins or cards from them.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <Link
            href="/explore"
            className="group bg-white rounded-2xl p-6 border-2 border-red-500 hover:border-red-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="text-5xl mb-3">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Explore Amiibos
            </h2>
            <p className="text-sm text-gray-600">
              Search and filter through the complete Amiibo collection.
            </p>
          </Link>

          <Link
            href="/lists"
            className="group bg-white rounded-2xl p-6 border-2 border-blue-500 hover:border-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="text-5xl mb-3">📋</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              My Lists
            </h2>
            <p className="text-sm text-gray-600">
              Organize your Amiibos into custom lists.
            </p>
          </Link>

          <Link
            href="/generator"
            className="group bg-white rounded-2xl p-6 border-2 border-green-500 hover:border-green-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="text-5xl mb-3">🎨</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Template Generator
            </h2>
            <p className="text-sm text-gray-600">
              Generate printable coins or cards from your lists.
            </p>
          </Link>

          <Link
            href="/templates"
            className="group bg-white rounded-2xl p-6 border-2 border-yellow-500 hover:border-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <div className="text-5xl mb-3">💾</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Saved Templates
            </h2>
            <p className="text-sm text-gray-600">
              Access your saved templates and regenerate designs.
            </p>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Powered by the{" "}
            <a
              href="https://www.amiiboapi.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 transition-colors underline"
            >
              AmiiboAPI
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
