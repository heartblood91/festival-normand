import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import { heroVideoSrc } from "./hero-video"

const emptyRoot = () => mkdtempSync(join(tmpdir(), "pel-hero-"))

describe("heroVideoSrc", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns null when no video is configured or deployed", () => {
    vi.stubEnv("HERO_VIDEO_URL", "")
    expect(heroVideoSrc(emptyRoot())).toBeNull()
  })

  it("uses the deployed local file", () => {
    vi.stubEnv("HERO_VIDEO_URL", "")
    const root = emptyRoot()
    mkdirSync(join(root, "public", "videos"), { recursive: true })
    writeFileSync(join(root, "public", "videos", "hero.mp4"), "")
    expect(heroVideoSrc(root)).toBe("/videos/hero.mp4")
  })

  it("prefers the configured URL", () => {
    vi.stubEnv("HERO_VIDEO_URL", " https://cdn.example.org/hero.mp4 ")
    expect(heroVideoSrc(emptyRoot())).toBe("https://cdn.example.org/hero.mp4")
  })
})
