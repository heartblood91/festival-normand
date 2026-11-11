import { afterEach, describe, expect, it, vi } from "vitest"
import {
  archivedEditionYear,
  defaultProgrammeEdition,
  parseProgrammeEdition,
  programmeEditionWhere,
} from "./programme-edition"

describe("programme edition", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("parses only known editions", () => {
    expect(parseProgrammeEdition("past")).toBe("past")
    expect(parseProgrammeEdition("2026")).toBeUndefined()
    expect(parseProgrammeEdition(undefined)).toBeUndefined()
  })

  it("defaults to the current edition unless configured to show all", () => {
    vi.stubEnv("PROGRAMME_DEFAULT_EDITION", "")
    expect(defaultProgrammeEdition()).toBe("current")
    vi.stubEnv("PROGRAMME_DEFAULT_EDITION", "past")
    expect(defaultProgrammeEdition()).toBe("current")
    vi.stubEnv("PROGRAMME_DEFAULT_EDITION", "all")
    expect(defaultProgrammeEdition()).toBe("all")
  })

  it("splits events on 1 January of the edition year", () => {
    const start = new Date("2027-01-01T00:00:00")
    expect(programmeEditionWhere("current", 2027)).toEqual({ dateStart: { gte: start } })
    expect(programmeEditionWhere("past", 2027)).toEqual({ dateStart: { lt: start } })
    expect(programmeEditionWhere("all", 2027)).toBeNull()
  })

  it("names the edition of an archived event only", () => {
    expect(archivedEditionYear("2026-05-15T18:00:00.000Z", 2027)).toBe(2026)
    expect(archivedEditionYear("2027-05-21T18:00:00.000Z", 2027)).toBeNull()
  })
})
