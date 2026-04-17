import { getTranslations } from "next-intl/server"

const SkipNav = async () => {
  const t = await getTranslations()
  return (
    <>
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:outline-none"
      >
        {t("a11y.skipToContent")}
      </a>
      <a
        href="#footer-nav"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:top-12 focus:left-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:outline-none"
      >
        {t("a11y.skipToFooter")}
      </a>
    </>
  )
}

export { SkipNav }
