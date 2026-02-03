import {
  Box,
  Button,
  ButtonGroup,
  ButtonProps,
  Checkbox,
  Flex,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
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
import { Warning } from "@phosphor-icons/react"
import { format, isValid, parseISO } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EDataValidationOperation, ERequirementType } from "../../../../types/enums"
import { DatePicker } from "../../../shared/date-picker"
import { IRequirementBlockForm } from "../requirements-block-modal"

interface IProps {
  triggerButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps) => JSX.Element
  index: number
  requirementType?: ERequirementType
}

const FILE_GROUPS = [
  {
    label: "Documents & Text",
    options: [
      { label: ".pdf", value: ".pdf" },
      { label: ".docx, .doc", value: ".docx,.doc" },
      { label: ".xlsx, .xls, .xlsm", value: ".xlsx,.xls,.xlsm" },
      { label: ".txt", value: ".txt" },
      { label: ".html", value: ".html,.htm" },
      { label: ".md", value: ".md" },
    ],
  },
  {
    label: "Images",
    options: [
      { label: ".jpg", value: ".jpg,.jpeg" },
      { label: ".png", value: ".png" },
      { label: ".webp", value: ".webp" },
      { label: ".gif", value: ".gif,.gifv" },
      { label: ".svg", value: ".svg" },
    ],
  },
  {
    label: "Revit (Autodesk)",
    options: [
      { label: ".rvt", value: ".rvt" },
      { label: ".rfa", value: ".rfa" },
      { label: ".rte", value: ".rte" },
      { label: ".rft", value: ".rft" },
    ],
  },
  {
    label: "CAD & BIM",
    options: [
      { label: ".dwg", value: ".dwg" },
      { label: ".dxf", value: ".dxf" },
      { label: ".dgn", value: ".dgn" },
      { label: ".dwf", value: ".dwf" },
      { label: ".ifc", value: ".ifc" },
      { label: ".bcf", value: ".bcf" },
      { label: ".skp", value: ".skp" },
      { label: ".bim", value: ".bim" },
      { label: ".sat", value: ".sat" },
      { label: ".gbxml", value: ".gbxml" },
    ],
  },
  {
    label: "Energy & Other",
    options: [{ label: ".h2k", value: ".h2k" }],
  },
]

interface IFileTypeSelectorProps {
  value: string
  onChange: (value: string) => void
}

const FileTypeSelector = ({ value, onChange }: IFileTypeSelectorProps) => {
  const { t } = useTranslation()
  const currentTypes = useMemo(() => (value ? value.split(",").map((t) => t.trim().toLowerCase()) : []), [value])

  const handleCheckboxChange = (typeGroup: string, isChecked: boolean) => {
    const typesInGroup = typeGroup.split(",")
    let newTypes = [...currentTypes]

    if (isChecked) {
      typesInGroup.forEach((t) => {
        if (!newTypes.includes(t)) newTypes.push(t)
      })
    } else {
      newTypes = newTypes.filter((t) => !typesInGroup.includes(t))
    }
    onChange(newTypes.join(","))
  }

  // Flatten standard types to easily check for "other" types
  const standardTypesFlat = useMemo(
    () => FILE_GROUPS.flatMap((group) => group.options.flatMap((opt) => opt.value.split(","))),
    []
  )
  const otherTypes = currentTypes.filter((t) => !standardTypesFlat.includes(t))

  const [inputValue, setInputValue] = useState(otherTypes.join(", "))
  const [isFocused, setIsFocused] = useState(false)
  const [isOtherChecked, setIsOtherChecked] = useState(otherTypes.length > 0)

  useEffect(() => {
    if (!isFocused) {
      setInputValue(otherTypes.join(", "))
    }
  }, [otherTypes.join(","), isFocused])

  useEffect(() => {
    if (otherTypes.length > 0) {
      setIsOtherChecked(true)
    }
  }, [otherTypes.length])

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setInputValue(rawValue)

    const currentStandardTypes = currentTypes.filter((t) => standardTypesFlat.includes(t))
    const newOtherTypes = rawValue
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t)
      .map((t) => (t.startsWith(".") ? t : `.${t}`))

    const combined = [...currentStandardTypes, ...newOtherTypes]
    onChange(combined.join(","))
  }

  return (
    <Box>
      <Stack spacing={4}>
        {FILE_GROUPS.map((group) => (
          <Box key={group.label}>
            <Text fontWeight="bold" fontSize="xs" mb={2} color="text.secondary">
              {group.label}
            </Text>
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
              {group.options.map((opt) => {
                const typesInGroup = opt.value.split(",")
                const isChecked = typesInGroup.every((t) => currentTypes.includes(t))
                return (
                  <GridItem key={opt.value}>
                    <Checkbox isChecked={isChecked} onChange={(e) => handleCheckboxChange(opt.value, e.target.checked)}>
                      {opt.label}
                    </Checkbox>
                  </GridItem>
                )
              })}
            </Grid>
          </Box>
        ))}
        <Box>
          <Text fontWeight="bold" fontSize="xs" mb={2} color="text.secondary">
            {t("ui.other")}
          </Text>
          <HStack>
            <Checkbox
              isChecked={isOtherChecked}
              onChange={(e) => {
                setIsOtherChecked(e.target.checked)
                if (!e.target.checked) {
                  const currentStandardTypes = currentTypes.filter((t) => standardTypesFlat.includes(t))
                  onChange(currentStandardTypes.join(","))
                }
              }}
            >
              {t("ui.other")}:
            </Checkbox>
            <Input
              size="sm"
              value={inputValue}
              onChange={handleOtherChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              bg="white"
              isDisabled={!isOtherChecked}
            />
          </HStack>
        </Box>
      </Stack>
    </Box>
  )
}

