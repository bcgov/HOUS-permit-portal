import { InputGroup } from "@/components/ui/input-group"
import { Radio, RadioGroup } from "@/components/ui/radio"
import {
  Field,
  Flex,
  Grid,
  HStack,
  IconButton,
  Input,
  InputElement,
  Popover,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { Info } from "@phosphor-icons/react/dist/ssr"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus, EPart3StepCodeSoftware } from "../../../../../types/enums"
import { generateUUID } from "../../../../../utils/utility-functions"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { RowHeader } from "../../part-9/checklist/building-characteristics-summary/row-header"
import { GridColumnHeader } from "../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../part-9/checklist/shared/grid/data"
import { Part3FormFooter } from "./shared/form-footer"
import { SectionHeading } from "./shared/section-heading"

export const PerformanceCharacteristics = observer(function Part3StepCodeFormPerformanceCharacteristics() {
  const { checklist } = usePart3StepCode()
  const i18nPrefix = "stepCode.part3.performanceCharacteristics"

  const formMethods = useForm({
    mode: "onSubmit",
    defaultValues: {
      software: checklist.software,
      softwareName: checklist.softwareName,
      simulationWeatherFile: checklist.simulationWeatherFile,
      aboveGroundWallArea: checklist.aboveGroundWallArea,
      windowToWallAreaRatio: checklist.windowToWallAreaRatio,
      designAirtightness: checklist.designAirtightness,
      modelledInfiltrationRate: checklist.modelledInfiltrationRate,
      averageWallClearFieldRValue: checklist.averageWallClearFieldRValue,
      averageWallEffectiveRValue: checklist.averageWallEffectiveRValue,
      averageRoofClearFieldRValue: checklist.averageRoofClearFieldRValue,
      averageRoofEffectiveRValue: checklist.averageRoofEffectiveRValue,
      averageWindowEffectiveUValue: checklist.averageWindowEffectiveUValue,
      averageWindowSolarHeatGainCoefficient: checklist.averageWindowSolarHeatGainCoefficient,
      averageOccupantDensity: checklist.averageOccupantDensity,
      averageLightingPowerDensity: checklist.averageLightingPowerDensity,
      averageVentilationRate: checklist.averageVentilationRate,
      dhwLowFlowSavings: checklist.dhwLowFlowSavings,
      isDemandControlVentilationUsed: checklist.isDemandControlVentilationUsed,
      sensibleRecoveryEfficiency: checklist.sensibleRecoveryEfficiency,
    },
  })
  const { handleSubmit, formState, register, control, reset, setValue, watch, getValues } = formMethods
  const { isSubmitting, isValid, isSubmitted, errors } = formState
  const watchSoftware = watch("software")
  const watchAboveGroundWallArea = watch("aboveGroundWallArea")
  const watchWindowToWallAreaRatio = watch("windowToWallAreaRatio")
  const watchWallClearField = watch("averageWallClearFieldRValue")
  const watchRoofClearField = watch("averageRoofClearFieldRValue")
  const watchWindowEffective = watch("averageWindowEffectiveUValue")

  const verticalFacadeFloorRatio = useMemo(() => {
    if (!watchAboveGroundWallArea || checklist.totalMFA == 0) return
    return (parseFloat(watchAboveGroundWallArea) / checklist.totalMFA).toFixed(2)
  }, [watchAboveGroundWallArea])

  const windowFloorRatio = useMemo(() => {
    if (!watchAboveGroundWallArea || !watchWindowToWallAreaRatio || checklist.totalMFA == 0) return
    return (parseFloat(watchAboveGroundWallArea) * parseFloat(watchWindowToWallAreaRatio)) / checklist.totalMFA
  }, [watchAboveGroundWallArea, watchWindowToWallAreaRatio])

  const wallClearFieldConversion = useMemo(() => {
    if (!watchWallClearField) return
    return (parseFloat(watchWallClearField) * 5.68).toFixed(1)
  }, [watchWallClearField])

  const roofClearFieldConversion = useMemo(() => {
    if (!watchWallClearField) return
    return (parseFloat(watchRoofClearField) * 5.68).toFixed(1)
  }, [watchRoofClearField])

  const windowEffectiveConversion = useMemo(() => {
    if (!watchWallClearField) return
    return (parseFloat(watchWallClearField) / 5.68).toFixed(1)
  }, [watchWindowEffective])

  const onSubmit = async (values) => {
    if (!checklist) return

    const updated = await checklist.update(values)
    if (!updated) throw new Error("Save failed")

    await checklist.completeSection("performanceCharacteristics")
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  useEffect(() => {
    if (watchSoftware && watchSoftware != EPart3StepCodeSoftware.other && getValues("softwareName")) {
      setValue("softwareName", null)
    }
  }, [watchSoftware])

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        {!isValid && isSubmitted && (
          <CustomMessageBox title={t("stepCode.part3.errorTitle")} status={EFlashMessageStatus.error} />
        )}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
      </Flex>
      <FormProvider {...formMethods}>
        <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
          <Field.Root>
            <Field.Label pb={1}>{t(`${i18nPrefix}.software.label`)}</Field.Label>
            <Field.HelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name="software" />
            </Field.HelperText>
            <Controller
              name="software"
              control={control}
              rules={{ required: t(`${i18nPrefix}.software.error`) }}
              render={({ field: { value, onChange } }) => (
                <RadioGroup.Root value={value} onValueChange={onChange}>
                  <SimpleGrid columns={2} gap={4}>
                    {Object.values(EPart3StepCodeSoftware).map((s) => (
                      <Radio key={generateUUID()} value={s}>
                        {t(`${i18nPrefix}.software.options.${s}`)}
                      </Radio>
                    ))}
                  </SimpleGrid>
                </RadioGroup.Root>
              )}
            />
          </Field.Root>
          {watchSoftware == EPart3StepCodeSoftware.other && (
            <Field.Root>
              <Field.Label>{t(`${i18nPrefix}.softwareName.label`)}</Field.Label>
              <Field.HelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="softwareName" />
              </Field.HelperText>
              <Input
                maxW={"430px"}
                {...register("softwareName", { required: t(`${i18nPrefix}.softwareName.error`) })}
              />
            </Field.Root>
          )}
          <Field.Root>
            <Field.Label>{t(`${i18nPrefix}.weatherFile.label`)}</Field.Label>
            <Field.HelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name="simulationWeatherFile" />
            </Field.HelperText>
            <Input
              maxW={"430px"}
              {...register("simulationWeatherFile", { required: t(`${i18nPrefix}.weatherFile.error`) })}
            />
          </Field.Root>
          <Field.Root>
            <Field.Label pb={1}>{t(`${i18nPrefix}.ventilation.label`)}</Field.Label>
            <Field.HelperText mb={1} mt={0} color="semantic.error">
              <ErrorMessage errors={errors} name="isDemandControlVentilationUsed" />
            </Field.HelperText>
            <Controller
              name="isDemandControlVentilationUsed"
              control={control}
              rules={{
                validate: (value) => value === true || value === false || t(`${i18nPrefix}.ventilation.error`),
              }}
              render={({ field: { value, onChange } }) => (
                <RadioGroup.Root
                  onValueChange={(val) => onChange(val === "yes")}
                  value={value === true ? "yes" : value === false ? "no" : undefined}
                >
                  <Stack gap={5} direction="row">
                    <RadioGroup.Item variant="binary" value={"yes"}>
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>{t("ui.yes")}</RadioGroup.ItemText>
                    </RadioGroup.Item>
                    <RadioGroup.Item variant="binary" value={"no"}>
                      <RadioGroup.ItemHiddenInput />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>{t("ui.no")}</RadioGroup.ItemText>
                    </RadioGroup.Item>
                  </Stack>
                </RadioGroup.Root>
              )}
            />
          </Field.Root>

          <Grid
            w="full"
            templateColumns={`auto repeat(2, minmax(auto, 216px))`}
            borderWidth={1}
            borderTopWidth={0}
            // borderBottomWidth={0}
            borderColor="borders.light"
          >
            <GridColumnHeader>
              <Text>{t(`${i18nPrefix}.buildingCharacteristics.description`)}</Text>
            </GridColumnHeader>
            <GridColumnHeader>
              <Text>{t(`${i18nPrefix}.buildingCharacteristics.value`)}</Text>
            </GridColumnHeader>
            <GridColumnHeader>
              <Text>{t(`${i18nPrefix}.buildingCharacteristics.result`)}</Text>
            </GridColumnHeader>

            {/* ABOVE GROUND WALL AREA */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.aboveGroundWallArea.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label="above ground wall area hint" variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.aboveGroundWallArea.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("aboveGroundWallArea", { required: t(`${i18nPrefix}.aboveGroundWallArea.error`) })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="aboveGroundWallArea" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* Vertical facade to floor area ratio */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>{t(`${i18nPrefix}.vfar.label`)}</Text>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input value={verticalFacadeFloorRatio || "-"} disabled textAlign="center" />
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* window-to-wall area ratio */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>{t(`${i18nPrefix}.wwr.label`)}</Text>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <InputGroup>
                  <Input
                    textAlign="center"
                    {...register("windowToWallAreaRatio", { required: t(`${i18nPrefix}.wwr.error`) })}
                  />
                  <InputElement placement="end">{t(`${i18nPrefix}.wwr.units`)}</InputElement>
                </InputGroup>
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="windowToWallAreaRatio" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* window-to-floor area ratio */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>{t(`${i18nPrefix}.wfr.label`)}</Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.wfr.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.wfr.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input value={windowFloorRatio?.toFixed(3) || "-"} disabled textAlign="center" />
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* airtightness */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.airtightness.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.airtightness.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.airtightness.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("designAirtightness", { required: t(`${i18nPrefix}.airtightness.error`) })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="designAirtightness" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* infiltration rate */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.infiltrationRate.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.infiltrationRate.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.infiltrationRate.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("modelledInfiltrationRate", { required: t(`${i18nPrefix}.infiltrationRate.error`) })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="modelledInfiltrationRate" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* wall clear field R-value */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.wallClearField.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.wallClearField.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.wallClearField.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("averageWallClearFieldRValue", { required: t(`${i18nPrefix}.wallClearField.error`) })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="averageWallClearFieldRValue" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <InputGroup>
                <Input value={wallClearFieldConversion || "-"} disabled pr={"88px"} textAlign="center" />
                <InputElement placement="end" w="auto" px={1}>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.wallClearField.conversionUnits`} components={{ sup: <sup /> }} />
                  </Text>
                </InputElement>
              </InputGroup>
            </GridData>

            {/* wall effective field R-value */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.wallEffectiveField.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.wallEffectiveField.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.wallEffectiveField.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("averageWallEffectiveRValue", {
                    required: t(`${i18nPrefix}.wallEffectiveField.error`),
                  })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="averageWallEffectiveRValue" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* roof clear field R-value */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.roofClearField.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.roofClearField.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.roofClearField.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("averageRoofClearFieldRValue", { required: t(`${i18nPrefix}.roofClearField.error`) })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="averageRoofClearFieldRValue" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <InputGroup>
                <Input value={roofClearFieldConversion || "-"} disabled pr={"88px"} textAlign="center" />
                <InputElement placement="end" w="auto" px={1}>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.roofClearField.conversionUnits`} components={{ sup: <sup /> }} />
                  </Text>
                </InputElement>
              </InputGroup>
            </GridData>

            {/* roof effective field R-value */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.roofEffectiveField.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.roofEffectiveField.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.roofEffectiveField.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("averageRoofEffectiveRValue", {
                    required: t(`${i18nPrefix}.roofEffectiveField.error`),
                  })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="averageRoofEffectiveRValue" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* window effective U-value */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.windowEffective.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.windowEffective.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.windowEffective.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("averageWindowEffectiveUValue", {
                    required: t(`${i18nPrefix}.windowEffective.error`),
                  })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="averageWindowEffectiveUValue" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <InputGroup>
                <Input value={windowEffectiveConversion || "-"} disabled pr={"88px"} textAlign="center" />
                <InputElement placement="end" w="auto" px={1}>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.windowEffective.conversionUnits`} components={{ sup: <sup /> }} />
                  </Text>
                </InputElement>
              </InputGroup>
            </GridData>

            {/* window solar heat gain coefficient */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.windowSolar.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.windowSolar.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.windowSolar.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("averageWindowSolarHeatGainCoefficient", {
                    required: t(`${i18nPrefix}.windowSolar.error`),
                  })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="averageWindowSolarHeatGainCoefficient" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* occupant density */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.occupantDensity.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.occupantDensity.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.occupantDensity.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("averageOccupantDensity", {
                    required: t(`${i18nPrefix}.occupantDensity.error`),
                  })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="averageOccupantDensity" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* lighting density */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.lightingDensity.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.lightingDensity.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.lightingDensity.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("averageLightingPowerDensity", {
                    required: t(`${i18nPrefix}.lightingDensity.error`),
                  })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="averageLightingPowerDensity" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* ventilation rate */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.ventilationRate.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.ventilationRate.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.ventilationRate.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("averageVentilationRate", {
                    required: t(`${i18nPrefix}.ventilationRate.error`),
                  })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="averageVentilationRate" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* DHW low-flow savings */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.dhwSavings.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.dhwSavings.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.dhwSavings.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <InputGroup>
                  <Input
                    textAlign="center"
                    {...register("dhwLowFlowSavings", {
                      required: t(`${i18nPrefix}.dhwSavings.error`),
                    })}
                  />
                  <InputElement placement="end">{t(`${i18nPrefix}.dhwSavings.units`)}</InputElement>
                </InputGroup>

                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="dhwLowFlowSavings" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>

            {/* HRV/ERV sensible efficiency */}
            <RowHeader borderRightWidth={1}>
              <HStack>
                <Text>
                  <Trans i18nKey={`${i18nPrefix}.hrvErvEfficiency.label`} components={{ sup: <sup /> }} />
                </Text>
                <Popover.Root
                  positioning={{
                    placement: "top-start",
                  }}
                >
                  <Popover.Trigger asChild>
                    <IconButton aria-label={t(`${i18nPrefix}.hrvErvEfficiency.hint`)} variant="ghost">
                      <Info />
                    </IconButton>
                  </Popover.Trigger>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Body fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.hrvErvEfficiency.hint`} />
                      </Popover.Body>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </HStack>
            </RowHeader>
            <GridData>
              <Field.Root>
                <Input
                  textAlign="center"
                  {...register("sensibleRecoveryEfficiency", {
                    required: t(`${i18nPrefix}.hrvErvEfficiency.error`),
                  })}
                />
                <Field.HelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="sensibleRecoveryEfficiency" />
                </Field.HelperText>
              </Field.Root>
            </GridData>
            <GridData>
              <Input value="-" disabled textAlign="center" />
            </GridData>
          </Grid>
          <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
        </Flex>
      </FormProvider>
    </>
  )
})
