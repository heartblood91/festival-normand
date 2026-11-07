import { vi } from "vitest"

const mockMethods = () => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  count: vi.fn(),
  upsert: vi.fn(),
})

export const prismaMock = {
  event: mockMethods(),
  news: mockMethods(),
  partner: mockMethods(),
  page: mockMethods(),
  adminUser: mockMethods(),
  user: mockMethods(),
  session: mockMethods(),
  account: mockMethods(),
  verification: mockMethods(),
  // No embargo by default: public queries see `{ published: true }`.
  departmentSetting: { ...mockMethods(), findMany: vi.fn().mockResolvedValue([]) },
  // No saved edition by default: the code default (2027) applies.
  edition: { ...mockMethods(), findFirst: vi.fn().mockResolvedValue(null) },
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  $transaction: vi.fn(),
  $queryRawUnsafe: vi.fn().mockResolvedValue([]),
}
