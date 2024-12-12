import { Heading, Radio, RadioGroup, Stack, StackProps, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { FormProvider, useController, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
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
  heatingSystemPlant: EHeatingSystemPlant
  heatingSystemType: EHeatingSystemType
  heatingSystemTypeDescription?: string | null
  heatingSystemPlantDescription?: string | null
  coolingSystemPlant: ECoolingSystemPlant
  coolingSystemType: ECoolingSystemType
  coolingSystemTypeDescription?: string | null
  coolingSystemPlantDescription?: string | null
  dhwSystemType: EDHWSystemType
  dhwSystemTypeDescription?: string | null
  dhwSystemPlantDescription?: string | null
}

export const HVAC = observer(() => {
  const { t } = useTranslation()
  const formMethods = useForm<IStepcodeHvacFormProps>()

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
      },
      {
        optionFieldName: "heatingSystemType",
        options: orderedHeatingSystemTypeOptions,
        otherDescriptionFieldName: "heatingSystemTypeDescription",
      },
      {
        optionFieldName: "coolingSystemPlant",
        options: orderedCoolingSystemPlantOptions,
        otherDescriptionFieldName: "coolingSystemPlantDescription",
      },
      {
        optionFieldName: "coolingSystemType",
        options: orderedCoolingSystemTypeOptions,
        otherDescriptionFieldName: "coolingSystemTypeDescription",
      },
      {
        optionFieldName: "dhwSystemType",
        options: orderedDhwSystemTypeOptions,
        otherDescriptionFieldName: "dhwSystemTypeDescription",
      },
    ],
    [
      orderedHeatingSystemPlantOptions,
      orderedHeatingSystemTypeOptions,
      orderedCoolingSystemPlantOptions,
      orderedCoolingSystemTypeOptions,
      orderedDhwSystemTypeOptions,
    ]
  )

  return (
    <Stack direction="column" w="full">
      <Heading as="h2" fontSize="2xl" variant="yellowline">
        {t(`${i18nPrefix}.heading`)}
      </Heading>
      <Text fontSize="md">{t(`${i18nPrefix}.description`)}</Text>

      <FormProvider {...formMethods}>
        <Stack spacing={7} mt={3}>
          {optionSections.map((section) => (
            <OptionsSection
              key={section.optionFieldName}
              optionFieldName={section.optionFieldName as TOptionFieldName}
              options={section.options}
              otherDescriptionFieldName={section.otherDescriptionFieldName as TDescriptionFieldName}
            />
          ))}
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
  | "dhwSystemTypeDescription"
  | "dhwSystemPlantDescription"

type TOptionFieldName = keyof Omit<IStepcodeHvacFormProps, TDescriptionFieldName>

interface IOptionsSectionProps extends StackProps {
  optionFieldName: TOptionFieldName
  options: IStepcodeHvacFormProps[TOptionFieldName][]
  otherDescriptionFieldName: keyof Pick<IStepcodeHvacFormProps, TDescriptionFieldName>
}

export const OptionsSection = observer(
  ({ optionFieldName, options, otherDescriptionFieldName, ...props }: IOptionsSectionProps) => {
    const { t } = useTranslation()
    const { control, setValue } = useFormContext<IStepcodeHvacFormProps>()
    const {
      field: { value: optionValue, onChange: onOptionChange },
    } = useController({ control, name: optionFieldName })

    const handleOptionChange = (option: (typeof options)[number]) => {
      onOptionChange(option)

      if (option === "other") {
        setValue(otherDescriptionFieldName, null)
      }
    }

    const otherSelected = optionValue === "other"

    return (
      <Stack spacing={3.25} {...props}>
        <Heading as="h3" fontSize="md">
          {t(`${i18nPrefix}.${optionFieldName as TOptionFieldName}.heading`)}
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
