import { Box, Button, Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useTemplateVersion } from "../../../../hooks/resources/use-template-version"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { FloatingHelpDrawer } from "../../../shared/floating-help-drawer"
import { BuilderBottomFloatingButtons } from "../builder-bottom-floating-buttons"
import { SectionsDisplay } from "../sections-display"
import { SectionsSidebar } from "../sections-sidebar"
import { useSectionHighlight } from "../use-section-highlight"
import { BuilderHeader } from "./base-edit-requirement-template-screen/builder-header"

const scrollToIdPrefix = "template-version-scroll-to-id-"
export const formScrollToId = (id: string) => `${scrollToIdPrefix}${id}`

export const TemplateVersionScreen = observer(function TemplateVersionScreen() {
  const { templateVersion, error } = useTemplateVersion()
  const denormalizedTemplate = templateVersion?.denormalizedTemplateJson
  const { t } = useTranslation()
  const {
    rootContainerRef: rightContainerRef,
    sectionRefs,
    sectionIdToHighlight: currentSectionId,
  } = useSectionHighlight({ sections: denormalizedTemplate?.requirementTemplateSections })
  const [isCollapsedAll, setIsCollapsedAll] = useState(false)
  const navigate = useNavigate()

  if (error) return <ErrorScreen error={error} />
  if (!templateVersion?.isFullyLoaded) return <LoadingScreen />

  const templateSections = denormalizedTemplate?.requirementTemplateSections ?? []
  const hasNoSections = templateSections.length === 0

  const onClose = () => {
    window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate(`/requirement-templates`)
  }

  return (
    <Box as="main" id="view-template-version">
      <BuilderHeader
        breadCrumbs={[
          {
            href: "/template-versions",
            title: t("site.breadcrumb.templateVersions"),
          },
        ]}
        requirementTemplate={denormalizedTemplate}
        status={templateVersion.status}
        versionDate={templateVersion.versionDate}
        latestVersionId={templateVersion.latestVersionId}
      />
      <Box borderTop={"1px solid"} borderColor={"border.base"}>
        <SectionsSidebar
          sections={templateSections}
          onItemClick={scrollIntoView}
          sectionIdToHighlight={currentSectionId}
        />
        <Box
          bg={hasNoSections ? "greys.grey03" : undefined}
          ref={rightContainerRef}
          position={"relative"}
          display="flex"
          flexDirection="column"
        >
          <Flex
            position="sticky"
            zIndex="1"
            left="0"
            right="0"
            top="0"
            px="6"
            py="4"
            bg="greys.grey03"
            w="100%"
            justifyContent={"flex-end"}
            boxShadow={"elevations.elevation02"}
          >
            <Button variant={"secondary"} onClick={onClose}>
              {t("ui.close")}
            </Button>
          </Flex>
          <FloatingHelpDrawer top="24" />

          <SectionsDisplay
            sections={templateSections}
            isCollapsedAll={isCollapsedAll}
            setSectionRef={setSectionRef}
            formScrollToId={formScrollToId}
          />
        </Box>
      </Box>
      <BuilderBottomFloatingButtons isCollapsedAll={isCollapsedAll} setIsCollapsedAll={setIsCollapsedAll} />
    </Box>
  )

  function scrollToTop() {
    rightContainerRef.current?.scrollTo({ behavior: "smooth", top: 0 })
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
})
