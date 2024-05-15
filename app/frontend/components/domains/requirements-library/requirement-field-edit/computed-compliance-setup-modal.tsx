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
import { computed } from "mobx"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo } from "react"
import { useController, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { useAutoComplianceModuleConfigurations } from "../../../../hooks/resources/use-auto-compliance-module-configurations"
import { useMst } from "../../../../setup/root"
import { EAutoComplianceModule } from "../../../../types/enums"
import { IOption, TComputedCompliance } from "../../../../types/types"
import { IRequirementBlockForm } from "../requirements-block-modal"

interface IProps {
  triggerButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps) => JSX.Element
  requirementIndex: number
}

interface IComputedComplianceForm {
  module: EAutoComplianceModule
  value?: string
}

function formFormDefaults(computedCompliance?: TComputedCompliance): IComputedComplianceForm {
  return { value: computedCompliance?.value, module: computedCompliance?.module }
}

export const ComputedComplianceSetupModal = observer(
  ({ triggerButtonProps, renderTriggerButton, requirementIndex }: IProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { t } = useTranslation()
    const { requirementBlockStore } = useMst()
    const requirementBlockFormMethods = useFormContext<IRequirementBlockForm>()
    const { watch: watchRequirementBlockForm } = requirementBlockFormMethods
    const { autoComplianceModuleConfigurations, error: configurationFetchError } =
      useAutoComplianceModuleConfigurations()

    const watchedRequirementType = watchRequirementBlockForm(`requirementsAttributes.${requirementIndex}.inputType`)
    const watchedComputedCompliance = watchRequirementBlockForm(
      `requirementsAttributes.${requirementIndex}.inputOptions.computedCompliance`
    )
    const availableAutoComplianceModuleConfigurations =
      requirementBlockStore.getAvailableAutoComplianceModuleConfigurationsForRequirementType(watchedRequirementType)

    const {
      control,
      reset,
      setValue,
      formState: { isValid },
      watch,
    } = useForm<IComputedComplianceForm>({ defaultValues: formFormDefaults(watchedComputedCompliance) })

    useEffect(() => {
      if (isOpen) {
        reset(formFormDefaults(watchedComputedCompliance))
      }
    }, [watchedComputedCompliance, isOpen])

    const { field: moduleField } = useController({
      name: "module",
      control,
      rules: {
        required: true,
        validate: {
          isSupportedModule: (value) => value in (autoComplianceModuleConfigurations ?? {}),
        },
      },
    })
    const { field: valueField } = useController({ name: "value", control })

    const moduleSelectOptions = useMemo(
      () =>
        computed(() =>
          availableAutoComplianceModuleConfigurations.map((option) => ({
            value: option.module,
            label: option.label,
          }))
        ),
      []
    ).get()

    const selectedModuleOption = useMemo(
      () => computed(() => moduleSelectOptions.find((option) => option.value === moduleField?.value ?? null)),
      [moduleField?.value]
    ).get()

    const onModuleChange = (option: IOption) => {
      moduleField.onChange(option?.value)
      setValue("value", undefined)
    }

    return (
      <>
        {renderTriggerButton ? (
          renderTriggerButton({ onClick: onOpen })
        ) : (
          <MenuItem color={"text.primary"} onClick={onOpen} {...triggerButtonProps}>
            <HStack spacing={2} fontSize={"sm"}>
              <SlidersHorizontal />
              <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.computedCompliance")}</Text>
            </HStack>
          </MenuItem>
        )}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent maxW={"md"} fontSize={"sm"} color={"text.secondary"}>
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
              {t("requirementsLibrary.modals.optionsMenu.computedCompliance")}
            </ModalHeader>
            <ModalBody py={4}>
              <Flex direction="column" gap={4}>
                <Flex direction="column">
                  <FormLabel fontWeight="bold" size="lg">
                    {t("requirementsLibrary.modals.computedComplianceSetup.module")}
                  </FormLabel>
                  <Box px={4}>
                    <Select options={moduleSelectOptions} value={selectedModuleOption} onChange={onModuleChange} />
                  </Box>
                </Flex>
              </Flex>
            </ModalBody>

            <ModalFooter justifyContent={"flex-start"}>
              <ButtonGroup>
                <Button variant={"secondary"}>{t("ui.reset")}</Button>
                <Button variant={"primary"} onClick={onClose} isDisabled={!isValid}>
                  {t("ui.done")}
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }
)
