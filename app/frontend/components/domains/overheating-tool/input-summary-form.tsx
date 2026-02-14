import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Radio,
  RadioGroup,
  Stack,
  useToast,
} from "@chakra-ui/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { TextFormControl } from "../../shared/form/input-form-control"

import { useSectionCompletion } from "../../../hooks/use-section-completion"
import { useMst } from "../../../setup/root"

/** Helper to access nested error object from a dot-separated path like "calculationBasedOn.stories" */
const getNestedError = (errors: any, fieldName: string) => {
  return fieldName.split(".").reduce((obj, key) => obj?.[key], errors)
}

interface RequiredInputFieldProps {
  fieldName: string
  label: string
  maxLength?: number
  width?: string
  type?: string
  step?: number
  filterPattern?: RegExp
}

/** Reusable required input field with validation, replacing repeated IIFE patterns */
const RequiredInputField: React.FC<RequiredInputFieldProps> = ({
  fieldName,
  label,
  maxLength = 60,
  width = "50%",
  type = "text",
  step,
  filterPattern,
}) => {
  const { t } = useTranslation() as any
  const { register, formState } = useFormContext()
  const { errors } = formState as any
  const fieldError = getNestedError(errors, fieldName)

  return (
    <FormControl isInvalid={!!fieldError}>
      <FormLabel htmlFor={fieldName}>{label}</FormLabel>
      <Input
        id={fieldName}
        type={type}
        maxLength={maxLength}
        width={width}
        step={step}
        {...(register as any)(fieldName, {
          required: t("ui.isRequired", { field: label }) as string,
        })}
        {...(filterPattern && {
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value
            const filtered = value.replace(filterPattern, "")
            if (filtered !== value) {
              e.target.value = filtered
            }
          },
        })}
      />
      <FormErrorMessage>{fieldError?.message as any}</FormErrorMessage>
    </FormControl>
  )
}

