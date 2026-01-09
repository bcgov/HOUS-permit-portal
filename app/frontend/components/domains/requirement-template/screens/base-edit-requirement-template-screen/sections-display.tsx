import { Box, Button, HStack, Stack, Text } from "@chakra-ui/react"
import { Trash } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"
import { IRequirementTemplateForm, formScrollToId } from "."
import { useMst } from "../../../../../setup/root"
import { EditableInputWithControls } from "../../../../shared/editable-input-with-controls"
import { RemoveConfirmationModal } from "../../../../shared/modals/remove-confirmation-modal"
import { RequirementBlockAccordion } from "../../../requirements-library/requirement-block-accordion"
import { RequirementsLibraryDrawer } from "../../../requirements-library/requirements-library-drawer"

interface IProps {
  isCollapsedAll?: boolean
  setSectionRef: (el: HTMLElement, id: string) => void
}

const RemovedPlaceholder = ({ name, onUndo, onExpire }: { name: string; onUndo: () => void; onExpire: () => void }) => {
  const { t } = useTranslation()

  useEffect(() => {
    const timer = setTimeout(onExpire, 10000)
    return () => clearTimeout(timer)
  }, [onExpire])

  return (
    <HStack
      w="full"
      p={4}
      bg="greys.grey04"
      border="1px solid"
      borderColor="border.light"
      borderRadius="lg"
      spacing={4}
    >
      <Text fontStyle="italic" fontWeight="bold">
        {t("requirementTemplate.edit.wasRemoved", { name })}
      </Text>
      <Button variant="link" color="semantic.info" onClick={onUndo}>
        {t("ui.undo")}
      </Button>
    </HStack>
  )
}

const SectionHeader = observer(
  ({
    section,
    sectionIndex,
    activeSectionBlocksCount,
    onRemove,
  }: {
    section: any
    sectionIndex: number
    activeSectionBlocksCount: number
    onRemove: () => void
  }) => {
    const { setValue } = useFormContext<IRequirementTemplateForm>()
    const { t } = useTranslation()
    const watchedSectionName = section.name || ""
    const [editableSectionName, setEditableSectionName] = React.useState<string>(watchedSectionName)
    const [isInEditMode, setIsInEditMode] = React.useState<boolean>(false)

    useEffect(() => {
      setEditableSectionName(watchedSectionName)
    }, [watchedSectionName])

    return (
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

        {activeSectionBlocksCount === 0 ? (
          <Button leftIcon={<Trash />} variant={"ghost"} color={"error"} visibility={"hidden"} onClick={onRemove}>
            {t("ui.remove")}
          </Button>
        ) : (
          <RemoveConfirmationModal
            title={t("requirementTemplate.edit.removeConfirmationModal.title")}
            body={t("requirementTemplate.edit.removeConfirmationModal.body")}
            onRemove={onRemove}
            triggerButtonProps={{ visibility: "hidden" }}
          />
        )}
      </HStack>
    )
  }
)

interface ISectionBlocksProps {
  section: any
  sectionIndex: number
  isCollapsedAll?: boolean
  disabledUseForBlockIds: string[]
}

