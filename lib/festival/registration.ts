import { DEPARTMENTS, type DepartmentMeta } from "@/lib/festival/departments"

export type DepartmentRegistration = {
  department: DepartmentMeta["enum"]
  code: DepartmentMeta["code"]
  /** Department form, or null while it is not online yet */
  url: string | null
}

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value)
    return protocol === "https:" || protocol === "http:"
  } catch {
    return false
  }
}

/**
 * One entry per Norman department, in department-code order, so visitors
 * always find theirs. URLs come from the admin; anything that is not a plain
 * http(s) link is dropped rather than rendered as a clickable href.
 */
export const departmentRegistrations = (
  links: { department: string; url: string }[]
): DepartmentRegistration[] =>
  [...DEPARTMENTS]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((dept) => {
      const url = links.find((link) => link.department === dept.enum)?.url.trim() ?? ""
      return { department: dept.enum, code: dept.code, url: isHttpUrl(url) ? url : null }
    })
