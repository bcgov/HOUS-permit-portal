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
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IRequirementBlockForm } from "../requirements-block-modal"

interface IProps {
  triggerButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps) => JSX.Element
  index: number
}

export const DataValidationSetupModal = observer(({ triggerButtonProps, renderTriggerButton, index }: IProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()

  const { control, setValue } = useFormContext<IRequirementBlockForm>()

  const onReset = () => {
    setValue(`requirementsAttributes.${index}.inputOptions.dataValidation`, undefined)
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
                <Text fontWeight="bold">
                  {t("requirementsLibrary.modals.dataValidationSetup.valueMustBe", "Value must be:")}
                </Text>

                <Controller
                  name={`requirementsAttributes.${index}.inputOptions.dataValidation.operation`}
                  control={control}
                  defaultValue="min"
                  render={({ field: { onChange, value } }) => (
                    <RadioGroup onChange={onChange} value={value || "min"}>
                      <Stack direction="column">
                        <Radio value="min">
                          {t("requirementsLibrary.modals.dataValidationSetup.greaterOrEqual", "Greater or equal to")}
                        </Radio>
                        <Radio value="max">
                          {t("requirementsLibrary.modals.dataValidationSetup.lessOrEqual", "Less than or equal to")}
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  )}
                />

                <Box>
                  <FormLabel fontSize="sm" mb={1}>
                    {t("requirementsLibrary.modals.dataValidationSetup.thisNumber", "this number")}
                  </FormLabel>
                  <Controller
                    name={`requirementsAttributes.${index}.inputOptions.dataValidation.value`}
                    control={control}
                    render={({ field }) => <Input {...field} type="number" width="150px" bg="white" />}
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
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={t(
                          "requirementsLibrary.modals.dataValidationSetup.errorMessagePlaceholder",
                          "Value must be greater than or equal to ..."
                        )}
                        bg="white"
                      />
                    )}
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
})
