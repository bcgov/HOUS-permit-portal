import { Box, Button, ButtonGroup, Flex, Menu, MenuButton, MenuItem, MenuList, Spacer } from "@chakra-ui/react"
import { CaretDown, CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useJurisdictionTemplateVersionCustomization } from "../../../../../hooks/resources/use-jurisdiction-template-version-customization"
import { useTemplateVersion } from "../../../../../hooks/resources/use-template-version"
import { IJurisdictionTemplateVersionCustomization } from "../../../../../models/jurisdiction-template-version-customization"
import { IRequirement } from "../../../../../models/requirement"
import { useMst } from "../../../../../setup/root"
import { ERequirementChangeAction } from "../../../../../types/enums"
import {
  ICompareRequirementsBoxData,
  ICompareRequirementsBoxDiff,
  IRequirementBlockCustomization,
  ITemplateCustomization,
  ITemplateVersionDiff,
} from "../../../../../types/types"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { FloatingHelpDrawer } from "../../../../shared/floating-help-drawer"
import ConfirmationModal from "../../../../shared/modals/confirmation-modal"
import { BrowserSearchPrompt } from "../../../../shared/permit-applications/browser-search-prompt"
import { CompareRequirementsBox } from "../../../permit-application/compare-requirements-box"
import { BuilderBottomFloatingButtons } from "../../builder-bottom-floating-buttons"
import { SectionsDisplay } from "../../sections-display"
import { SectionsSidebar } from "../../sections-sidebar"
import { useSectionHighlight } from "../../use-section-highlight"
import { BuilderHeader } from "../base-edit-requirement-template-screen/builder-header"
import { JurisdictionRequirementBlockEditSidebar } from "./jurisdiction-requirement-block-edit-sidebar"

const scrollToIdPrefix = "jurisdiction-edit-template-version-scroll-to-id-"
export const formScrollToId = (id: string) => `${scrollToIdPrefix}${id}`

export interface IJurisdictionTemplateVersionCustomizationForm {
  jurisdictionId?: string
  customizations: ITemplateCustomization
}

function formFormDefaults(
  jurisdictionTemplateVersionCustomization: IJurisdictionTemplateVersionCustomization | undefined
): IJurisdictionTemplateVersionCustomizationForm {
  if (!jurisdictionTemplateVersionCustomization) {
    return {
      customizations: {
        requirementBlockChanges: {},
      },
    }
  }

  return {
    customizations: { requirementBlockChanges: {}, ...jurisdictionTemplateVersionCustomization.customizations },
  }
}

