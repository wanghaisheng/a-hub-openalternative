import type { ComponentProps } from "react"
import wretch from "wretch"
import { Chart } from "~/app/admin/_components/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/admin/ui/card"
import { env } from "~/env"
import { cache } from "~/lib/cache"

type AnalyticsResponse = {
  results: { date: string; visitors: number }[]
}

const getAnalytics = cache(
  async () => {
    const host = env.NEXT_PUBLIC_PLAUSIBLE_HOST
    const apiKey = env.PLAUSIBLE_API_KEY
    const domain = env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

    const api = wretch(`${host}/api/v1`)
      .auth(`Bearer ${apiKey}`)
      .options({ cache: "no-store" })
      .errorType("json")

    const queryOptions = new URLSearchParams({
      metrics: "visitors",
      period: "30d",
      site_id: domain,
    })

    const { results } = await api
      .get(`/stats/timeseries?${queryOptions.toString()}`)
      .json<AnalyticsResponse>()

    const totalVisitors = results.reduce((acc, curr) => acc + curr.visitors, 0)
    const averageVisitors = Math.round(totalVisitors / results.length)

    return { results, totalVisitors, averageVisitors }
  },
  ["analytics"],
  { revalidate: 60 * 60 },
)

const AnalyticsCard = async ({ ...props }: ComponentProps<typeof Card>) => {
  const { results, totalVisitors, averageVisitors } = await getAnalytics()

  return (
    <Card {...props}>
      <CardHeader>
        <CardDescription>Visitors</CardDescription>
        <CardTitle className="text-3xl tabular-nums">{totalVisitors.toLocaleString()}</CardTitle>
      </CardHeader>

      <CardContent>
        <Chart
          data={results.map(({ date, visitors }) => ({ date, value: visitors }))}
          average={averageVisitors}
          className="h-56 w-full"
          cellClassName="fill-chart-4"
          config={{ value: { label: "Visitors" } }}
        />
      </CardContent>
    </Card>
  )
}

export { AnalyticsCard }
