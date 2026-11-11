import { getTranslations } from "next-intl/server"

const STEPS = ["choose", "fill", "publish"] as const

const RegistrationSteps = async () => {
  const t = await getTranslations("registration")

  return (
    <section aria-labelledby="registration-steps-heading" className="mb-12">
      <h2
        id="registration-steps-heading"
        className="text-foreground font-display text-3xl font-normal tracking-tight italic md:text-4xl"
      >
        {t("stepsTitle")}
      </h2>
      <ol className="mt-8 grid gap-6 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step} className="border-primary/40 border-t pt-4">
            <span className="text-primary font-mono text-xs tracking-[0.2em]" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-foreground font-display mt-2 text-xl leading-snug font-normal italic">
              {step === "choose" ? (
                <a
                  href="#registration-links-heading"
                  className="hover:text-primary focus-visible:ring-primary/50 inline-block rounded-sm underline decoration-1 underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {t(`steps.${step}.title`)}
                </a>
              ) : (
                t(`steps.${step}.title`)
              )}
            </h3>
            <p className="text-ed-bone mt-2 font-serif text-base font-light">
              {t(`steps.${step}.text`)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export { RegistrationSteps }
