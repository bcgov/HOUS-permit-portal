import {
  Box,
  Button,
  ButtonGroup,
  ButtonProps,
  Flex,
  FormLabel,
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
import React, { useMemo } from "react"
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

export const DataValidationSetupModal = observer(
  ({ triggerButtonProps, renderTriggerButton, index, requirementType }: IProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { t } = useTranslation()

    const { control, setValue } = useFormContext<IRequirementBlockForm>()

    const onReset = () => {
      setValue(`requirementsAttributes.${index}.inputOptions.dataValidation`, undefined, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    }

    const validationConfig = useMemo(() => {
      const configs: Partial<
        Record<
          ERequirementType,
          {
            defaultOperation: string
            operations: { value: string; label: string }[]
            valueLabel: string
            errorMessagePlaceholder: string
            renderInput: (props: { onChange: (val: any) => void; value: any }) => JSX.Element
          }
        >
      > = {
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
          renderInput: ({ onChange, value }) => (
            <Input onChange={onChange} value={value} type="number" width="150px" bg="white" />
          ),
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
          renderInput: ({ onChange, value }) => {
            const parsed = value && value.length > 5 ? parseISO(value) : null
            const isValidDate = parsed && isValid(parsed)
            return (
              <DatePicker
                selected={isValidDate ? parsed : null}
                onChange={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
              />
            )
          },
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
          renderInput: ({ onChange, value }) => (
            <Input onChange={onChange} value={value} type="number" width="150px" bg="white" />
          ),
        },
      }

      return configs[requirementType] || configs[ERequirementType.number]
    }, [requirementType, t])

    const { defaultOperation, operations, valueLabel, errorMessagePlaceholder, renderInput } = validationConfig

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

                  <Box>
                    <FormLabel fontSize="sm" mb={1}>
                      {valueLabel}
                    </FormLabel>
                    <Controller
                      name={`requirementsAttributes.${index}.inputOptions.dataValidation.value`}
                      control={control}
                      render={({ field: { onChange, value } }) => renderInput({ onChange, value })}
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
