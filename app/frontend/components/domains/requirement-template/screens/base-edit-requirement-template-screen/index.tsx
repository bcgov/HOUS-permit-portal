import { Box, ButtonProps, Flex, Text, useDisclosure } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { useRequirementTemplate } from "../../../../../hooks/resources/use-requirement-template"
import { IRequirementTemplate } from "../../../../../models/requirement-template"
import { ITemplateSectionBlockModel } from "../../../../../models/template-section-block"
import { useMst } from "../../../../../setup/root"
import {
  IRequirementTemplateSectionAttributes,
  IRequirementTemplateUpdateParams,
  ITemplateSectionBlockAttributes,
} from "../../../../../types/api-request"
import { CalloutBanner } from "../../../../shared/base/callout-banner"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { FloatingHelpDrawer } from "../../../../shared/floating-help-drawer"
import { BuilderBottomFloatingButtons } from "../../builder-bottom-floating-buttons"
import { SectionsSidebar } from "../../sections-sidebar"
import { useSectionHighlight } from "../../use-section-highlight"
import { ControlsHeader } from "./controls-header"
import { EditableBuilderHeader } from "./editable-builder-header"
import { SectionsDisplay } from "./sections-display"
import { SectionsDnd } from "./sections-dnd"

export interface IRequirementTemplateForm extends IRequirementTemplateUpdateParams {}

export interface IEditRequirementOptionsProps {
  requirementTemplate: IRequirementTemplate
}

export interface IEditRequirementActionsProps {
  minDate?: Date
  onScheduleConfirm?: (date: Date) => void
  onForcePublishNow?: () => void
  triggerButtonProps?: Partial<ButtonProps>
  requirementTemplate?: IRequirementTemplate
  onSaveDraft?: () => void
}
const scrollToIdPrefix = "template-builder-scroll-to-id-"
export const formScrollToId = (id: string) => `${scrollToIdPrefix}${id}`

interface IBaseEditRequirementTemplateScreenProps {
  renderOptionsMenu?: React.FC<IEditRequirementOptionsProps>
  renderActions?: React.FC<IEditRequirementActionsProps>
}