export const InputSummaryForm = () => {
  const { t } = useTranslation() as any
  const prefix = "singleZoneCoolingHeatingTool.inputSummary"
  const { overheatingToolStore } = useMst()
  const { setValue, watch, trigger, register, formState, getValues } = useFormContext()
  const { errors } = formState as any
  const toast = useToast()
  const ventilated = watch("climateData.ventilated")
  const hrvErv = watch("climateData.hrvErv")

  const inputSummarySections = React.useMemo(
    () => [
      t(`${prefix}.inputSummarySections.aboveGradeWalls`),
      t(`${prefix}.inputSummarySections.belowGradeWalls`),
      t(`${prefix}.inputSummarySections.ceilings`),
      t(`${prefix}.inputSummarySections.floorsOnSoil`),
      t(`${prefix}.inputSummarySections.windows`),
      t(`${prefix}.inputSummarySections.exposedFloors`),
      t(`${prefix}.inputSummarySections.doors`),
      t(`${prefix}.inputSummarySections.skylights`),
    ],
    [t]
  )

  const requiredFields = React.useMemo(() => {
    const baseFields = [
      "calculationBasedOn.dimensionalInfo",
      "calculationBasedOn.attachment",
      "calculationBasedOn.frontFacing",
      "calculationBasedOn.frontFacingAssumed",
      "calculationBasedOn.stories",
      "calculationBasedOn.airTightness",
      "calculationBasedOn.airTightnessAssumed",
      "calculationBasedOn.weatherLocation",
      "calculationBasedOn.internalShading",
      "calculationBasedOn.assumed",
      "climateData.windExposure",
      "climateData.windSheilding",
      "climateData.ventilated",
      "climateData.hrvErv",
      "climateData.ase",
      "climateData.atre",
      "heatingDesignConditions.outdoorTemp",
      "heatingDesignConditions.indoorTemp",
      "heatingDesignConditions.soilConductivity",
      "heatingDesignConditions.meanSoilTemp",
      "heatingDesignConditions.waterTableDepth",
      "heatingDesignConditions.slabFluidTemp",
      "coolingDesignConditions.outdoorTemp",
      "coolingDesignConditions.range",
      "coolingDesignConditions.indoorTemp",
      "coolingDesignConditions.latitude",
    ]
    const sectionFields = inputSummarySections.flatMap((section) => {
      const normalized = section.replace(/\s+/g, "")
      return [`${normalized}_styleA`, `${normalized}_styleB`, `${normalized}_styleC`]
    })
    return [...baseFields, ...sectionFields]
  }, [inputSummarySections])

  const canContinue = useSectionCompletion({ key: "inputSummary", requiredFields })

  return (
    <Box as="form">
      <Box mb={6}>
        <Heading as="h2" size="lg" mb={6} variant="yellowline">
          {t(`${prefix}.title`)}
        </Heading>
      </Box>

      <Box mb={6}>
        <Heading as="h3" size="md" mb={4}>
          {t(`${prefix}.calculationBasedOn.title`)}
        </Heading>
      </Box>
      <Grid templateColumns="1fr" gap={6} mb={6}>
        <RequiredInputField
          fieldName="calculationBasedOn.dimensionalInfo"
          label={t(`${prefix}.calculationBasedOn.dimensionalInfo`)}
          maxLength={70}
        />
      </Grid>
      <Grid templateColumns="1fr" gap={6}>
        <TextFormControl
          fieldName="calculationBasedOn.attachment"
          label={t(`${prefix}.calculationBasedOn.attachment`)}
          maxLength={60}
          width="50%"
        />
        <RequiredInputField
          fieldName="calculationBasedOn.frontFacing"
          label={t(`${prefix}.calculationBasedOn.frontFacing`)}
          filterPattern={/[^a-zA-Z\s\-'\.,]/g}
        />

        <FormControl>
          <FormLabel>{t(`${prefix}.calculationBasedOn.frontFacingAssumed`)}</FormLabel>
          <RadioGroup
            onChange={(value) =>
              setValue("calculationBasedOn.frontFacingAssumed", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            value={watch("calculationBasedOn.frontFacingAssumed")}
          >
            <Stack spacing={5} direction="row">
              <Radio variant="binary" value={"yes"}>
                {t(`${prefix}.calculationBasedOn.frontFacingAssumedYes`)}
              </Radio>
              <Radio variant="binary" value={"no"}>
                {t(`${prefix}.calculationBasedOn.frontFacingAssumedNo`)}
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        <RequiredInputField fieldName="calculationBasedOn.stories" label={t(`${prefix}.calculationBasedOn.stories`)} />
        <RequiredInputField
          fieldName="calculationBasedOn.airTightness"
          label={t(`${prefix}.calculationBasedOn.airTightness`)}
        />
        <FormControl>
          <FormLabel>{t(`${prefix}.calculationBasedOn.airTightnessAssumed`)}</FormLabel>
          <RadioGroup
            onChange={(value) =>
              setValue("calculationBasedOn.airTightnessAssumed", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            value={watch("calculationBasedOn.airTightnessAssumed")}
          >
            <Stack spacing={5} direction="row">
              <Radio variant="binary" value={"yes"}>
                {t(`${prefix}.calculationBasedOn.airTightnessYes`)}
              </Radio>
              <Radio variant="binary" value={"no"}>
                {t(`${prefix}.calculationBasedOn.airTightnessNo`)}
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        <RequiredInputField
          fieldName="calculationBasedOn.weatherLocation"
          label={t(`${prefix}.calculationBasedOn.weatherLocation`)}
        />
        <RequiredInputField
          fieldName="calculationBasedOn.internalShading"
          label={t(`${prefix}.climateData.internalShading`)}
          filterPattern={/[^a-zA-Z\s\-'\.,]/g}
        />
        <FormControl>
          <FormLabel>{t(`${prefix}.calculationBasedOn.assumed`)}</FormLabel>
          <RadioGroup
            onChange={(value) =>
              setValue("calculationBasedOn.assumed", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            value={watch("calculationBasedOn.assumed")}
          >
            <Stack spacing={5} direction="row">
              <Radio variant="binary" value={"yes"}>
                {t(`${prefix}.calculationBasedOn.yes`)}
              </Radio>
              <Radio variant="binary" value={"no"}>
                {t(`${prefix}.calculationBasedOn.no`)}
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        <RequiredInputField
          fieldName="calculationBasedOn.occupants"
          label={t(`${prefix}.climateData.occupants`)}
          type="number"
          step={0.01}
        />
        <FormControl>
          <FormLabel>{t(`${prefix}.calculationBasedOn.occupantsAssumed`)}</FormLabel>
          <RadioGroup
            onChange={(value) =>
              setValue("calculationBasedOn.occupantsAssumed", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
            value={watch("calculationBasedOn.occupantsAssumed")}
          >
            <Stack spacing={5} direction="row">
              <Radio variant="binary" value={"yes"}>
                {t(`${prefix}.calculationBasedOn.occupantsAssumedYes`)}
              </Radio>
              <Radio variant="binary" value={"no"}>
                {t(`${prefix}.calculationBasedOn.occupantsAssumedNo`)}
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
      </Grid>
      <Divider my={10} />

      <Heading as="h2" size="md" mb={4} variant="yellowline">
        {t(`${prefix}.climateData.title`)}
      </Heading>
      <Grid templateColumns="1fr" gap={6}>
        <RequiredInputField fieldName="climateData.windExposure" label={t(`${prefix}.climateData.windExposure`)} />
        <RequiredInputField fieldName="climateData.windSheilding" label={t(`${prefix}.climateData.windSheilding`)} />
        <FormControl>
          <FormLabel>{t(`${prefix}.climateData.ventilated`)}</FormLabel>
          <RadioGroup
            onChange={(value) =>
              setValue("climateData.ventilated", value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
            }
            value={ventilated}
          >
            <Stack spacing={5} direction="row">
              <Radio variant="binary" value={"yes"}>
                {" "}
                {t("ui.yes")}{" "}
              </Radio>
              <Radio variant="binary" value={"no"}>
                {" "}
                {t("ui.no")}{" "}
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        <FormControl>
          <FormLabel>{t(`${prefix}.climateData.hrvErv`)}</FormLabel>
          <RadioGroup
            onChange={(value) =>
              setValue("climateData.hrvErv", value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
            }
            value={hrvErv}
          >
            <Stack spacing={5} direction="row">
              <Radio variant="binary" value={"yes"}>
                {" "}
                {t("ui.yes")}{" "}
              </Radio>
              <Radio variant="binary" value={"no"}>
                {" "}
                {t("ui.no")}{" "}
              </Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        <TextFormControl
          fieldName="climateData.ase"
          maxLength={60}
          label={t(`${prefix}.climateData.ase`)}
          width="50%"
        />
        <TextFormControl
          fieldName="climateData.atre"
          maxLength={60}
          label={t(`${prefix}.climateData.atre`)}
          width="50%"
        />
      </Grid>

      <Grid templateColumns="1fr" gap={6} my={10}>
        <Box>
          <Heading as="h2" size="md" mb={4} variant="yellowline">
            {t(`${prefix}.heatingDesignConditions.title`)}
          </Heading>
          <FormControl isInvalid={!!errors?.heatingDesignConditions?.outdoorTemp}>
            <FormLabel>{t(`${prefix}.heatingDesignConditions.outdoorTemp`)}</FormLabel>
            <InputGroup maxW={"200px"}>
              <Input
                type="number"
                step="any"
                pr="4.5rem"
                {...register("heatingDesignConditions.outdoorTemp", {
                  required: t(`${prefix}.heatingDesignConditions.outdoorTemp.error`),
                })}
              />
              <InputRightElement
                pointerEvents="none"
                px={2}
                fontSize="sm"
                whiteSpace="nowrap"
                maxW="60%"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {t(`${prefix}.heatingDesignConditions.outdoorTempUnits`)}
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors?.heatingDesignConditions?.outdoorTemp?.message as any}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors?.heatingDesignConditions?.indoorTemp}>
            <FormLabel>{t(`${prefix}.heatingDesignConditions.indoorTemp`)}</FormLabel>
            <InputGroup maxW={"200px"}>
              <Input
                type="number"
                step="any"
                pr="4.5rem"
                {...register("heatingDesignConditions.indoorTemp", {
                  required: t(`${prefix}.heatingDesignConditions.indoorTemp.error`),
                })}
              />
              <InputRightElement
                pointerEvents="none"
                px={2}
                fontSize="sm"
                whiteSpace="nowrap"
                maxW="60%"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {t(`${prefix}.heatingDesignConditions.indoorTempUnits`)}
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors?.heatingDesignConditions?.indoorTemp?.message as any}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors?.heatingDesignConditions?.soilConductivity}>
            <FormLabel>{t(`${prefix}.heatingDesignConditions.soilConductivity`)}</FormLabel>
            <InputGroup maxW={"200px"}>
              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9.]*"
                maxLength={10}
                pr="4.5rem"
                onChange={(e) => {
                  const raw = e.target.value || ""
                  let cleaned = raw.replace(/[^\d.]/g, "")
                  const firstDot = cleaned.indexOf(".")
                  if (firstDot !== -1) {
                    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "")
                  }
                  if (cleaned.length > 5) cleaned = cleaned.slice(0, 5)
                  e.target.value = cleaned
                }}
                {...register("heatingDesignConditions.soilConductivity", {
                  required: t(`${prefix}.heatingDesignConditions.soilConductivity.error`),
                })}
              />
              <InputRightElement
                pointerEvents="none"
                px={8}
                fontSize="sm"
                whiteSpace="nowrap"
                maxW="20%"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {t(`${prefix}.heatingDesignConditions.soilConductivityUnits`)}
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors?.heatingDesignConditions?.soilConductivity?.message as any}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors?.heatingDesignConditions?.meanSoilTemp}>
            <FormLabel>{t(`${prefix}.heatingDesignConditions.meanSoilTemp`)}</FormLabel>
            <InputGroup maxW={"200px"}>
              <Input
                type="number"
                step="any"
                pattern="[0-9.]*"
                maxLength={10}
                pr="4.5rem"
                onChange={(e) => {
                  const raw = e.target.value || ""
                  let cleaned = raw.replace(/[^\d.]/g, "")
                  const firstDot = cleaned.indexOf(".")
                  if (firstDot !== -1) {
                    cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "")
                  }
                  if (cleaned.length > 5) cleaned = cleaned.slice(0, 5)
                  e.target.value = cleaned
                }}
                {...register("heatingDesignConditions.meanSoilTemp", {
                  required: t(`${prefix}.heatingDesignConditions.meanSoilTemp.error`),
                })}
              />
              <InputRightElement
                pointerEvents="none"
                px={2}
                fontSize="sm"
                whiteSpace="nowrap"
                maxW="60%"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {t(`${prefix}.heatingDesignConditions.meanSoilTempUnits`)}
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors?.heatingDesignConditions?.meanSoilTemp?.message as any}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors?.heatingDesignConditions?.waterTableDepth}>
            <FormLabel>{t(`${prefix}.heatingDesignConditions.waterTableDepth`)}</FormLabel>
            <InputGroup maxW={"200px"}>
              <Input
                type="number"
                step="any"
                pr="4.5rem"
                {...register("heatingDesignConditions.waterTableDepth", {
                  required: t(`${prefix}.heatingDesignConditions.waterTableDepth.error`),
                })}
              />
              <InputRightElement
                pointerEvents="none"
                px={2}
                fontSize="sm"
                whiteSpace="nowrap"
                maxW="60%"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {t(`${prefix}.heatingDesignConditions.waterTableDepthUnits`)}
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors?.heatingDesignConditions?.waterTableDepth?.message as any}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors?.heatingDesignConditions?.slabFluidTemp}>
            <FormLabel>{t(`${prefix}.heatingDesignConditions.slabFluidTemp`)}</FormLabel>
            <InputGroup maxW={"200px"}>
              <Input
                type="number"
                step="any"
                pr="4.5rem"
                {...register("heatingDesignConditions.slabFluidTemp", {
                  required: t(`${prefix}.heatingDesignConditions.slabFluidTemp.error`),
                })}
              />
              <InputRightElement
                pointerEvents="none"
                px={2}
                fontSize="sm"
                whiteSpace="nowrap"
                maxW="60%"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {t(`${prefix}.heatingDesignConditions.slabFluidTempUnits`)}
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors?.heatingDesignConditions?.slabFluidTemp?.message as any}</FormErrorMessage>
          </FormControl>
        </Box>
        <Box>
          <Heading as="h2" size="md" mb={4} variant="yellowline">
            {t(`${prefix}.coolingDesignConditions.title`)}
          </Heading>
          <RequiredInputField
            fieldName="coolingDesignConditions.outdoorTemp"
            label={t(`${prefix}.coolingDesignConditions.outdoorTemp`)}
            maxLength={25}
            width="17%"
          />
          <RequiredInputField
            fieldName="coolingDesignConditions.range"
            label={t(`${prefix}.coolingDesignConditions.range`)}
            maxLength={25}
            width="17%"
          />
          <RequiredInputField
            fieldName="coolingDesignConditions.indoorTemp"
            label={t(`${prefix}.coolingDesignConditions.indoorTemp`)}
            maxLength={25}
            width="17%"
          />
          <RequiredInputField
            fieldName="coolingDesignConditions.latitude"
            label={t(`${prefix}.coolingDesignConditions.latitude`)}
            maxLength={25}
            width="17%"
          />
        </Box>
      </Grid>
      <Divider my={10} />

      {/* Sections for Above Grade Walls, Below Grade Walls, Ceilings, etc. */}
      {inputSummarySections.map((section) => (
        <Box key={section} mb={6}>
          <Heading as="h2" size="md" mb={4} variant="yellowline">
            {section}
          </Heading>
          <Grid templateColumns="1fr" gap={6}>
            {(["A", "B", "C"] as const).map((style) => (
              <RequiredInputField
                key={`${section}_style${style}`}
                fieldName={`${section.replace(/\s+/g, "")}_style${style}`}
                label={t(`${prefix}.belowGradeWalls.style${style}` as any)}
                maxLength={50}
              />
            ))}
          </Grid>
          <Divider my={10} />
        </Box>
      ))}
      <Flex justify="flex-start" mt={10} mb={10}>
        {canContinue && (
          <Button
            variant="primary"
            onClick={async () => {
              const valid = await trigger(undefined, { shouldFocus: true })
              if (!valid) {
                toast({
                  title: "Error",
                  description: t("ui.pleaseFillRequiredFields") || "Please fill all required fields to continue.",
                  status: "error",
                  duration: 5000,
                  isClosable: true,
                })
                return
              }
              const values = getValues()
              const { overheatingDocumentsAttributes, ...formJson } = values
              await overheatingToolStore.saveOverheatingToolDraft({
                formJson,
                formType: "single_zone_cooling_heating_tool",
                overheatingDocumentsAttributes,
              })
              window.location.hash = "#calculations"
            }}
          >
            {t(`${prefix}.next`)}
          </Button>
        )}
      </Flex>
    </Box>
  )
}
