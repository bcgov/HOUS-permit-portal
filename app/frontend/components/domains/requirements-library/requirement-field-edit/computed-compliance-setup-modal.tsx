import {
  Box,
  Button,
  ButtonGroup,
  ButtonProps,
  FormControl,
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
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { Form } from "@formio/react"
import { LightningA } from "@phosphor-icons/react"
import { computed } from "mobx"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo } from "react"
import { useController, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Select from "react-select"
import { VALUE_EXTRACTION_AUTO_COMPLIANCE_TYPES } from "../../../../constants"
import { useAutoComplianceModuleConfigurations } from "../../../../hooks/resources/use-auto-compliance-module-configurations"
import { useMst } from "../../../../setup/root"
import { EAutoComplianceModule } from "../../../../types/enums"
import {
  IOption,
  TAutoComplianceModuleConfiguration,
  TComputedCompliance,
  TValueExtractorAutoComplianceModuleConfiguration,
} from "../../../../types/types"
import { IRequirementBlockForm } from "../requirements-block-modal"
import onSubmit = Form.propTypes.onSubmit

interface IProps {
  triggerButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps) => JSX.Element
  requirementIndex: number
}

interface IComputedComplianceForm {
  module: EAutoComplianceModule | null
  value?: string | null
}

const MODULE_SELECT_LABEL_ID = "compliance-module-select-label"
const MODULE_SELECT_ID = "compliance-module-select-id"
const VALUE_EXTRACTION_FIELD_SELECT_LABEL_ID = "compliance-extraction-field-select-label"
const VALUE_EXTRACTION_FIELD_SELECT_ID = "compliance-extraction-field-select-id"

function isValueExtractorModuleConfiguration(moduleConfiguration?: TAutoComplianceModuleConfiguration) {
  return VALUE_EXTRACTION_AUTO_COMPLIANCE_TYPES.includes(moduleConfiguration?.type)
}

