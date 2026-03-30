"use client"

import { CheckCircle2, AlertCircle } from "lucide-react"

type ConfirmationStepProps = {
  contentType: string
  title: string
  locale: string
  seoIssues: number
  a11yIssues: number
  spellingCorrections: number
  translationApplied: boolean
}

export const ConfirmationStep = ({
  contentType,
  title,
  locale,
  seoIssues,
  a11yIssues,
  spellingCorrections,
  translationApplied,
}: ConfirmationStepProps) => {
  const allClear = seoIssues === 0 && a11yIssues === 0 && spellingCorrections === 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-white mb-2">Ready to Publish</h3>
        <p className="text-sm text-slate-400">
          Review the summary below and confirm to publish.
        </p>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="flex justify-between items-start">
          <span className="text-sm text-slate-400">Content Type</span>
          <span className="text-sm font-medium text-white capitalize">{contentType}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-sm text-slate-400">Title</span>
          <span className="text-sm font-medium text-white text-right max-w-xs">
            {title}
          </span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-sm text-slate-400">Locale</span>
          <span className="text-sm font-medium text-white uppercase">{locale}</span>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-white">Analysis Summary</h4>
        <div className="grid gap-2">
          <div
            className={`rounded-lg border p-3 flex items-start gap-3 ${
              seoIssues === 0
                ? "border-green-500/20 bg-green-500/10"
                : "border-amber-500/20 bg-amber-500/10"
            }`}
          >
            <CheckCircle2
              className={`h-5 w-5 mt-0.5 shrink-0 ${
                seoIssues === 0 ? "text-green-400" : "text-amber-400"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-white">SEO</p>
              <p className="text-xs text-slate-300">
                {seoIssues === 0 ? "All checks passed" : `${seoIssues} issues found`}
              </p>
            </div>
          </div>

          <div
            className={`rounded-lg border p-3 flex items-start gap-3 ${
              a11yIssues === 0
                ? "border-green-500/20 bg-green-500/10"
                : "border-amber-500/20 bg-amber-500/10"
            }`}
          >
            <CheckCircle2
              className={`h-5 w-5 mt-0.5 shrink-0 ${
                a11yIssues === 0 ? "text-green-400" : "text-amber-400"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-white">Accessibility</p>
              <p className="text-xs text-slate-300">
                {a11yIssues === 0 ? "WCAG 2.1 compliant" : `${a11yIssues} issues found`}
              </p>
            </div>
          </div>

          <div
            className={`rounded-lg border p-3 flex items-start gap-3 ${
              spellingCorrections === 0
                ? "border-green-500/20 bg-green-500/10"
                : "border-amber-500/20 bg-amber-500/10"
            }`}
          >
            <CheckCircle2
              className={`h-5 w-5 mt-0.5 shrink-0 ${
                spellingCorrections === 0 ? "text-green-400" : "text-amber-400"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-white">Spelling & Grammar</p>
              <p className="text-xs text-slate-300">
                {spellingCorrections === 0
                  ? "No errors found"
                  : `${spellingCorrections} corrections applied`}
              </p>
            </div>
          </div>

          {translationApplied && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-white">Translation</p>
                <p className="text-xs text-slate-300">Content translated and reviewed</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {allClear && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-400">All checks passed!</p>
            <p className="text-xs text-green-300 mt-1">
              Your content is ready for publication.
            </p>
          </div>
        </div>
      )}

      {!allClear && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-400">Some issues remain</p>
            <p className="text-xs text-amber-300 mt-1">
              You can still publish, but it&apos;s recommended to address the issues first.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
