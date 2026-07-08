"use client";

import { motion } from "framer-motion";
import { HOW_TO_SHORTEN, SNIPSHORT_CAPABILITIES, SNIPSHORT_DEFINITION } from "@/lib/aeo";
import { ALL_FAQ_ITEMS, KEY_FACTS, USE_CASES } from "@/lib/geo";
import { BlurFade } from "@/components/magicui/blur-fade";

const cardHover = {
  whileHover: { y: -3 },
  transition: { type: "spring" as const, stiffness: 320, damping: 28 },
};

export function AboutBlock() {
  return (
    <section
      id="about-snipshort"
      aria-labelledby="about-snipshort-heading"
      className="relative z-10 py-28 px-4 border-t border-white/[0.05]"
    >
      <div className="max-w-3xl mx-auto">
        <BlurFade inView>
          <p className="text-xs font-medium tracking-[0.35em] text-white/25 uppercase mb-5 text-center">
            About
          </p>
          <h2
            id="about-snipshort-heading"
            className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-6"
          >
            What is SnipShort?
          </h2>
          <p className="text-white/45 text-sm md:text-base leading-relaxed text-center mb-10">
            {SNIPSHORT_DEFINITION}
          </p>
        </BlurFade>

        <BlurFade inView delay={0.1}>
          <h3 className="text-sm font-semibold tracking-wide text-white/60 mb-4 text-center">
            What SnipShort can do
          </h3>
        </BlurFade>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {SNIPSHORT_CAPABILITIES.map((item, i) => (
            <BlurFade key={item} inView delay={0.06 * i}>
              <li className="flex items-start gap-2.5 text-sm text-white/40 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" aria-hidden />
                {item}
              </li>
            </BlurFade>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function UseCasesBlock() {
  return (
    <section
      id="use-cases"
      aria-labelledby="use-cases-heading"
      className="relative z-10 py-28 px-4 border-t border-white/[0.05]"
    >
      <div className="max-w-4xl mx-auto">
        <BlurFade inView>
          <p className="text-xs font-medium tracking-[0.35em] text-white/25 uppercase mb-5 text-center">
            Use cases
          </p>
          <h2 id="use-cases-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
            Who uses SnipShort?
          </h2>
          <p className="text-sm text-white/35 text-center mb-12 max-w-xl mx-auto leading-relaxed">
            SnipShort fits anyone who shares links and wants them shorter, measurable, or access-controlled.
          </p>
        </BlurFade>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {USE_CASES.map((item, i) => (
            <BlurFade key={item.title} inView delay={0.1 * i}>
              <motion.article
                {...cardHover}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 h-full"
              >
                <p className="text-[10px] font-medium tracking-[0.2em] text-brand/70 uppercase mb-2">
                  {item.audience}
                </p>
                <h3 className="text-base font-semibold text-white/85 mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.description}</p>
              </motion.article>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

export function KeyFactsBlock() {
  return (
    <section
      id="key-facts"
      aria-labelledby="key-facts-heading"
      className="relative z-10 py-28 px-4 border-t border-white/[0.05]"
    >
      <div className="max-w-3xl mx-auto">
        <BlurFade inView>
          <p className="text-xs font-medium tracking-[0.35em] text-white/25 uppercase mb-5 text-center">
            Key facts
          </p>
          <h2 id="key-facts-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-4">
            SnipShort at a glance
          </h2>
          <p className="text-sm text-white/35 text-center mb-10 leading-relaxed">
            Factual statements about SnipShort — written for clarity and accurate citation.
          </p>
        </BlurFade>

        <dl className="flex flex-col gap-4">
          {KEY_FACTS.map((fact, i) => (
            <BlurFade key={fact.label} inView delay={0.07 * i}>
              <motion.div
                {...cardHover}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4"
              >
                <dt className="text-xs font-semibold tracking-wide text-brand/80 uppercase mb-1.5">
                  {fact.label}
                </dt>
                <dd className="text-sm text-white/45 leading-relaxed">
                  <cite className="not-italic">{fact.statement}</cite>
                </dd>
              </motion.div>
            </BlurFade>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative z-10 py-28 px-4 border-t border-white/[0.05]"
    >
      <div className="max-w-3xl mx-auto">
        <BlurFade inView>
          <p className="text-xs font-medium tracking-[0.35em] text-white/25 uppercase mb-5 text-center">
            FAQ
          </p>
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">
            Frequently asked questions
          </h2>
        </BlurFade>

        <div className="flex flex-col gap-6">
          {ALL_FAQ_ITEMS.map((item, i) => (
            <BlurFade key={item.question} inView delay={0.04 * Math.min(i, 8)}>
              <motion.article
                {...cardHover}
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
              >
                <h3
                  itemProp="name"
                  className="text-base font-semibold text-white/85 mb-2.5"
                >
                  {item.question}
                </h3>
                <div
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <p itemProp="text" className="text-sm text-white/40 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </motion.article>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowToBlock() {
  return (
    <section
      id="how-to-shorten"
      aria-labelledby="how-to-heading"
      className="sr-only"
      aria-label="How to shorten a URL with SnipShort"
    >
      <h2 id="how-to-heading">How to shorten a URL with SnipShort</h2>
      <ol>
        {HOW_TO_SHORTEN.map((step, i) => (
          <li key={step.name}>
            <strong>
              Step {i + 1}: {step.name}
            </strong>{" "}
            — {step.text}
          </li>
        ))}
      </ol>
    </section>
  );
}
