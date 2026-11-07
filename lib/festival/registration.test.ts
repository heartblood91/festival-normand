import { describe, it, expect } from "vitest"
import { departmentRegistrations } from "./registration"

describe("departmentRegistrations", () => {
  it("lists the five departments in code order, even without links", () => {
    expect(departmentRegistrations([]).map((d) => [d.code, d.url])).toEqual([
      ["14", null],
      ["27", null],
      ["50", null],
      ["61", null],
      ["76", null],
    ])
  })

  it("attaches each department's form URL", () => {
    const result = departmentRegistrations([
      { department: "ORNE", url: " https://orne.example/form " },
      { department: "CALVADOS", url: "https://calvados.example/form" },
    ])
    expect(result.find((d) => d.department === "ORNE")?.url).toBe("https://orne.example/form")
    expect(result.find((d) => d.department === "CALVADOS")?.url).toBe(
      "https://calvados.example/form"
    )
    expect(result.find((d) => d.department === "EURE")?.url).toBeNull()
  })

  it("only keeps http(s) URLs", () => {
    const result = departmentRegistrations([
      { department: "EURE", url: "javascript:alert(1)" },
      { department: "MANCHE", url: "inscription.manche.fr" },
      { department: "ORNE", url: "" },
    ])
    expect(result.every((d) => d.url === null)).toBe(true)
  })
})
