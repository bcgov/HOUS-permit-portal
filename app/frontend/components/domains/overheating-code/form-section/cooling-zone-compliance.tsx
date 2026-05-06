import { InputGroup } from "@/components/ui/input-group"
import { RadioGroup } from "@/components/ui/radio"
import { Box, Field, Heading, HStack, Input, InputAddon, SimpleGrid, Stack, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { EOverheatingCodeCoolingZoneUnits } from "../../../../types/enums"
import { ClauseBadge } from "./clause-badge"
import { FormFooter } from "./form-footer"

interface ICoolingZoneComplianceFormData {
  designatedRooms: string
  coolingZoneUnits: string
  minimumCoolingCapacity: string
}

export const CoolingZoneCompliance = observer(function CoolingZoneCompliance() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ICoolingZoneComplianceFormData>({
    mode: "onChange",
    defaultValues: {
      designatedRooms: currentOverheatingCode?.designatedRooms || "",
      coolingZoneUnits: currentOverheatingCode?.coolingZoneUnits || EOverheatingCodeCoolingZoneUnits.metric,
      minimumCoolingCapacity: currentOverheatingCode?.minimumCoolingCapacity?.toString() || "",
    },
  })

  const unitsValue = watch("coolingZoneUnits")
  const isMetric = unitsValue === EOverheatingCodeCoolingZoneUnits.metric

  const onSubmit = async (data: ICoolingZoneComplianceFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      designatedRooms: data.designatedRooms || null,
      coolingZoneUnits: data.coolingZoneUnits || null,
      minimumCoolingCapacity: data.minimumCoolingCapacity ? Number(data.minimumCoolingCapacity) : null,
    })
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.coolingZoneCompliance.title", "Cooling Zone Compliance")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.coolingZoneCompliance.description",
          "Specify the designated cooling zone rooms and minimum cooling capacity for code compliance."
        )}
      </Text>
      <VStack gap={6} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          <Field.Root>
            <Field.Label>
              {t("overheatingCode.sections.coolingZoneCompliance.designatedRoomsLabel", "Designated Room(s)")}
              <ClauseBadge
                clause="§ 2.2.1–2.2.3"
                tooltip="2.2.1 The Cooling Zone may be a single room or a group of rooms within a dwelling unit. 2.2.2 When reference drawings are produced, the designated room or rooms shall be designated as the 'Cooling Zone'. 2.2.3 The selected room or rooms comprising the cooling zone shall be identified in the calculation result documents by the name designated on the Architectural/Design drawings."
              />
            </Field.Label>
            <Input
              {...register("designatedRooms")}
              placeholder={t(
                "overheatingCode.sections.coolingZoneCompliance.designatedRoomsPlaceholder",
                "e.g. Living Room, Kitchen, Bedroom 1"
              )}
            />
          </Field.Root>

          {/* [OVERHEATING TODO] Units field purpose unclear — btuh is already labeled on the capacity input */}
          <Field.Root>
            <Field.Label>{t("overheatingCode.sections.coolingZoneCompliance.unitsLabel", "Units")}</Field.Label>
            <Controller
              name="coolingZoneUnits"
              control={control}
              render={({ field }) => (
                <RadioGroup.Root {...field}>
                  <Stack direction="row" gap={6} pt={2}>
                    <RadioGroup.Item value={EOverheatingCodeCoolingZoneUnits.imperial}>
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>
                        {t("overheatingCode.sections.coolingZoneCompliance.imperial", "Imperial")}
                      </RadioGroup.ItemText>
                    </RadioGroup.Item>
                    <RadioGroup.Item value={EOverheatingCodeCoolingZoneUnits.metric}>
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>
                        {t("overheatingCode.sections.coolingZoneCompliance.metric", "Metric")}
                      </RadioGroup.ItemText>
                    </RadioGroup.Item>
                  </Stack>
                </RadioGroup.Root>
              )}
            />
          </Field.Root>
        </SimpleGrid>

        <Field.Root invalid={!!errors.minimumCoolingCapacity}>
          <Field.Label fontWeight="bold" fontSize="lg">
            {t(
              "overheatingCode.sections.coolingZoneCompliance.minimumCoolingCapacityLabel",
              "Minimum Cooling Capacity"
            )}
            <ClauseBadge
              clause="§ 2.7.1–2.7.2"
              tooltip="2.7.1 Nominal Cooling System Capacity: CSCncz = LMcz × HGscz, where LMcz = latent load multiplier (1.3). 2.7.2 Minimum Cooling System Capacity: The cooling system capacity for the cooling zone shall not be less than the nominal cooling system capacity (CSCncz) determined according to clause 2.7.1."
            />
          </Field.Label>
          <Text fontSize="sm" color="text.secondary" mb={2}>
            {t(
              "overheatingCode.sections.coolingZoneCompliance.minimumCoolingCapacityHint",
              "Minimum Cooling Capacity as per F280-12 Sentence 6.3.1."
            )}
          </Text>
          <HStack maxW="400px">
            <InputGroup>
              <Input
                type="number"
                step="any"
                {...register("minimumCoolingCapacity", {
                  validate: (value) => {
                    if (!value) return true
                    const num = Number(value)
                    return (
                      (!isNaN(num) && num >= 0) ||
                      t(
                        "overheatingCode.sections.coolingZoneCompliance.capacityInvalid",
                        "Must be a valid positive number"
                      )
                    )
                  },
                })}
                placeholder={t("overheatingCode.sections.coolingZoneCompliance.capacityPlaceholder", "e.g. 26412")}
              />
              <InputAddon>{isMetric ? "kW" : "btuh"}</InputAddon>
            </InputGroup>
          </HStack>
          <Field.ErrorText>{errors.minimumCoolingCapacity?.message}</Field.ErrorText>
        </Field.Root>
      </VStack>
      <FormFooter<ICoolingZoneComplianceFormData>
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        loading={isSubmitting}
      />
    </Box>
  )
})
