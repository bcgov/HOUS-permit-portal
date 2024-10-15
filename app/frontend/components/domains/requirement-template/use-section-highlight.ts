import { useEffect, useRef, useState } from "react"
import { IDenormalizedRequirementTemplateSection } from "../../../types/types"
import { IRequirementTemplateForm } from "./screens/base-edit-requirement-template-screen"

export interface IUseSectionHighlightOptions {
  sections:
    | IDenormalizedRequirementTemplateSection[]
    | IRequirementTemplateForm["requirementTemplateSectionsAttributes"]
}

export function useSectionHighlight({ sections }: IUseSectionHighlightOptions) {
  const [sectionsInViewStatuses, setSectionsInViewStatuses] = useState<Record<string, boolean>>({})
  const rootContainerRef = useRef<HTMLDivElement>()

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const handleSectionIntersection = (entries: IntersectionObserverEntry[]) => {
    setSectionsInViewStatuses((pastState) => {
      const newState = { ...pastState }

      entries.forEach((entry) => {
        const sectionId = entry.target.getAttribute("data-section-id")

        if (entry.isIntersecting) {
          newState[sectionId] = true
        } else {
          newState[sectionId] = false
        }
      })

      return newState
    })
  }

  useEffect(() => {
    const options = {
      root: rootContainerRef?.current,
      rootMargin: "0px",
      threshold: 0.1,
    }

    const observer = new IntersectionObserver(handleSectionIntersection, options)

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) {
        observer.observe(ref)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [sections])

  const sectionIdToHighlight = (() => {
    const firstInViewSection = sections?.find((section) => sectionsInViewStatuses[section.id])

    return firstInViewSection?.id ?? null
  })()

  return { rootContainerRef, sectionRefs, sectionIdToHighlight }
}
