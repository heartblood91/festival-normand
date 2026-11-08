import { Department } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export type DepartmentSettingItem = { department: Department; publishFrom: string | null }

// Always returns the five departments, even before any row was saved.
export const getDepartmentSettings = async (): Promise<DepartmentSettingItem[]> => {
  const rows = await prisma.departmentSetting.findMany()
  const byDepartment = new Map(rows.map((row) => [row.department, row.publishFrom]))
  return Object.values(Department).map((department) => ({
    department,
    publishFrom: byDepartment.get(department)?.toISOString() ?? null,
  }))
}
