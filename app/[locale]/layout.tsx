import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { locales } from "@/lib/i18n/config"
import { fontVariables } from "@/lib/fonts"
import { CookieConsent } from "@/components/cookies/cookie-consent"
import { Toaster } from "@/components/ui/sonner"

type LocaleLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// Vercel serves /_vercel/insights itself: elsewhere (local build, preview) the scripts would 404.
const ON_VERCEL = !!process.env.VERCEL

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params

  if (!hasLocale(locales, locale)) {
    notFound()
  }

  // Lets next-intl resolve the locale from params instead of request headers,
  // which keeps ISR pages renderable on demand (no DYNAMIC_SERVER_USAGE).
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning className={fontVariables}>
      <head>
        <link rel="preconnect" href="https://pierresenlumieres.fr" />
        <link rel="dns-prefetch" href="https://pierresenlumieres.fr" />
      </head>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <CookieConsent />
        </NextIntlClientProvider>
        <Toaster />
        {ON_VERCEL ? (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        ) : null}
      </body>
    </html>
  )
}

export default LocaleLayout
