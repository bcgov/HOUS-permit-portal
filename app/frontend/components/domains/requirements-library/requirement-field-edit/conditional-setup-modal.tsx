import {
  Box,
  Button,
  ButtonGroup,
  ButtonProps,
  Dialog,
  Field,
  Flex,
  HStack,
  Menu,
  Portal,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { SlidersHorizontal } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { EConditionalOperator, EConditionalThen } from "../../../../types/enums"
import { IOption } from "../../../../types/types"
import { DatePickerFormControl, NumberFormControl, TextFormControl } from "../../../shared/form/input-form-control"
import { RequirementSelect } from "../../../shared/select/selectors/requirement-select"
import { IRequirementBlockForm } from "../requirements-block-modal"

interface IProps {
  triggerButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps) => JSX.Element
  index: number
}

const textInputTypes = ["text", "textarea", "phone", "email", "address", "bcaddress"]
const optionInputTypes = ["select", "radio", "multi_option_select", "checkbox"]
const numberInputType = "number"
const dateInputType = "date"
const fileInputType = "file"
const supportedInputTypes = [...textInputTypes, ...optionInputTypes, numberInputType, dateInputType, fileInputType]

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

function getOperatorsForInputType(inputType: string | undefined): EConditionalOperator[] {
  if (!inputType) return OPERATORS_BY_TYPE.default
  if (inputType === numberInputType) return OPERATORS_BY_TYPE.number
  if (inputType === dateInputType) return OPERATORS_BY_TYPE.date
  if (inputType === fileInputType) return OPERATORS_BY_TYPE.file
  return OPERATORS_BY_TYPE.default
}

