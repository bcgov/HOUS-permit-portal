import { InputGroup } from "@/components/ui/input-group"
import { Box, Checkbox, Field, Heading, Input, InputAddon, SimpleGrid, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { EOverheatingCodeCoolingZoneUnits } from "../../../../types/enums"
import { ClauseBadge } from "./clause-badge"
import { FormFooter } from "./form-footer"

interface IDesignConditionsFormData {
  designOutdoorTemp: string
  designIndoorTemp: string
  designAdjacentTemp: string
  coolingZoneArea: string
  weatherLocation: string
  ventilationRate: string
  hrvErv: boolean
  atrePercentage: string
}

const FIXED_INDOOR_TEMP = 24

export const DesignConditions = observer(function DesignConditions() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const isMetric = currentOverheatingCode?.coolingZoneUnits === EOverheatingCodeCoolingZoneUnits.metric
  const tempUnit = isMetric ? "°C" : "°F"
  const areaUnit = isMetric ? "m²" : "ft²"
  const ventilationUnit = isMetric ? "L/s" : "cfm"

  const jurisdictionWeatherLocation = currentOverheatingCode?.jurisdiction?.weatherLocation
  const jurisdictionDesignTemp = currentOverheatingCode?.jurisdiction?.designSummerTemp
  const hasJurisdictionWeather = !!jurisdictionWeatherLocation
  const hasJurisdictionTemp = jurisdictionDesignTemp != null

  const initialOutdoorTemp = useMemo(() => {
    if (hasJurisdictionTemp) return jurisdictionDesignTemp.toString()
    return currentOverheatingCode?.designOutdoorTemp?.toString() || ""
  }, [currentOverheatingCode?.id])

  const initialWeatherLocation = useMemo(() => {
    if (hasJurisdictionWeather) return jurisdictionWeatherLocation
    return currentOverheatingCode?.weatherLocation || ""
  }, [currentOverheatingCode?.id])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IDesignConditionsFormData>({
    mode: "onChange",
    defaultValues: {
      designOutdoorTemp: initialOutdoorTemp,
      designIndoorTemp: FIXED_INDOOR_TEMP.toString(),
      designAdjacentTemp: currentOverheatingCode?.designAdjacentTemp?.toString() || initialOutdoorTemp,
      coolingZoneArea: currentOverheatingCode?.coolingZoneArea?.toString() || "",
      weatherLocation: initialWeatherLocation,
      ventilationRate: currentOverheatingCode?.ventilationRate?.toString() || "",
      hrvErv: currentOverheatingCode?.hrvErv ?? false,
      atrePercentage: currentOverheatingCode?.atrePercentage?.toString() || "",
    },
  })

  const hrvErvValue = watch("hrvErv")
  const outdoorTempValue = watch("designOutdoorTemp")

  useEffect(() => {
    if (outdoorTempValue) {
      setValue("designAdjacentTemp", outdoorTempValue)
    }
  }, [outdoorTempValue, setValue])

  const onSubmit = async (data: IDesignConditionsFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      designOutdoorTemp: data.designOutdoorTemp ? Number(data.designOutdoorTemp) : null,
      designIndoorTemp: FIXED_INDOOR_TEMP,
      designAdjacentTemp: data.designAdjacentTemp ? Number(data.designAdjacentTemp) : null,
      coolingZoneArea: data.coolingZoneArea ? Number(data.coolingZoneArea) : null,
      weatherLocation: data.weatherLocation || null,
      ventilationRate: data.ventilationRate ? Number(data.ventilationRate) : null,
      hrvErv: data.hrvErv,
      atrePercentage: data.atrePercentage ? Number(data.atrePercentage) : null,
    })
  }

  const validateTemp = (value: string) => {
    if (!value) return true
    const num = Number(value)
    if (isNaN(num)) return t("overheatingCode.sections.designConditions.invalidTemp", "Must be a valid temperature")
    if (num < -80 || num > 80)
      return t("overheatingCode.sections.designConditions.tempRange", "Temperature must be between -80°C and 80°C")
    return true
  }

  const validatePercentage = (value: string) => {
    if (!value) return true
    const num = Number(value)
    if (isNaN(num)) return t("overheatingCode.sections.designConditions.invalidPercent", "Must be a valid number")
    if (num < 0 || num > 100)
      return t("overheatingCode.sections.designConditions.percentRange", "Must be between 0% and 100%")
    return true
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.designConditions.title", "Design Conditions")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.designConditions.description",
          "Design temperatures, ventilation, and zone parameters for the cooling assessment."
        )}
      </Text>
      <VStack gap={8} align="stretch">
        <Box>
          <Heading as="h3" size="md" mb={4}>
            {t("overheatingCode.sections.designConditions.temperaturesHeading", "Temperatures")}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <Field.Root invalid={!!errors.designOutdoorTemp}>
              <Field.Label>
                {t("overheatingCode.sections.designConditions.outdoorTempLabel", "Outdoor Temp")}
                <ClauseBadge
                  clause="§ 2.1.2"
                  tooltip="2.1.2 Outdoor Design Temperature: (1) Except as permitted by 2.1.2.(2) the Outdoor Design temperature (Toc) shall be the outside summer design temperatures determined from Appendix C of the BCBC and shall be those listed for the July 2.5% dry bulb values. (2) The Outdoor Design temperature (Toc) may be set at a higher temperature than the temperature determined according to 2.1.2.(1) by the Authority Having Jurisdiction."
                />
              </Field.Label>
              <InputGroup>
                <Input
                  type="number"
                  step="any"
                  {...register("designOutdoorTemp", { validate: validateTemp })}
                  placeholder="e.g. 31"
                  readOnly={hasJurisdictionTemp}
                  bg={hasJurisdictionTemp ? "greys.grey03" : undefined}
                  fontWeight={hasJurisdictionTemp ? "semibold" : undefined}
                />
                <InputAddon>{tempUnit}</InputAddon>
              </InputGroup>
              <Text fontSize="xs" color="text.secondary" mt={1}>
                {hasJurisdictionTemp
                  ? t(
                      "overheatingCode.sections.designConditions.outdoorTempAutoHint",
                      "Auto-populated from jurisdiction (BCBC Appendix C)"
                    )
                  : t(
                      "overheatingCode.sections.designConditions.outdoorTempHint",
                      "From BCBC Appendix C — July 2.5% dry bulb"
                    )}
              </Text>
              <Field.ErrorText>{errors.designOutdoorTemp?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root>
              <Field.Label>
                {t("overheatingCode.sections.designConditions.indoorTempLabel", "Indoor Temp")}
                <ClauseBadge
                  clause="§ 2.1.1"
                  tooltip="2.1.1 The Design temperature of the Cooling Zone shall be 24ºC."
                />
              </Field.Label>
              <InputGroup>
                <Input type="number" value={FIXED_INDOOR_TEMP} readOnly bg="greys.grey03" fontWeight="semibold" />
                <InputAddon>{tempUnit}</InputAddon>
              </InputGroup>
              <Text fontSize="xs" color="text.secondary" mt={1}>
                {t(
                  "overheatingCode.sections.designConditions.indoorTempHint",
                  "Fixed at 24°C per BC-SZCG clause 2.1.1"
                )}
              </Text>
            </Field.Root>

            <Field.Root invalid={!!errors.designAdjacentTemp}>
              <Field.Label>
                {t("overheatingCode.sections.designConditions.adjacentTempLabel", "Adjacent Temp")}
                <ClauseBadge
                  clause="§ 2.1.3"
                  tooltip="2.1.3 The Design Temperature of Adjacent Unconditioned spaces (Tca) shall be the same as the outdoor design temperature determined according to clause 2.1.2."
                />
              </Field.Label>
              <InputGroup>
                <Input
                  type="number"
                  step="any"
                  {...register("designAdjacentTemp", { validate: validateTemp })}
                  bg="greys.grey03"
                  readOnly
                />
                <InputAddon>{tempUnit}</InputAddon>
              </InputGroup>
              <Text fontSize="xs" color="text.secondary" mt={1}>
                {t(
                  "overheatingCode.sections.designConditions.adjacentTempHint",
                  "Auto-filled from outdoor temp per clause 2.1.3"
                )}
              </Text>
              <Field.ErrorText>{errors.designAdjacentTemp?.message}</Field.ErrorText>
            </Field.Root>
          </SimpleGrid>
        </Box>

        <Box>
          <Heading as="h3" size="md" mb={4}>
            {t("overheatingCode.sections.designConditions.zoneAndVentilationHeading", "Zone & Ventilation")}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Field.Root invalid={!!errors.coolingZoneArea}>
              <Field.Label>
                {t("overheatingCode.sections.designConditions.coolingZoneAreaLabel", "Cooling Zone Area")}
                <ClauseBadge
                  clause="§ 2.2.4"
                  tooltip="2.2.4 The cooling zone should have the following attributes: (2) have a minimum area of at least 48 ft² (4.5 m²) for each occupant based on the design number of occupants calculated according to sentence 2.3.1."
                />
              </Field.Label>
              <InputGroup>
                <Input
                  type="number"
                  step="any"
                  {...register("coolingZoneArea", {
                    validate: (value) => {
                      if (!value) return true
                      const num = Number(value)
                      if (isNaN(num) || num <= 0)
                        return t(
                          "overheatingCode.sections.designConditions.areaInvalid",
                          "Must be a valid positive number"
                        )
                      const minArea = isMetric ? 4.5 : 48
                      if (num < minArea)
                        return t(
                          "overheatingCode.sections.designConditions.areaMinimum",
                          `Minimum ${minArea} ${areaUnit} per clause 2.2.4(2)`
                        )
                      return true
                    },
                  })}
                  placeholder="e.g. 850"
                />
                <InputAddon>{areaUnit}</InputAddon>
              </InputGroup>
              <Text fontSize="xs" color="text.secondary" mt={1}>
                {t(
                  "overheatingCode.sections.designConditions.coolingZoneAreaHint",
                  "Min. 48 ft² per occupant (bedrooms + 1)"
                )}
              </Text>
              <Field.ErrorText>{errors.coolingZoneArea?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root>
              <Field.Label>
                {t("overheatingCode.sections.designConditions.weatherLocationLabel", "Weather Location")}
                <ClauseBadge
                  clause="§ 2.1.2(1)"
                  tooltip="2.1.2(1) The Outdoor Design temperature (Toc) shall be the outside summer design temperatures determined from Appendix C of the BCBC and shall be those listed for the July 2.5% dry bulb values."
                />
              </Field.Label>
              <Input
                {...register("weatherLocation")}
                placeholder={t(
                  "overheatingCode.sections.designConditions.weatherLocationPlaceholder",
                  "e.g. Kaslo, BC"
                )}
                readOnly={hasJurisdictionWeather}
                bg={hasJurisdictionWeather ? "greys.grey03" : undefined}
                fontWeight={hasJurisdictionWeather ? "semibold" : undefined}
              />
              {hasJurisdictionWeather && (
                <Text fontSize="xs" color="text.secondary" mt={1}>
                  {t(
                    "overheatingCode.sections.designConditions.weatherLocationAutoHint",
                    "Auto-populated from jurisdiction"
                  )}
                </Text>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.ventilationRate}>
              <Field.Label>
                {t("overheatingCode.sections.designConditions.ventilationRateLabel", "Ventilation Rate")}
                <ClauseBadge
                  clause="§ 2.3.2"
                  tooltip="2.3.2 Ventilation Air flow rate: (1) In a home without a central air handling system, the ventilation airflow rate for the purposes of calculating heat gain shall be assumed to be 3.5 L/s (7.5 cfm) per person based on the occupancy determined according to sentence 2.3.1. (2) In a home with a central air handling system the ventilation airflow rate shall be the greater of 3.5 L/s per person or the estimated air flow to or from the cooling zone."
                />
              </Field.Label>
              <InputGroup>
                <Input
                  type="number"
                  step="any"
                  {...register("ventilationRate", {
                    validate: (value) => {
                      if (!value) return true
                      const num = Number(value)
                      if (isNaN(num) || num < 0)
                        return t(
                          "overheatingCode.sections.designConditions.ventilationInvalid",
                          "Must be a valid positive number"
                        )
                      return true
                    },
                  })}
                  placeholder="e.g. 17.5"
                />
                <InputAddon>{ventilationUnit}</InputAddon>
              </InputGroup>
              <Text fontSize="xs" color="text.secondary" mt={1}>
                {t(
                  "overheatingCode.sections.designConditions.ventilationRateHint",
                  "3.5 L/s per person (occupants = bedrooms + 1)"
                )}
              </Text>
              <Field.ErrorText>{errors.ventilationRate?.message}</Field.ErrorText>
            </Field.Root>
          </SimpleGrid>
        </Box>

        <Box>
          <Heading as="h3" size="md" mb={4}>
            {t("overheatingCode.sections.designConditions.hrvErvHeading", "Heat/Energy Recovery")}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} alignItems="start">
            <Field.Root>
              <Field.Label>{t("overheatingCode.sections.designConditions.hrvErvLabel", "HRV/ERV?")}</Field.Label>
              <Controller
                name="hrvErv"
                control={control}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Checkbox.Root
                    onCheckedChange={(e) => onChange(e.target.checked)}
                    {...rest}
                    size="lg"
                    h="40px"
                    display="flex"
                    alignItems="center"
                    checked={value}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Label>{t("ui.yes", "Yes")}</Checkbox.Label>
                  </Checkbox.Root>
                )}
              />
              <Text fontSize="xs" color="text.secondary" mt={1}>
                {t(
                  "overheatingCode.sections.designConditions.hrvErvHint",
                  "Is a Heat Recovery Ventilator or Energy Recovery Ventilator used?"
                )}
              </Text>
            </Field.Root>

            <Field.Root invalid={!!errors.atrePercentage} disabled={!hrvErvValue}>
              <Field.Label>
                {t("overheatingCode.sections.designConditions.atreLabel", "ATRE %")}
                <ClauseBadge
                  clause="§ 2.5.9"
                  tooltip="2.5.9 Sensible Heat Gain due to Ventilation: HGsvcz = VCcz × CZODTDc × 1.2 × (1 − ATRE). Where ATRE = adjusted total recovery efficiency of the HRV/ERV, expressed as a fraction, or zero if there is no ATRE reported or if there is no heat recovery."
                />
              </Field.Label>
              <InputGroup maxW="200px">
                <Input
                  type="number"
                  step="any"
                  {...register("atrePercentage", { validate: validatePercentage })}
                  placeholder="e.g. 23"
                />
                <InputAddon>%</InputAddon>
              </InputGroup>
              <Text fontSize="xs" color="text.secondary" mt={1}>
                {t(
                  "overheatingCode.sections.designConditions.atreHint",
                  "Adjusted Total Recovery Efficiency — zero if no HRV/ERV"
                )}
              </Text>
              <Field.ErrorText>{errors.atrePercentage?.message}</Field.ErrorText>
            </Field.Root>
          </SimpleGrid>
        </Box>
      </VStack>
      <FormFooter<IDesignConditionsFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
    </Box>
  )
})