interface IValidationConfig {
  defaultOperation: string
  operations: { value: string; label: string }[] | null
  valueLabel: string
  errorMessagePlaceholder: string
}

const useValidationConfig = (requirementType: ERequirementType | undefined): IValidationConfig => {
  const { t } = useTranslation()

  return useMemo<IValidationConfig>(() => {
    const configs: any = {
      [ERequirementType.number]: {
        defaultOperation: "min",
        operations: [
          {
            value: "min",
            label: t("requirementsLibrary.modals.dataValidationSetup.greaterOrEqual"),
          },
          {
            value: "max",
            label: t("requirementsLibrary.modals.dataValidationSetup.lessOrEqual"),
          },
        ],
        valueLabel: t("requirementsLibrary.modals.dataValidationSetup.thisNumber"),
        errorMessagePlaceholder: t("requirementsLibrary.modals.dataValidationSetup.errorMessagePlaceholder"),
      },
      [ERequirementType.date]: {
        defaultOperation: "after",
        operations: [
          {
            value: "after",
            label: t("requirementsLibrary.modals.dataValidationSetup.after"),
          },
          {
            value: "before",
            label: t("requirementsLibrary.modals.dataValidationSetup.before"),
          },
        ],
        valueLabel: t("requirementsLibrary.modals.dataValidationSetup.thisDate"),
        errorMessagePlaceholder: t("requirementsLibrary.modals.dataValidationSetup.dateErrorMessagePlaceholder"),
      },
      [ERequirementType.multiOptionSelect]: {
        defaultOperation: "min_selected_count",
        operations: [
          {
            value: "min_selected_count",
            label: t("requirementsLibrary.modals.dataValidationSetup.minSelectedCount"),
          },
          {
            value: "max_selected_count",
            label: t("requirementsLibrary.modals.dataValidationSetup.maxSelectedCount"),
          },
        ],
        valueLabel: t("requirementsLibrary.modals.dataValidationSetup.thisAmount"),
        errorMessagePlaceholder: t("requirementsLibrary.modals.dataValidationSetup.selectionErrorMessagePlaceholder"),
      },
      [ERequirementType.file]: {
        defaultOperation: "allowed_file_types",
        operations: null,
        valueLabel: t("requirementsLibrary.modals.dataValidationSetup.limitAcceptedFileFormatsTo"),
        errorMessagePlaceholder: t("requirementsLibrary.modals.dataValidationSetup.fileTypeErrorMessagePlaceholder"),
      },
    }

    return configs[requirementType as ERequirementType] || configs[ERequirementType.number]!
  }, [requirementType, t])
}

interface IValidationValueInputProps {
  requirementType: ERequirementType | undefined
  value: any
  onChange: (value: any) => void
}

