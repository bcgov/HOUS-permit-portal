import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
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
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EPart3StepCodeSoftware } from "../../../../../types/enums"
import { generateUUID } from "../../../../../utils/utility-functions"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { RowHeader } from "../../part-9/checklist/building-characteristics-summary/row-header"
import { GridColumnHeader } from "../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../part-9/checklist/shared/grid/data"
import { SectionHeading } from "./shared/section-heading"

export const PerformanceCharacteristics = observer(function Part3StepCodeFormPerformanceCharacteristics() {
  const { checklist } = usePart3StepCode()
  const i18nPrefix = "stepCode.part3.performanceCharacteristics"

  const navigate = useNavigate()
  const location = useLocation()

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
    const updated = await checklist.update(values)
    if (updated) {
      await checklist.completeSection("performanceCharacteristics")
      navigate(location.pathname.replace("performance-characteristics", "hvac"))
    }
  }

  useEffect(() => {
    if (isSubmitted) {
      // reset form state to prevent message box from showing again until form is resubmitted
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
        {!isValid && isSubmitted && <CustomMessageBox title={t("stepCode.part3.errorTitle")} status="error" />}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
      </Flex>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
            <FormControl>
              <FormLabel pb={1}>{t(`${i18nPrefix}.software.label`)}</FormLabel>
              <FormHelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="software" />
              </FormHelperText>
              <Controller
                name="software"
                control={control}
                rules={{ required: t(`${i18nPrefix}.software.error`) }}
                render={({ field: { value, onChange } }) => (
                  <RadioGroup value={value} onChange={onChange}>
                    <SimpleGrid columns={2} spacing={4}>
                      {Object.values(EPart3StepCodeSoftware).map((s) => (
                        <Radio key={generateUUID()} value={s}>
                          {t(`${i18nPrefix}.software.options.${s}`)}
                        </Radio>
                      ))}
                    </SimpleGrid>
                  </RadioGroup>
                )}
              />
            </FormControl>
            {watchSoftware == EPart3StepCodeSoftware.other && (
              <FormControl>
                <FormLabel>{t(`${i18nPrefix}.softwareName.label`)}</FormLabel>
                <FormHelperText mb={1} mt={0} color="semantic.error">
                  <ErrorMessage errors={errors} name="softwareName" />
                </FormHelperText>
                <Input
                  maxW={"430px"}
                  {...register("softwareName", { required: t(`${i18nPrefix}.softwareName.error`) })}
                />
              </FormControl>
            )}
            <FormControl>
              <FormLabel>{t(`${i18nPrefix}.weatherFile.label`)}</FormLabel>
              <FormHelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="simulationWeatherFile" />
              </FormHelperText>
              <Input
                maxW={"430px"}
                {...register("simulationWeatherFile", { required: t(`${i18nPrefix}.weatherFile.error`) })}
              />
            </FormControl>
            <FormControl>
              <FormLabel pb={1}>{t(`${i18nPrefix}.ventilation.label`)}</FormLabel>
              <FormHelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="isDemandControlVentilationUsed" />
              </FormHelperText>
              <Controller
                name="isDemandControlVentilationUsed"
                control={control}
                rules={{
                  validate: (value) => value === true || value === false || t(`${i18nPrefix}.ventilation.error`),
                }}
                render={({ field: { value, onChange } }) => (
                  <RadioGroup onChange={(val) => onChange(val === "yes")} value={value ? "yes" : "no"}>
                    <Stack spacing={5} direction="row">
                      <Radio variant="binary" value={"yes"}>
                        {t("ui.yes")}
                      </Radio>
                      <Radio variant="binary" value={"no"}>
                        {t("ui.no")}
                      </Radio>
                    </Stack>
                  </RadioGroup>
                )}
              />
            </FormControl>

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
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton aria-label="above ground wall area hint" icon={<Info />} variant="ghost" />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.aboveGroundWallArea.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("aboveGroundWallArea", { required: t(`${i18nPrefix}.aboveGroundWallArea.error`) })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="aboveGroundWallArea" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* Vertical facade to floor area ratio */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>{t(`${i18nPrefix}.vfar.label`)}</Text>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input value={verticalFacadeFloorRatio || "-"} isDisabled textAlign="center" />
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* window-to-wall area ratio */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>{t(`${i18nPrefix}.wwr.label`)}</Text>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <InputGroup>
                    <Input
                      textAlign="center"
                      {...register("windowToWallAreaRatio", { required: t(`${i18nPrefix}.wwr.error`) })}
                    />
                    <InputRightElement>{t(`${i18nPrefix}.wwr.units`)}</InputRightElement>
                  </InputGroup>
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="windowToWallAreaRatio" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* window-to-floor area ratio */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>{t(`${i18nPrefix}.wfr.label`)}</Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton aria-label={t(`${i18nPrefix}.wfr.hint`)} icon={<Info />} variant="ghost" />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.wfr.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input value={windowFloorRatio || "-"} isDisabled textAlign="center" />
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* airtightness */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.airtightness.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton aria-label={t(`${i18nPrefix}.airtightness.hint`)} icon={<Info />} variant="ghost" />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.airtightness.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("designAirtightness", { required: t(`${i18nPrefix}.airtightness.error`) })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="designAirtightness" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* infiltration rate */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.infiltrationRate.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton
                        aria-label={t(`${i18nPrefix}.infiltrationRate.hint`)}
                        icon={<Info />}
                        variant="ghost"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.infiltrationRate.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("modelledInfiltrationRate", { required: t(`${i18nPrefix}.infiltrationRate.error`) })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="modelledInfiltrationRate" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* wall clear field R-value */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.wallClearField.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton aria-label={t(`${i18nPrefix}.wallClearField.hint`)} icon={<Info />} variant="ghost" />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.wallClearField.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("averageWallClearFieldRValue", { required: t(`${i18nPrefix}.wallClearField.error`) })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="averageWallClearFieldRValue" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <InputGroup>
                  <Input value={wallClearFieldConversion || "-"} isDisabled pr={"88px"} textAlign="center" />
                  <InputRightElement w="auto" px={1}>
                    <Text>
                      <Trans i18nKey={`${i18nPrefix}.wallClearField.conversionUnits`} components={{ sup: <sup /> }} />
                    </Text>
                  </InputRightElement>
                </InputGroup>
              </GridData>

              {/* wall effective field R-value */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.wallEffectiveField.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton
                        aria-label={t(`${i18nPrefix}.wallEffectiveField.hint`)}
                        icon={<Info />}
                        variant="ghost"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.wallEffectiveField.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("averageWallEffectiveRValue", {
                      required: t(`${i18nPrefix}.wallEffectiveField.error`),
                    })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="averageWallEffectiveRValue" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* roof clear field R-value */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.roofClearField.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton aria-label={t(`${i18nPrefix}.roofClearField.hint`)} icon={<Info />} variant="ghost" />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.roofClearField.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("averageRoofClearFieldRValue", { required: t(`${i18nPrefix}.roofClearField.error`) })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="averageRoofClearFieldRValue" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <InputGroup>
                  <Input value={roofClearFieldConversion || "-"} isDisabled pr={"88px"} textAlign="center" />
                  <InputRightElement w="auto" px={1}>
                    <Text>
                      <Trans i18nKey={`${i18nPrefix}.roofClearField.conversionUnits`} components={{ sup: <sup /> }} />
                    </Text>
                  </InputRightElement>
                </InputGroup>
              </GridData>

              {/* roof effective field R-value */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.roofEffectiveField.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton
                        aria-label={t(`${i18nPrefix}.roofEffectiveField.hint`)}
                        icon={<Info />}
                        variant="ghost"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.roofEffectiveField.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("averageRoofEffectiveRValue", {
                      required: t(`${i18nPrefix}.roofEffectiveField.error`),
                    })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="averageRoofEffectiveRValue" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* window effective U-value */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.windowEffective.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton
                        aria-label={t(`${i18nPrefix}.windowEffective.hint`)}
                        icon={<Info />}
                        variant="ghost"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.windowEffective.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("averageWindowEffectiveUValue", {
                      required: t(`${i18nPrefix}.windowEffective.error`),
                    })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="averageWindowEffectiveUValue" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <InputGroup>
                  <Input value={windowEffectiveConversion || "-"} isDisabled pr={"88px"} textAlign="center" />
                  <InputRightElement w="auto" px={1}>
                    <Text>
                      <Trans i18nKey={`${i18nPrefix}.windowEffective.conversionUnits`} components={{ sup: <sup /> }} />
                    </Text>
                  </InputRightElement>
                </InputGroup>
              </GridData>

              {/* window solar heat gain coefficient */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.windowSolar.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton aria-label={t(`${i18nPrefix}.windowSolar.hint`)} icon={<Info />} variant="ghost" />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.windowSolar.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("averageWindowSolarHeatGainCoefficient", {
                      required: t(`${i18nPrefix}.windowSolar.error`),
                    })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="averageWindowSolarHeatGainCoefficient" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* occupant density */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.occupantDensity.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton
                        aria-label={t(`${i18nPrefix}.occupantDensity.hint`)}
                        icon={<Info />}
                        variant="ghost"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.occupantDensity.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("averageOccupantDensity", {
                      required: t(`${i18nPrefix}.occupantDensity.error`),
                    })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="averageOccupantDensity" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* lighting density */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.lightingDensity.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton
                        aria-label={t(`${i18nPrefix}.lightingDensity.hint`)}
                        icon={<Info />}
                        variant="ghost"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.lightingDensity.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("averageLightingPowerDensity", {
                      required: t(`${i18nPrefix}.lightingDensity.error`),
                    })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="averageLightingPowerDensity" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* ventilation rate */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.ventilationRate.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton
                        aria-label={t(`${i18nPrefix}.ventilationRate.hint`)}
                        icon={<Info />}
                        variant="ghost"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.ventilationRate.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("averageVentilationRate", {
                      required: t(`${i18nPrefix}.ventilationRate.error`),
                    })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="averageVentilationRate" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* DHW low-flow savings */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.dhwSavings.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton aria-label={t(`${i18nPrefix}.dhwSavings.hint`)} icon={<Info />} variant="ghost" />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.dhwSavings.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <InputGroup>
                    <Input
                      textAlign="center"
                      {...register("dhwLowFlowSavings", {
                        required: t(`${i18nPrefix}.dhwSavings.error`),
                      })}
                    />
                    <InputRightElement>{t(`${i18nPrefix}.dhwSavings.units`)}</InputRightElement>
                  </InputGroup>

                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="dhwLowFlowSavings" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>

              {/* HRV/ERV sensible efficiency */}
              <RowHeader borderRightWidth={1}>
                <HStack>
                  <Text>
                    <Trans i18nKey={`${i18nPrefix}.hrvErvEfficiency.label`} components={{ sup: <sup /> }} />
                  </Text>
                  <Popover placement="top-start">
                    <PopoverTrigger>
                      <IconButton
                        aria-label={t(`${i18nPrefix}.hrvErvEfficiency.hint`)}
                        icon={<Info />}
                        variant="ghost"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverBody fontWeight="normal">
                        <Trans i18nKey={`${i18nPrefix}.hrvErvEfficiency.hint`} />
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                </HStack>
              </RowHeader>
              <GridData>
                <FormControl>
                  <Input
                    textAlign="center"
                    {...register("sensibleRecoveryEfficiency", {
                      required: t(`${i18nPrefix}.hrvErvEfficiency.error`),
                    })}
                  />
                  <FormHelperText mb={1} mt={0} color="semantic.error">
                    <ErrorMessage errors={errors} name="sensibleRecoveryEfficiency" />
                  </FormHelperText>
                </FormControl>
              </GridData>
              <GridData>
                <Input value="-" isDisabled textAlign="center" />
              </GridData>
            </Grid>
            <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
              {t("stepCode.part3.cta")}
            </Button>
          </Flex>
        </form>
      </FormProvider>
    </>
  )
})