export const ComputedComplianceSetupModal = observer(
  ({ triggerButtonProps, renderTriggerButton, requirementIndex }: IProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { t } = useTranslation()
    const { requirementBlockStore } = useMst()
    const requirementBlockFormMethods = useFormContext<IRequirementBlockForm>()
    const { watch: watchRequirementBlockForm, setValue: setRequirementBlockFormValue } = requirementBlockFormMethods
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
      handleSubmit,
      watch,
    } = useForm<IComputedComplianceForm>({ defaultValues: formFormDefaults(watchedComputedCompliance) })

    const watchedModule = watch("module")
    const watchedValueExtractionField = watch("value")

    useEffect(() => {
      if (isOpen) {
        reset(formFormDefaults(watchedComputedCompliance))
      }
    }, [watchedComputedCompliance, isOpen, autoComplianceModuleConfigurations])

    const { field: moduleField } = useController({
      name: "module",
      control,
      rules: {
        validate: {
          isSupportedModule: (module) =>
            module in (autoComplianceModuleConfigurations ?? {}) &&
            autoComplianceModuleConfigurations[module].availableOnInputTypes.includes(watchedRequirementType),
        },
      },
    })
    const { field: valueExtractionField } = useController({
      name: "value",
      control,
      rules: {
        required: isValueExtractorModuleConfiguration(autoComplianceModuleConfigurations?.[watchedModule]),
        validate: {
          isValidField: isValidValueExtractionField,
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

    const selectedModuleOption = useMemo(() => {
      return moduleSelectOptions.find((option) => option.value === watchedModule) ?? null
    }, [moduleSelectOptions, watchedModule])

    const valueExtractionFieldOptions = useMemo(
      () =>
        computed(() => {
          const moduleConfiguration = autoComplianceModuleConfigurations?.[selectedModuleOption?.value]

          if (!moduleConfiguration || !isValueExtractorModuleConfiguration(moduleConfiguration)) {
            return null
          }

          return (moduleConfiguration as TValueExtractorAutoComplianceModuleConfiguration).availableFields.map(
            (field) => ({ ...field })
          )
        }),
      [selectedModuleOption]
    ).get()

    const selectedValueExtractionFieldOption = useMemo(() => {
      return valueExtractionFieldOptions?.find((option) => option.value === watchedValueExtractionField) ?? null
    }, [watchedValueExtractionField, valueExtractionFieldOptions])

    const onModuleChange = (option: IOption) => {
      moduleField.onChange(option.value)
      setValue("value", null)
    }

    const onValueExtractionFieldChange = (option: IOption) => {
      valueExtractionField.onChange(option.value)
    }

    const isSetupDisabled = availableAutoComplianceModuleConfigurations.length === 0
    return (
      <>
        {renderTriggerButton ? (
          renderTriggerButton({
            onClick: onOpen,
            isDisabled: isSetupDisabled,
          })
        ) : (
          <MenuItem color={"text.primary"} onClick={onOpen} isDisabled={isSetupDisabled} {...triggerButtonProps}>
            <HStack spacing={2} fontSize={"sm"}>
              <LightningA weight={"fill"} />
              <Text as={"span"}>{t("requirementsLibrary.modals.optionsMenu.automatedCompliance")}</Text>
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
              <LightningA weight={"fill"} style={{ marginRight: "var(--chakra-space-2)" }} />
              {t("requirementsLibrary.modals.optionsMenu.automatedCompliance")}
            </ModalHeader>
            <ModalBody py={4}>
              <Stack direction="column" spacing={6}>
                <FormControl isRequired>
                  <FormLabel id={MODULE_SELECT_LABEL_ID} htmlFor={MODULE_SELECT_ID} fontWeight="bold" size="lg">
                    {t("requirementsLibrary.modals.computedComplianceSetup.module")}
                  </FormLabel>
                  <Box px={4}>
                    <Select
                      inputId={MODULE_SELECT_ID}
                      aria-labelledby={MODULE_SELECT_LABEL_ID}
                      options={moduleSelectOptions}
                      value={selectedModuleOption}
                      onChange={onModuleChange}
                    />
                  </Box>
                </FormControl>
                {valueExtractionFieldOptions && (
                  <FormControl isRequired>
                    <FormLabel
                      id={VALUE_EXTRACTION_FIELD_SELECT_LABEL_ID}
                      htmlFor={VALUE_EXTRACTION_FIELD_SELECT_ID}
                      fontWeight="bold"
                      size="lg"
                    >
                      {t("requirementsLibrary.modals.computedComplianceSetup.valueExtractionField")}
                    </FormLabel>
                    <Box px={4}>
                      <Select
                        inputId={VALUE_EXTRACTION_FIELD_SELECT_ID}
                        aria-labelledby={VALUE_EXTRACTION_FIELD_SELECT_LABEL_ID}
                        options={valueExtractionFieldOptions}
                        value={selectedValueExtractionFieldOption}
                        onChange={onValueExtractionFieldChange}
                      />
                    </Box>
                  </FormControl>
                )}
              </Stack>
            </ModalBody>

            <ModalFooter justifyContent={"flex-start"}>
              <ButtonGroup>
                <Button variant={"secondary"} onClick={onReset}>
                  {t("ui.reset")}
                </Button>
                <Button variant={"primary"} onClick={handleSubmit(onDone)} isDisabled={!isValid}>
                  {t("ui.done")}
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )

    function isValidValueExtractionField(value) {
      // value should be only present for value extractor types
      // so it's valid if it's not present
      if (!value?.trim() && !isValueExtractorModuleConfiguration(autoComplianceModuleConfigurations?.[watchedModule])) {
        return true
      }

      if (!(watchedModule in autoComplianceModuleConfigurations)) {
        return false
      }

      const moduleConfiguration = autoComplianceModuleConfigurations[
        watchedModule
      ] as TAutoComplianceModuleConfiguration

      if (
        !isValueExtractorModuleConfiguration(moduleConfiguration) ||
        !moduleConfiguration.availableOnInputTypes.includes(watchedRequirementType)
      ) {
        return false
      }

      const isSelectedFieldValid = (
        moduleConfiguration as TValueExtractorAutoComplianceModuleConfiguration
      ).availableFields.find(
        (field) => field.value === value && field.availableOnInputTypes.includes(watchedRequirementType)
      )

      return isSelectedFieldValid
    }

    function onReset() {
      reset(formFormDefaults())
    }

    function onDone(form: IComputedComplianceForm) {
      const moduleConfiguration = autoComplianceModuleConfigurations?.[form.module]

      if (!moduleConfiguration) {
        setRequirementBlockFormValue(
          `requirementsAttributes.${requirementIndex}.inputOptions.computedCompliance`,
          undefined
        )
        onClose()
        return
      }

      const computedCompliance: TComputedCompliance = {
        module: form.module,
      }

      if (isValueExtractorModuleConfiguration(moduleConfiguration)) {
        computedCompliance.value = form.value
      }

      setRequirementBlockFormValue(
        `requirementsAttributes.${requirementIndex}.inputOptions.computedCompliance`,
        computedCompliance
      )

      onClose()
    }

    function formFormDefaults(computedCompliance?: TComputedCompliance): IComputedComplianceForm {
      const defaults = {
        module: computedCompliance?.module ?? null,
        value: null,
      }

      if (isValueExtractorModuleConfiguration(autoComplianceModuleConfigurations?.[computedCompliance?.module])) {
        defaults.value = computedCompliance?.value
      }

      return defaults
    }
  }
)
