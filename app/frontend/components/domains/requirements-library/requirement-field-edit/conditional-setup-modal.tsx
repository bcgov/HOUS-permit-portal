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
  Radio,
  RadioGroup,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { SlidersHorizontal } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { IOption } from "../../../../types/types"
import { NumberFormControl, TextFormControl } from "../../../shared/form/input-form-control"
import { RequirementSelect } from "../../../shared/select/selectors/requirement-select"
import { IRequirementBlockForm } from "../requirements-block-modal"

interface IProps {
  triggerButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps) => JSX.Element
  index: number
}

export const ConditionalSetupModal = observer(({ triggerButtonProps, renderTriggerButton, index }: IProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()

  const formMethods = useFormContext<IRequirementBlockForm>()

  const { control, watch, setValue } = formMethods

  const watchedLabel = watch(`requirementsAttributes.${index}.label`)

  const watchedWhen = watch(`requirementsAttributes.${index}.inputOptions.conditional.when`)
  const watchedComparison = watch(`requirementsAttributes.${index}.inputOptions.conditional.comparison`)
  const watchedOperand = watch(`requirementsAttributes.${index}.inputOptions.conditional.operand`)
  const watchedThen = watch(`requirementsAttributes.${index}.inputOptions.conditional.then`)
  const allFieldsProvided = watchedWhen && watchedComparison && watchedOperand && watchedThen

  const watchedRequirements = watch(`requirementsAttributes`)
  const watchedRequirementCode = watch(`requirementsAttributes.${index}.requirementCode`)
  const selectedRequirementAttr = watchedRequirements?.find((reqAttr) => reqAttr.requirementCode === watchedWhen)

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const toggleShowAdvanced = () => setShowAdvanced((cur) => !cur)

  const [operandOptions, setOperandOptions] = useState<IOption[]>(null)
  const [requirementOptions, setRequirementOptions] = useState<IOption[]>(null)

  const onReset = () => {
    setValue(`requirementsAttributes.${index}.inputOptions.conditional.when`, null)
    setValue(`requirementsAttributes.${index}.inputOptions.conditional.operand`, null)
    setValue(`requirementsAttributes.${index}.inputOptions.conditional.comparison`, null)
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

  const getRequirementOptions = () => {
    return watchedRequirements
      .map((requirement) => ({ label: requirement.label, value: requirement.requirementCode }))
      .filter((opt) => opt.value !== watchedRequirementCode)
  }

  useEffect(() => {
    setRequirementOptions(getRequirementOptions())
    if (watchedWhen) {
      setOperandOptions(getOperandOptions())
    }
  }, [watchedWhen])

  const effectOptions = ["show", "hide"].map((value) => ({
    value,
    // @ts-ignore
    label: t(`requirementsLibrary.modals.conditionalSetup.${value}`),
  }))

  const getOperandSelectFormControl = (fieldName: keyof IRequirementBlockForm) => {
    if (!watchedWhen) return <></>
    const inputType = watchedRequirements.find((req) => req.requirementCode === watchedWhen).inputType
    if (["text", "textarea", "phone", "email", "address", "bcaddress"].includes(inputType)) {
      return <TextFormControl fieldName={fieldName} />
    } else if (inputType === "number") {
      return <NumberFormControl fieldName={fieldName} />
    } else if (["select", "radio", "multi_option_select", "checkbox"].includes(inputType)) {
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

  return (
    <>
      {renderTriggerButton ? (
        renderTriggerButton({ onClick: onOpen })
      ) : (
        <MenuItem color={"text.primary"} onClick={onOpen} {...triggerButtonProps}>
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
                    name={`requirementsAttributes.${index}.inputOptions.conditional.when`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <RequirementSelect
                        onChange={(opt) => onChange(opt.value)}
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
                    {t("requirementsLibrary.modals.conditionalSetup.satisfies")}
                  </FormLabel>
                  <Flex px={4} gap={4} align="center">
                    {/* Only "eq" available for now */}
                    <Controller
                      name={`requirementsAttributes.${index}.inputOptions.conditional.comparison`}
                      control={control}
                      defaultValue="eq"
                      render={({ field: { onChange, value } }) => (
                        <ComparisonRadioGroup value={"eq"} onChange={onChange} possibleValues={["eq"]} />
                      )}
                    />

                    {getOperandSelectFormControl(
                      `requirementsAttributes.${index}.inputOptions.conditional.operand` as keyof IRequirementBlockForm
                    )}
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
              <Button variant={"primary"} onClick={onClose} isDisabled={!allFieldsProvided}>
                {t("ui.done")}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
})

interface IComparisonRadioGroupProps {
  value: string
  possibleValues: string[]
  onChange: (any) => void
}

const ComparisonRadioGroup: React.FC<IComparisonRadioGroupProps> = ({ value, onChange, possibleValues }) => {
  const { t } = useTranslation()

  return (
    <RadioGroup onChange={onChange} value={value} minW={32}>
      <Stack direction="column">
        {possibleValues.map((value) => (
          <Radio key={value} value={value}>
            {/* @ts-ignore */}
            {t(`requirementsLibrary.modals.conditionalSetup.${value}`)}
          </Radio>
        ))}
      </Stack>
    </RadioGroup>
  )
}

interface IOperandSelectProps {
  selectedOption: IOption
  onChange: (any) => void
  options: IOption[]
}

const OperandSelect: React.FC<IOperandSelectProps> = ({ selectedOption, onChange, options }) => {
  const { t } = useTranslation()

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
  const { t } = useTranslation()

  return <Select options={options} value={selectedOption} onChange={onChange} />
}
