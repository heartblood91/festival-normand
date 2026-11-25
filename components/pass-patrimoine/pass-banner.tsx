import { getTranslations } from "next-intl/server"
import { toLocalDateInput } from "@/lib/admin/form-status"
import { withPassUtm } from "@/lib/pass-patrimoine/url"
import {
  isPassBannerVisible,
  passBannerStorageKey,
  passBannerVersion,
  type BannerPage,
  type PassPatrimoineSettings,
} from "@/lib/site-settings/pass-patrimoine"
import type { Locale } from "@/lib/i18n/config"
import { PassBannerView } from "@/components/pass-patrimoine/pass-banner-view"

type PassBannerProps = {
  page: BannerPage
  settings: PassPatrimoineSettings
  locale: Locale
}

const BANNER_ID = "pass-patrimoine-banner"

/**
 * Promo banner for the Pass Patrimoine. Rendered on the server so it takes its
 * place without a layout shift; the inline script hides it before the first
 * paint for visitors who closed this version of the banner.
 */
export const PassBanner = async ({ page, settings, locale }: PassBannerProps) => {
  if (!isPassBannerVisible(settings, page, toLocalDateInput(new Date()))) return null
  const t = await getTranslations("passPatrimoine")
  const version = passBannerVersion(settings)
  const hideIfDismissed = `try{if(localStorage.getItem(${JSON.stringify(
    passBannerStorageKey(version)
  )}))document.getElementById(${JSON.stringify(BANNER_ID)}).hidden=true}catch(e){}`

  return (
    <>
      <PassBannerView
        id={BANNER_ID}
        version={version}
        label={t("bannerLabel")}
        text={locale === "en" ? settings.bannerTextEn : settings.bannerTextFr}
        href={withPassUtm(settings.bannerUrl)}
        cta={t("bannerCta")}
        newTab={t("newTab")}
        close={t("bannerClose")}
      />
      <script dangerouslySetInnerHTML={{ __html: hideIfDismissed }} />
    </>
  )
}
