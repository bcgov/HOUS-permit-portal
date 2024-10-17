import { Box, Button, HStack, Stack } from "@chakra-ui/react"
import { X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"
import { IRequirementTemplateForm, formScrollToId } from "."
import { useMst } from "../../../../../setup/root"
import { IRequirementTemplateSectionAttributes } from "../../../../../types/api-request"
import { EditableInputWithControls } from "../../../../shared/editable-input-with-controls"
import { RemoveConfirmationModal } from "../../../../shared/modals/remove-confirmation-modal"
import { RequirementBlockAccordion } from "../../../requirements-library/requirement-block-accordion"
import { RequirementsLibraryDrawer } from "../../../requirements-library/requirements-library-drawer"

interface IProps {
  isCollapsedAll?: boolean
  setSectionRef: (el: HTMLElement, id: string) => void
}

export const SectionsDisplay = observer(function SectionsDisplay(props: IProps) {
  const { watch } = useFormContext<IRequirementTemplateForm>()
  const watchedSections = watch("requirementTemplateSectionsAttributes")
  const usedRequirementBlockIds = watchedSections.flatMap((section) =>
    section.templateSectionBlocksAttributes.map((sectionBlock) => sectionBlock.requirementBlockId)
  )

  return (
    <Stack
      id="sections-display-form-blocks"
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
        <SectionDisplay
          key={section.id}
          section={section}
          sectionIndex={index}
          disabledUseForBlockIds={usedRequirementBlockIds}
          {...props}
        />
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
    disabledUseForBlockIds = [],
  }: {
    section: IRequirementTemplateSectionAttributes
    sectionIndex: number
    isCollapsedAll?: boolean
    setSectionRef: (el: HTMLElement, id: string) => void
    disabledUseForBlockIds?: string[]
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

    const [editableSectionName, setEditableSectionName] = React.useState<string>(watchedSectionName ?? "")
    const [isInEditMode, setIsInEditMode] = React.useState<boolean>(false)

    useEffect(() => {
      setEditableSectionName(watchedSectionName)
    }, [watchedSectionName])

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
            className={"edit-template-yellowBarHeader"}
            sx={{
              "&::before": {
                borderTop: isInEditMode ? "none" : undefined,
              },
            }}
            editablePreviewProps={{
              marginTop: 6,
            }}
            initialHint={t("ui.clickToEdit")}
            value={editableSectionName}
            onChange={setEditableSectionName}
            onEdit={() => setIsInEditMode(true)}
            onSubmit={(nextValue) => {
              setValue(`requirementTemplateSectionsAttributes.${sectionIndex}.name`, nextValue)
            }}
            color={R.isEmpty(editableSectionName) ? "text.link" : undefined}
            aria-label={"Edit Section Name"}
            onBlur={() => setIsInEditMode(false)}
            onCancel={(previousValue) => {
              setEditableSectionName(previousValue)
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
              id={formScrollToId(sectionBlock.requirementBlockId)}
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
            }}
            disabledUseForBlockIds={new Set(disabledUseForBlockIds)}
            disabledReason={t("requirementTemplate.edit.duplicateRequirementBlockDisabledReason")}
          />
        </Stack>
      </Box>
    )
  }
)
