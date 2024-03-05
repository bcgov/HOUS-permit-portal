import { Button, ButtonGroup, Flex } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { RemoveScroll } from "react-remove-scroll"
import { useNavigate } from "react-router-dom"
import { useJurisdictionTemplateVersionCustomization } from "../../../../../hooks/resources/use-jurisdiction-template-version-customization"
import { useTemplateVersion } from "../../../../../hooks/resources/use-template-version"
import { IJurisdiction } from "../../../../../models/jurisdiction"
import { IJurisdictionTemplateVersionCustomization } from "../../../../../models/jurisdiction-template-version-customization"
import { useMst } from "../../../../../setup/root"
import { IRequirementBlockCustomization, ITemplateCustomization } from "../../../../../types/types"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { BuilderFloatingButtons } from "../../builder-floating-buttons"
import { SectionsDisplay } from "../../sections-display"
import { SectionsSidebar } from "../../sections-sidebar"
import { useSectionHighlight } from "../../use-section-highlight"
import { BuilderHeader } from "../edit-requirement-template-screen/builder-header"
import { JurisdictionRequirementBlockEditSidebar } from "./jurisdiction-requirement-block-edit-sidebar"

const scrollToIdPrefix = "jurisdiction-edit-template-version-scroll-to-id-"
export const formScrollToId = (id: string) => `${scrollToIdPrefix}${id}`

export interface IJurisdictionTemplateVersionCustomizationForm {
  jurisdictionId?: string
  customizations: ITemplateCustomization
}

function formFormDefaults(
  jurisdictionTemplateVersionCustomization: IJurisdictionTemplateVersionCustomization | undefined,
  jurisdiction: IJurisdiction
): IJurisdictionTemplateVersionCustomizationForm {
  if (!jurisdictionTemplateVersionCustomization) {
    return {
      jurisdictionId: jurisdiction?.id,
      customizations: {
        requirementBlockChanges: {},
      },
    }
  }

  return {
    jurisdictionId: jurisdiction?.jurisdictionId,
    customizations: { requirementBlockChanges: {}, ...jurisdictionTemplateVersionCustomization.customizations },
  }
}

export const JurisdictionEditDigitalPermitScreen = observer(function JurisdictionEditDigitalPermitScreen() {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore
  const { templateVersion, error: templateVersionError } = useTemplateVersion({
    customErrorMessage: t("errors.fetchBuildingPermit"),
  })
  const denormalizedTemplate = templateVersion?.denormalizedTemplateJson
  const {
    rootContainerRef: rightContainerRef,
    sectionRefs,
    sectionIdToHighlight: currentSectionId,
  } = useSectionHighlight({ sections: denormalizedTemplate?.requirementTemplateSections })
  const [shouldCollapseAll, setShouldCollapseAll] = useState(false)
  const navigate = useNavigate()
  const { jurisdictionTemplateVersionCustomization, error: customizationError } =
    useJurisdictionTemplateVersionCustomization({
      templateVersion,
      jurisdictionId: currentUser?.jurisdiction?.id,
      customErrorMessage: t("errors.fetchBuildingPermitJurisdictionChanges"),
    })

  const formMethods = useForm<IJurisdictionTemplateVersionCustomizationForm>({
    defaultValues: formFormDefaults(jurisdictionTemplateVersionCustomization, currentUser?.jurisdiction),
  })
  const { formState, handleSubmit, setValue, reset, watch } = formMethods

  const { isSubmitting, isValid } = formState

  const watchedCustomizations = watch("customizations")

  const getRequirementBlockCustomization = (requirementBlockId: string): IRequirementBlockCustomization | undefined => {
    return watchedCustomizations?.requirementBlockChanges[requirementBlockId]
  }

  useEffect(() => {
    reset(formFormDefaults(jurisdictionTemplateVersionCustomization, currentUser?.jurisdiction))
  }, [jurisdictionTemplateVersionCustomization?.customizations])

  if (!currentUser?.jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  if (templateVersionError || customizationError)
    return <ErrorScreen error={templateVersionError || customizationError} />
  if (!templateVersion?.isFullyLoaded) return <LoadingScreen />

  const templateSections = denormalizedTemplate?.requirementTemplateSections ?? []
  const hasNoSections = templateSections.length === 0

  const onClose = () => {
    window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate(`/requirement-templates`)
  }

  const onBlockEditSave = (requirementBlockId: string, data: IRequirementBlockCustomization) => {
    setValue(`customizations.requirementBlockChanges.${requirementBlockId}`, data)
  }

  const onSubmit = handleSubmit((data) => {
    const submitMethod = jurisdictionTemplateVersionCustomization
      ? templateVersion.updateJurisdictionTemplateVersionCustomization
      : templateVersion.createJurisdictionTemplateVersionCustomization

    return submitMethod(currentUser.jurisdiction.id, data)
  })

  return (
    // the height 1px is needed other wise scroll does not work
    // as it seems like the browser has issues calculating height for flex=1 containers
    <RemoveScroll style={{ width: "100%", height: "100%" }}>
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
              <ButtonGroup>
                <Button
                  variant={"primary"}
                  rightIcon={<CaretRight />}
                  onClick={onSubmit}
                  isDisabled={isSubmitting || !isValid}
                  isLoading={isSubmitting}
                >
                  {t("ui.publish")}
                </Button>
                <Button variant={"secondary"} onClick={onClose} isDisabled={isSubmitting}>
                  {t("ui.close")}
                </Button>
              </ButtonGroup>
            </Flex>
            <SectionsDisplay
              sections={templateSections}
              shouldCollapseAll={shouldCollapseAll}
              setSectionRef={setSectionRef}
              formScrollToId={formScrollToId}
              renderEdit={({ denormalizedRequirementBlock }) => {
                return (
                  <JurisdictionRequirementBlockEditSidebar
                    requirementBlockCustomization={getRequirementBlockCustomization(denormalizedRequirementBlock.id)}
                    requirementBlock={denormalizedRequirementBlock}
                    onSave={onBlockEditSave}
                    triggerButtonProps={{
                      isDisabled: isSubmitting,
                    }}
                  />
                )
              }}
            />
          </Flex>
        </Flex>
        <BuilderFloatingButtons onScrollToTop={scrollToTop} onCollapseAll={onCollapseAll} />
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
})
