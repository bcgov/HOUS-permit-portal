import { Box, Button, Collapse, Flex, FormLabel, HStack, IconButton, Text, useDisclosure } from "@chakra-ui/react"
import { SlidersHorizontal, Trash } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { IRequirementTemplateForm } from "."
import { useMst } from "../../../../../setup/root"
import { IBlockConditional, IRequirementTemplateSectionAttributes } from "../../../../../types/api-request"
import { IOption } from "../../../../../types/types"

interface IProps {
  sectionIndex: number
  blockIndex: number
}

const SUPPORTED_TRIGGER_INPUT_TYPES = [
  "text",
  "textarea",
  "phone",
  "email",
  "address",
  "bcaddress",
  "select",
  "radio",
  "multi_option_select",
  "checkbox",
  "number",
]

const OPTION_INPUT_TYPES = ["select", "radio", "multi_option_select", "checkbox"]

export const BlockConditionalConfig = observer(function BlockConditionalConfig({ sectionIndex, blockIndex }: IProps) {
  const { t } = useTranslation()
  const { requirementBlockStore } = useMst()
  const { watch, setValue } = useFormContext<IRequirementTemplateForm>()
  const { isOpen, onToggle, onOpen } = useDisclosure()

  const basePath =
    `requirementTemplateSectionsAttributes.${sectionIndex}.templateSectionBlocksAttributes.${blockIndex}` as const
  const conditionalPath = `${basePath}.conditional` as any

  const currentBlockId = watch(`${basePath}.requirementBlockId` as any)
  const conditional = watch(conditionalPath) as IBlockConditional | null | undefined
  const allSections = watch("requirementTemplateSectionsAttributes") as IRequirementTemplateSectionAttributes[]

  const otherBlocks = useMemo(() => {
    const blocks: Array<{ blockId: string; blockName: string }> = []
    allSections?.forEach((section) => {
      section.templateSectionBlocksAttributes?.forEach((sb) => {
        if (sb.requirementBlockId && sb.requirementBlockId !== currentBlockId && !sb._destroy) {
          const block = requirementBlockStore.getRequirementBlockById(sb.requirementBlockId)
          if (block) {
            blocks.push({ blockId: block.id, blockName: block.displayName || block.name })
          }
        }
      })
    })
    return blocks
  }, [allSections, currentBlockId, requirementBlockStore])

  const blockOptions: IOption[] = useMemo(
    () => otherBlocks.map((b) => ({ label: b.blockName, value: b.blockId })),
    [otherBlocks]
  )

  const selectedBlock = conditional?.whenBlockId
    ? requirementBlockStore.getRequirementBlockById(conditional.whenBlockId)
    : null

  const fieldOptions: IOption[] = useMemo(() => {
    if (!selectedBlock) return []
    return selectedBlock.requirements
      .filter((r) => SUPPORTED_TRIGGER_INPUT_TYPES.includes(r.inputType))
      .map((r) => ({ label: r.label, value: r.requirementCode }))
  }, [selectedBlock])

  const selectedRequirement = useMemo(() => {
    if (!selectedBlock || !conditional?.whenRequirementCode) return null
    return selectedBlock.requirements.find((r) => r.requirementCode === conditional.whenRequirementCode)
  }, [selectedBlock, conditional?.whenRequirementCode])

  const valueOptions: IOption[] = useMemo(() => {
    if (!selectedRequirement) return []
    if (selectedRequirement.inputOptions?.valueOptions) {
      return selectedRequirement.inputOptions.valueOptions
    }
    if (selectedRequirement.inputType === "checkbox") {
      return [
        { label: t("ui.checked"), value: "true" },
        { label: t("ui.unchecked"), value: "false" },
      ]
    }
    return []
  }, [selectedRequirement])

  const isOptionType = selectedRequirement && OPTION_INPUT_TYPES.includes(selectedRequirement.inputType)

  const effectOptions: IOption[] = [
    { label: t("requirementTemplate.edit.blockConditional.showBlock"), value: "show" },
    { label: t("requirementTemplate.edit.blockConditional.hideBlock"), value: "hide" },
  ]

  const currentEffect = conditional?.show ? "show" : conditional?.hide ? "hide" : null

  const setConditionalField = (field: keyof IBlockConditional, value: any) => {
    const current = (conditional || {}) as Record<string, any>
    const updated = { ...current, [field]: value }
    setValue(conditionalPath, updated as IBlockConditional, { shouldDirty: true })
  }

  const handleBlockChange = (opt: IOption) => {
    setValue(
      conditionalPath,
      { whenBlockId: opt.value, whenRequirementCode: "", eq: "", show: true } as IBlockConditional,
      { shouldDirty: true }
    )
  }

  const handleFieldChange = (opt: IOption) => {
    const current = conditional || ({} as IBlockConditional)
    setValue(conditionalPath, { ...current, whenRequirementCode: opt.value, eq: "" } as IBlockConditional, {
      shouldDirty: true,
    })
  }

  const handleValueChange = (val: string) => {
    setConditionalField("eq", val)
  }

  const handleEffectChange = (opt: IOption) => {
    const current = conditional || ({} as IBlockConditional)
    const updated: IBlockConditional = {
      whenBlockId: current.whenBlockId,
      whenRequirementCode: current.whenRequirementCode,
      eq: current.eq,
    }
    if (opt.value === "show") {
      updated.show = true
    } else {
      updated.hide = true
    }
    setValue(conditionalPath, updated, { shouldDirty: true })
  }

  const handleRemove = () => {
    setValue(conditionalPath, null, { shouldDirty: true })
  }

  const hasConditional = conditional?.whenBlockId && conditional?.whenRequirementCode && conditional?.eq

  if (hasConditional && !isOpen) {
    const blockName = selectedBlock?.displayName || selectedBlock?.name || ""
    const fieldLabel = selectedRequirement?.label || conditional.whenRequirementCode
    const effect = conditional.show
      ? t("requirementTemplate.edit.blockConditional.showBlock")
      : t("requirementTemplate.edit.blockConditional.hideBlock")

    return (
      <HStack
        bg="semantic.infoLight"
        px={4}
        py={2}
        borderRadius="md"
        spacing={3}
        cursor="pointer"
        onClick={onOpen}
        role="button"
        _hover={{ opacity: 0.85 }}
      >
        <SlidersHorizontal size={14} />
        <Text fontSize="xs" flex={1}>
          {t("requirementTemplate.edit.blockConditional.conditionalActive", {
            effect,
            blockName,
            fieldLabel,
            value: conditional.eq,
          })}
        </Text>
        <IconButton
          aria-label={t("requirementTemplate.edit.blockConditional.removeConditional")}
          icon={<Trash size={14} />}
          size="xs"
          variant="ghost"
          color="error"
          onClick={(e) => {
            e.stopPropagation()
            handleRemove()
          }}
        />
      </HStack>
    )
  }

  return (
    <Box>
      {!isOpen && !hasConditional && (
        <Button
          variant="link"
          size="xs"
          leftIcon={<SlidersHorizontal size={12} />}
          color="text.link"
          onClick={onToggle}
        >
          {t("requirementTemplate.edit.blockConditional.addConditional")}
        </Button>
      )}
      <Collapse in={isOpen} animateOpacity>
        <Box border="1px solid" borderColor="border.light" borderRadius="md" p={4} mt={1} bg="greys.grey03">
          <Flex direction="column" gap={3}>
            <Flex direction="column" gap={1}>
              <FormLabel fontSize="xs" fontWeight="bold" mb={0}>
                {t("requirementTemplate.edit.blockConditional.whenBlock")}
              </FormLabel>
              <Select
                options={blockOptions}
                value={blockOptions.find((o) => o.value === conditional?.whenBlockId) || null}
                onChange={handleBlockChange}
                placeholder={t("requirementTemplate.edit.blockConditional.selectBlock")}
                menuPortalTarget={document.body}
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              />
            </Flex>

            {conditional?.whenBlockId && (
              <Flex direction="column" gap={1}>
                <FormLabel fontSize="xs" fontWeight="bold" mb={0}>
                  {t("requirementTemplate.edit.blockConditional.whenField")}
                </FormLabel>
                <Select
                  options={fieldOptions}
                  value={fieldOptions.find((o) => o.value === conditional?.whenRequirementCode) || null}
                  onChange={handleFieldChange}
                  placeholder={t("requirementTemplate.edit.blockConditional.selectField")}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </Flex>
            )}

            {conditional?.whenRequirementCode && (
              <Flex direction="column" gap={1}>
                <FormLabel fontSize="xs" fontWeight="bold" mb={0}>
                  {t("requirementTemplate.edit.blockConditional.equals")}
                </FormLabel>
                {isOptionType ? (
                  <Select
                    options={valueOptions}
                    value={valueOptions.find((o) => o.value === conditional?.eq) || null}
                    onChange={(opt) => handleValueChange(opt?.value || "")}
                    placeholder={t("requirementTemplate.edit.blockConditional.selectValue")}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                ) : (
                  <input
                    type="text"
                    value={conditional?.eq || ""}
                    onChange={(e) => handleValueChange(e.target.value)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "14px",
                      width: "100%",
                    }}
                  />
                )}
              </Flex>
            )}

            {conditional?.whenRequirementCode && (
              <Flex direction="column" gap={1}>
                <FormLabel fontSize="xs" fontWeight="bold" mb={0}>
                  {t("requirementTemplate.edit.blockConditional.then")}
                </FormLabel>
                <Select
                  options={effectOptions}
                  value={effectOptions.find((o) => o.value === currentEffect) || effectOptions[0]}
                  onChange={handleEffectChange}
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </Flex>
            )}

            <HStack justifyContent="flex-end" pt={1}>
              <Button
                size="xs"
                variant="ghost"
                color="error"
                onClick={() => {
                  handleRemove()
                  onToggle()
                }}
              >
                {hasConditional ? t("requirementTemplate.edit.blockConditional.removeConditional") : t("ui.cancel")}
              </Button>
              {hasConditional && (
                <Button size="xs" variant="primary" onClick={onToggle}>
                  {t("ui.done")}
                </Button>
              )}
            </HStack>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  )
})
