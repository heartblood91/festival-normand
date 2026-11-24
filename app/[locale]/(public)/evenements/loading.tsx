import { ListingSkeleton } from "@/components/editorial/listing-skeleton"

const EventsLoading = () => (
  <ListingSkeleton cards={6} centered columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
)

export default EventsLoading
