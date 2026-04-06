import { Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import Logo from "@/components/logo";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/map", label: "Live Map" },
  { href: "/plant", label: "Plant Tree" },
  { href: "/trees", label: "Browse Trees" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/report", label: "Report" },
];

const roleLabels: Record<string, string> = {
  citizen: "Citizen",
  officer: "Forest Officer",
  admin: "Admin",
};

export default function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Left side: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 font-semibold text-lg text-sidebar-foreground shrink-0">
              <Logo className="h-28 w-28" />
              <div className="hidden sm:block">
                <div className="text-lg font-semibold">TreeTrack India</div>
                <div className="text-sm text-sidebar-foreground/70">Forest Protection</div>
              </div>
            </Link>
          </div>

          {/* Desktop Nav links - Center */}
          <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto mx-4 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                  location === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/60 text-sidebar-foreground/80"
                }`}
              >
                {item.href === "/map" ? "🗺️ " : ""}{item.label}
              </Link>
            ))}
          </div>

          {/* Right side: Auth + Hamburger (mobile) */}
          <div className="flex items-center gap-2 ml-4">
            {/* Auth section */}
            <div className="shrink-0">
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent/60 transition-colors"
                  >
                    <div className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center uppercase ${user.role === "officer" ? "bg-emerald-600" : "bg-green-500"}`}>
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-semibold leading-tight">{user.name}</div>
                      <div className="text-[10px] text-sidebar-foreground/60 leading-tight">{roleLabels[user.role] ?? user.role}</div>
                    </div>
                    <svg className="w-3.5 h-3.5 text-sidebar-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-border rounded-lg shadow-lg py-1 z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <div className="font-semibold text-sm text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
                        <div className="text-xs text-muted-foreground">{user.state} · {roleLabels[user.role]}</div>
                        {user.role === "officer" && user.employeeId && (
                          <div className="text-xs text-emerald-600 font-mono mt-0.5">{user.employeeId}</div>
                        )}
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        Dashboard
                      </Link>
                      {(user.role === "admin" || user.role === "officer") && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={async () => { await logout(); setMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 rounded text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-1.5 rounded text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile/Tablet menu button - Right side */}
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent/60 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Menu */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="lg:hidden border-t border-sidebar-border bg-sidebar-accent/20">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  }`}
                >
                  {item.href === "/map" ? "🗺️ " : ""}{item.label}
                </Link>
              ))}

              {/* Mobile/Tablet Auth Links */}
              {!user && (
                <div className="border-t border-sidebar-border pt-3 mt-3 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
