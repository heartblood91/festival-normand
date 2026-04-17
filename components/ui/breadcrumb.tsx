import Link from "next/link"

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
  ariaLabel: string
}

const Breadcrumb = ({ items, ariaLabel }: BreadcrumbProps) => (
  <nav aria-label={ariaLabel} className="mb-6">
    <ol className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
      {items.map((item, index) => (
        <li key={index} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden="true" className="text-muted-foreground/50">
              /
            </span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground focus-visible:ring-primary/50 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-foreground">
              {item.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  </nav>
)

export { Breadcrumb }
export type { BreadcrumbItem }
