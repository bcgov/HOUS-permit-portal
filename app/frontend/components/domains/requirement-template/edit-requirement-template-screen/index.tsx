import { Button, Flex, Stack, Text, useDisclosure } from "@chakra-ui/react"
import { ArrowUp } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useRef, useState } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { RemoveScroll } from "react-remove-scroll"
import { v4 as uuidv4 } from "uuid"
import { useRequirementTemplate } from "../../../../hooks/resources/use-requirement-template"
import { IRequirementTemplate } from "../../../../models/requirement-template"
import { ITemplateSectionBlockModel } from "../../../../models/template-section-block"
import { useMst } from "../../../../setup/root"
import {
  IRequirementTemplateSectionAttributes,
  IRequirementTemplateUpdateParams,
  ITemplateSectionBlockAttributes,
} from "../../../../types/api-request"
import { ERequirementTemplateStatus } from "../../../../types/enums"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { BuilderHeader } from "./builder-header"
import { ControlsHeader } from "./controls-header"
import { SectionsDisplay } from "./sections-display"
import { SectionsDnd } from "./sections-dnd"
import { SectionsSidebar } from "./sections-sidebar"

export interface IRequirementTemplateForm extends IRequirementTemplateUpdateParams {}

const scrollToIdPrefix = "template-builder-scroll-to-id-"
export const formScrollToId = (id: string) => `${scrollToIdPrefix}${id}`

export const EditRequirementTemplateScreen = observer(function EditRequirementTemplateScreen() {
  const { isOpen: isReorderMode, onClose: closeReorderMode, onOpen: openReorderMode } = useDisclosure()
  const { requirementTemplateStore } = useMst()
  const { requirementTemplate, error } = useRequirementTemplate()
  const formMethods = useForm({ defaultValues: formFormDefaults(requirementTemplate) })
  const { control, reset, watch, setValue, handleSubmit } = formMethods
  const { append: appendToSectionsAttributes } = useFieldArray({
    name: `requirementTemplateSectionsAttributes`,
    control,
  })
  const { t } = useTranslation()
  const rightContainerRef = useRef<HTMLDivElement>()
  const [shouldCollapseAll, setShouldCollapseAll] = useState(false)
  const [sectionsInViewStatuses, setSectionsInViewStatuses] = useState<Record<string, boolean>>({})
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const watchedSectionsAttributes = watch("requirementTemplateSectionsAttributes")

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
    reset(formFormDefaults(requirementTemplate))
  }, [requirementTemplate?.isFullyLoaded])

  if (error) return <ErrorScreen error={error} />
  if (!requirementTemplate?.isFullyLoaded) return <LoadingScreen />

  const onSaveDraft = handleSubmit(async (templateFormData) => {
    const formattedSubmitData = formatSubmitData(templateFormData)

    formattedSubmitData.status = ERequirementTemplateStatus.draft
    return await requirementTemplateStore.updateRequirementTemplate(requirementTemplate.id, formattedSubmitData)
  })

  const onPublish = handleSubmit(async (templateFormData) => {
    const formattedSubmitData = formatSubmitData(templateFormData)

    formattedSubmitData.status = ERequirementTemplateStatus.published
    return await requirementTemplateStore.updateRequirementTemplate(requirementTemplate.id, formattedSubmitData)
  })

  const hasNoSections = watchedSectionsAttributes.length === 0

  const currentSectionId = (() => {
    const orderedInViewSections = watchedSectionsAttributes.filter((section) => sectionsInViewStatuses[section.id])

    return orderedInViewSections?.[0]?.id ?? null
  })()

  return (
    // the height 1px is needed other wise scroll does not work
    // as it seems like the browser has issues calculating height for flex=1 containers
    <RemoveScroll style={{ width: "100%", flex: "1", height: "100%" }}>
      <Flex flexDir={"column"} w={"full"} maxW={"full"} h="full" as="main">
        <FormProvider {...formMethods}>
          <BuilderHeader requirementTemplate={requirementTemplate} />
          <Flex flex={1} w={"full"} h={"1px"} borderTop={"1px solid"} borderColor={"border.base"}>
            {isReorderMode ? (
              <SectionsDnd sections={watchedSectionsAttributes} onCancel={closeReorderMode} onDone={onDndComplete} />
            ) : (
              <SectionsSidebar
                onEdit={openReorderMode}
                onItemClick={scrollIntoView}
                sectionIdToHighlight={currentSectionId}
              />
            )}
            <Flex
              flexDir={"column"}
              flex={1}
              h={"full"}
              bg={hasNoSections ? "greys.grey03" : undefined}
              overflow={"auto"}
              ref={rightContainerRef}
            >
              <ControlsHeader
                onSaveDraft={onSaveDraft}
                onPublish={onPublish}
                onAddSection={onAddSection}
                requirementTemplate={requirementTemplate}
              />
              {hasNoSections ? (
                <Flex
                  justifyContent={hasNoSections ? "center" : undefined}
                  alignItems={hasNoSections ? "center" : undefined}
                  flex={1}
                  w={"full"}
                >
                  <Text color={"text.secondary"} fontSize={"sm"} fontStyle={"italic"}>
                    {t("requirementTemplate.edit.emptyTemplateSectionText")}
                  </Text>
                </Flex>
              ) : (
                <SectionsDisplay shouldCollapseAll={shouldCollapseAll} setSectionRef={setSectionRef} />
              )}
            </Flex>
          </Flex>
        </FormProvider>
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
          sectionBlockAttributes.id = null
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
    requirementTemplateSectionsAttributes,
  }
}
