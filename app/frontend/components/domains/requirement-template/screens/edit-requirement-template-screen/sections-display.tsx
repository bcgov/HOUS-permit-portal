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
  isCollapsedAll?: boolean
  setSectionRef: (el: HTMLElement, id: string) => void
}

export const SectionsDisplay = observer(function SectionsDisplay(props: IProps) {
  const { watch } = useFormContext<IRequirementTemplateForm>()
  const watchedSections = watch("requirementTemplateSectionsAttributes")

  return (
    <Stack
      w={"full"}
      alignItems={"flex-start"}
      spacing={16}
      mt="8"
      mb="20"
      mx="auto"
      pl="8"
      pr="var(--app-permit-form-right-white-space)"
      maxWidth="container.lg"
    >
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
    isCollapsedAll,
    setSectionRef,
  }: {
    section: IRequirementTemplateSectionAttributes
    sectionIndex: number
    isCollapsedAll?: boolean
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
        <HStack
          w={"full"}
          justifyContent={"space-between"}
          _hover={{ "button:nth-of-type(1)": { visibility: "visible" } }}
        >
          <EditableInputWithControls
            role={"heading"}
            aria-level={4}
            w={"fit-content"}
            fontWeight={700}
            fontSize={"2xl"}
            className="edit-template-yellowBarHeader"
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
        <Stack w={"full"}>
          {watchedSectionBlocks.map((sectionBlock, index) => (
            <RequirementBlockAccordion
              mb="6"
              as={"section"}
              id={formScrollToId(sectionBlock.id)}
              key={sectionBlock.id}
              requirementBlock={requirementBlockStore.getRequirementBlockById(sectionBlock.requirementBlockId)}
              onRemove={() => removeSectionBlock(index)}
              isCollapsedAll={isCollapsedAll}
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
