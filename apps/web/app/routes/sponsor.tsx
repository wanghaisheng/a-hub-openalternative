import { formatNumber } from "@curiousleaf/utils"
import { type MetaFunction, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { BreadcrumbsLink } from "apps/web/app/components/Breadcrumbs"
import { Card } from "apps/web/app/components/Card"
import { H4 } from "apps/web/app/components/Heading"
import { Intro, IntroDescription, IntroTitle } from "apps/web/app/components/Intro"
import { Sponsoring } from "apps/web/app/components/Sponsoring"
import { BrandGitHubIcon } from "apps/web/app/components/icons/BrandGitHub"
import { Sponsors } from "apps/web/app/partials/Sponsors"
import { prisma } from "apps/web/app/services.server/prisma"
import { SITE_STATS, SPONSORING_PREMIUM_TRESHOLD } from "apps/web/app/utils/constants"
import { getMetaTags } from "apps/web/app/utils/meta"
import { getPremiumSponsors } from "apps/web/app/utils/sponsoring"
import { HandHeartIcon, SendIcon, SquareAsteriskIcon } from "lucide-react"

export const handle = {
  breadcrumb: () => <BreadcrumbsLink to="/sponsor" label="Sponsor" />,
}

export const meta: MetaFunction<typeof loader> = ({ matches, data, location }) => {
  const { title, description } = data?.meta || {}

  return getMetaTags({
    location,
    title,
    description,
    parentMeta: matches.find(({ id }) => id === "root")?.meta,
  })
}

export const loader = async () => {
  const sponsorings = await prisma.sponsoring.findMany({
    orderBy: { createdAt: "asc" },
  })

  const meta = {
    title: "Supercharge your sales with sponsored listing",
    description:
      "Ensure the long-term success and growth of your business by sponsoring our comprehensive open source directory. Your support helps promote open source alternatives, fosters innovation, and makes a lasting positive impact.",
  }

  return json({ sponsorings, meta })
}

export default function SponsorPage() {
  const { sponsorings, meta } = useLoaderData<typeof loader>()
  const premiumSponsors = getPremiumSponsors(sponsorings)

  const benefits = [
    {
      icon: <SquareAsteriskIcon className="size-full" />,
      title: "Homepage Ad",
      description: "Get featured on our homepage with a banner ad linking to your website.",
      stats: {
        value: SITE_STATS.visitors,
        label: "Monthly Visitors",
      },
    },
    {
      icon: <HandHeartIcon className="size-full" />,
      title: "Support OSS",
      description: "Support the open-source community and help us maintain the directory.",
      stats: {
        value: SITE_STATS.tools,
        label: "Listed Projects",
      },
    },
    {
      icon: <SendIcon className="size-full" />,
      title: "Newsletter Mention",
      description: "Get featured in our monthly newsletter read by OpenSource/tech enthusiasts.",
      stats: {
        value: SITE_STATS.subscribers,
        label: "Subscribers",
      },
      exclusive: true,
    },
    {
      icon: <BrandGitHubIcon className="size-full" />,
      title: "GitHub Logo",
      description: 'Display your logo in a special "Sponsors" section in our GitHub repository.',
      stats: {
        value: SITE_STATS.stars,
        label: "Stars",
      },
      exclusive: true,
    },
  ]

  return (
    <>
      <Intro {...meta} />

      <Sponsoring dates={sponsorings} className="max-w-2xl" />

      <div className="flex flex-col items-start gap-8 max-w-2xl mt-4">
        <Intro>
          <IntroTitle size="h2">What do I get for sponsoring?</IntroTitle>

          <IntroDescription>
            We offer a variety of benefits to our sponsors. Explore our{" "}
            <a
              href="https://go.openalternative.co/analytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              real-time analytics
            </a>{" "}
            to see what impact sponsoring could have on your business.
          </IntroDescription>
        </Intro>

        <div className="grid grid-auto-fill-xl gap-4 w-full">
          {benefits.map(benefit => (
            <Card key={benefit.title}>
              <Card.Header>
                <div className="flex size-9 items-center justify-center shrink-0 rounded-md border bg-background p-1.5">
                  {benefit.icon}
                </div>

                <H4 as="strong">
                  {benefit.title}
                  {benefit.exclusive && <span className="text-muted">*</span>}
                </H4>
              </Card.Header>

              <Card.Description>{benefit.description}</Card.Description>
              <Card.Footer>
                ~{formatNumber(benefit.stats.value)} {benefit.stats.label}
              </Card.Footer>
            </Card>
          ))}
        </div>

        <p className="text-sm text-muted">
          *Available only for premium sponsors who purchased {SPONSORING_PREMIUM_TRESHOLD} days or
          more.
        </p>
      </div>

      {!!premiumSponsors.length && (
        <div className="flex flex-col items-start gap-8 max-w-2xl mt-4" id="sponsors">
          <Intro>
            <IntroTitle size="h2">Premium Sponsors</IntroTitle>
          </Intro>

          <Sponsors sponsors={premiumSponsors} />
        </div>
      )}
    </>
  )
}