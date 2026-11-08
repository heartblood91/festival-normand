"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import {
  clearDraft,
  hasChanges,
  leavesForm,
  readDraft,
  writeDraft,
  type FormDraft,
} from "@/lib/admin/form-draft"

export const LEAVE_MESSAGE =
  "Des modifications ne sont pas enregistrées. Quitter la page quand même ?"
const AUTOSAVE_DELAY_MS = 1000

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

/** Text values of the form's own inputs; files are left out. */
const readForm = (form: HTMLFormElement | null): Record<string, string> =>
  form
    ? Object.fromEntries(
        [...new FormData(form)].filter(
          (entry): entry is [string, string] => typeof entry[1] === "string"
        )
      )
    : {}

const isFormField = (element: unknown): element is FormField =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLSelectElement ||
  element instanceof HTMLTextAreaElement

/**
 * Keeps an admin form's unsaved work: autosaves it to localStorage, offers to
 * restore it on the next visit and asks before leaving the page while dirty.
 */
export const useFormDraft = ({
  storageKey,
  formRef,
  values,
  onRestore,
}: {
  storageKey: string
  formRef: RefObject<HTMLFormElement | null>
  /** Controlled fields; they take precedence over the form's own inputs. */
  values: Record<string, string>
  /** Puts restored values back into the form's state. */
  onRestore: (values: Record<string, string>) => void
}) => {
  const [dirty, setDirty] = useState(false)
  const [draft, setDraft] = useState<FormDraft | null>(null)
  const valuesRef = useRef(values)
  const initial = useRef<Record<string, string> | null>(null)
  const pendingDraft = useRef(false)
  const saved = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const snapshot = useCallback(
    () => ({ ...readForm(formRef.current), ...valuesRef.current }),
    [formRef]
  )

  const check = useCallback(() => {
    if (saved.current || !initial.current) return
    const current = snapshot()
    const isDirty = hasChanges(initial.current, current)
    setDirty(isDirty)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (saved.current) return
      if (isDirty) writeDraft(localStorage, storageKey, current, Date.now())
      else if (!pendingDraft.current) clearDraft(localStorage, storageKey)
    }, AUTOSAVE_DELAY_MS)
  }, [snapshot, storageKey])

  useEffect(() => {
    initial.current = snapshot()
    const stored = readDraft(localStorage, storageKey, Date.now())
    if (stored && hasChanges(initial.current, stored.values)) {
      pendingDraft.current = true
      setDraft(stored)
    }

    const form = formRef.current
    form?.addEventListener("input", check)
    form?.addEventListener("change", check)
    return () => {
      form?.removeEventListener("input", check)
      form?.removeEventListener("change", check)
      clearTimeout(timer.current)
    }
    // The initial snapshot is taken once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const valuesKey = JSON.stringify(values)
  useEffect(() => {
    valuesRef.current = values
    check()
    // valuesKey stands for values, which is a new object on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesKey, check])

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (saved.current) return
      event.preventDefault()
      event.returnValue = ""
    }
    // Capture phase, so the confirm runs before Next.js links navigate.
    const onClick = (event: MouseEvent) => {
      if (saved.current || event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null
      if (!(link instanceof HTMLAnchorElement)) return
      const target = {
        href: link.href,
        target: link.target,
        download: link.hasAttribute("download"),
      }
      if (!leavesForm(target, window.location.href)) return
      if (window.confirm(LEAVE_MESSAGE)) {
        clearDraft(localStorage, storageKey)
        return
      }
      event.preventDefault()
      event.stopPropagation()
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    document.addEventListener("click", onClick, true)
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload)
      document.removeEventListener("click", onClick, true)
    }
  }, [dirty, storageKey])

  const restoreDraft = useCallback(() => {
    if (!draft) return
    const form = formRef.current
    Object.entries(draft.values).forEach(([name, value]) => {
      if (name in valuesRef.current) return
      const field = form?.elements.namedItem(name)
      if (isFormField(field) && field.type !== "file" && field.type !== "hidden") {
        field.value = value
      }
    })
    onRestore(draft.values)
    pendingDraft.current = false
    setDraft(null)
    // Uncontrolled fields changed without an input event.
    requestAnimationFrame(check)
  }, [draft, formRef, onRestore, check])

  const discardDraft = useCallback(() => {
    pendingDraft.current = false
    clearDraft(localStorage, storageKey)
    setDraft(null)
  }, [storageKey])

  /** Call once the server accepted the save, before navigating away. */
  const markSaved = useCallback(() => {
    saved.current = true
    clearTimeout(timer.current)
    clearDraft(localStorage, storageKey)
    setDirty(false)
  }, [storageKey])

  return { dirty, draft, restoreDraft, discardDraft, markSaved }
}
