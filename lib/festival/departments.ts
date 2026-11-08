import type { Locale } from "@/lib/i18n/config"

export type DepartmentCode = "14" | "27" | "50" | "61" | "76"

export type DepartmentMeta = {
  /** Prisma enum value */
  enum: "CALVADOS" | "EURE" | "MANCHE" | "ORNE" | "SEINE_MARITIME"
  code: DepartmentCode
  nameFr: string
  nameEn: string
  /** Hand-calibrated centre within the 1000×600 Normandy viewBox */
  center: { x: number; y: number }
}

export const DEPARTMENTS: DepartmentMeta[] = [
  { enum: "MANCHE", code: "50", nameFr: "Manche", nameEn: "Manche", center: { x: 215, y: 290 } },
  {
    enum: "CALVADOS",
    code: "14",
    nameFr: "Calvados",
    nameEn: "Calvados",
    center: { x: 460, y: 230 },
  },
  {
    enum: "SEINE_MARITIME",
    code: "76",
    nameFr: "Seine-Maritime",
    nameEn: "Seine-Maritime",
    center: { x: 720, y: 175 },
  },
  { enum: "ORNE", code: "61", nameFr: "Orne", nameEn: "Orne", center: { x: 510, y: 410 } },
  { enum: "EURE", code: "27", nameFr: "Eure", nameEn: "Eure", center: { x: 720, y: 380 } },
]

export const departmentName = (dept: DepartmentMeta, locale: Locale): string =>
  locale === "en" ? dept.nameEn : dept.nameFr

export const departmentByEnum = (value: string): DepartmentMeta | undefined =>
  DEPARTMENTS.find((d) => d.enum === value)
