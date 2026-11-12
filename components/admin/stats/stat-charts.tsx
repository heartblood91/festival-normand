import { cn } from "@/lib/utils"

type StatTileProps = {
  label: string
  value: string
  detail?: string
}

export const StatTile = ({ label, value, detail }: StatTileProps) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
    <dt className="text-muted-foreground text-sm">{label}</dt>
    <dd className="mt-1 font-serif text-3xl font-bold text-white tabular-nums">{value}</dd>
    {detail ? <dd className="text-muted-foreground mt-1 text-xs">{detail}</dd> : null}
  </div>
)

type BarListProps = {
  rows: { label: string; value: number; detail?: string }[]
  /** Bars are scaled against this value (e.g. the total) instead of the largest row. */
  max?: number
  formatValue?: (value: number) => string
}

/** Horizontal bars, one series: each row says its value in text, so no legend is needed. */
export const BarList = ({ rows, max, formatValue = String }: BarListProps) => {
  const scale = Math.max(max ?? 0, ...rows.map((row) => row.value), 1)
  return (
    <ul className="grid gap-3">
      {rows.map((row, index) => (
        <li key={`${index}-${row.label}`} className="grid gap-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 break-words text-white">{row.label}</span>
            <span className="text-muted-foreground shrink-0 tabular-nums">
              {formatValue(row.value)}
              {row.detail ? <span className="ml-1 text-xs">{row.detail}</span> : null}
            </span>
          </div>
          <div className="h-2 rounded-sm bg-white/10" aria-hidden="true">
            <div
              className={cn("h-2 rounded-r bg-amber-500", row.value === 0 && "hidden")}
              style={{ width: `${(row.value / scale) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

type DailyColumnsProps = {
  caption: string
  days: { day: string; label: string; views: number }[]
  tableSummary: string
}

/** Daily columns with a hover/focus tooltip; the table below is the accessible version. */
export const DailyColumns = ({ caption, days, tableSummary }: DailyColumnsProps) => {
  const peak = Math.max(...days.map((day) => day.views), 1)
  const peakDay = days.find((day) => day.views === peak)
  return (
    <figure className="grid gap-3">
      <figcaption className="text-muted-foreground text-sm">
        {caption}
        {peakDay && peakDay.views > 0 ? ` Pic le ${peakDay.label} : ${peakDay.views}.` : ""}
      </figcaption>
      <div className="flex h-40 items-end gap-0.5 border-b border-white/15" aria-hidden="true">
        {days.map((day) => (
          <div key={day.day} className="group relative flex h-full flex-1 items-end">
            <div
              className="w-full max-w-6 rounded-t bg-amber-500 group-hover:bg-amber-300"
              style={{ height: `${(day.views / peak) * 100}%`, minHeight: day.views ? 2 : 0 }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-slate-950 px-2 py-1 text-xs whitespace-nowrap text-white shadow group-hover:block">
              {day.label} : {day.views}
            </span>
          </div>
        ))}
      </div>
      <div className="text-muted-foreground flex justify-between text-xs" aria-hidden="true">
        <span>{days[0]?.label}</span>
        <span>{days.at(-1)?.label}</span>
      </div>
      <details className="text-sm">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-amber-400 focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:outline-none">
          Voir les données sous forme de tableau
        </summary>
        <table className="mt-2 w-full text-left">
          <caption className="sr-only">{tableSummary}</caption>
          <thead>
            <tr className="text-muted-foreground border-b border-white/10">
              <th scope="col" className="py-1 font-normal">
                Jour
              </th>
              <th scope="col" className="py-1 text-right font-normal">
                Pages vues
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day.day} className="border-b border-white/5">
                <th scope="row" className="py-1 font-normal text-white">
                  {day.label}
                </th>
                <td className="py-1 text-right tabular-nums">{day.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
