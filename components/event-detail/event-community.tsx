import Image from "next/image"
import { getTranslations } from "next-intl/server"
import {
  Facebook,
  Instagram,
  Linkedin,
  Music2,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react"
import { socialLabel, socialPlatform, type SocialPlatform } from "@/lib/events/social-links"
import type { EventDetail } from "@/lib/queries/events"

const ICONS: Record<SocialPlatform, LucideIcon> = {
  facebook: Facebook,
  instagram: Instagram,
  x: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: Music2,
}

const linkClass =
  "text-ed-bone hover:text-primary focus-visible:ring-primary/50 flex min-h-11 items-center gap-3 rounded-sm font-serif text-base break-words transition-colors focus-visible:ring-2 focus-visible:outline-none"

type EventCommunityProps = {
  event: Pick<EventDetail, "location" | "socialLinks" | "associations">
}

/** Social pages and partner associations of a site; renders nothing when both are empty. */
const EventCommunity = async ({ event }: EventCommunityProps) => {
  const socials = event.socialLinks.flatMap((url) => {
    const platform = socialPlatform(url)
    return platform ? [{ url, platform }] : []
  })
  if (socials.length === 0 && event.associations.length === 0) return null
  const t = await getTranslations()

  return (
    <div className="bg-ed-bg-deep border-primary/25 flex flex-col gap-6 border p-6">
      {socials.length > 0 ? (
        <section aria-labelledby="community-social">
          <h2
            id="community-social"
            className="text-primary mb-3 font-mono text-xs tracking-[0.22em] uppercase"
          >
            <span aria-hidden="true">¶</span> {t("community.socialTitle")}
          </h2>
          <ul className="grid gap-1">
            {socials.map(({ url, platform }) => {
              const Icon = ICONS[platform]
              return (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    <Icon className="text-primary size-5 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="sr-only">
                        {t("community.socialLink", {
                          network: socialLabel(platform),
                          place: event.location,
                        })}
                      </span>
                      <span aria-hidden="true">{socialLabel(platform)}</span>
                      <span className="sr-only"> {t("a11y.newTab")}</span>
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {event.associations.length > 0 ? (
        <section aria-labelledby="community-associations">
          <h2
            id="community-associations"
            className="text-primary mb-3 font-mono text-xs tracking-[0.22em] uppercase"
          >
            <span aria-hidden="true">¶</span> {t("community.associationsTitle")}
          </h2>
          <ul className="grid gap-3">
            {event.associations.map((association) => {
              const content = (
                <>
                  {association.logo ? (
                    <Image
                      src={association.logo}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 shrink-0 rounded-sm bg-white object-contain p-1"
                    />
                  ) : null}
                  <span className="min-w-0">{association.name}</span>
                </>
              )
              return (
                <li key={association.id}>
                  {association.url ? (
                    <a
                      href={association.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {content}
                      <span className="sr-only"> {t("a11y.newTab")}</span>
                    </a>
                  ) : (
                    <p className="text-ed-bone flex min-h-11 items-center gap-3 font-serif text-base break-words">
                      {content}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

export { EventCommunity }
