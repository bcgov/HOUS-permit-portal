import {
  Button,
  ButtonGroup,
  ButtonProps,
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
import { LightningA } from "@phosphor-icons/react"
import { computed } from "mobx"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useMemo } from "react"
import { useController, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useAutoComplianceModuleConfigurations } from "../../../../../hooks/resources/use-auto-compliance-module-configurations"
import { useMst } from "../../../../../setup/root"
import { EAutoComplianceModule } from "../../../../../types/enums"
import {
  IOption,
  TAutoComplianceModuleConfiguration,
  TComputedCompliance,
  TOptionsMapperAutoComplianceModuleConfiguration,
  TValueExtractorAutoComplianceModuleConfiguration,
} from "../../../../../types/types"
import {
  isOptionsMapperModuleConfiguration,
  isValueExtractorModuleConfiguration,
} from "../../../../../utils/utility-functions"
import { IRequirementBlockForm } from "../../requirements-block-modal"
import { ModuleSelect } from "./module-select"
import { OptionsMapGrid } from "./options-map-grid"
import { ValueExtractionFieldSelect } from "./value-extraction-field-select"

interface IProps {
  triggerButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps) => JSX.Element
  requirementIndex: number
}

interface IComputedComplianceForm {
  module: EAutoComplianceModule | null
  value?: string | null
  optionsMap?: Record<string, string> | null
}

