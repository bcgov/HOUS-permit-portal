import { Box, Button, Collapsible, Field, Flex, HStack, IconButton, Text, useDisclosure } from "@chakra-ui/react"
import { SlidersHorizontal, Trash } from "@phosphor-icons/react"
import { format, parse } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { IRequirementTemplateForm } from "."
import { datefnsAppDateFormat } from "../../../../../constants"
import { useMst } from "../../../../../setup/root"
import { IBlockConditional, IRequirementTemplateSectionAttributes } from "../../../../../types/api-request"
import { EConditionalOperator, EConditionalThen, ERequirementType } from "../../../../../types/enums"
import { IOption } from "../../../../../types/types"
import { DatePicker } from "../../../../shared/date-picker"

interface IProps {
  sectionIndex: number
  blockIndex: number
}

const SUPPORTED_TRIGGER_INPUT_TYPES: ERequirementType[] = [
  ERequirementType.text,
  ERequirementType.textArea,
  ERequirementType.phone,
  ERequirementType.email,
  ERequirementType.address,
  ERequirementType.bcaddress,
  ERequirementType.select,
  ERequirementType.radio,
  ERequirementType.multiOptionSelect,
  ERequirementType.checkbox,
  ERequirementType.number,
  ERequirementType.date,
  ERequirementType.file,
]

const OPTION_INPUT_TYPES: ERequirementType[] = [
  ERequirementType.select,
  ERequirementType.radio,
  ERequirementType.multiOptionSelect,
  ERequirementType.checkbox,
]

const VALUELESS_OPERATORS = [EConditionalOperator.isEmpty, EConditionalOperator.isNotEmpty]

const OPERATORS_BY_TYPE: Record<string, EConditionalOperator[]> = {
  number: [
    EConditionalOperator.isEqual,
    EConditionalOperator.isNotEqual,
    EConditionalOperator.greaterThan,
    EConditionalOperator.greaterThanOrEqual,
    EConditionalOperator.lessThan,
    EConditionalOperator.lessThanOrEqual,
  ],
  date: [
    EConditionalOperator.isDateEqual,
    EConditionalOperator.isNotDateEqual,
    EConditionalOperator.dateGreaterThan,
    EConditionalOperator.dateGreaterThanOrEqual,
    EConditionalOperator.dateLessThan,
    EConditionalOperator.dateLessThanOrEqual,
  ],
  file: [EConditionalOperator.isEmpty, EConditionalOperator.isNotEmpty],
  default: [EConditionalOperator.isEqual, EConditionalOperator.isNotEqual],
}

function getOperatorsForType(inputType: string | undefined): EConditionalOperator[] {
  if (!inputType) return OPERATORS_BY_TYPE.default
  if (inputType === ERequirementType.number) return OPERATORS_BY_TYPE.number
  if (inputType === ERequirementType.date) return OPERATORS_BY_TYPE.date
  if (inputType === ERequirementType.file) return OPERATORS_BY_TYPE.file
  return OPERATORS_BY_TYPE.default
}

