import { Link } from "wouter";
import Logo from "@/components/logo";

const featureCards = [
  {
    title: "Live forest monitoring",
    description:
      "Satellite imagery and field reports work together to detect changes quickly so forest officers can act without delay.",
    accent: "bg-green-800",
    label: "SURVEILLANCE",
  },
  {
    title: "Trusted tree registry",
    description:
      "A verified record for every tree, tracked by GPS, species, health status, and planting history.",
    accent: "bg-emerald-700",
    label: "REGISTRY",
  },
  {
    title: "Citizen reporting",
    description:
      "Any resident can report a concern or request plantation support through the national platform.",
    accent: "bg-teal-700",
    label: "ENGAGEMENT",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-green-50 text-slate-900">
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-green-600/15 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            <Logo className="h-8 w-8" />
            <span>Government forest protection platform</span>
          </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Secure India’s forests with real-time monitoring and public participation.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                  TreeTrack is the national tree monitoring system built for forest officers, citizens, and agencies to manage, protect, and restore green cover across the country.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/map"
                  className="inline-flex items-center justify-center rounded-full bg-green-800 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-green-800/20 transition hover:bg-green-700"
                >
                  View live map
                </Link>
                <Link
                  href="/report"
                  className="inline-flex items-center justify-center rounded-full border border-green-300 bg-white px-7 py-3 text-sm font-semibold text-green-800 transition hover:border-green-400 hover:bg-green-50"
                >
                  Report a forest issue
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
                  <div className="text-3xl font-semibold text-green-900">56K+</div>
                  <p className="mt-2 text-sm uppercase tracking-[0.24em] text-green-600">Trees registered</p>
                </div>
                <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
                  <div className="text-3xl font-semibold text-emerald-700">28</div>
                  <p className="mt-2 text-sm uppercase tracking-[0.24em] text-green-600">States covered</p>
                </div>
                <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
                  <div className="text-3xl font-semibold text-green-900">4.8/5</div>
                  <p className="mt-2 text-sm uppercase tracking-[0.24em] text-green-600">Officer satisfaction</p>
                </div>
                <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm">
                  <div className="text-3xl font-semibold text-teal-700">24/7</div>
                  <p className="mt-2 text-sm uppercase tracking-[0.24em] text-green-600">Active monitoring</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-green-200 bg-green-900 px-8 py-10 text-white shadow-2xl shadow-green-900/20">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-2xl" />
              <div className="absolute -left-20 bottom-12 h-32 w-32 rounded-full bg-teal-500/15 blur-2xl" />
              <div className="relative space-y-8">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Forest guard dashboard</p>
                  <h2 className="text-3xl font-semibold">Trusted by officers across the country</h2>
                </div>
                <div className="rounded-[1.75rem] bg-slate-900/95 p-6 shadow-inner shadow-slate-900/40 ring-1 ring-white/10">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Protection index</span>
                    <span className="font-semibold text-white">78%</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-2 w-5/6 rounded-full bg-emerald-500" />
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-900/90 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Watchlist</p>
                      <p className="mt-3 text-xl font-semibold text-white">4,212</p>
                    </div>
                    <div className="rounded-3xl bg-slate-900/90 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Verified reports</p>
                      <p className="mt-3 text-xl font-semibold text-white">14,800</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/90 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Last update</p>
                    <p className="mt-3 text-xl font-semibold">5 mins ago</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 p-5">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Active zones</p>
                    <p className="mt-3 text-xl font-semibold">12</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                How TreeTrack works
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                One platform for every step in forest protection.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Forest departments, local communities, and national agencies collaborate through a single source of truth for tree status, incident response, and restoration planning.
              </p>
              <div className="space-y-4">
                {[
                  {
                    title: "Survey & registration",
                    detail: "Field teams verify trees, record location and species, and add them to the national registry.",
                  },
                  {
                    title: "Monitor & alert",
                    detail: "Satellite images, sensors, and reports trigger alerts for changes in forest cover or suspicious activity.",
                  },
                  {
                    title: "Report & restore",
                    detail: "Citizens and officers submit reports, enabling rapid action and planned plantation drives.",
                  },
                ].map((step, index) => (
                  <div key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3 text-sm font-semibold text-slate-900 uppercase tracking-[0.2em]">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">{index + 1}</span>
                      {step.title}
                    </div>
                    <p className="mt-3 text-slate-600 leading-7">{step.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {featureCards.map((card) => (
                <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white ${card.accent}`}>
                    {card.label}
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-4 text-slate-600 leading-7">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20" style={{ backgroundColor: "#ffffff" }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-lg uppercase tracking-[0.35em] text-green-700 font-semibold">National forest mission</p>
          <h2 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl text-green-900">
            Make every tree visible, every report meaningful.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-700">
            Join the platform that gives the forest community the tools to protect, restore, and manage India’s natural heritage.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-green-800 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-green-800/20 transition hover:bg-green-700"
            >
              Register for access
            </Link>
            <Link
              href="/trees"
              className="inline-flex items-center justify-center rounded-full border-2 border-green-800 bg-white px-8 py-4 text-lg font-semibold text-green-800 transition hover:bg-green-50"
            >
              Learn how it works
            </Link>
          </div>
        </div>
      </section>

      <footer className="text-slate-300 border-t py-12" style={{ backgroundColor: "oklch(26.6% 0.065 152.934)", borderTopColor: "oklch(26.6% 0.065 152.934)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Logo className="h-20 w-20" />
                <h4 className="text-white text-xl font-semibold">TreeTrack India</h4>
              </div>
              <p className="text-sm leading-7 text-slate-400">
                A national forest protection platform for government agencies, forest officers, and citizens.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300 mb-4">Platform</h5>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/map" className="transition hover:text-white">Live Map</Link></li>
                <li><Link href="/trees" className="transition hover:text-white">Tree Registry</Link></li>
                <li><Link href="/dashboard" className="transition hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300 mb-4">Support</h5>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="/report" className="transition hover:text-white">Report an issue</Link></li>
                <li><Link href="/help" className="transition hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="transition hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800 pt-8 text-sm text-slate-500">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p>© 2026 Government of India. TreeTrack India — National Tree Monitoring System.</p>
              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                <Link href="/privacy" className="transition hover:text-white">Privacy</Link>
                <Link href="/terms" className="transition hover:text-white">Terms</Link>
                <a href="#" className="transition hover:text-white">Forest Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
