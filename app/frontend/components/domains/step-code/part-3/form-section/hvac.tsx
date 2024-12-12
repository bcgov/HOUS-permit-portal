import { Button, Heading, Radio, RadioGroup, Stack, StackProps, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import { path } from "ramda"
import React, { useEffect, useMemo } from "react"
import { FormProvider, useController, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import {
  ECoolingSystemPlant,
  ECoolingSystemType,
  EDHWSystemType,
  EHeatingSystemPlant,
  EHeatingSystemType,
} from "../../../../../types/enums"
import { TextFormControl } from "../../../../shared/form/input-form-control"
import { HStack } from "../../part-9/checklist/pdf-content/shared/h-stack"

const i18nPrefix = "stepCode.part3.hvac"

interface IStepcodeHvacFormProps {
  heatingSystemPlant: EHeatingSystemPlant | null
  heatingSystemType: EHeatingSystemType | null
  heatingSystemTypeDescription?: string | null
  heatingSystemPlantDescription?: string | null
  coolingSystemPlant: ECoolingSystemPlant | null
  coolingSystemType: ECoolingSystemType | null
  coolingSystemTypeDescription?: string | null
  coolingSystemPlantDescription?: string | null
  dhwSystemType: EDHWSystemType | null
  dhwSystemDescription?: string | null
}
function initializeFormValues(formValues?: IStepcodeHvacFormProps): IStepcodeHvacFormProps {
  return {
    heatingSystemPlant: formValues?.heatingSystemPlant || null,
    heatingSystemType: formValues?.heatingSystemType || null,
    heatingSystemTypeDescription: formValues?.heatingSystemTypeDescription || null,
    heatingSystemPlantDescription: formValues?.heatingSystemPlantDescription || null,
    coolingSystemPlant: formValues?.coolingSystemPlant || null,
    coolingSystemType: formValues?.coolingSystemType || null,
    coolingSystemTypeDescription: formValues?.coolingSystemTypeDescription || null,
    coolingSystemPlantDescription: formValues?.coolingSystemPlantDescription || null,
    dhwSystemType: formValues?.dhwSystemType || null,
    dhwSystemDescription: formValues?.dhwSystemDescription || null,
  }
}

export const HVAC = observer(() => {
  const { t } = useTranslation()
  const { checklist } = usePart3StepCode()
  const navigate = useNavigate()
  const location = useLocation()
  const formMethods = useForm<IStepcodeHvacFormProps>({
    mode: "onSubmit",
    defaultValues: initializeFormValues(checklist),
  })
  const { handleSubmit } = formMethods

  const orderedHeatingSystemPlantOptions = useMemo(
    () => [
      EHeatingSystemPlant.none,
      EHeatingSystemPlant.groundSourceVRF,
      EHeatingSystemPlant.airSourceHeatPump,
      EHeatingSystemPlant.airSourceVRF,
      EHeatingSystemPlant.gasBoiler,
      EHeatingSystemPlant.groundSourceHeatPump,
      EHeatingSystemPlant.districtSystem,
      EHeatingSystemPlant.other,
    ],
    []
  )
  const orderedHeatingSystemTypeOptions = useMemo(
    () => [
      EHeatingSystemType.electricBaseboard,
      EHeatingSystemType.VRFUnits,
      EHeatingSystemType.hydronicBasebaord,
      EHeatingSystemType.radiantFloorCooling,
      EHeatingSystemType.hydronicFanCoils,
      EHeatingSystemType.gasFiredRooftop,
      EHeatingSystemType.VAVReheat,
      EHeatingSystemType.electricResistanceRooftop,
      EHeatingSystemType.airSourceHeatPump,
      EHeatingSystemType.other,
      EHeatingSystemType.heatPumpRooftop,
    ],
    []
  )
  const orderedCoolingSystemPlantOptions = useMemo(
    () => [
      ECoolingSystemPlant.none,
      ECoolingSystemPlant.groundSourceHeatPump,
      ECoolingSystemPlant.airCooledChiller,
      ECoolingSystemPlant.airSourceVRF,
      ECoolingSystemPlant.waterCooledChiller,
      ECoolingSystemPlant.groundSourceVRF,
      ECoolingSystemPlant.airSourceHeatPump,
      ECoolingSystemPlant.other,
    ],
    []
  )
  const orderedCoolingSystemTypeOptions = useMemo(
    () => [
      ECoolingSystemType.ptac,
      ECoolingSystemType.radiantFloorCeiling,
      ECoolingSystemType.hydronicFanCoils,
      ECoolingSystemType.none,
      ECoolingSystemType.hydronicBaseboards,
      ECoolingSystemType.other,
      ECoolingSystemType.VRFUnits,
    ],
    []
  )
  const orderedDhwSystemTypeOptions = useMemo(
    () => [
      EDHWSystemType.heatPumpSpaceHeating,
      EDHWSystemType.gas,
      EDHWSystemType.airSourceHeatPump,
      EDHWSystemType.suiteElectric,
      EDHWSystemType.groundSourcHeatPump,
      EDHWSystemType.suiteGas,
      EDHWSystemType.gasSpaceHeating,
      EDHWSystemType.other,
    ],
    []
  )

  const optionSections = useMemo(
    () => [
      {
        optionFieldName: "heatingSystemPlant",
        options: orderedHeatingSystemPlantOptions,
        otherDescriptionFieldName: "heatingSystemPlantDescription",
        storeOptionValue: checklist?.heatingSystemPlant,
        storeOtherDescriptionValue: checklist?.heatingSystemPlantDescription,
      },
      {
        optionFieldName: "heatingSystemType",
        options: orderedHeatingSystemTypeOptions,
        otherDescriptionFieldName: "heatingSystemTypeDescription",
        storeOptionValue: checklist?.heatingSystemType,
        storeOtherDescriptionValue: checklist?.heatingSystemTypeDescription,
      },
      {
        optionFieldName: "coolingSystemPlant",
        options: orderedCoolingSystemPlantOptions,
        otherDescriptionFieldName: "coolingSystemPlantDescription",
        storeOptionValue: checklist?.coolingSystemPlant,
        storeOtherDescriptionValue: checklist?.coolingSystemPlantDescription,
      },
      {
        optionFieldName: "coolingSystemType",
        options: orderedCoolingSystemTypeOptions,
        otherDescriptionFieldName: "coolingSystemTypeDescription",
        storeOptionValue: checklist?.coolingSystemType,
        storeOtherDescriptionValue: checklist?.coolingSystemTypeDescription,
      },
      {
        optionFieldName: "dhwSystemType",
        options: orderedDhwSystemTypeOptions,
        otherDescriptionFieldName: "dhwSystemDescription",
        storeOptionValue: checklist?.dhwSystemType,
        storeOtherDescriptionValue: checklist?.dhwSystemDescription,
      },
    ],
    [
      orderedHeatingSystemPlantOptions,
      orderedHeatingSystemTypeOptions,
      orderedCoolingSystemPlantOptions,
      orderedCoolingSystemTypeOptions,
      orderedDhwSystemTypeOptions,
      checklist?.heatingSystemPlant,
      checklist?.heatingSystemType,
      checklist?.coolingSystemPlant,
      checklist?.coolingSystemType,
      checklist?.dhwSystemType,
      checklist?.heatingSystemPlantDescription,
      checklist?.heatingSystemTypeDescription,
      checklist?.coolingSystemPlantDescription,
      checklist?.coolingSystemTypeDescription,
      checklist?.dhwSystemDescription,
    ]
  )

  const onSubmit = handleSubmit(async (data) => {
    const updated = await checklist?.update(data)
    if (updated) {
      await checklist?.completeSection("hvac")
      navigate(location.pathname.replace("hvac", "contact"))
    }
  })
  return (
    <Stack direction="column" w="full">
      <Heading as="h2" fontSize="2xl" variant="yellowline">
        {t(`${i18nPrefix}.heading`)}
      </Heading>
      <Text fontSize="md">{t(`${i18nPrefix}.description`)}</Text>

      <FormProvider {...formMethods}>
        <Stack as="form" onSubmit={onSubmit} spacing={7} mt={3}>
          {optionSections.map((section) => (
            <OptionsSection
              key={section.optionFieldName}
              optionFieldName={section.optionFieldName as TOptionFieldName}
              options={section.options}
              otherDescriptionFieldName={section.otherDescriptionFieldName as TDescriptionFieldName}
            />
          ))}
          <Button type="submit" variant="primary" mt={5}>
            {t("stepCode.part3.cta")}
          </Button>
        </Stack>
      </FormProvider>
    </Stack>
  )
})

type TDescriptionFieldName =
  | "heatingSystemTypeDescription"
  | "heatingSystemPlantDescription"
  | "coolingSystemTypeDescription"
  | "coolingSystemPlantDescription"
  | "dhwSystemDescription"

type TOptionFieldName = keyof Omit<IStepcodeHvacFormProps, TDescriptionFieldName>

interface IOptionsSectionProps extends StackProps {
  optionFieldName: TOptionFieldName
  options: IStepcodeHvacFormProps[TOptionFieldName][]
  otherDescriptionFieldName: keyof Pick<IStepcodeHvacFormProps, TDescriptionFieldName>
  storeOptionValue?: IStepcodeHvacFormProps[TOptionFieldName]
  storeOtherDescriptionValue?: IStepcodeHvacFormProps[TDescriptionFieldName]
}

export const OptionsSection = observer(
  ({
    optionFieldName,
    options,
    otherDescriptionFieldName,
    storeOptionValue,
    storeOtherDescriptionValue,
    ...props
  }: IOptionsSectionProps) => {
    const { t } = useTranslation()
    const {
      control,
      setValue,
      formState: { errors },
    } = useFormContext<IStepcodeHvacFormProps>()
    const {
      field: { value: optionValue, onChange: onOptionChange },
    } = useController({
      control,
      name: optionFieldName,
      rules: {
        required: t("ui.isRequired", { field: undefined }),
      },
    })

    const handleOptionChange = (option: (typeof options)[number]) => {
      onOptionChange(option)

      if (option === "other") {
        setValue(otherDescriptionFieldName as keyof IStepcodeHvacFormProps, null)
      }
    }

    const otherSelected = optionValue === "other"

    useEffect(() => {
      if (storeOptionValue) {
        setValue(optionFieldName, storeOptionValue)
      }
    }, [storeOptionValue])

    useEffect(() => {
      if (storeOtherDescriptionValue) {
        setValue(otherDescriptionFieldName, storeOtherDescriptionValue)
      }
    }, [storeOtherDescriptionValue])

    const optionErrorMessage = path([optionFieldName, "message"], errors)

    return (
      <Stack spacing={3.25} {...props}>
        <Heading as="h3" fontSize="md" display="flex" alignItems="center">
          {t(`${i18nPrefix}.${optionFieldName as TOptionFieldName}.heading`)}
          {optionErrorMessage && (
            <Text color="semantic.error" fontSize="sm" fontWeight="normal" ml={2}>
              {optionErrorMessage}
            </Text>
          )}
        </Heading>
        <RadioGroup
          display="grid"
          gridTemplateColumns={["1fr", null, "repeat(2, minmax(200px, max-content))"]}
          rowGap={2}
          columnGap={10}
          gridAutoRows="minmax(35px, auto)" // Ensure minimum height for grid cells, this so that when the description field is shown, there is no layout shift
          value={optionValue}
          onChange={handleOptionChange}
        >
          {options.map((option) => {
            const showDescriptionField = otherSelected && option === "other"
            const Container = showDescriptionField ? HStack : React.Fragment
            return (
              <Container key={option}>
                <Radio value={option} size="lg">
                  <Text fontSize="md">
                    {
                      // @ts-expect-error - the values should be present in the translation file based on the enum
                      t(`${i18nPrefix}.${optionFieldName}.options.${option}`)
                    }
                  </Text>
                </Radio>
                {showDescriptionField && (
                  <TextFormControl
                    inputProps={{
                      size: "sm",
                    }}
                    fieldName={otherDescriptionFieldName}
                    maxW="180px"
                    required={otherSelected}
                  />
                )}
              </Container>
            )
          })}
        </RadioGroup>
      </Stack>
    )
  }
)
