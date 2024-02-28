import { Button, Flex, Stack } from "@chakra-ui/react"
import { ArrowUp } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { RemoveScroll } from "react-remove-scroll"
import { useNavigate } from "react-router-dom"
import { useTemplateVersion } from "../../../../hooks/resources/use-template-version"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { BuilderHeader } from "../edit-requirement-template-screen/builder-header"
import { SectionsSidebar } from "../sections-sidebar"
import { SectionsDisplay } from "./sections-display"

const scrollToIdPrefix = "template-version-scroll-to-id-"
export const formScrollToId = (id: string) => `${scrollToIdPrefix}${id}`

export const TemplateVersionScreen = observer(function TemplateVersionScreen() {
  const { templateVersion, error } = useTemplateVersion()
  const denormalizedTemplate = templateVersion?.denormalizedTemplateJson
  const { t } = useTranslation()
  const rightContainerRef = useRef<HTMLDivElement>()
  const [shouldCollapseAll, setShouldCollapseAll] = useState(false)
  const [sectionsInViewStatuses, setSectionsInViewStatuses] = useState<Record<string, boolean>>({})
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const navigate = useNavigate()

  useEffect(() => {
    const options = {
      root: rightContainerRef?.current,
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
  }, [denormalizedTemplate?.requirementTemplateSections])

  if (error) return <ErrorScreen error={error} />
  if (!templateVersion?.isFullyLoaded) return <LoadingScreen />

  const templateSections = denormalizedTemplate?.requirementTemplateSections ?? []
  const hasNoSections = templateSections.length === 0

  const currentSectionId = (() => {
    const firstInViewSection = templateSections.find((section) => sectionsInViewStatuses[section.id])

    return firstInViewSection?.id ?? null
  })()

  const onClose = () => {
    window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate(`/requirement-templates`)
  }

  return (
    // the height 1px is needed other wise scroll does not work
    // as it seems like the browser has issues calculating height for flex=1 containers
    <RemoveScroll style={{ width: "100%", flex: "1", height: "1px" }}>
      <Flex flexDir={"column"} w={"full"} maxW={"full"} h="full" as="main">
        <BuilderHeader
          requirementTemplate={denormalizedTemplate}
          status={templateVersion.status}
          versionDate={templateVersion.versionDate}
        />
        <Flex flex={1} w={"full"} h={"1px"} borderTop={"1px solid"} borderColor={"border.base"}>
          <SectionsSidebar
            sections={templateSections}
            onItemClick={scrollIntoView}
            sectionIdToHighlight={currentSectionId}
          />
          <Flex
            flexDir={"column"}
            flex={1}
            h={"full"}
            bg={hasNoSections ? "greys.grey03" : undefined}
            overflow={"auto"}
            ref={rightContainerRef}
          >
            <Flex
              px={6}
              py={4}
              bg={"greys.grey03"}
              w={"full"}
              justifyContent={"flex-end"}
              boxShadow={"elevations.elevation02"}
            >
              <Button variant={"secondary"} onClick={onClose}>
                {t("ui.close")}
              </Button>
            </Flex>
            <SectionsDisplay
              sections={templateSections}
              shouldCollapseAll={shouldCollapseAll}
              setSectionRef={setSectionRef}
            />
          </Flex>
        </Flex>
        <Stack spacing={4} position={"fixed"} bottom={6} right={6} alignItems={"flex-end"}>
          <Button variant={"greyButton"} leftIcon={<ArrowUp />} pl={"0.6125rem"} onClick={scrollToTop}>
            {t("requirementTemplate.edit.goToTop")}
          </Button>
          <Button variant={"greyButton"} onClick={onCollapseAll}>
            {t("requirementTemplate.edit.collapseAll")}
          </Button>
        </Stack>
      </Flex>
    </RemoveScroll>
  )

  function scrollToTop() {
    rightContainerRef.current?.scrollTo({ behavior: "smooth", top: 0 })
  }

  function onCollapseAll() {
    setShouldCollapseAll(true)

    setTimeout(() => {
      setShouldCollapseAll(false)
    }, 500)
  }

  function scrollIntoView(id: string) {
    const element = document.getElementById(formScrollToId(id))

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  function setSectionRef(el: HTMLElement, id: string) {
    sectionRefs.current[id] = el
  }

  // modified use case from https://stackoverflow.com/questions/57992340/how-to-get-first-visible-body-element-on-screen-with-pure-javascript
  function handleSectionIntersection(entries: IntersectionObserverEntry[]) {
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
})
