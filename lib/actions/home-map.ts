"use server"

import { getAllFilteredEventsForMap } from "@/lib/queries/events"
import { toLocale } from "@/lib/i18n/config"

// Public visitor action (no login): the home map asks for the current edition's
// published places once it nears the viewport, instead of the page embedding them.
export const loadHomeMapEvents = async (locale: unknown) =>
  getAllFilteredEventsForMap({ edition: "current" }, toLocale(locale))
