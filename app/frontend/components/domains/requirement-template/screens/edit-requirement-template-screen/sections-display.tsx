import { Box, Button, HStack, Stack } from "@chakra-ui/react"
import { X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"
import { useMst } from "../../../../../setup/root"
import { IRequirementTemplateSectionAttributes } from "../../../../../types/api-request"
import { EditableInputWithControls } from "../../../../shared/editable-input-with-controls"
import { RemoveConfirmationModal } from "../../../../shared/remove-confirmation-modal"
import { RequirementBlockAccordion } from "../../../requirements-library/requirement-block-accordion"
import { RequirementsLibraryDrawer } from "../../../requirements-library/requirements-library-drawer"
import { IRequirementTemplateForm, formScrollToId } from "./index"

interface IProps {
  shouldCollapseAll?: boolean
  setSectionRef: (el: HTMLElement, id: string) => void
}

export const SectionsDisplay = observer(function SectionsDisplay(props: IProps) {
  const { watch } = useFormContext<IRequirementTemplateForm>()
  const watchedSections = watch("requirementTemplateSectionsAttributes")

  return (
    <Stack w={"full"} alignItems={"flex-start"} spacing={16} p={16}>
      {watchedSections.map((section, index) => (
        <SectionDisplay key={section.id} section={section} sectionIndex={index} {...props} />
      ))}
    </Stack>
  )
})

const SectionDisplay = observer(
  ({
    section,
    sectionIndex,
    shouldCollapseAll,
    setSectionRef,
  }: {
    section: IRequirementTemplateSectionAttributes
    sectionIndex: number
    shouldCollapseAll?: boolean
    setSectionRef: (el: HTMLElement, id: string) => void
  }) => {
    const { requirementBlockStore } = useMst()
    const { control, watch, register, setValue } = useFormContext<IRequirementTemplateForm>()
    const { t } = useTranslation()

    const { append: appendSectionBlock, remove: removeSectionBlock } = useFieldArray({
      name: `requirementTemplateSectionsAttributes.${sectionIndex}.templateSectionBlocksAttributes`,
      control,
    })

    const { remove: removeSection } = useFieldArray({
      name: `requirementTemplateSectionsAttributes`,
      control,
    })

    const watchedSectionBlocks = watch(
      `requirementTemplateSectionsAttributes.${sectionIndex}.templateSectionBlocksAttributes`
    )

    const watchedSectionName = watch(`requirementTemplateSectionsAttributes.${sectionIndex}.name`)
    return (
      <Box
        ref={(el) => setSectionRef(el, section.id)}
        as={"section"}
        w={"full"}
        id={formScrollToId(section.id)}
        data-section-id={section.id}
      >
        <Box w={"36px"} border={"4px solid"} borderColor={"theme.yellow"} mb={2} />
        <HStack
          w={"full"}
          maxW={"798px"}
          justifyContent={"space-between"}
          _hover={{ "button:nth-of-type(1)": { visibility: "visible" } }}
        >
          <EditableInputWithControls
            role={"heading"}
            aria-level={4}
            w={"fit-content"}
            fontWeight={700}
            fontSize={"2xl"}
            initialHint={t("ui.clickToEdit")}
            value={watchedSectionName || ""}
            editableInputProps={{
              ...register(`requirementTemplateSectionsAttributes.${sectionIndex}.name`, { required: true }),
              "aria-label": "Edit Section Name",
            }}
            color={R.isEmpty(watchedSectionName) ? "text.link" : undefined}
            aria-label={"Edit Section Name"}
            onCancel={(previousValue) => {
              setValue(`requirementTemplateSectionsAttributes.${sectionIndex}.name`, previousValue)
            }}
          />

          {watchedSectionBlocks.length === 0 ? (
            <Button
              leftIcon={<X />}
              variant={"ghost"}
              color={"error"}
              visibility={"hidden"}
              onClick={() => removeSection(sectionIndex)}
            >
              {t("ui.remove")}
            </Button>
          ) : (
            <RemoveConfirmationModal
              title={t("requirementTemplate.edit.removeConfirmationModal.title")}
              body={t("requirementTemplate.edit.removeConfirmationModal.body")}
              onRemove={() => removeSection(sectionIndex)}
              triggerButtonProps={{ visibility: "hidden" }}
            />
          )}
        </HStack>
        <Stack w={"full"} maxW={"798px"} spacing={6} pl={0} mt={6}>
          {watchedSectionBlocks.map((sectionBlock, index) => (
            <RequirementBlockAccordion
              as={"section"}
              id={formScrollToId(sectionBlock.id)}
              key={sectionBlock.id}
              requirementBlock={requirementBlockStore.getRequirementBlockById(sectionBlock.requirementBlockId)}
              onRemove={() => removeSectionBlock(index)}
              triggerForceCollapse={shouldCollapseAll}
              isEditable
              showEditWarning
            />
          ))}
          <RequirementsLibraryDrawer
            defaultButtonProps={{ alignSelf: "center" }}
            onUse={(requirementBlock, closeDrawer) => {
              appendSectionBlock({ id: uuidv4(), requirementBlockId: requirementBlock.id })
              closeDrawer()
            }}
            disableUseForBlockIds={new Set(watchedSectionBlocks.map((sectionBlock) => sectionBlock.requirementBlockId))}
          />
        </Stack>
      </Box>
    )
  }
)