export const ConditionalSetupModal = observer(({ triggerButtonProps, renderTriggerButton, index }: IProps) => {
  const { open, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()

  const formMethods = useFormContext<IRequirementBlockForm>()

  const { control, watch, setValue } = formMethods

  const watchedLabel = watch(`requirementsAttributes.${index}.label`)

  const watchedWhen = watch(`requirementsAttributes.${index}.inputOptions.conditional.when`)
  const watchedOperator = watch(`requirementsAttributes.${index}.inputOptions.conditional.operator`)
  const watchedOperand = watch(`requirementsAttributes.${index}.inputOptions.conditional.operand`)
  const watchedThen = watch(`requirementsAttributes.${index}.inputOptions.conditional.then`)

  const currentOperator = watchedOperator || EConditionalOperator.isEqual
  const isValueless = VALUELESS_OPERATORS.includes(currentOperator as EConditionalOperator)
  const allFieldsProvided = watchedWhen && watchedThen && currentOperator && (isValueless || watchedOperand)

  const watchedRequirements = watch(`requirementsAttributes`)
  const watchedRequirementCode = watch(`requirementsAttributes.${index}.requirementCode`)
  const selectedRequirementAttr = watchedRequirements?.find((reqAttr) => reqAttr.requirementCode === watchedWhen)

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const toggleShowAdvanced = () => setShowAdvanced((cur) => !cur)

  const [operandOptions, setOperandOptions] = useState<IOption[]>(null)
  const [requirementOptions, setRequirementOptions] = useState<IOption[]>(null)

  const onReset = () => {
    setValue(`requirementsAttributes.${index}.inputOptions.conditional.when`, null)
    setValue(`requirementsAttributes.${index}.inputOptions.conditional.operator`, null)
    setValue(`requirementsAttributes.${index}.inputOptions.conditional.operand`, null)
    setValue(`requirementsAttributes.${index}.inputOptions.conditional.then`, null)
  }

  const getOperandOptions = () => {
    if (selectedRequirementAttr?.inputOptions?.valueOptions) {
      return selectedRequirementAttr?.inputOptions.valueOptions
    }
    if (selectedRequirementAttr?.inputType === "checkbox") {
      return [
        { label: t("ui.checked"), value: "true" },
        { label: t("ui.unchecked"), value: "false" },
      ]
    }
    return []
  }

  const isSupportedInputType = (type: string) => {
    return supportedInputTypes.includes(type)
  }

  const getRequirementOptions = () => {
    return watchedRequirements
      .filter((requirement) => requirement.requirementCode !== watchedRequirementCode)
      .map((requirement) => ({
        label: requirement.label + (!isSupportedInputType(requirement.inputType) ? ` (${t("ui.notSupported")})` : ""),
        value: requirement.requirementCode,
      }))
  }

  useEffect(() => {
    setRequirementOptions(getRequirementOptions())
    if (watchedWhen) {
      setOperandOptions(getOperandOptions())
    }
  }, [watchedWhen])

  const inputType = watchedRequirements?.find((req) => req.requirementCode === watchedWhen)?.inputType

  const availableOperators = useMemo(() => getOperatorsForInputType(inputType), [inputType])

  const operatorSelectOptions: IOption[] = useMemo(
    () =>
      availableOperators.map((op) => ({
        label: t(`requirementsLibrary.modals.conditionalSetup.operators.${op}`),
        value: op,
      })),
    [availableOperators, t]
  )

  const effectOptions = ([EConditionalThen.show, EConditionalThen.hide] as const).map((value) => ({
    value,
    label: t(`requirementsLibrary.modals.conditionalSetup.${value}`),
  }))

  const getOperandSelectFormControl = (fieldName: keyof IRequirementBlockForm) => {
    if (!watchedWhen || isValueless) return <></>

    if (textInputTypes.includes(inputType)) {
      return <TextFormControl fieldName={fieldName} />
    } else if (inputType === numberInputType) {
      return <NumberFormControl fieldName={fieldName} />
    } else if (inputType === dateInputType) {
      return <DatePickerFormControl fieldName={fieldName} />
    } else if (optionInputTypes.includes(inputType)) {
      return (
        <Controller
          name={fieldName}
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <OperandSelect
                onChange={(opt) => onChange(opt.value)}
                options={operandOptions}
                selectedOption={value && operandOptions?.find((option) => option.value === value)}
              />
            )
          }}
        />
      )
    } else {
      return <Text>{t("requirementsLibrary.inputNotSupported")}</Text>
    }
  }

  const handleWhenChange = (opt: IOption, onChange: (val: string) => void) => {
    setValue(`requirementsAttributes.${index}.inputOptions.conditional.operand`, null)
    const targetReq = watchedRequirements?.find((r) => r.requirementCode === opt.value)
    const ops = getOperatorsForInputType(targetReq?.inputType)
    setValue(
      `requirementsAttributes.${index}.inputOptions.conditional.operator`,
      ops[0] || EConditionalOperator.isEqual
    )
    onChange(opt.value)
  }

  return (
    <>
      {renderTriggerButton ? (
        renderTriggerButton({ onClick: onOpen })
      ) : (
        <Menu.Item value="conditional-setup" color={"text.primary"} onClick={onOpen} {...triggerButtonProps}>
          <HStack gap={2} fontSize={"sm"}>
            <SlidersHorizontal />
            <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.conditionalLogic")}</Text>
          </HStack>
        </Menu.Item>
      )}
      <Dialog.Root
        open={open}
        onOpenChange={(e) => {
          if (!e.open) {
            onClose()
          }
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW={"600px"} fontSize={"sm"} color={"text.secondary"}>
              <Dialog.CloseTrigger />
              <Dialog.Header
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                bg={"greys.grey03"}
                borderTopRadius={"md"}
                maxHeight={12}
                fontSize="md"
              >
                <SlidersHorizontal style={{ marginRight: "var(--chakra-space-2)" }} />
                {t("requirementsLibrary.modals.optionsMenu.conditionalLogic")}
              </Dialog.Header>
              <Dialog.Body
                py={4}
                css={{
                  "& pre": {
                    bg: "greys.grey03",
                    px: 4,
                    py: 3,
                    borderRadius: "sm",
                    color: "text.primary",
                  },
                }}
              >
                <Flex direction="column" gap={4}>
                  <Flex direction="column">
                    <Field.Label fontWeight="bold" size="lg">
                      {t("requirementsLibrary.modals.conditionalSetup.when")}
                    </Field.Label>
                    <Box px={4}>
                      <Controller
                        name={`requirementsAttributes.${index}.inputOptions.conditional.when`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <RequirementSelect
                            onChange={(opt) => handleWhenChange(opt, onChange)}
                            options={requirementOptions}
                            selectedOption={value && requirementOptions?.find((option) => option.value === value)}
                          />
                        )}
                      />
                    </Box>
                  </Flex>

                  {watchedWhen && (
                    <Flex direction="column">
                      <Field.Label fontWeight="bold" size="lg">
                        {t("requirementsLibrary.modals.conditionalSetup.operator")}
                      </Field.Label>
                      <Box px={4}>
                        <Controller
                          name={`requirementsAttributes.${index}.inputOptions.conditional.operator`}
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <Select
                              options={operatorSelectOptions}
                              value={operatorSelectOptions.find((o) => o.value === value) || operatorSelectOptions[0]}
                              onChange={(opt) => {
                                const newOp = opt?.value
                                if (VALUELESS_OPERATORS.includes(newOp as EConditionalOperator)) {
                                  setValue(`requirementsAttributes.${index}.inputOptions.conditional.operand`, null)
                                }
                                onChange(newOp)
                              }}
                            />
                          )}
                        />
                      </Box>
                    </Flex>
                  )}

                  {watchedWhen && !isValueless && (
                    <Flex direction="column">
                      <Field.Label fontWeight="bold" size="lg">
                        {t("requirementsLibrary.modals.conditionalSetup.satisfies")}
                      </Field.Label>
                      <Flex px={4} gap={4} align="center">
                        {getOperandSelectFormControl(
                          `requirementsAttributes.${index}.inputOptions.conditional.operand` as keyof IRequirementBlockForm
                        )}
                      </Flex>
                    </Flex>
                  )}

                  {watchedWhen && (
                    <Flex direction="column" bg="theme.blueLight" p={4}>
                      <Field.Label fontWeight="bold" size="lg">
                        {t("requirementsLibrary.modals.conditionalSetup.then")}
                      </Field.Label>
                      <Text fontSize="sm" pb={4} color="text.secondary">
                        "{watchedLabel}"
                      </Text>
                      <Box px={4}>
                        <Controller
                          name={`requirementsAttributes.${index}.inputOptions.conditional.then`}
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <EffectSelect
                              onChange={(opt) => onChange(opt.value)}
                              options={effectOptions}
                              selectedOption={effectOptions?.find((option) => option.value === value)}
                            />
                          )}
                        />
                      </Box>
                    </Flex>
                  )}
                  <Box overflow="auto">
                    <Button variant="plain" onClick={toggleShowAdvanced}>
                      {showAdvanced ? t("ui.hideAdvanced") : t("ui.showAdvanced")}
                    </Button>
                    {showAdvanced && <pre>{JSON.stringify(watchedRequirements, null, 2)}</pre>}
                  </Box>
                </Flex>
              </Dialog.Body>
              <Dialog.Footer justifyContent={"flex-start"}>
                <ButtonGroup>
                  <Button variant={"secondary"} onClick={onReset}>
                    {t("ui.reset")}
                  </Button>
                  <Button
                    variant={"primary"}
                    onClick={onClose}
                    disabled={!allFieldsProvided || !isSupportedInputType(inputType)}
                  >
                    {t("ui.done")}
                  </Button>
                </ButtonGroup>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
})

interface IOperandSelectProps {
  selectedOption: IOption
  onChange: (any) => void
  options: IOption[]
}

const OperandSelect: React.FC<IOperandSelectProps> = ({ selectedOption, onChange, options }) => {
  const customStyles = {
    container: (base: any) => ({
      ...base,
      width: "100%",
    }),
  }

  return <Select options={options} value={selectedOption} onChange={onChange} styles={customStyles} />
}

interface IEffectSelectProps {
  selectedOption: IOption
  onChange: (any) => void
  options: IOption[]
}

const EffectSelect: React.FC<IEffectSelectProps> = ({ selectedOption, onChange, options }) => {
  return <Select options={options} value={selectedOption} onChange={onChange} />
}
