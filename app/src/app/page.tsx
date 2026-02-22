import Link from "next/link";
import {
  Heart,
  ArrowRight,
  Chrome,
  Sparkles,
  Users,
  Bookmark,
  List,
  Star,
  Camera,
  FolderSearch,
  MessageCircle,
  Link2,
  MousePointerClick,
  Tags,
  Share2,
  Globe,
  Puzzle,
  Smartphone,
  LayoutDashboard,
  ListChecks,
  Upload,
  Languages,
  Zap,
  Clock,
  MessageSquare,
  Ban,
  RefreshCw,
  BellRing,
  X,
  Check,
  Shield,
  Lock,
  UserCheck,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { LandingNavbar } from "@/components/landing-navbar";
import { ChromeExtensionButton } from "@/components/chrome-extension-button";
import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import landingData from "@/lib/i18n/landing.json";

/* ═══════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════ */

const platforms = [
  "YouTube", "TikTok", "Reddit", "Facebook", "Instagram",
  "GitHub", "Shopee", "Amazon", "Google Maps", "Medium",
  "LinkedIn", "Twitter / X", "Airbnb", "StackOverflow",
  "Pinterest", "Spotify", "DevDocs", "MDN", "Netflix",
  "Apple Music", "Notion", "Figma", "Dribbble", "Behance",
  "Product Hunt", "Hacker News", "Substack", "Wikipedia",
  "Lazada", "Tiki", "Grab Food", "ShopeeFood", "Foody", "Google Docs",
];



/* ═══════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════ */

export default async function LandingPage() {
  /* ── Locale ───────────────────────────── */
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get("landing_locale")?.value || "vi";
  const locale: Locale = (SUPPORTED_LOCALES as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : "vi";
  const t = (landingData as Record<string, Record<string, string | string[]>>)[locale] || landingData.vi;

  /* ── i18n Data ──────────────────────────── */
  const stats = [
    { icon: Users, value: "5K+", label: t.statsUsers as string, color: "text-pink-500" },
    { icon: Bookmark, value: "100K+", label: t.statsItems as string, color: "text-rose-500" },
    { icon: List, value: "20K+", label: t.statsLists as string, color: "text-pink-600" },
    { icon: Star, value: "4.8", label: t.statsRating as string, color: "text-rose-600" },
  ];

  const problems = [
    { icon: Camera, text: t.problem1 as string, color: "from-pink-500 to-rose-500" },
    { icon: FolderSearch, text: t.problem2 as string, color: "from-rose-500 to-pink-600" },
    { icon: MessageCircle, text: t.problem3 as string, color: "from-pink-600 to-rose-500" },
    { icon: Link2, text: t.problem4 as string, color: "from-rose-500 to-pink-500" },
  ];

  const howItWorksSteps = [
    {
      number: "01", icon: MousePointerClick,
      title: t.step01Title as string, description: t.step01Desc as string,
      features: [t.step01F1 as string, t.step01F2 as string, t.step01F3 as string, t.step01F4 as string],
    },
    {
      number: "02", icon: Tags,
      title: t.step02Title as string, description: t.step02Desc as string,
      features: [t.step02F1 as string, t.step02F2 as string, t.step02F3 as string, t.step02F4 as string],
    },
    {
      number: "03", icon: Share2,
      title: t.step03Title as string, description: t.step03Desc as string,
      features: [t.step03F1 as string, t.step03F2 as string, t.step03F3 as string, t.step03F4 as string],
    },
  ];

  const useCases = [
    { emoji: "🍳", title: t.case1 as string, image: "https://images.unsplash.com/photo-1761839257845-9283b7d1b933?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600", items: t.case1Items as string[] },
    { emoji: "👨‍💻", title: t.case2 as string, image: "https://images.unsplash.com/photo-1607971422532-73f9d45d7a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600", items: t.case2Items as string[] },
    { emoji: "🛍", title: t.case3 as string, image: "https://images.unsplash.com/photo-1768987439370-bd60d3d0b28b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600", items: t.case3Items as string[] },
    { emoji: "🎥", title: t.case4 as string, image: "https://images.unsplash.com/photo-1639426191907-ecbec8568bcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=600", items: t.case4Items as string[] },
  ];

  const productsData = [
    {
      status: "Production", statusColor: "bg-green-100 text-green-700",
      icon: Globe, title: t.webAppTitle as string, subtitle: t.webAppSubtitle as string, gradient: "from-pink-500 to-rose-500",
      features: [
        { icon: LayoutDashboard, text: t.featureDashboard as string },
        { icon: ListChecks, text: t.featureCRUD as string },
        { icon: Tags, text: t.featureListsTags as string },
        { icon: Upload, text: t.featureUpload as string },
        { icon: Share2, text: t.featureShare as string },
        { icon: Languages, text: t.featureLanguages as string },
      ],
    },
    {
      status: "Coming Soon", statusColor: "bg-pink-100 text-pink-700",
      icon: Puzzle, title: t.chromeExtTitle as string, subtitle: t.chromeExtSubtitle as string, gradient: "from-rose-500 to-pink-600",
      features: [
        { icon: MousePointerClick, text: t.featureFloating as string },
        { icon: Zap, text: t.featureExtract as string },
        { icon: Clock, text: t.featureSaveFast as string },
        { icon: MessageSquare, text: t.featureInline as string },
        { icon: Ban, text: t.featureNoLeave as string },
      ],
    },
    {
      status: "Coming Soon", statusColor: "bg-pink-100 text-pink-700",
      icon: Smartphone, title: t.mobileTitle as string, subtitle: t.mobileSubtitle as string, gradient: "from-pink-600 to-rose-600",
      features: [
        { icon: RefreshCw, text: t.featureSync as string },
        { icon: Share2, text: t.featureShareSheet as string },
        { icon: Zap, text: t.featureSafari as string },
        { icon: Link2, text: t.featureDeepLink as string },
      ],
    },
  ];

  const bookmarkFeatures = [t.bm1 as string, t.bm2 as string, t.bm3 as string, t.bm4 as string, t.bm5 as string];
  const favlizFeatures = [t.fl1 as string, t.fl2 as string, t.fl3 as string, t.fl4 as string, t.fl5 as string];

  const privacyFeatures = [
    { icon: Lock, title: t.privacy1Title as string, desc: t.privacy1Desc as string },
    { icon: Eye, title: t.privacy2Title as string, desc: t.privacy2Desc as string },
    { icon: UserCheck, title: t.privacy3Title as string, desc: t.privacy3Desc as string },
    { icon: Shield, title: t.privacy4Title as string, desc: t.privacy4Desc as string },
  ];

  /* ── Auth check ──────────────────────────── */
  let isLoggedIn = false;
  let userName: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      isLoggedIn = true;
      const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } });
      userName = dbUser?.name || null;
    }
  } catch { /* guests */ }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', sans-serif" }}>
      {/* ── NAVBAR ─────────────────────────────── */}
      <LandingNavbar isLoggedIn={isLoggedIn} userName={userName} locale={locale} t={t} />

      {/* ── HERO ──────────────────────────────── */}
      <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Animated gradient background */}
        <div className="landing-hero-bg" />
        {/* Soft floating orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-pink-200/30 rounded-full blur-[120px] landing-orb-float" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[100px] landing-orb-float" style={{ animationDelay: "3s" }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pink-100/25 rounded-full blur-[120px] landing-orb-float" style={{ animationDelay: "6s" }} />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-200 rounded-full mb-8 landing-reveal">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-pink-700" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                {t.badge}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-gray-900 mb-6 landing-reveal"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 800, lineHeight: 1.1, animationDelay: "100ms" }}
            >
              {t.heroLine1}
              <br />
              {t.heroLine2}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600">
                {t.heroLine3}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-gray-500 max-w-2xl mx-auto mb-10 landing-reveal"
              style={{ fontSize: "1.2rem", lineHeight: 1.7, animationDelay: "200ms" }}
            >
              {t.subtitle}
            </p>

            {/* Secondary text */}
            <p
              className="text-gray-400 mb-10 landing-reveal"
              style={{ fontSize: "1rem", fontWeight: 500, animationDelay: "300ms" }}
            >
              {t.subtext}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 landing-reveal" style={{ animationDelay: "350ms" }}>
              <Link
                href={isLoggedIn ? "/dashboard" : "/register"}
                className="group px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:shadow-xl hover:shadow-pink-500/30 transition-all flex items-center gap-2 no-underline"
                style={{ fontSize: "1.05rem", fontWeight: 600 }}
              >
                {isLoggedIn ? t.ctaApp : t.ctaStart}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <ChromeExtensionButton
                className="group px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-full hover:border-pink-300 hover:text-pink-600 transition-all flex items-center gap-2 cursor-pointer"
                style={{ fontSize: "1.05rem", fontWeight: 600 }}
                labelInstall={t.ctaChrome as string}
                labelComingSoon={t.comingSoon as string}
                labelComingSoonDesc={t.comingSoonDesc as string}
                labelOk={t.comingSoonOk as string}
              />
            </div>
          </div>

          {/* Hero Screenshot */}
          <div className="mt-16 md:mt-24 max-w-5xl mx-auto landing-reveal" style={{ animationDelay: "500ms" }}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-2xl border border-pink-100 shadow-2xl shadow-pink-500/10 overflow-hidden">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white rounded-md px-3 py-1.5 text-gray-400 border border-gray-200" style={{ fontSize: "0.8rem" }}>
                      app.favliz.com/dashboard
                    </div>
                  </div>
                </div>
                {/* Dashboard mockup */}
                <div className="p-6 md:p-8 bg-gradient-to-b from-white to-pink-50/30 min-h-[300px] md:min-h-[420px]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: "Total Items", value: "247", sub: "+12 tuần này", subColor: "text-green-500" },
                      { label: "Lists", value: "18", sub: "+3 tuần này", subColor: "text-green-500" },
                      { label: "Tags", value: "42", sub: "5 được dùng nhiều nhất", subColor: "text-pink-500" },
                    ].map((c) => (
                      <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border border-pink-50">
                        <div className="text-gray-400 mb-1" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{c.label}</div>
                        <div className="text-gray-900" style={{ fontSize: "2rem", fontWeight: 700 }}>{c.value}</div>
                        <div className={`mt-1 ${c.subColor}`} style={{ fontSize: "0.75rem" }}>{c.sub}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <div className="text-gray-900 mb-4" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Recent Items</div>
                    <div className="space-y-3">
                      {[
                        { title: "Cách làm Phở Bò tại nhà chuẩn vị", platform: "YouTube", cls: "bg-red-100 text-red-600" },
                        { title: "NextJS 15 App Router Best Practices", platform: "GitHub", cls: "bg-gray-100 text-gray-700" },
                        { title: "Áo khoác mùa đông giảm 50%", platform: "Shopee", cls: "bg-orange-100 text-orange-600" },
                      ].map((item) => (
                        <div key={item.title} className="flex items-center gap-4 bg-white rounded-lg p-3 border border-gray-100">
                          <div className="w-12 h-12 bg-pink-50 rounded-lg shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-900 truncate" style={{ fontSize: "0.85rem", fontWeight: 500 }}>{item.title}</div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full ${item.cls}`} style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                              {item.platform}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* ── STATS ─────────────────────────────── */}
      < section className="py-16 bg-white border-y border-pink-50" >
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center landing-reveal">
                  <Icon className={`w-6 h-6 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-gray-900" style={{ fontSize: "2.5rem", fontWeight: 800 }}>{stat.value}</div>
                  <div className="text-gray-400 mt-1" style={{ fontSize: "0.9rem" }}>{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section >

      {/* ── PROBLEM ───────────────────────────── */}
      < section className="py-20 md:py-28 bg-gray-50/50" >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 landing-reveal">
            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full mb-6" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {t.sectionProblem}
            </span>
            <h2 className="text-gray-900" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.2 }}>
              {t.problemTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {problems.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-500/5 transition-all landing-reveal">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-gray-600" style={{ fontSize: "1.05rem", lineHeight: 1.6 }}>{p.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-12 text-center landing-reveal">
            <div className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-[1px]">
              <div className="bg-white rounded-2xl px-8 py-5">
                <p className="text-gray-800" style={{ fontSize: "1.15rem", fontWeight: 600 }}>
                  {t.solutionTitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* ── HOW IT WORKS ──────────────────────── */}
      < section id="features" className="py-20 md:py-28 bg-white" >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20 landing-reveal">
            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full mb-6" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {t.sectionSolution}
            </span>
            <h2 className="text-gray-900" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.2 }}>
              {t.solutionSubtitle}
            </h2>
          </div>
          <div className="space-y-20 md:space-y-32">
            {howItWorksSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center landing-reveal`}>
                  {/* Content */}
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400" style={{ fontSize: "3.5rem", fontWeight: 900 }}>
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-gray-900 mb-4" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, lineHeight: 1.3 }}>
                      {step.title}
                    </h3>
                    <p className="text-gray-500 mb-6" style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>{step.description}</p>
                    <div className="space-y-3">
                      {step.features.map((f) => (
                        <div key={f} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-gray-600" style={{ fontSize: "0.95rem" }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Screenshot placeholder */}
                  <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="relative">
                      <div className="absolute -inset-3 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-3xl blur-xl" />
                      <div className="relative bg-white rounded-2xl border border-pink-100 shadow-xl overflow-hidden">
                        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
                        </div>
                        <div className="p-6 bg-gradient-to-b from-white to-pink-50/20 min-h-[280px] md:min-h-[340px] flex items-center justify-center">
                          <div className="text-center border-2 border-dashed border-pink-200 rounded-xl p-8 bg-pink-50/30 w-full">
                            <div className="mb-3" style={{ fontSize: "2rem" }}>📸</div>
                            <p className="text-pink-400" style={{ fontSize: "0.9rem", fontWeight: 500 }}>Screenshot sẽ được thêm vào đây</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section >

      {/* ── PLATFORMS ──────────────────────────── */}
      < section className="py-16 bg-white border-y border-pink-50" >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8 landing-reveal">
            <p className="text-gray-400" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
              {t.platformsTitle} {t.platformsSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5 landing-reveal">
            {platforms.map((p) => (
              <span
                key={p}
                className="px-4 py-2 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-full text-gray-600 hover:border-pink-300 hover:text-pink-600 hover:shadow-sm transition-all cursor-default"
                style={{ fontSize: "0.8rem", fontWeight: 500 }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section >

      {/* ── USE CASES ─────────────────────────── */}
      < section id="usecases" className="py-20 md:py-28 bg-gray-50/50" >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 landing-reveal">
            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full mb-6" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {t.sectionUseCases}
            </span>
            <h2 className="text-gray-900 mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.2 }}>
              {t.useCasesTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.title} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5 transition-all landing-reveal">
                <div className="h-48 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uc.image}
                    alt={uc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-5 flex items-center gap-3">
                    <span style={{ fontSize: "2rem" }}>{uc.emoji}</span>
                    <span className="text-white" style={{ fontSize: "1.3rem", fontWeight: 700 }}>{uc.title}</span>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {uc.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2 shrink-0" />
                        <span className="text-gray-600" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* ── PRODUCTS ──────────────────────────── */}
      < section id="products" className="py-20 md:py-28 bg-white" >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 landing-reveal">
            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full mb-6" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {t.sectionProducts}
            </span>
            <h2 className="text-gray-900 mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.2 }}>
              {t.productsTitle}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">{t.productsTitleHighlight}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {productsData.map((product) => {
              const PIcon = product.icon;
              return (
                <div key={product.title} className="group bg-white rounded-2xl border border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5 transition-all overflow-hidden flex flex-col landing-reveal">
                  <div className={`p-6 bg-gradient-to-br ${product.gradient} text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <PIcon className="w-8 h-8" />
                      <span className={`px-3 py-1 rounded-full ${product.statusColor}`} style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                        {product.status}
                      </span>
                    </div>
                    <h3 className="mb-1" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{product.title}</h3>
                    <p className="text-white/80" style={{ fontSize: "0.9rem" }}>{product.subtitle}</p>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="space-y-3">
                      {product.features.map((f) => {
                        const FIcon = f.icon;
                        return (
                          <div key={f.text} className="flex items-center gap-3">
                            <FIcon className="w-4 h-4 text-pink-400 shrink-0" />
                            <span className="text-gray-600" style={{ fontSize: "0.9rem" }}>{f.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section >

      {/* ── COMPARISON ────────────────────────── */}
      < section id="comparison" className="py-20 md:py-28 bg-gray-50/50" >
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16 landing-reveal">
            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full mb-6" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {t.sectionComparison}
            </span>
            <h2 className="text-gray-900" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.2 }}>
              {t.comparisonTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bookmark */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 landing-reveal">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <X className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-gray-400" style={{ fontSize: "1.3rem", fontWeight: 700 }}>{t.bookmarkTitle}</h3>
              </div>
              <div className="space-y-4">
                {bookmarkFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <span className="text-gray-400" style={{ fontSize: "0.95rem" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* FavLiz */}
            <div className="relative bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-8 text-white landing-reveal">
              <div className="absolute -inset-1 bg-gradient-to-br from-pink-500/30 to-rose-500/30 rounded-2xl blur-xl -z-10" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white" style={{ fontSize: "1.3rem", fontWeight: 700 }}>FavLiz</h3>
              </div>
              <div className="space-y-4">
                {favlizFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white/90" style={{ fontSize: "0.95rem" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* ── PRIVACY ───────────────────────────── */}
      < section className="py-20 md:py-28 bg-white" >
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16 landing-reveal">
            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full mb-6" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {t.sectionPrivacy}
            </span>
            <h2 className="text-gray-900 mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.2 }}>
              {t.privacyTitle}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">{t.privacyTitleHighlight}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {privacyFeatures.map((pf) => {
              const PIcon = pf.icon;
              return (
                <div key={pf.title} className="bg-gradient-to-br from-gray-50 to-pink-50/30 rounded-2xl p-6 border border-pink-100/50 landing-reveal">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4">
                    <PIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-gray-900 mb-2" style={{ fontSize: "1.15rem", fontWeight: 700 }}>{pf.title}</h3>
                  <p className="text-gray-500" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>{pf.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section >


      {/* ── CTA ───────────────────────────────── */}
      < section className="py-20 md:py-28 bg-white" >
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative landing-reveal">
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-pink-500/20 rounded-[2rem] blur-2xl" />
            <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-3xl p-10 md:p-16 text-center text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <Heart className="w-10 h-10 mx-auto mb-6 text-white/80" />
                <h2 className="mb-4" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, lineHeight: 1.2 }}>
                  {t.ctaTitle} <br /> {t.ctaTitleBreak}
                </h2>
                <p className="text-white/80 max-w-lg mx-auto mb-10" style={{ fontSize: "1.15rem", lineHeight: 1.7 }}>
                  {t.ctaSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href={isLoggedIn ? "/dashboard" : "/register"}
                    className="group px-8 py-4 bg-white text-pink-600 rounded-full hover:shadow-xl transition-all flex items-center gap-2 no-underline"
                    style={{ fontSize: "1.05rem", fontWeight: 700 }}
                  >
                    {isLoggedIn ? t.ctaApp : t.ctaRegister}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <ChromeExtensionButton
                    className="group px-8 py-4 bg-white/15 border border-white/30 text-white rounded-full hover:bg-white/25 transition-all flex items-center gap-2 cursor-pointer"
                    style={{ fontSize: "1.05rem", fontWeight: 600 }}
                    location="cta_section"
                    labelInstall={t.ctaChrome as string}
                    labelComingSoon={t.comingSoon as string}
                    labelComingSoonDesc={t.comingSoonDesc as string}
                    labelOk={t.comingSoonOk as string}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* ── FOOTER ────────────────────────────── */}
      < footer className="bg-gray-50 border-t border-gray-100" >
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4 no-underline">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-gray-900" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                  Fav<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Liz</span>
                </span>
              </Link>
              <p className="text-gray-400" style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
                {t.footerTagline}
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 mb-4" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{t.footerProduct}</h4>
              <ul className="space-y-3">
                {[t.footerWebApp, t.footerExtension, t.footerMobile].map((item) => (
                  <li key={item as string}>
                    <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors no-underline" style={{ fontSize: "0.9rem" }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 mb-4" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{t.footerResources}</h4>
              <ul className="space-y-3">
                {[t.footerUseCases, t.footerBlog, t.footerChangelog].map((item) => (
                  <li key={item as string}>
                    <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors no-underline" style={{ fontSize: "0.9rem" }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 mb-4" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{t.footerLegal}</h4>
              <ul className="space-y-3">
                {[t.footerPrivacy, t.footerTerms].map((item) => (
                  <li key={item as string}>
                    <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors no-underline" style={{ fontSize: "0.9rem" }}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400" style={{ fontSize: "0.85rem" }}>
              {t.footerCopyright}
            </p>
          </div>
        </div>
      </footer >
    </div >
  );
}
