import {
  Box,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import {
  EOverheatingCodeAirTightnessCategory,
  EOverheatingCodeAttachment,
  EOverheatingCodeCalculationUnits,
  EOverheatingCodeFrontFacing,
  EOverheatingCodeInternalShading,
  EOverheatingCodeWindExposure,
  EOverheatingCodeWindSheltering,
} from "../../../../types/enums"
import { FormFooter } from "./form-footer"

interface ICalculationsFormData {
  dimensionalInfoBasedOn: string
  attachment: string
  numberOfStories: string
  hasBasement: boolean
  weatherLocation: string
  ventilated: boolean
  hrvErv: boolean
  asePercentage: string
  atrePercentage: string
  frontFacing: string
  frontFacingAssumed: boolean
  airTightnessCategory: string
  airTightnessAch50: string
  airTightnessEla10: string
  airTightnessAssumed: boolean
  windExposure: string
  windSheltering: string
  internalShading: string
  internalShadingAssumed: boolean
  occupants: string
  occupantsAssumed: boolean
  calculationUnits: string
}

export const CalculationsBasedOn = observer(function CalculationsBasedOn() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const oc = currentOverheatingCode

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ICalculationsFormData>({
    defaultValues: {
      dimensionalInfoBasedOn: oc?.dimensionalInfoBasedOn || "",
      attachment: oc?.attachment || "",
      numberOfStories: oc?.numberOfStories?.toString() || "",
      hasBasement: oc?.hasBasement ?? false,
      weatherLocation: oc?.weatherLocation || "",
      ventilated: oc?.ventilated ?? false,
      hrvErv: oc?.hrvErv ?? false,
      asePercentage: oc?.asePercentage?.toString() || "",
      atrePercentage: oc?.atrePercentage?.toString() || "",
      frontFacing: oc?.frontFacing || "",
      frontFacingAssumed: oc?.frontFacingAssumed ?? false,
      airTightnessCategory: oc?.airTightnessCategory || "",
      airTightnessAch50: oc?.airTightnessAch50?.toString() || "",
      airTightnessEla10: oc?.airTightnessEla10?.toString() || "",
      airTightnessAssumed: oc?.airTightnessAssumed ?? false,
      windExposure: oc?.windExposure || "",
      windSheltering: oc?.windSheltering || "",
      internalShading: oc?.internalShading || "",
      internalShadingAssumed: oc?.internalShadingAssumed ?? false,
      occupants: oc?.occupants?.toString() || "",
      occupantsAssumed: oc?.occupantsAssumed ?? false,
      calculationUnits: oc?.calculationUnits || "",
    },
  })

  const airTightnessCategory = watch("airTightnessCategory")

  const parseOptionalInt = (val: string) => (val ? parseInt(val, 10) : null)
  const parseOptionalDecimal = (val: string) => (val ? parseFloat(val) : null)

  const onSubmit = async (data: ICalculationsFormData) => {
    if (!oc) return
    await updateOverheatingCode(oc.id, {
      dimensionalInfoBasedOn: data.dimensionalInfoBasedOn || null,
      attachment: data.attachment || null,
      numberOfStories: parseOptionalInt(data.numberOfStories),
      hasBasement: data.hasBasement,
      weatherLocation: data.weatherLocation || null,
      ventilated: data.ventilated,
      hrvErv: data.hrvErv,
      asePercentage: parseOptionalDecimal(data.asePercentage),
      atrePercentage: parseOptionalDecimal(data.atrePercentage),
      frontFacing: data.frontFacing || null,
      frontFacingAssumed: data.frontFacingAssumed,
      airTightnessCategory: data.airTightnessCategory || null,
      airTightnessAch50:
        data.airTightnessCategory === EOverheatingCodeAirTightnessCategory.test
          ? parseOptionalDecimal(data.airTightnessAch50)
          : null,
      airTightnessEla10:
        data.airTightnessCategory === EOverheatingCodeAirTightnessCategory.test
          ? parseOptionalDecimal(data.airTightnessEla10)
          : null,
      airTightnessAssumed: data.airTightnessAssumed,
      windExposure: data.windExposure || null,
      windSheltering: data.windSheltering || null,
      internalShading: data.internalShading || null,
      internalShadingAssumed: data.internalShadingAssumed,
      occupants: parseOptionalInt(data.occupants),
      occupantsAssumed: data.occupantsAssumed,
      calculationUnits: data.calculationUnits || null,
    })
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.calculationsBasedOn.title", "Calculations Based On")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.calculationsBasedOn.description",
          "The assumptions and data the heat loss/gain calculation is based on. See following page for results."
        )}
      </Text>

      <VStack spacing={8} align="stretch">
        {/* Dimensional Info */}
        <FormControl>
          <FormLabel fontWeight="bold">
            {t("overheatingCode.sections.calculationsBasedOn.dimensionalInfoLabel", "Dimensional Info Based On")}
          </FormLabel>
          <Input
            {...register("dimensionalInfoBasedOn")}
            placeholder={t(
              "overheatingCode.sections.calculationsBasedOn.dimensionalInfoPlaceholder",
              "e.g. Architect Design Dwgs Dated 21/Feb/2024"
            )}
          />
        </FormControl>

        {/* Attachment & # of Stories */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {/* [OVERHEATING TODO] Confirm attachment enum values */}
          <FormControl>
            <FormLabel>{t("overheatingCode.sections.calculationsBasedOn.attachmentLabel", "Attachment")}</FormLabel>
            <Select {...register("attachment")} placeholder={t("ui.select", "Select...")}>
              {Object.values(EOverheatingCodeAttachment).map((val) => (
                <option key={val} value={val}>
                  {t(`overheatingCode.sections.calculationsBasedOn.attachmentOptions.${val}`, val)}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isInvalid={!!errors.numberOfStories}>
            <FormLabel>
              {t("overheatingCode.sections.calculationsBasedOn.storiesLabel", "# of Stories (not including basement)")}
            </FormLabel>
            <Input
              type="number"
              {...register("numberOfStories", {
                validate: (v) => {
                  if (!v) return true
                  const n = parseInt(v, 10)
                  return (
                    (!isNaN(n) && n > 0) ||
                    t("overheatingCode.sections.calculationsBasedOn.storiesInvalid", "Must be a positive number")
                  )
                },
              })}
              placeholder="e.g. 2"
            />
            <FormErrorMessage>{errors.numberOfStories?.message}</FormErrorMessage>
          </FormControl>

          <FormControl display="flex" alignItems="flex-end" pb={2}>
            <Controller
              name="hasBasement"
              control={control}
              render={({ field: { value, onChange, ...rest } }) => (
                <Checkbox isChecked={value} onChange={onChange} {...rest}>
                  {t("overheatingCode.sections.calculationsBasedOn.hasBasementLabel", "Has Basement")}
                </Checkbox>
              )}
            />
          </FormControl>
        </SimpleGrid>

        {/* Weather Location & Front Facing */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {/* [OVERHEATING TODO] Consider making weather location a dropdown/enum instead of free text */}
          <FormControl>
            <FormLabel>
              {t("overheatingCode.sections.calculationsBasedOn.weatherLocationLabel", "Weather Location")}
            </FormLabel>
            <Input
              {...register("weatherLocation")}
              placeholder={t(
                "overheatingCode.sections.calculationsBasedOn.weatherLocationPlaceholder",
                "e.g. Vancouver"
              )}
            />
          </FormControl>

          <FormControl>
            <FormLabel>{t("overheatingCode.sections.calculationsBasedOn.frontFacingLabel", "Front Facing")}</FormLabel>
            <Select {...register("frontFacing")} placeholder={t("ui.select", "Select...")}>
              {Object.values(EOverheatingCodeFrontFacing).map((val) => (
                <option key={val} value={val}>
                  {t(`overheatingCode.sections.calculationsBasedOn.frontFacingOptions.${val}`, val)}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl display="flex" alignItems="flex-end" pb={2}>
            <Controller
              name="frontFacingAssumed"
              control={control}
              render={({ field: { value, onChange, ...rest } }) => (
                <Checkbox isChecked={value} onChange={onChange} {...rest}>
                  {t("overheatingCode.sections.calculationsBasedOn.assumed", "Assumed?")}
                </Checkbox>
              )}
            />
          </FormControl>
        </SimpleGrid>

        {/* Air Tightness */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl>
            <FormLabel>
              {t("overheatingCode.sections.calculationsBasedOn.airTightnessCategoryLabel", "Air Tightness")}
            </FormLabel>
            <Select {...register("airTightnessCategory")} placeholder={t("ui.select", "Select...")}>
              {Object.values(EOverheatingCodeAirTightnessCategory).map((val) => (
                <option key={val} value={val}>
                  {t(`overheatingCode.sections.calculationsBasedOn.airTightnessOptions.${val}`, val)}
                </option>
              ))}
            </Select>
          </FormControl>

          {airTightnessCategory === EOverheatingCodeAirTightnessCategory.test && (
            <>
              <FormControl isInvalid={!!errors.airTightnessAch50}>
                <FormLabel>{t("overheatingCode.sections.calculationsBasedOn.ach50Label", "ACH50")}</FormLabel>
                <Input type="number" step="0.01" {...register("airTightnessAch50")} placeholder="0.00" />
                <FormErrorMessage>{errors.airTightnessAch50?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.airTightnessEla10}>
                <FormLabel>{t("overheatingCode.sections.calculationsBasedOn.ela10Label", "ELA10")}</FormLabel>
                <Input type="number" step="0.01" {...register("airTightnessEla10")} placeholder="0.00" />
                <FormErrorMessage>{errors.airTightnessEla10?.message}</FormErrorMessage>
              </FormControl>
            </>
          )}

          {airTightnessCategory !== EOverheatingCodeAirTightnessCategory.test && (
            <FormControl display="flex" alignItems="flex-end" pb={2}>
              <Controller
                name="airTightnessAssumed"
                control={control}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Checkbox isChecked={value} onChange={onChange} {...rest}>
                    {t("overheatingCode.sections.calculationsBasedOn.assumed", "Assumed?")}
                  </Checkbox>
                )}
              />
            </FormControl>
          )}
        </SimpleGrid>

        {/* Wind Exposure & Sheltering */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>
              {t("overheatingCode.sections.calculationsBasedOn.windExposureLabel", "Wind Exposure, Site")}
            </FormLabel>
            <Select {...register("windExposure")} placeholder={t("ui.select", "Select...")}>
              {Object.values(EOverheatingCodeWindExposure).map((val) => (
                <option key={val} value={val}>
                  {t(`overheatingCode.sections.calculationsBasedOn.windExposureOptions.${val}`, val)}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>
              {t("overheatingCode.sections.calculationsBasedOn.windShelteringLabel", "Wind Sheltering, Building")}
            </FormLabel>
            <Select {...register("windSheltering")} placeholder={t("ui.select", "Select...")}>
              {Object.values(EOverheatingCodeWindSheltering).map((val) => (
                <option key={val} value={val}>
                  {t(`overheatingCode.sections.calculationsBasedOn.windShelteringOptions.${val}`, val)}
                </option>
              ))}
            </Select>
          </FormControl>
        </SimpleGrid>

        {/* Internal Shading & Occupants */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl>
            <FormLabel>
              {t("overheatingCode.sections.calculationsBasedOn.internalShadingLabel", "Internal Shading")}
            </FormLabel>
            <Select {...register("internalShading")} placeholder={t("ui.select", "Select...")}>
              {Object.values(EOverheatingCodeInternalShading).map((val) => (
                <option key={val} value={val}>
                  {t(`overheatingCode.sections.calculationsBasedOn.internalShadingOptions.${val}`, val)}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl display="flex" alignItems="flex-end" pb={2}>
            <Controller
              name="internalShadingAssumed"
              control={control}
              render={({ field: { value, onChange, ...rest } }) => (
                <Checkbox isChecked={value} onChange={onChange} {...rest}>
                  {t("overheatingCode.sections.calculationsBasedOn.assumed", "Assumed?")}
                </Checkbox>
              )}
            />
          </FormControl>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl isInvalid={!!errors.occupants}>
            <FormLabel>{t("overheatingCode.sections.calculationsBasedOn.occupantsLabel", "Occupants")}</FormLabel>
            <Input
              type="number"
              {...register("occupants", {
                validate: (v) => {
                  if (!v) return true
                  const n = parseInt(v, 10)
                  return (
                    (!isNaN(n) && n > 0) ||
                    t("overheatingCode.sections.calculationsBasedOn.occupantsInvalid", "Must be a positive number")
                  )
                },
              })}
              placeholder="e.g. 4"
            />
            <FormErrorMessage>{errors.occupants?.message}</FormErrorMessage>
          </FormControl>

          <FormControl display="flex" alignItems="flex-end" pb={2}>
            <Controller
              name="occupantsAssumed"
              control={control}
              render={({ field: { value, onChange, ...rest } }) => (
                <Checkbox isChecked={value} onChange={onChange} {...rest}>
                  {t("overheatingCode.sections.calculationsBasedOn.assumed", "Assumed?")}
                </Checkbox>
              )}
            />
          </FormControl>
        </SimpleGrid>

        {/* Ventilation */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl display="flex" alignItems="flex-end" pb={2}>
            <Controller
              name="ventilated"
              control={control}
              render={({ field: { value, onChange, ...rest } }) => (
                <Checkbox isChecked={value} onChange={onChange} {...rest}>
                  {t("overheatingCode.sections.calculationsBasedOn.ventilatedLabel", "Ventilated?")}
                </Checkbox>
              )}
            />
          </FormControl>

          <FormControl display="flex" alignItems="flex-end" pb={2}>
            <Controller
              name="hrvErv"
              control={control}
              render={({ field: { value, onChange, ...rest } }) => (
                <Checkbox isChecked={value} onChange={onChange} {...rest}>
                  {t("overheatingCode.sections.calculationsBasedOn.hrvErvLabel", "HRV/ERV?")}
                </Checkbox>
              )}
            />
          </FormControl>
        </SimpleGrid>

        {/* ASE / ATRE */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isInvalid={!!errors.asePercentage}>
            <FormLabel>{t("overheatingCode.sections.calculationsBasedOn.aseLabel", "ASE %")}</FormLabel>
            <InputGroup maxW="250px">
              <Input
                type="number"
                step="0.01"
                {...register("asePercentage", {
                  validate: (v) => {
                    if (!v) return true
                    const n = parseFloat(v)
                    return (
                      (!isNaN(n) && n >= 0 && n <= 100) ||
                      t("overheatingCode.sections.calculationsBasedOn.percentageInvalid", "Must be between 0 and 100")
                    )
                  },
                })}
                placeholder="0.00"
              />
              <InputRightAddon>%</InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{errors.asePercentage?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.atrePercentage}>
            <FormLabel>{t("overheatingCode.sections.calculationsBasedOn.atreLabel", "ATRE %")}</FormLabel>
            <InputGroup maxW="250px">
              <Input
                type="number"
                step="0.01"
                {...register("atrePercentage", {
                  validate: (v) => {
                    if (!v) return true
                    const n = parseFloat(v)
                    return (
                      (!isNaN(n) && n >= 0 && n <= 100) ||
                      t("overheatingCode.sections.calculationsBasedOn.percentageInvalid", "Must be between 0 and 100")
                    )
                  },
                })}
                placeholder="0.00"
              />
              <InputRightAddon>%</InputRightAddon>
            </InputGroup>
            <FormErrorMessage>{errors.atrePercentage?.message}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>

        {/* [OVERHEATING TODO] Clarify significance of this units field — none of the fields on this page use unit quantities */}
        <FormControl>
          <FormLabel fontWeight="bold">
            {t("overheatingCode.sections.calculationsBasedOn.calculationUnitsLabel", "Units")}
          </FormLabel>
          <Controller
            name="calculationUnits"
            control={control}
            render={({ field }) => (
              <RadioGroup {...field}>
                <Stack direction="row" spacing={6}>
                  {Object.values(EOverheatingCodeCalculationUnits).map((val) => (
                    <Radio key={val} value={val}>
                      {t(`overheatingCode.sections.calculationsBasedOn.calculationUnitsOptions.${val}`, val)}
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
            )}
          />
        </FormControl>
      </VStack>

      <FormFooter<ICalculationsFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Box>
  )
})
