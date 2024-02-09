import { Box, Button, HStack, Stack, useDisclosure } from "@chakra-ui/react"
import { X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { IRequirementTemplateSectionAttributes } from "../../../../types/api-request"
import { EditableInputWithControls } from "../../../shared/editable-input-with-controls"
import { RemoveConfirmationModal } from "../../../shared/remove-confirmation-modal"
import { RequirementBlockAccordion } from "../../requirements-library/requirement-block-accordion"
import { RequirementsLibraryDrawer } from "../../requirements-library/requirements-library-drawer"
import { IRequirementTemplateForm, formScrollToId } from "./index"

export const SectionsDisplay = observer(function SectionsDisplay() {
  const { watch } = useFormContext<IRequirementTemplateForm>()
  const watchedSections = watch("requirementTemplateSectionsAttributes")

  return (
    <Stack w={"full"} alignItems={"flex-start"} spacing={16} p={16}>
      {watchedSections.map((section, index) => (
        <SectionDisplay key={section.id} section={section} sectionIndex={index} />
      ))}
    </Stack>
  )
})

const SectionDisplay = observer(
  ({ section, sectionIndex }: { section: IRequirementTemplateSectionAttributes; sectionIndex: number }) => {
    const { requirementBlockStore } = useMst()
    const { control, watch, register, setValue } = useFormContext<IRequirementTemplateForm>()
    const { isOpen: isEditMode, onClose: closeEditMode, onOpen: openEditMode } = useDisclosure()
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
      <Box as={"section"} w={"full"} id={formScrollToId(section.id)}>
        <Box w={"36px"} border={"4px solid"} borderColor={"theme.yellow"} mb={2} />
        <HStack
          w={"full"}
          justifyContent={"space-between"}
          _hover={{ "button:nth-of-type(1)": { visibility: "visible" } }}
        >
          <EditableInputWithControls
            onEdit={openEditMode}
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
              closeEditMode()
            }}
            onSubmit={closeEditMode}
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
              isEditable
              showEditWarning
            />
          ))}
          <RequirementsLibraryDrawer
            defaultButtonProps={{ alignSelf: "center" }}
            onUse={(requirementBlock, closeDrawer) => {
              appendSectionBlock({ requirementBlockId: requirementBlock.id })
              closeDrawer()
            }}
          />
        </Stack>
      </Box>
    )
  }
)