export const ComputedComplianceSetupModal = observer(function ComputedCompliance({
  triggerButtonProps,
  renderTriggerButton,
  requirementIndex,
}: IProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()
  const { requirementBlockStore } = useMst()
  const requirementBlockFormMethods = useFormContext<IRequirementBlockForm>()
  const { watch: watchRequirementBlockForm, setValue: setRequirementBlockFormValue } = requirementBlockFormMethods
  const { autoComplianceModuleConfigurations, error: configurationFetchError } = useAutoComplianceModuleConfigurations()

  const watchedRequirementType = watchRequirementBlockForm(`requirementsAttributes.${requirementIndex}.inputType`)
  const watchedComputedCompliance = watchRequirementBlockForm(
    `requirementsAttributes.${requirementIndex}.inputOptions.computedCompliance`
  )

  // have to use useMemo to prevent infinite loop as the default [] is a new reference every time
  // and will cause use effect to run every time
  const watchedRequirementValueOptions = useMemo(
    () => watchRequirementBlockForm(`requirementsAttributes.${requirementIndex}.inputOptions.valueOptions`) ?? [],
    [watchRequirementBlockForm(`requirementsAttributes.${requirementIndex}.inputOptions.valueOptions`)]
  )

  const availableAutoComplianceModuleConfigurations =
    requirementBlockStore.getAvailableAutoComplianceModuleConfigurationsForRequirementType(watchedRequirementType)

  const {
    control,
    reset,
    formState: { isValid },
    handleSubmit,
    watch,
  } = useForm<IComputedComplianceForm>({ defaultValues: formFormDefaults(watchedComputedCompliance) })

  const watchedModule = watch("module")
  const watchedValueExtractionField = watch("value")
  const watchedOptionsMap = watch("optionsMap")
  const selectedModuleConfig = requirementBlockStore.getAutoComplianceModuleConfigurationForRequirementType(
    watchedModule,
    watchedRequirementType
  )

  useEffect(() => {
    if (isOpen) {
      reset(formFormDefaults(watchedComputedCompliance))
    }
  }, [watchedComputedCompliance, isOpen, autoComplianceModuleConfigurations, watchedRequirementValueOptions])

  const { field: moduleField } = useController({
    name: "module",
    control,
    rules: {
      validate: {
        isSupportedModule: (module) =>
          !module ||
          !!requirementBlockStore.getAutoComplianceModuleConfigurationForRequirementType(
            module,
            watchedRequirementType
          ),
      },
    },
  })
  const { field: valueExtractionField } = useController({
    name: "value",
    control,
    rules: {
      required: isValueExtractorModuleConfiguration(selectedModuleConfig),
      validate: {
        isValidField: isValidValueExtractionField,
      },
    },
  })

  const { field: optionsMapField } = useController({
    name: "optionsMap",
    control,
    rules: {
      required: isOptionsMapperModuleConfiguration(selectedModuleConfig),
      validate: {
        isValidMappedOptions,
      },
    },
  })

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
        const moduleConfiguration = requirementBlockStore.getAutoComplianceModuleConfigurationForRequirementType(
          selectedModuleOption?.value,
          watchedRequirementType
        )

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

  const mappableExternalOptions = useMemo(
    () =>
      computed(() => {
        const moduleConfiguration = requirementBlockStore.getAutoComplianceModuleConfigurationForRequirementType(
          selectedModuleOption?.value,
          watchedRequirementType
        )

        if (!moduleConfiguration || !isOptionsMapperModuleConfiguration(moduleConfiguration)) {
          return null
        }

        return (moduleConfiguration as TOptionsMapperAutoComplianceModuleConfiguration).mappableExternalOptions.map(
          (option) => ({ ...option })
        )
      }),
    [selectedModuleOption]
  ).get()

  const optionValueToRequirementOption = useMemo(() => {
    return watchedRequirementValueOptions.reduce((acc, currOption) => {
      acc[currOption.value] = currOption
      return acc
    }, {})
  }, [watchedRequirementValueOptions])

  const optionValueToMappableExternalOption = useMemo(() => {
    return (
      mappableExternalOptions?.reduce((acc, currOption) => {
        acc[currOption.value] = currOption
        return acc
      }, {}) ?? {}
    )
  }, [mappableExternalOptions])

  const availableRequirementOptions = useMemo(() => {
    return watchedRequirementValueOptions.filter(
      (option) => !Object.values(watchedOptionsMap ?? {}).includes(option.value)
    )
  }, [watchedRequirementValueOptions, watchedOptionsMap])

  const isSetupDisabled = availableAutoComplianceModuleConfigurations.length === 0

  // prunes the optionsMap if the value options changed
  useEffect(() => {
    if (isOpen && watchedOptionsMap && autoComplianceModuleConfigurations) {
      const prunedOptionsMap = getPrunedOptionsMapBasedOnValueOptions(
        watchedOptionsMap,
        watchedRequirementValueOptions,
        selectedModuleConfig
      )

      optionsMapField.onChange(prunedOptionsMap)
    }
  }, [isOpen, watchedRequirementValueOptions, autoComplianceModuleConfigurations])

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
        <ModalContent maxW={"lg"} fontSize={"sm"} color={"text.secondary"}>
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
              <ModuleSelect options={moduleSelectOptions} value={selectedModuleOption} onChange={onModuleChange} />

              {valueExtractionFieldOptions && (
                <ValueExtractionFieldSelect
                  options={valueExtractionFieldOptions}
                  value={selectedValueExtractionFieldOption}
                  onChange={onValueExtractionFieldChange}
                />
              )}
              {mappableExternalOptions && (
                <OptionsMapGrid
                  mappableExternalOptions={mappableExternalOptions}
                  setOptionMapValue={setOptionMapValue}
                  availableRequirementOptions={availableRequirementOptions}
                  optionValueToRequirementOption={optionValueToRequirementOption}
                  currentOptionsMap={watchedOptionsMap}
                />
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

  function onModuleChange(option: IOption) {
    moduleField.onChange(option?.value ?? null)
    resetModuleDependencies()
  }

  function onValueExtractionFieldChange(option: IOption) {
    valueExtractionField.onChange(option?.value ?? null)
  }

  function setOptionMapValue(mappableExternalOptionValue: string, requirementOption: IOption | null) {
    const clonedOptionsMap = { ...(watchedOptionsMap ?? {}) }
    if (requirementOption) {
      clonedOptionsMap[mappableExternalOptionValue] = requirementOption.value
    } else {
      delete clonedOptionsMap[mappableExternalOptionValue]
    }

    optionsMapField.onChange(clonedOptionsMap)
  }

  function isValidValueExtractionField(value) {
    // value should be only present for value extractor types
    // so it's valid if it's not present
    if (!value?.trim() && !isValueExtractorModuleConfiguration(selectedModuleConfig)) {
      return true
    }

    if (!(watchedModule in autoComplianceModuleConfigurations)) {
      return false
    }

    const moduleConfiguration = autoComplianceModuleConfigurations[watchedModule] as TAutoComplianceModuleConfiguration

    if (
      !isValueExtractorModuleConfiguration(moduleConfiguration) ||
      !moduleConfiguration.availableOnInputTypes.includes(watchedRequirementType)
    ) {
      return false
    }

    const isSelectedFieldValid = !!(
      moduleConfiguration as TValueExtractorAutoComplianceModuleConfiguration
    ).availableFields.find(
      (field) => field.value === value && field.availableOnInputTypes.includes(watchedRequirementType)
    )

    return isSelectedFieldValid
  }

  function isValidMappedOptions(mappedOptions: IComputedComplianceForm["optionsMap"]) {
    if (!mappedOptions && !isOptionsMapperModuleConfiguration(selectedModuleConfig)) {
      return true
    }

    if (!(watchedModule in autoComplianceModuleConfigurations)) {
      return false
    }

    const moduleConfiguration = selectedModuleConfig as TOptionsMapperAutoComplianceModuleConfiguration

    if (
      !isOptionsMapperModuleConfiguration(moduleConfiguration) ||
      !moduleConfiguration.availableOnInputTypes.includes(watchedRequirementType)
    ) {
      return false
    }

    const validMappedOption =
      Object.entries(mappedOptions ?? {}).every(
        ([mappableExternalOptionValue, requirementOptionValue]) =>
          !!optionValueToRequirementOption[requirementOptionValue] &&
          !!optionValueToMappableExternalOption[mappableExternalOptionValue]
      ) && Object.keys(mappedOptions ?? {}).length > 0

    return validMappedOption
  }

  function onReset() {
    reset(formFormDefaults())
  }

  function onDone(form: IComputedComplianceForm) {
    const moduleConfiguration = requirementBlockStore.getAutoComplianceModuleConfigurationForRequirementType(
      form.module,
      watchedRequirementType
    )

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

    if (isOptionsMapperModuleConfiguration(moduleConfiguration)) {
      computedCompliance.optionsMap = { ...(form.optionsMap ?? {}) }
    }

    setRequirementBlockFormValue(
      `requirementsAttributes.${requirementIndex}.inputOptions.computedCompliance`,
      computedCompliance
    )

    onClose()
  }

  function formFormDefaults(computedCompliance?: TComputedCompliance): IComputedComplianceForm {
    const defaults: TComputedCompliance = {
      module: computedCompliance?.module ?? null,
      value: null,
      optionsMap: null,
    }

    const autoComplianceModuleConfiguration = autoComplianceModuleConfigurations?.[computedCompliance?.module]

    if (isValueExtractorModuleConfiguration(autoComplianceModuleConfiguration)) {
      defaults.value = computedCompliance?.value
    }

    if (isOptionsMapperModuleConfiguration(autoComplianceModuleConfiguration)) {
      defaults.optionsMap = computedCompliance?.optionsMap

      // This for backwards compatibility with old data, as the initial implementation did not have optionsMap
      // and assumed that the requirement will have a yes or no option
      const requiresBackwardCompatability =
        !defaults.optionsMap &&
        autoComplianceModuleConfiguration?.module === EAutoComplianceModule.HistoricSite &&
        !!optionValueToRequirementOption["yes"] &&
        !!optionValueToRequirementOption["no"]

      if (requiresBackwardCompatability) {
        defaults.optionsMap = {
          Y: "yes",
          N: "no",
        }
      }
    }

    return defaults
  }

  function resetModuleDependencies() {
    valueExtractionField.onChange(null)
    optionsMapField.onChange(null)
  }

  // removes mapping which are not present in the value options
  function getPrunedOptionsMapBasedOnValueOptions(
    optionsMap: Record<string, string>,
    valueOptions: IOption[],
    moduleConfig: TAutoComplianceModuleConfiguration | undefined
  ) {
    if (!isOptionsMapperModuleConfiguration(moduleConfig)) {
      return null
    }

    const clonedOptionsMap = R.clone(optionsMap) as Record<string, string>
    valueOptions = valueOptions ?? []

    if (valueOptions.length === 0) {
      return null
    }

    Object.entries(optionsMap).forEach(([key, value]) => {
      if (!valueOptions.find((option) => option.value === value)) {
        delete clonedOptionsMap[key]
      }
    })

    if (Object.keys(clonedOptionsMap).length === 0) {
      return null
    }

    return clonedOptionsMap
  }
})
