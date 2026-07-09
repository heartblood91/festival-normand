import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { locales } from "@/lib/i18n/config"
import { CookieConsent } from "@/components/cookies/cookie-consent"

type LocaleLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params

  if (!hasLocale(locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <CookieConsent />
    </NextIntlClientProvider>
  )
}

export default LocaleLayout
