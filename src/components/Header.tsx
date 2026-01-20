import Link from "next/link";

// Amiibo-style logo component with confetti (header size)
function AmiiboLogo() {
  return (
    <div className="flex items-center">
      {/* Left confetti */}
      <div className="flex flex-col mr-1.5">
        <div className="flex items-end gap-[3px] mb-[2px]">
          <span className="w-[6px] h-[6px] bg-red-500 rotate-[20deg]"></span>
          <span className="w-[6px] h-[6px] bg-yellow-400 -rotate-[15deg] -mb-[2px]"></span>
        </div>
        <div className="flex items-start gap-[3px]">
          <span className="w-[6px] h-[6px] bg-lime-500 -rotate-[20deg]"></span>
          <span className="w-[6px] h-[6px] bg-cyan-400 rotate-[15deg] -mt-[2px]"></span>
        </div>
      </div>

      {/* Text */}
      <span className="text-2xl font-black text-white tracking-tight">
        amiibo Explorer
      </span>

      {/* Right confetti */}
      <div className="flex flex-col ml-1.5">
        <div className="flex items-end gap-[3px] mb-[2px]">
          <span className="w-[6px] h-[6px] bg-orange-500 -rotate-[15deg] -mb-[2px]"></span>
          <span className="w-[6px] h-[6px] bg-emerald-500 rotate-[20deg]"></span>
        </div>
        <div className="flex items-start gap-[3px]">
          <span className="w-[6px] h-[6px] bg-pink-500 rotate-[15deg] -mt-[2px]"></span>
          <span className="w-[6px] h-[6px] bg-cyan-500 -rotate-[20deg]"></span>
        </div>
      </div>
    </div>
  );
}

interface HeaderProps {
  showNav?: boolean;
  onMenuClick?: () => void;
}

export default function Header({ showNav = true, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-black text-white py-3 shadow-lg">
      <div className="px-4 md:px-6 flex items-center justify-between">
        {/* Mobile menu button (optional, for pages that need it) */}
        {onMenuClick ? (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        ) : (
          <div className="md:hidden w-10"></div>
        )}

        <Link href="/" className="hover:opacity-80 transition-opacity">
          <AmiiboLogo />
        </Link>

        {showNav ? (
          <nav className="flex gap-4">
            <Link
              href="/explore"
              className="hidden md:block text-sm font-medium hover:text-gray-300 transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/lists"
              className="hidden md:block text-sm font-medium hover:text-gray-300 transition-colors"
            >
              Lists
            </Link>
            <Link
              href="/templates"
              className="hidden md:block text-sm font-medium hover:text-gray-300 transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/guides"
              className="hidden md:block text-sm font-medium hover:text-gray-300 transition-colors"
            >
              Guides
            </Link>
          </nav>
        ) : (
          <div className="md:hidden w-10"></div>
        )}
      </div>
    </header>
  );
}
