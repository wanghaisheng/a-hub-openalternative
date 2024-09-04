import { titleCase } from "@curiousleaf/utils"
import {
  type HeadersFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { BackButton } from "apps/web/app/components/BackButton"
import { BreadcrumbsLink } from "apps/web/app/components/Breadcrumbs"
import { Grid } from "apps/web/app/components/Grid"
import { Intro } from "apps/web/app/components/Intro"
import { ToolRecord } from "apps/web/app/partials/records/ToolRecord"
import { type TopicOne, toolManyPayload, topicOnePayload } from "apps/web/app/services.server/api"
import { prisma } from "apps/web/app/services.server/prisma"
import { JSON_HEADERS } from "apps/web/app/utils/constants"
import { getMetaTags } from "apps/web/app/utils/meta"
import { combineServerTimings, makeTimings, time } from "apps/web/app/utils/timing.server"

export const handle = {
  breadcrumb: (data?: { topic: TopicOne }) => {
    if (!data?.topic) return <BackButton to="/topics" />

    const { slug } = data.topic

    return <BreadcrumbsLink to={`/topics/${slug}`} label={titleCase(slug)} />
  },
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

export const headers: HeadersFunction = ({ loaderHeaders, parentHeaders }) => {
  return {
    "Server-Timing": combineServerTimings(parentHeaders, loaderHeaders),
  }
}

export const loader = async ({ params: { slug } }: LoaderFunctionArgs) => {
  const timings = makeTimings("topic loader")

  try {
    const [topic, tools] = await Promise.all([
      time(
        () =>
          prisma.topic.findUniqueOrThrow({
            where: { slug },
            include: topicOnePayload,
          }),
        { type: "find topic", timings },
      ),

      time(
        () =>
          prisma.tool.findMany({
            where: {
              topics: { some: { topic: { slug } } },
              publishedAt: { lte: new Date() },
            },
            include: toolManyPayload,
            orderBy: [{ isFeatured: "desc" }, { score: "desc" }],
          }),
        { type: "find tools", timings },
      ),
    ])

    const name = titleCase(topic.slug)

    const meta = {
      title: `Open Source Projects tagged "${name}"`,
      description: `A curated collection of the ${tools.length} best open source projects tagged "${name}". Each listing includes a website screenshot along with a detailed review of its features.`,
    }

    return json(
      { meta, topic, tools },
      { headers: { "Server-Timing": timings.toString(), ...JSON_HEADERS } },
    )
  } catch {
    throw json(null, { status: 404, statusText: "Not Found" })
  }
}

export default function TopicsPage() {
  const { meta, tools } = useLoaderData<typeof loader>()

  return (
    <>
      <Intro {...meta} />

      <Grid>
        {tools.map(tool => (
          <ToolRecord key={tool.id} tool={tool} />
        ))}

        {!tools?.length && <p className="col-span-full">No Open Source software found.</p>}
      </Grid>

      <BackButton to="/topics" />
    </>
  )
}