const ValidationValueInput = ({ requirementType, value, onChange }: IValidationValueInputProps) => {
  switch (requirementType) {
    case ERequirementType.date: {
      const parsed = value && value.length > 5 ? parseISO(value) : null
      const isValidDate = parsed && isValid(parsed)
      return (
        <DatePicker
          selected={isValidDate ? parsed : null}
          onChange={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
        />
      )
    }
    case ERequirementType.file:
      return <FileTypeSelector value={value} onChange={onChange} />
    case ERequirementType.number:
    case ERequirementType.multiOptionSelect:
    default:
      return <Input onChange={onChange} value={value} type="number" width="150px" bg="white" />
  }
}

export const DataValidationSetupModal = observer(
  ({ triggerButtonProps, renderTriggerButton, index, requirementType }: IProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { t } = useTranslation()

    const { control, setValue, getValues } = useFormContext<IRequirementBlockForm>()

    const validationConfig = useValidationConfig(requirementType) as any
    const { defaultOperation, operations, valueLabel, errorMessagePlaceholder } = validationConfig as IValidationConfig

    useEffect(() => {
      if (isOpen) {
        const operationPath = `requirementsAttributes.${index}.inputOptions.dataValidation.operation` as any
        const currentOperation = getValues(operationPath)

        if (!currentOperation && defaultOperation) {
          setValue(operationPath, defaultOperation as EDataValidationOperation, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }
      }
    }, [isOpen, defaultOperation, index, setValue, getValues])

    const onReset = () => {
      setValue(`requirementsAttributes.${index}.inputOptions.dataValidation`, undefined, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }

    return (
      <>
        {renderTriggerButton ? (
          renderTriggerButton({ onClick: onOpen })
        ) : (
          <MenuItem color={"text.primary"} onClick={onOpen} {...triggerButtonProps}>
            <HStack spacing={2} fontSize={"sm"}>
              <Warning />
              <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.dataValidation")}</Text>
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
              <Warning style={{ marginRight: "var(--chakra-space-2)" }} />
              {t("requirementsLibrary.modals.optionsMenu.dataValidation")}
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
                <Flex direction="column" gap={4}>
                  {operations && (
                    <>
                      <Text fontWeight="bold">
                        {t("requirementsLibrary.modals.dataValidationSetup.valueMustBe", "Value must be:")}
                      </Text>

                      <Controller
                        name={`requirementsAttributes.${index}.inputOptions.dataValidation.operation`}
                        control={control}
                        defaultValue={defaultOperation as EDataValidationOperation}
                        render={({ field: { onChange, value } }) => (
                          <RadioGroup onChange={onChange} value={value || defaultOperation}>
                            <Stack direction="column">
                              {operations.map((op) => (
                                <Radio key={op.value} value={op.value}>
                                  {op.label}
                                </Radio>
                              ))}
                            </Stack>
                          </RadioGroup>
                        )}
                      />
                    </>
                  )}
                  {!operations && (
                    <Controller
                      name={`requirementsAttributes.${index}.inputOptions.dataValidation.operation`}
                      control={control}
                      defaultValue={defaultOperation as EDataValidationOperation}
                      render={() => <></>}
                    />
                  )}

                  <Box>
                    <FormLabel fontSize="sm" mb={1} fontWeight={operations ? "normal" : "bold"}>
                      {valueLabel}
                    </FormLabel>
                    <Controller
                      name={`requirementsAttributes.${index}.inputOptions.dataValidation.value`}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <ValidationValueInput requirementType={requirementType} onChange={onChange} value={value} />
                      )}
                    />
                  </Box>

                  <Box>
                    <FormLabel fontSize="sm" mb={1}>
                      {t(
                        "requirementsLibrary.modals.dataValidationSetup.customErrorMessage",
                        "Custom error message (Optional)"
                      )}
                    </FormLabel>
                    <Controller
                      name={`requirementsAttributes.${index}.inputOptions.dataValidation.errorMessage`}
                      control={control}
                      render={({ field }) => <Input {...field} placeholder={errorMessagePlaceholder} bg="white" />}
                    />
                  </Box>
                </Flex>
              </Flex>
            </ModalBody>

            <ModalFooter justifyContent={"flex-start"}>
              <ButtonGroup>
                <Button variant={"primary"} onClick={onClose}>
                  {t("ui.save")}
                </Button>
                <Button variant={"secondary"} onClick={onClose}>
                  {t("ui.cancel")}
                </Button>
                <Button variant={"ghost"} onClick={onReset} ml="auto">
                  {t("ui.reset")}
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }
)
