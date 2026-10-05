import {
  Box,
  Button,
  ButtonGroup,
  ButtonProps,
  Flex,
  FormLabel,
  HStack,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { SlidersHorizontal } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { IFormConditional } from "../../../../types/api-request"
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

interface IConditionalDraft {
  when?: string | null
  operator?: EConditionalOperator | null
  operand?: string | null
  then?: EConditionalThen | null
}

const emptyConditional: IConditionalDraft = {
  when: null,
  operator: null,
  operand: null,
  then: null,
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()

  const formMethods = useFormContext<IRequirementBlockForm>()

  const { watch: watchParent, setValue: setParentValue, getValues: getParentValues } = formMethods
  const draftFormMethods = useForm<IConditionalDraft>({ defaultValues: emptyConditional })
  const { control, watch, setValue, reset, getValues } = draftFormMethods

  const watchedLabel = watchParent(`requirementsAttributes.${index}.label`)

  const watchedWhen = watch("when")
  const watchedOperator = watch("operator")
  const watchedOperand = watch("operand")
  const watchedThen = watch("then")
  const watchedConditional = watchParent(`requirementsAttributes.${index}.inputOptions.conditional`)
  const hasExistingConditional = !!watchedConditional && Object.keys(watchedConditional).length > 0

  const currentOperator = watchedOperator || EConditionalOperator.isEqual
  const isValueless = VALUELESS_OPERATORS.includes(currentOperator as EConditionalOperator)
  const allFieldsProvided = watchedWhen && watchedThen && currentOperator && (isValueless || watchedOperand)

  const watchedRequirements = watchParent(`requirementsAttributes`)
  const watchedRequirementCode = watchParent(`requirementsAttributes.${index}.requirementCode`)
  const selectedRequirementAttr = watchedRequirements?.find((reqAttr) => reqAttr.requirementCode === watchedWhen)

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const toggleShowAdvanced = () => setShowAdvanced((cur) => !cur)

  const [operandOptions, setOperandOptions] = useState<IOption[]>(null)
  const [requirementOptions, setRequirementOptions] = useState<IOption[]>(null)

  const onReset = () => {
    reset()
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

  const getOperandSelectFormControl = () => {
    if (!watchedWhen || isValueless) return <></>

    if (textInputTypes.includes(inputType)) {
      return <TextFormControl fieldName="operand" />
    } else if (inputType === numberInputType) {
      return <NumberFormControl fieldName="operand" />
    } else if (inputType === dateInputType) {
      return <DatePickerFormControl fieldName="operand" />
    } else if (optionInputTypes.includes(inputType)) {
      return (
        <Controller
          name="operand"
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
    setValue("operand", null)
    const targetReq = watchedRequirements?.find((r) => r.requirementCode === opt.value)
    const ops = getOperatorsForInputType(targetReq?.inputType)
    setValue("operator", ops[0] || EConditionalOperator.isEqual)
    onChange(opt.value)
  }

  const openModal = () => {
    const conditional = getParentValues(`requirementsAttributes.${index}.inputOptions.conditional`)
    reset(conditional ? ({ ...conditional } as IConditionalDraft) : emptyConditional)
    onOpen()
  }

  const onDone = () => {
    setParentValue(`requirementsAttributes.${index}.inputOptions.conditional`, getValues() as IFormConditional, {
      shouldDirty: true,
    })
    onClose()
  }

  const onRemove = () => {
    setParentValue(`requirementsAttributes.${index}.inputOptions.conditional`, undefined, { shouldDirty: true })
    onClose()
  }

  return (
    <>
      {renderTriggerButton ? (
        renderTriggerButton({ onClick: openModal })
      ) : (
        <MenuItem color={"text.primary"} onClick={openModal} {...triggerButtonProps}>
          <HStack spacing={2} fontSize={"sm"}>
            <SlidersHorizontal />
            <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.conditionalLogic")}</Text>
          </HStack>
        </MenuItem>
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW={"600px"} fontSize={"sm"} color={"text.secondary"}>
          <ModalCloseButton />
          <ModalHeader
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
          </ModalHeader>
          <ModalBody
            py={4}
            sx={{
              pre: {
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
                <FormLabel fontWeight="bold" size="lg">
                  {t("requirementsLibrary.modals.conditionalSetup.when")}
                </FormLabel>
                <Box px={4}>
                  <Controller
                    name="when"
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
                  <FormLabel fontWeight="bold" size="lg">
                    {t("requirementsLibrary.modals.conditionalSetup.operator")}
                  </FormLabel>
                  <Box px={4}>
                    <Controller
                      name="operator"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          options={operatorSelectOptions}
                          value={operatorSelectOptions.find((o) => o.value === value) || operatorSelectOptions[0]}
                          onChange={(opt) => {
                            const newOp = opt?.value
                            if (VALUELESS_OPERATORS.includes(newOp as EConditionalOperator)) {
                              setValue("operand", null)
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
                  <FormLabel fontWeight="bold" size="lg">
                    {t("requirementsLibrary.modals.conditionalSetup.satisfies")}
                  </FormLabel>
                  <Flex px={4} gap={4} align="center">
                    <FormProvider {...draftFormMethods}>{getOperandSelectFormControl()}</FormProvider>
                  </Flex>
                </Flex>
              )}

              {watchedWhen && (
                <Flex direction="column" bg="theme.blueLight" p={4}>
                  <FormLabel fontWeight="bold" size="lg">
                    {t("requirementsLibrary.modals.conditionalSetup.then")}
                  </FormLabel>
                  <Text fontSize="sm" pb={4} color="text.secondary">
                    "{watchedLabel}"
                  </Text>
                  <Box px={4}>
                    <Controller
                      name="then"
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
                <Button variant="link" onClick={toggleShowAdvanced}>
                  {showAdvanced ? t("ui.hideAdvanced") : t("ui.showAdvanced")}
                </Button>
                {showAdvanced && <pre>{JSON.stringify(watchedRequirements, null, 2)}</pre>}
              </Box>
            </Flex>
          </ModalBody>

          <ModalFooter justifyContent={"flex-start"}>
            <ButtonGroup>
              <Button variant={"secondary"} onClick={onReset}>
                {t("ui.reset")}
              </Button>
              <Button
                variant={"primary"}
                onClick={onDone}
                isDisabled={!allFieldsProvided || !isSupportedInputType(inputType)}
              >
                {t("ui.done")}
              </Button>
              <Button variant={"secondary"} onClick={onClose}>
                {t("ui.cancel")}
              </Button>
              {hasExistingConditional && (
                <Button variant={"ghost"} color={"semantic.error"} onClick={onRemove}>
                  {t("ui.remove")}
                </Button>
              )}
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
