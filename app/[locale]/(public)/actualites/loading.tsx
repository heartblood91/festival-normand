import { ListingSkeleton } from "@/components/editorial/listing-skeleton"

const NewsLoading = () => (
  <ListingSkeleton cards={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
)

export default NewsLoading
