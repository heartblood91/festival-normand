import { notFound } from "next/navigation"

// Unknown localized URLs end in the public not-found page, inside the site layout.
const UnknownPage = () => notFound()

export default UnknownPage
