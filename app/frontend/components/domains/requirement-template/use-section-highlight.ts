import { useCallback, useEffect, useRef, useState } from "react"
import { IDenormalizedRequirementTemplateSection } from "../../../types/types"
import { IRequirementTemplateForm } from "./screens/base-edit-requirement-template-screen"

export interface IUseSectionHighlightOptions {
  sections:
    | IDenormalizedRequirementTemplateSection[]
    | IRequirementTemplateForm["requirementTemplateSectionsAttributes"]
}

export function useSectionHighlight({ sections }: IUseSectionHighlightOptions) {
  const [sectionIdToHighlight, setSectionIdToHighlight] = useState<string | null>(null)
  const rootContainerRef = useRef<HTMLDivElement>()
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  // Keep this free of setState — Chakra/react re-invoke refs on every render;
  // bumping state here causes a max-update-depth loop.
  const setSectionRef = useCallback((el: HTMLElement | null, id: string) => {
    if (el) sectionRefs.current[id] = el
    else delete sectionRefs.current[id]
  }, [])

  useEffect(() => {
    if (!sections?.length) return

    let cancelled = false
    let observer: IntersectionObserver | null = null
    let rafId = 0

    // Mid-viewport band — same approach as requirement-form.tsx scroll-spy
    const viewportHeight = window.innerHeight
    const margin = -viewportHeight / 2 + 5

    const bind = () => {
      if (cancelled) return

      const nodes = sections
        .map((section) => sectionRefs.current[section.id])
        .filter((node): node is HTMLElement => !!node)

      // Sections data can arrive before the loading screen unmounts and DOM refs attach
      if (nodes.length === 0) {
        rafId = requestAnimationFrame(bind)
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          const intersectingIds = new Set(
            entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target.getAttribute("data-section-id"))
          )
          if (intersectingIds.size === 0) return

          const firstInView = sections.find((section) => intersectingIds.has(section.id))
          if (firstInView) setSectionIdToHighlight(firstInView.id)
        },
        {
          rootMargin: `${margin}px 0px ${margin}px 0px`,
          threshold: 0.0001,
        }
      )

      nodes.forEach((node) => observer!.observe(node))
    }

    bind()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      observer?.disconnect()
    }
  }, [sections])

  // Seed highlight to first section while waiting for intersection (e.g. at page top)
  useEffect(() => {
    if (!sectionIdToHighlight && sections?.[0]?.id) {
      setSectionIdToHighlight(sections[0].id)
    }
  }, [sections])

  return { rootContainerRef, setSectionRef, sectionIdToHighlight }
}