export const BaseEditRequirementTemplateScreen = observer(function BaseEditRequirementTemplateScreen({
  renderOptionsMenu,
  renderActions,
}: IBaseEditRequirementTemplateScreenProps) {
  const navigate = useNavigate()
  const { isOpen: isReorderMode, onClose: closeReorderMode, onOpen: openReorderMode } = useDisclosure()
  const { requirementTemplateStore, requirementBlockStore } = useMst()
  const { requirementTemplate, error } = useRequirementTemplate()
  const formMethods = useForm({ defaultValues: formFormDefaults(requirementTemplate) })
  const { control, reset, watch, setValue, handleSubmit } = formMethods
  const { append: appendToSectionsAttributes } = useFieldArray({
    name: `requirementTemplateSectionsAttributes`,
    control,
  })
  const { t } = useTranslation()
  const [isCollapsedAll, setIsCollapsedAll] = useState(false)
  const [sectionsInViewStatuses, setSectionsInViewStatuses] = useState<Record<string, boolean>>({})

  const watchedSectionsAttributes = watch("requirementTemplateSectionsAttributes")
  const {
    rootContainerRef: rightContainerRef,
    sectionRefs,
    sectionIdToHighlight: currentSectionId,
  } = useSectionHighlight({ sections: watchedSectionsAttributes })

  const denormalizedSections = watchedSectionsAttributes.map((section) => ({
    id: section.id,
    name: section.name,
    templateSectionBlocks: section.templateSectionBlocksAttributes.map((sectionBlock) => ({
      id: sectionBlock.id,
      requirementBlock: requirementBlockStore.getRequirementBlockById(sectionBlock.requirementBlockId),
    })),
  }))

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
  }, [watchedSectionsAttributes])

  useEffect(() => {
    if (requirementTemplate?.isFullyLoaded) {
      reset(formFormDefaults(requirementTemplate))
    }
  }, [requirementTemplate?.isFullyLoaded])

  if (error) return <ErrorScreen error={error} />
  if (!requirementTemplate?.isFullyLoaded) return <LoadingScreen />

  const onSaveDraft = handleSubmit(async (templateFormData) => {
    const formattedSubmitData = formatSubmitData(templateFormData)

    const updatedTemplate = await requirementTemplateStore.updateRequirementTemplate(
      requirementTemplate.id,
      formattedSubmitData
    )

    updatedTemplate && formFormDefaults(updatedTemplate as IRequirementTemplate)
  })

  const onSchedule = async (date: Date) => {
    await handleSubmit(async (templateFormData) => {
      const formattedSubmitData = formatSubmitData(templateFormData)

      const updatedRequirementTemplate = await requirementTemplateStore.scheduleRequirementTemplate(
        requirementTemplate.id,
        formattedSubmitData,
        date
      )

      if (updatedRequirementTemplate) {
        // the template versions are ordered by latest first, so this should return the newly scheduled template
        // version
        const scheduledTemplateVersion = (updatedRequirementTemplate as IRequirementTemplate)
          .scheduledTemplateVersions?.[0]

        scheduledTemplateVersion
          ? navigate(`/template-versions/${scheduledTemplateVersion.id}`)
          : navigate("/requirement-templates")
      }
    })()
  }

  const onForcePublishNow =
    import.meta.env.VITE_ENABLE_TEMPLATE_FORCE_PUBLISH === "true"
      ? async () => {
          await handleSubmit(async (templateFormData) => {
            const formattedSubmitData = formatSubmitData(templateFormData)

            const updatedRequirementTemplate = await requirementTemplateStore.forcePublishRequirementTemplate(
              requirementTemplate.id,
              formattedSubmitData
            )

            if (updatedRequirementTemplate) {
              const publishedTemplateVersion = updatedRequirementTemplate.publishedTemplateVersion

              publishedTemplateVersion
                ? navigate(`/template-versions/${publishedTemplateVersion.id}`)
                : navigate("/requirement-templates")
            }
          })()
        }
      : undefined

  const hasNoSections = watchedSectionsAttributes.length === 0

  const allTemplateSectionBlocks = watchedSectionsAttributes.flatMap(
    (section) => section.templateSectionBlocksAttributes
  )

  const stepCodeRelatedWarningBannerErrors = getStepCodeRelatedWarningBannerErrors()

  const hasStepCodeDependencyError = !!stepCodeRelatedWarningBannerErrors.find((error) => error.type === "error")
  return (
    <Box as="main" id="admin-edit-permit-template">
      <FormProvider {...formMethods}>
        <EditableBuilderHeader requirementTemplate={requirementTemplate} />
        <Box
          id="sidebar-and-form-container"
          borderTop={"1px solid"}
          borderColor={"border.base"}
          position="relative"
          sx={{ "&:after": { content: `""`, display: "block", clear: "both" } }}
        >
          {isReorderMode ? (
            <SectionsDnd sections={watchedSectionsAttributes} onCancel={closeReorderMode} onDone={onDndComplete} />
          ) : (
            <SectionsSidebar
              onEdit={openReorderMode}
              onItemClick={scrollIntoView}
              sectionIdToHighlight={currentSectionId}
              sections={denormalizedSections}
            />
          )}
          <Box
            id="editing-permit-requirements-form"
            display="flex"
            flexDirection="column"
            bg={hasNoSections ? "greys.grey03" : undefined}
            ref={rightContainerRef}
          >
            <ControlsHeader
              onSaveDraft={onSaveDraft}
              onScheduleDate={onSchedule}
              onForcePublishNow={onForcePublishNow}
              onAddSection={onAddSection}
              requirementTemplate={requirementTemplate}
              hasStepCodeDependencyError={hasStepCodeDependencyError}
              renderOptionsMenu={renderOptionsMenu}
              renderActions={renderActions}
            />
            <FloatingHelpDrawer top="100px" />
            {hasNoSections ? (
              <Flex
                justifyContent={hasNoSections ? "center" : undefined}
                alignItems={hasNoSections ? "flex-start" : undefined}
                flex={1}
                w={"full"}
                minH="100vh"
              >
                <Text color={"text.secondary"} fontSize={"sm"} fontStyle={"italic"} mt="20%">
                  {t("requirementTemplate.edit.emptyTemplateSectionText")}
                </Text>
              </Flex>
            ) : (
              <>
                <Box w="full" px={6}>
                  {stepCodeRelatedWarningBannerErrors.map((error) => (
                    <CalloutBanner key={error.title} type={error.type} title={error.title} />
                  ))}
                </Box>
                <SectionsDisplay isCollapsedAll={isCollapsedAll} setSectionRef={setSectionRef} />
              </>
            )}
          </Box>
        </Box>
      </FormProvider>
      <BuilderBottomFloatingButtons isCollapsedAll={isCollapsedAll} setIsCollapsedAll={setIsCollapsedAll} />
    </Box>
  )

  function getEnergyStepCodeBlocks() {
    return allTemplateSectionBlocks.filter(
      (sectionBlock) =>
        requirementBlockStore.getRequirementBlockById(sectionBlock.requirementBlockId)?.blocksWithEnergyStepCode
    )
  }

  function getStepCodePackageFileBlocks() {
    return allTemplateSectionBlocks.filter(
      (sectionBlock) =>
        requirementBlockStore.getRequirementBlockById(sectionBlock.requirementBlockId)?.blocksWithStepCodePackageFile
    )
  }

  function getStepCodeRelatedWarningBannerErrors() {
    const energyStepCodeBlocks = getEnergyStepCodeBlocks()
    const stepCodePackageFileBlocks = getStepCodePackageFileBlocks()

    const hasAnyEnergyStepCodeBlocks = energyStepCodeBlocks.length > 0
    const hasDuplicateEnergyStepCodeBlocks = energyStepCodeBlocks.length > 1
    const hasAnyStepCodePackageFileBlock = stepCodePackageFileBlocks.length > 0
    const hasDuplicateStepCodePackageFileBlock = stepCodePackageFileBlocks.length > 1

    const errors: Array<{ title: string; type: "warning" | "error" }> = []

    if (!hasAnyEnergyStepCodeBlocks && !hasAnyStepCodePackageFileBlock) {
      return errors
    }

    if (hasAnyEnergyStepCodeBlocks) {
      if (!hasAnyStepCodePackageFileBlock) {
        errors.push({
          title: t("requirementTemplate.edit.stepCodeErrors.stepCodePackageRequired"),
          type: "error",
        })
      }

      if (hasDuplicateStepCodePackageFileBlock) {
        errors.push({
          title: t("requirementTemplate.edit.stepCodeErrors.duplicateStepCodePackage"),
          type: "error",
        })
      }
    } else if (hasAnyStepCodePackageFileBlock) {
      if (hasDuplicateStepCodePackageFileBlock) {
        errors.push({
          title: t("requirementTemplate.edit.stepCodeWarnings.duplicateStepCodePackage"),
          type: "warning",
        })
      } else {
        errors.push({
          title: t("requirementTemplate.edit.stepCodeWarnings.energyStepCodeRecommended"),
          type: "warning",
        })
      }
    }

    if (hasDuplicateEnergyStepCodeBlocks) {
      errors.push({
        title: t("requirementTemplate.edit.stepCodeErrors.duplicateEnergyStepCode"),
        type: "error",
      })
    }

    return errors
  }

  function scrollIntoView(id: string) {
    const element = document.getElementById(formScrollToId(id))

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }

  function formatSubmitData(formData: IRequirementTemplateForm) {
    const formattedData = R.clone(formData)

    formattedData.requirementTemplateSectionsAttributes.forEach((sectionAttributes, sectionIndex) => {
      const existingMSTSection = requirementTemplate.getRequirementSectionById(sectionAttributes.id)

      // if this is a new section, set id null to mark it to be created
      // on the backend
      if (!existingMSTSection) {
        sectionAttributes.id = null
      }
      sectionAttributes.position = sectionIndex
      sectionAttributes.templateSectionBlocksAttributes.forEach((sectionBlockAttributes, blockIndex) => {
        // if the section is new or if the block is moved to this section
        // from another section, then we set the id to null so that it gets created
        // on the new section by rails.
        if (!existingMSTSection || !existingMSTSection.hasTemplateSectionBlock(sectionBlockAttributes.id)) {
          // this is to handle case if the same requirementBlock was removed then re-added during edit
          const existingSectionAndRequirementBlockCombo =
            existingMSTSection?.getTemplateSectionBlockByRequirementBlockId(sectionBlockAttributes.requirementBlockId)

          sectionBlockAttributes.id = existingSectionAndRequirementBlockCombo
            ? existingSectionAndRequirementBlockCombo.id
            : null
        }
        sectionBlockAttributes.position = blockIndex
      })

      // mark removed or moved templateSectionBlocks to be deleted
      const deletedTemplateSectionBlocksAttributes: ITemplateSectionBlockAttributes[] =
        existingMSTSection?.sortedTemplateSectionBlocks
          .filter(
            (sectionBlock) =>
              !sectionAttributes.templateSectionBlocksAttributes.find(
                (blockAttribute) => blockAttribute.id === sectionBlock.id
              )
          )
          .map((sectionBlock) => ({ id: sectionBlock.id, _destroy: true })) ?? []

      // append the deleted templateSectionBlocks to request params
      sectionAttributes.templateSectionBlocksAttributes.unshift(...deletedTemplateSectionBlocksAttributes)
    })

    // mark removed sections to be deleted
    const deletedTemplateSectionsAttributes: ITemplateSectionBlockAttributes[] =
      requirementTemplate?.sortedRequirementTemplateSections
        .filter(
          (section) =>
            !formattedData.requirementTemplateSectionsAttributes.find(
              (sectionAttributes) => sectionAttributes.id === section.id
            )
        )
        .map((section) => ({ id: section.id, _destroy: true })) ?? []

    // append the deleted templateSections to request params
    formattedData.requirementTemplateSectionsAttributes.unshift(...deletedTemplateSectionsAttributes)

    return formattedData
  }

  function onDndComplete(
    dndSectionMap: {
      [key: string]: IRequirementTemplateSectionAttributes
    },
    sortedSectionsId: string[]
  ) {
    const newTemplateSectionsAttributes: IRequirementTemplateSectionAttributes[] = sortedSectionsId.map((sectionID) => {
      return {
        ...dndSectionMap[sectionID],
        requirementTemplateSectionsAttributes: R.clone(dndSectionMap[sectionID].templateSectionBlocksAttributes),
      }
    })

    setValue("requirementTemplateSectionsAttributes", newTemplateSectionsAttributes)
    closeReorderMode()
  }

  function scrollToTop() {
    rightContainerRef.current?.scrollTo({ behavior: "smooth", top: 0 })
  }

  function onAddSection() {
    const defaultName = "New Section"
    const numUneditedNewSections = watchedSectionsAttributes.filter((sectionAttributes) =>
      sectionAttributes.name?.startsWith(defaultName)
    ).length

    const sectionAttributes = {
      id: uuidv4(),
      name: `${defaultName} ${numUneditedNewSections + 1}`,
      templateSectionBlocksAttributes: [],
    }

    appendToSectionsAttributes(sectionAttributes)

    setTimeout(() => {
      scrollIntoView(sectionAttributes.id)
    }, 200)
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

function formFormDefaults(requirementTemplate?: IRequirementTemplate): IRequirementTemplateForm {
  if (!requirementTemplate) {
    return {
      description: "",
      nickname: "",
      requirementTemplateSectionsAttributes: [],
    }
  }

  const requirementTemplateSectionsAttributes = requirementTemplate.sortedRequirementTemplateSections.map(
    (templateSection) => {
      return {
        id: templateSection.id,
        name: templateSection.name,
        templateSectionBlocksAttributes: R.map(
          (sectionBlocks) => R.pick(["id", "requirementBlockId"], sectionBlocks),
          templateSection.sortedTemplateSectionBlocks as ITemplateSectionBlockModel[]
        ),
      }
    }
  )
  return {
    description: requirementTemplate.description,
    nickname: requirementTemplate.nickname,
    public: requirementTemplate.public,
    requirementTemplateSectionsAttributes,
  }
}