const SectionBlocksBase = (props: ISectionBlocksProps) => {
  const { section, sectionIndex, isCollapsedAll, disabledUseForBlockIds } = props
  const { requirementBlockStore } = useMst()
  const { getIsRequirementBlockEditable } = requirementBlockStore
  const { control } = useFormContext<IRequirementTemplateForm>()
  const { t } = useTranslation()

  const [expiredBlockIds, setExpiredBlockIds] = React.useState<Set<string>>(new Set())

  const { append: appendSectionBlock, update: updateSectionBlock } = useFieldArray({
    name: `requirementTemplateSectionsAttributes.${sectionIndex}.templateSectionBlocksAttributes` as any,
    control,
  })

  const watchedSectionBlocks = section.templateSectionBlocksAttributes || []

  return (
    <Stack w={"full"}>
      {watchedSectionBlocks.map((sectionBlock: any, index: number) => {
        const requirementBlock = requirementBlockStore.getRequirementBlockById(sectionBlock.requirementBlockId)

        if (!requirementBlock) return null

        if (sectionBlock._destroy) {
          if (expiredBlockIds.has(sectionBlock.id)) return null

          return (
            <Box key={sectionBlock.id} mb={6}>
              <RemovedPlaceholder
                name={requirementBlock.displayName}
                onUndo={() => {
                  setExpiredBlockIds((prev) => {
                    const next = new Set(prev)
                    next.delete(sectionBlock.id)
                    return next
                  })
                  updateSectionBlock(index, { ...sectionBlock, _destroy: undefined })
                }}
                onExpire={() => setExpiredBlockIds((prev) => new Set(prev).add(sectionBlock.id))}
              />
            </Box>
          )
        }

        return (
          <RequirementBlockAccordion
            mb="6"
            id={formScrollToId(sectionBlock.requirementBlockId)}
            key={sectionBlock.id}
            requirementBlock={requirementBlock}
            onRemove={() => updateSectionBlock(index, { ...sectionBlock, _destroy: true })}
            isCollapsedAll={isCollapsedAll}
            isEditable={getIsRequirementBlockEditable(requirementBlock)}
            showEditWarning
          />
        )
      })}
      <RequirementsLibraryDrawer
        defaultButtonProps={{ alignSelf: "center" }}
        onUse={(requirementBlock) => {
          appendSectionBlock({ id: uuidv4(), requirementBlockId: requirementBlock.id })
        }}
        disabledUseForBlockIds={new Set(disabledUseForBlockIds)}
        disabledReason={t("requirementTemplate.edit.duplicateRequirementBlockDisabledReason")}
      />
    </Stack>
  )
}

const SectionBlocks = observer(SectionBlocksBase)

interface ISectionDisplayProps {
  section: any
  sectionIndex: number
  isCollapsedAll?: boolean
  setSectionRef: (el: HTMLElement, id: string) => void
  disabledUseForBlockIds?: string[]
}

const SectionDisplayBase = (props: ISectionDisplayProps) => {
  const { section, sectionIndex, isCollapsedAll, setSectionRef, disabledUseForBlockIds = [] } = props
  const { control } = useFormContext<IRequirementTemplateForm>()

  const [isExpired, setIsExpired] = React.useState(false)

  const { update: updateSection } = useFieldArray({
    name: `requirementTemplateSectionsAttributes` as any,
    control,
  })

  if (section._destroy) {
    if (isExpired) return null

    return (
      <RemovedPlaceholder
        name={section.name}
        onUndo={() => {
          setIsExpired(false)
          updateSection(sectionIndex, { ...section, _destroy: undefined })
        }}
        onExpire={() => setIsExpired(true)}
      />
    )
  }

  const activeSectionBlocksCount = (section.templateSectionBlocksAttributes || []).filter(
    (block: any) => !block._destroy
  ).length

  return (
    <Box
      ref={(el) => setSectionRef(el, section.id)}
      w={"full"}
      id={formScrollToId(section.id)}
      data-section-id={section.id}
    >
      <SectionHeader
        section={section}
        sectionIndex={sectionIndex}
        activeSectionBlocksCount={activeSectionBlocksCount}
        onRemove={() => updateSection(sectionIndex, { ...section, _destroy: true })}
      />
      <SectionBlocks
        section={section}
        sectionIndex={sectionIndex}
        isCollapsedAll={isCollapsedAll}
        disabledUseForBlockIds={disabledUseForBlockIds}
      />
    </Box>
  )
}

const SectionDisplay = observer(SectionDisplayBase)

export const SectionsDisplay = observer(function SectionsDisplay(props: IProps) {
  const { watch } = useFormContext<IRequirementTemplateForm>()
  const watchedSections = watch("requirementTemplateSectionsAttributes") || []
  const usedRequirementBlockIds = watchedSections
    .filter((section: any) => !section._destroy)
    .flatMap(
      (section: any) =>
        section.templateSectionBlocksAttributes
          ?.filter((block: any) => !block._destroy)
          .map((sectionBlock: any) => sectionBlock.requirementBlockId) || []
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
      {watchedSections.map((section: any, index: number) => (
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