export const JurisdictionEditDigitalPermitScreen = observer(function JurisdictionEditDigitalPermitScreen() {
  const { t } = useTranslation()
  const { userStore, sandboxStore } = useMst()
  const { currentSandbox } = sandboxStore
  const { currentUser } = userStore
  const { templateVersion, error: templateVersionError } = useTemplateVersion({
    customErrorMessage: t("errors.fetchBuildingPermit"),
  })
  const denormalizedTemplate = templateVersion?.denormalizedTemplateJson

  const handleCopyTips = () => {
    templateVersion?.copyJurisdictionTemplateVersionTips(currentUser.jurisdiction.id)
  }

  const handleCopyElectives = () => {
    templateVersion?.copyJurisdictionTemplateVersionElectives(currentUser.jurisdiction.id)
  }

  const {
    rootContainerRef: rightContainerRef,
    sectionRefs,
    sectionIdToHighlight: currentSectionId,
  } = useSectionHighlight({ sections: denormalizedTemplate?.requirementTemplateSections })
  const [isCollapsedAll, setIsCollapsedAll] = useState(false)
  const navigate = useNavigate()
  const { jurisdictionTemplateVersionCustomization, error: customizationError } =
    useJurisdictionTemplateVersionCustomization({
      templateVersion,
      jurisdictionId: currentUser?.jurisdiction?.id,
      customErrorMessage: t("errors.fetchBuildingPermitJurisdictionChanges"),
    })

  const formMethods = useForm<IJurisdictionTemplateVersionCustomizationForm>({
    defaultValues: formFormDefaults(jurisdictionTemplateVersionCustomization),
  })
  const { formState, handleSubmit, setValue, reset, watch } = formMethods

  const { isSubmitting, isValid } = formState

  const watchedCustomizations = watch("customizations")

  const getRequirementBlockCustomization = (requirementBlockId: string): IRequirementBlockCustomization | undefined => {
    return watchedCustomizations?.requirementBlockChanges[requirementBlockId]
  }

  useEffect(() => {
    reset(formFormDefaults(jurisdictionTemplateVersionCustomization))
  }, [jurisdictionTemplateVersionCustomization?.customizations])

  const [searchParams] = useSearchParams()
  const isCompare = searchParams.get("compare") === "true"

  const [diff, setDiff] = useState<ITemplateVersionDiff>(null)
  const diffToInfoBoxData = (): ICompareRequirementsBoxDiff | null => {
    if (!diff) return null

    const mapFn = (req: IRequirement, action: ERequirementChangeAction): ICompareRequirementsBoxData => ({
      id: formScrollToId(req.formJson.key.split("|")[1].slice(2)),
      label: t("requirementTemplate.compareAction", {
        requirementName: `${req.label}${req.elective ? ` (${t("requirementsLibrary.elective")})` : ""}`,
        action: t(`requirementTemplate.${action}`),
      }),
      diffSectionLabel: req.diffSectionLabel,
    })
    const addedErrorBoxData = diff.added.map((req) => mapFn(req, ERequirementChangeAction.added))
    const removedErrorBoxData = diff.removed.map((req) => mapFn(req, ERequirementChangeAction.removed))
    const changedErrorBoxData = diff.changed.map((req) => mapFn(req, ERequirementChangeAction.changed))
    return { added: addedErrorBoxData, removed: removedErrorBoxData, changed: changedErrorBoxData }
  }
  const infoBoxData = diffToInfoBoxData()
  useEffect(() => {
    if (isCompare && templateVersion) {
      ;(async () => {
        const diffData = await templateVersion.fetchTemplateVersionCompare()
        setDiff(diffData.data)
      })()
    }
  }, [isCompare, templateVersion])

  if (!currentUser?.jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  if (templateVersionError || customizationError)
    return <ErrorScreen error={templateVersionError || customizationError} />
  if (!templateVersion?.isFullyLoaded) return <LoadingScreen />

  const templateSections = denormalizedTemplate?.requirementTemplateSections ?? []
  const hasNoSections = templateSections.length === 0

  const onClose = () => {
    window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate(`/digital-building-permits`)
  }

  const onBlockEditSave = (requirementBlockId: string, data: IRequirementBlockCustomization) => {
    setValue(`customizations.requirementBlockChanges.${requirementBlockId}`, data)
  }

  const onSubmit = handleSubmit((data) => {
    return templateVersion.createOrUpdateJurisdictionTemplateVersionCustomization(currentUser.jurisdiction.id, data)
  })

  const onPromote = async () => {
    await onSubmit()
    return templateVersion.promoteJurisdictionTemplateVersionCustomization(currentUser.jurisdiction.id)
  }

  return (
    <Box as="main" id="jurisdiction-edit-permit-template">
      <BuilderHeader
        breadCrumbs={[
          {
            href: "/digital-building-permits",
            title: t("site.breadcrumb.digitalBuildingPermits"),
          },
          {
            href: `/digital-building-permits/${templateVersion.id}/edit`,
            title: t("site.breadcrumb.editPermit"),
          },
        ]}
        requirementTemplate={denormalizedTemplate}
        status={templateVersion.status}
        versionDate={templateVersion.versionDate}
        latestVersionId={templateVersion.latestVersionId}
      />
      <Box
        borderTop={"1px solid"}
        borderColor={"border.base"}
        id="sidebar-and-form-container"
        sx={{ "&:after": { content: `""`, display: "block", clear: "both" } }}
      >
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
          id="form-template"
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
            w="full"
            justifyContent="space-between"
            boxShadow="elevations.elevation02"
          >
            {templateVersion.firstNations ? (
              <Menu>
                <MenuButton as={Button} rightIcon={<CaretDown />} variant="ghost">
                  {t("requirementTemplate.edit.options.button")}
                </MenuButton>
                <MenuList>
                  <>
                    <MenuItem onClick={handleCopyTips}>
                      {t("requirementTemplate.edit.options.copyTips", {
                        templateLabel: templateVersion.nonFirstNationLabel,
                      })}
                    </MenuItem>
                    <MenuItem onClick={handleCopyElectives}>
                      {t("requirementTemplate.edit.options.copyElectives", {
                        templateLabel: templateVersion.nonFirstNationLabel,
                      })}
                    </MenuItem>
                  </>
                </MenuList>
              </Menu>
            ) : (
              <Spacer />
            )}
            <ButtonGroup>
              <BrowserSearchPrompt color="text.primary" />
              {currentSandbox && (
                <ConfirmationModal
                  promptHeader={t("requirementTemplate.edit.promoteElectives")}
                  promptMessage={t("requirementTemplate.edit.promoteElectivesMessage")}
                  renderTrigger={(onOpen) => (
                    <Button
                      variant={"secondary"}
                      rightIcon={<CaretRight />}
                      onClick={onOpen}
                      isDisabled={isSubmitting || !isValid}
                      isLoading={isSubmitting}
                    >
                      {t("requirementTemplate.edit.promoteElectives")}
                    </Button>
                  )}
                  onConfirm={onPromote}
                />
              )}
              <ConfirmationModal
                promptHeader={t("ui.save")}
                promptMessage={t("ui.confirmOverwrite")}
                renderTrigger={(onOpen) => (
                  <Button
                    variant={"primary"}
                    rightIcon={<CaretRight />}
                    onClick={onOpen}
                    isDisabled={isSubmitting || !isValid}
                    isLoading={isSubmitting}
                  >
                    {t("ui.save")}
                  </Button>
                )}
                onConfirm={onSubmit}
              />

              <Button variant={"secondary"} onClick={onClose} isDisabled={isSubmitting}>
                {t("ui.close")}
              </Button>
            </ButtonGroup>
          </Flex>

          <FloatingHelpDrawer top="100px" />
          {isCompare &&
            (diff ? (
              <CompareRequirementsBox data={infoBoxData} />
            ) : (
              <SharedSpinner position="fixed" right={24} top="50vh" />
            ))}
          <SectionsDisplay
            sections={templateSections}
            isCollapsedAll={isCollapsedAll}
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
                  onResetDefault={(requirementBlockId) => {
                    return (
                      jurisdictionTemplateVersionCustomization?.customizations?.requirementBlockChanges?.[
                        requirementBlockId
                      ] || {}
                    )
                  }}
                />
              )
            }}
            requirementBlockCustomizations={watchedCustomizations?.requirementBlockChanges}
            hideElectiveField={(requirementBlockId, requirement) => {
              const customization = watchedCustomizations.requirementBlockChanges[requirementBlockId]

              if (!customization || !customization.enabledElectiveFieldIds) {
                return true
              }

              return !customization?.enabledElectiveFieldIds?.includes(requirement.id)
            }}
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
