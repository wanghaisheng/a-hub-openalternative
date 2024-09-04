import { slugify } from "@curiousleaf/utils"
import type { Sponsoring } from "apps/web/app/services.server/api"
import { cx } from "apps/web/app/utils/cva"
import { posthog } from "posthog-js"
import type { HTMLAttributes } from "react"

export type SponsorsProps = HTMLAttributes<HTMLDivElement> & {
  sponsors: Sponsoring[]
}

export const Sponsors = ({ className, sponsors, ...props }: SponsorsProps) => {
  return (
    <div className={cx("flex flex-wrap items-center gap-6", className)} {...props}>
      {sponsors.map(sponsor => (
        <a
          key={sponsor.name}
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-wrap items-center gap-x-2 font-semibold opacity-75 hover:opacity-100 md:text-lg"
          title={sponsor.description ?? undefined}
          onClick={() => posthog.capture("sponsoring_clicked", { url: sponsor.website })}
        >
          <img
            src={`/sponsors/${slugify(sponsor.name)}.svg`}
            width="24"
            height="24"
            alt={sponsor.name}
            className="h-6 w-auto"
          />

          {sponsor.name}
        </a>
      ))}
    </div>
  )
}