export const BlockConditionalConfig = observer(function BlockConditionalConfig({ sectionIndex, blockIndex }: IProps) {
  const { t } = useTranslation()
  const { requirementBlockStore } = useMst()
  const { watch, setValue } = useFormContext<IRequirementTemplateForm>()
  const { open, onToggle, onOpen } = useDisclosure()

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

  const availableOperators = useMemo(
    () => getOperatorsForType(selectedRequirement?.inputType),
    [selectedRequirement?.inputType]
  )

  const operatorOptions: IOption[] = useMemo(
    () =>
      availableOperators.map((op) => ({
        label: t(`requirementsLibrary.modals.conditionalSetup.operators.${op}`),
        value: op,
      })),
    [availableOperators, t]
  )

  const currentOperator =
    conditional?.operator || (availableOperators.length > 0 ? availableOperators[0] : EConditionalOperator.isEqual)
  const isValueless = VALUELESS_OPERATORS.includes(currentOperator as EConditionalOperator)

  const valueOptions: IOption[] = useMemo(() => {
    if (!selectedRequirement || isValueless) return []
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
  }, [selectedRequirement, isValueless])

  const isOptionType = selectedRequirement && OPTION_INPUT_TYPES.includes(selectedRequirement.inputType)

  const effectOptions: IOption[] = [
    { label: t("requirementTemplate.edit.blockConditional.showBlock"), value: EConditionalThen.show },
    { label: t("requirementTemplate.edit.blockConditional.hideBlock"), value: EConditionalThen.hide },
  ]

  const currentEffect = conditional?.show ? EConditionalThen.show : conditional?.hide ? EConditionalThen.hide : null

  const handleBlockChange = (opt: IOption) => {
    setValue(
      conditionalPath,
      {
        whenBlockId: opt.value,
        whenRequirementCode: "",
        operator: EConditionalOperator.isEqual,
        eq: "",
        show: true,
      } as IBlockConditional,
      { shouldDirty: true }
    )
  }

  const handleFieldChange = (opt: IOption) => {
    const current = conditional || ({} as IBlockConditional)
    const targetReq = selectedBlock?.requirements.find((r) => r.requirementCode === opt.value)
    const ops = getOperatorsForType(targetReq?.inputType)
    const defaultOp = ops[0] || EConditionalOperator.isEqual
    setValue(
      conditionalPath,
      {
        ...current,
        whenRequirementCode: opt.value,
        operator: defaultOp,
        eq: "",
      } as IBlockConditional,
      { shouldDirty: true }
    )
  }

  const handleOperatorChange = (opt: IOption) => {
    const current = conditional || ({} as IBlockConditional)
    const newOp = opt.value
    setValue(
      conditionalPath,
      {
        ...current,
        operator: newOp,
        eq: VALUELESS_OPERATORS.includes(newOp as EConditionalOperator) ? "" : current.eq,
      } as IBlockConditional,
      { shouldDirty: true }
    )
  }

  const handleValueChange = (val: string) => {
    const current = (conditional || {}) as Record<string, any>
    setValue(conditionalPath, { ...current, eq: val } as IBlockConditional, { shouldDirty: true })
  }

  const handleEffectChange = (opt: IOption) => {
    const current = conditional || ({} as IBlockConditional)
    const updated: IBlockConditional = {
      whenBlockId: current.whenBlockId,
      whenRequirementCode: current.whenRequirementCode,
      operator: current.operator,
      eq: current.eq,
    }
    if (opt.value === EConditionalThen.show) {
      updated.show = true
    } else {
      updated.hide = true
    }
    setValue(conditionalPath, updated, { shouldDirty: true })
  }

  const handleRemove = () => {
    setValue(conditionalPath, null, { shouldDirty: true })
  }

  const hasConditional =
    conditional?.whenBlockId &&
    conditional?.whenRequirementCode &&
    conditional?.operator &&
    (isValueless || conditional?.eq)

  if (hasConditional && !open) {
    const blockName = selectedBlock?.displayName || selectedBlock?.name || ""
    const fieldLabel = selectedRequirement?.label || conditional.whenRequirementCode
    const effect = conditional.show
      ? t("requirementTemplate.edit.blockConditional.showBlock")
      : t("requirementTemplate.edit.blockConditional.hideBlock")
    const operatorLabel = t(`requirementsLibrary.modals.conditionalSetup.operators.${conditional.operator}`)

    return (
      <HStack
        bg="semantic.infoLight"
        px={4}
        py={2}
        borderRadius="md"
        gap={3}
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
            operatorLabel,
            value: isValueless ? "" : `"${conditional.eq}"`,
          })}
        </Text>
        <IconButton
          aria-label={t("requirementTemplate.edit.blockConditional.removeConditional")}
          size="xs"
          variant="ghost"
          color="error"
          onClick={(e) => {
            e.stopPropagation()
            handleRemove()
          }}
        >
          <Trash size={14} />
        </IconButton>
      </HStack>
    )
  }

  return (
    <Box>
      {!open && !hasConditional && (
        <Button variant="plain" size="xs" color="text.link" onClick={onToggle}>
          <SlidersHorizontal size={12} />
          {t("requirementTemplate.edit.blockConditional.addConditional")}
        </Button>
      )}
      <Collapsible.Root open={open}>
        <Collapsible.Content>
          <Box border="1px solid" borderColor="border.light" borderRadius="md" p={4} mt={1} bg="greys.grey03">
            <Flex direction="column" gap={3}>
              <Flex direction="column" gap={1}>
                <Field.Label fontSize="xs" fontWeight="bold" mb={0}>
                  {t("requirementTemplate.edit.blockConditional.whenBlock")}
                </Field.Label>
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
                  <Field.Label fontSize="xs" fontWeight="bold" mb={0}>
                    {t("requirementTemplate.edit.blockConditional.whenField")}
                  </Field.Label>
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
                  <Field.Label fontSize="xs" fontWeight="bold" mb={0}>
                    {t("requirementTemplate.edit.blockConditional.operator")}
                  </Field.Label>
                  <Select
                    options={operatorOptions}
                    value={operatorOptions.find((o) => o.value === currentOperator) || operatorOptions[0]}
                    onChange={handleOperatorChange}
                    placeholder={t("requirementTemplate.edit.blockConditional.selectOperator")}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                </Flex>
              )}

              {conditional?.whenRequirementCode && !isValueless && (
                <Flex direction="column" gap={1}>
                  <Field.Label fontSize="xs" fontWeight="bold" mb={0}>
                    {t("requirementTemplate.edit.blockConditional.value")}
                  </Field.Label>
                  {isOptionType ? (
                    <Select
                      options={valueOptions}
                      value={valueOptions.find((o) => o.value === conditional?.eq) || null}
                      onChange={(opt) => handleValueChange(opt?.value || "")}
                      placeholder={t("requirementTemplate.edit.blockConditional.selectValue")}
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    />
                  ) : selectedRequirement?.inputType === ERequirementType.date ? (
                    <DatePicker
                      selected={conditional?.eq ? parse(conditional.eq, datefnsAppDateFormat, new Date()) : null}
                      onChange={(date: Date) => handleValueChange(date ? format(date, datefnsAppDateFormat) : "")}
                      containerProps={{
                        w: "full",
                        sx: {
                          ".react-datepicker-wrapper": { w: "full" },
                          ".react-datepicker__input-container": { w: "full" },
                        },
                      }}
                    />
                  ) : (
                    <input
                      type={selectedRequirement?.inputType === ERequirementType.number ? "number" : "text"}
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
                  <Field.Label fontSize="xs" fontWeight="bold" mb={0}>
                    {t("requirementTemplate.edit.blockConditional.then")}
                  </Field.Label>
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
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  )
})
