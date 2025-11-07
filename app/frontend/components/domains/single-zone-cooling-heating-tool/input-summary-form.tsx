import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  useToast,
} from "@chakra-ui/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { NumberFormControl, SelectFormControl, TextFormControl } from "../../shared/form/input-form-control"

interface IInputSummaryFormProps {
  onNext: () => void
}

export const InputSummaryForm = ({ onNext }: IInputSummaryFormProps) => {
  const { t } = useTranslation() as any
  const prefix = "singleZoneCoolingHeatingTool.inputSummary"
  const { setValue, watch, trigger, clearErrors } = useFormContext()
  const toast = useToast()
  const [canContinue, setCanContinue] = React.useState(false)
  const ventilated = watch("climateData.ventilated")
  const hrvErv = watch("climateData.hrvErv")
  const all = watch()

  React.useEffect(() => {
    const values = (watch() as any) || {}
    const getNested = (obj: any, path: string) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj)
    const hasVal = (v: any) => v !== undefined && v !== null && String(v).toString().trim() !== ""

    const requiredFields = [
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

    const ok = requiredFields.every((path) => hasVal(getNested(values, path)))
    setCanContinue(ok)
    clearErrors()
    window.dispatchEvent(new CustomEvent("szch:section", { detail: { key: "inputSummary", complete: ok } }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all])

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
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
        <TextFormControl
          fieldName="calculationBasedOn.dimensionalInfo"
          label={t(`${prefix}.calculationBasedOn.dimensionalInfo`)}
          maxLength={70}
        />
      </Grid>
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        <TextFormControl
          fieldName="calculationBasedOn.attachment"
          label={t(`${prefix}.calculationBasedOn.attachment`)}
          maxLength={60}
        />
        <TextFormControl
          fieldName="calculationBasedOn.frontFacing"
          label={t(`${prefix}.calculationBasedOn.frontFacing`)}
          maxLength={60}
          inputProps={{
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value
              const filtered = value.replace(/[^a-zA-Z\s\-'\.,]/g, "")
              if (filtered !== value) {
                e.target.value = filtered
              }
            },
          }}
        />

        <SelectFormControl
          fieldName="calculationBasedOn.frontFacingAssumed"
          label={t(`${prefix}.calculationBasedOn.frontFacingAssumed`)}
          options={[
            {
              label: t(`${prefix}.calculationBasedOn.frontFacingAssumedYes`),
              value: t(`${prefix}.calculationBasedOn.frontFacingAssumedYes`).toLowerCase(),
            },
            {
              label: t(`${prefix}.calculationBasedOn.frontFacingAssumedNo`),
              value: t(`${prefix}.calculationBasedOn.frontFacingAssumedNo`).toLowerCase(),
            },
          ]}
        />

        <TextFormControl
          fieldName="calculationBasedOn.stories"
          maxLength={60}
          label={t(`${prefix}.calculationBasedOn.stories`)}
        />

        <TextFormControl
          fieldName="calculationBasedOn.airTightness"
          maxLength={60}
          label={t(`${prefix}.calculationBasedOn.airTightness`)}
        />
        <SelectFormControl
          fieldName="calculationBasedOn.airTightnessAssumed"
          label={t(`${prefix}.calculationBasedOn.airTightnessAssumed`)}
          options={[
            {
              label: t(`${prefix}.calculationBasedOn.airTightnessYes`),
              value: t(`${prefix}.calculationBasedOn.airTightnessYes`).toLowerCase(),
            },
            {
              label: t(`${prefix}.calculationBasedOn.airTightnessNo`),
              value: t(`${prefix}.calculationBasedOn.airTightnessNo`).toLowerCase(),
            },
          ]}
        />

        <TextFormControl
          fieldName="calculationBasedOn.weatherLocation"
          label={t(`${prefix}.calculationBasedOn.weatherLocation`)}
          maxLength={60}
        />
        <TextFormControl
          fieldName="calculationBasedOn.internalShading"
          label={t(`${prefix}.climateData.internalShading`)}
          maxLength={60}
          inputProps={{
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value
              const filtered = value.replace(/[^a-zA-Z\s\-'\.,]/g, "")
              if (filtered !== value) {
                e.target.value = filtered
              }
            },
          }}
        />
        <SelectFormControl
          fieldName="calculationBasedOn.assumed"
          label={t(`${prefix}.calculationBasedOn.assumed`)}
          options={[
            {
              label: t(`${prefix}.calculationBasedOn.yes`),
              value: t(`${prefix}.calculationBasedOn.yes`).toLowerCase(),
            },
            { label: t(`${prefix}.calculationBasedOn.no`), value: t(`${prefix}.calculationBasedOn.no`).toLowerCase() },
          ]}
        />

        <NumberFormControl fieldName="calculationBasedOn.occupants" label={t(`${prefix}.climateData.occupants`)} />
        <SelectFormControl
          fieldName="calculationBasedOn.assumed"
          label={t(`${prefix}.calculationBasedOn.assumed`)}
          options={[
            {
              label: t(`${prefix}.calculationBasedOn.yes`),
              value: t(`${prefix}.calculationBasedOn.yes`).toLowerCase(),
            },
            { label: t(`${prefix}.calculationBasedOn.no`), value: t(`${prefix}.calculationBasedOn.no`).toLowerCase() },
          ]}
        />
      </Grid>
      <Divider my={10} />

      <Heading as="h2" size="md" mb={4} variant="yellowline">
        {t(`${prefix}.climateData.title`)}
      </Heading>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <TextFormControl
          fieldName="climateData.windExposure"
          maxLength={60}
          label={t(`${prefix}.climateData.windExposure`)}
        />
        <TextFormControl
          fieldName="climateData.windSheilding"
          maxLength={60}
          label={t(`${prefix}.climateData.windSheilding`)}
        />
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
        <TextFormControl fieldName="climateData.ase" maxLength={60} label={t(`${prefix}.climateData.ase`)} />
        <TextFormControl fieldName="climateData.atre" maxLength={60} label={t(`${prefix}.climateData.atre`)} />
      </Grid>

      <Grid templateColumns="1fr 1fr" gap={6} my={10}>
        <Box>
          <Heading as="h2" size="md" mb={4} variant="yellowline">
            {t(`${prefix}.heatingDesignConditions.title`)}
          </Heading>
          <TextFormControl
            fieldName="heatingDesignConditions.outdoorTemp"
            label={t(`${prefix}.heatingDesignConditions.outdoorTemp`)}
            maxLength={25}
          />
          <TextFormControl
            fieldName="heatingDesignConditions.indoorTemp"
            label={t(`${prefix}.heatingDesignConditions.indoorTemp`)}
            maxLength={25}
          />
          <TextFormControl
            fieldName="heatingDesignConditions.soilConductivity"
            label={t(`${prefix}.heatingDesignConditions.soilConductivity`)}
            maxLength={25}
          />
          <TextFormControl
            fieldName="heatingDesignConditions.meanSoilTemp"
            label={t(`${prefix}.heatingDesignConditions.meanSoilTemp`)}
            maxLength={25}
          />
          <TextFormControl
            fieldName="heatingDesignConditions.waterTableDepth"
            label={t(`${prefix}.heatingDesignConditions.waterTableDepth`)}
            maxLength={25}
          />
          <TextFormControl
            fieldName="heatingDesignConditions.slabFluidTemp"
            label={t(`${prefix}.heatingDesignConditions.slabFluidTemp`)}
            maxLength={25}
          />
        </Box>
        <Box>
          <Heading as="h2" size="md" mb={4} variant="yellowline">
            {t(`${prefix}.coolingDesignConditions.title`)}
          </Heading>
          <TextFormControl
            fieldName="coolingDesignConditions.outdoorTemp"
            label={t(`${prefix}.coolingDesignConditions.outdoorTemp`)}
            maxLength={25}
          />
          <TextFormControl
            fieldName="coolingDesignConditions.range"
            label={t(`${prefix}.coolingDesignConditions.range`)}
            maxLength={25}
          />
          <TextFormControl
            fieldName="coolingDesignConditions.indoorTemp"
            label={t(`${prefix}.coolingDesignConditions.indoorTemp`)}
            maxLength={25}
          />
          <TextFormControl
            fieldName="coolingDesignConditions.latitude"
            label={t(`${prefix}.coolingDesignConditions.latitude`)}
            maxLength={25}
          />
        </Box>
      </Grid>
      <Divider my={10} />

      {/* Sections for Above Grade Walls, Below Grade Walls, Ceilings, etc. */}
      {[
        t(`${prefix}.inputSummarySections.aboveGradeWalls`),
        t(`${prefix}.inputSummarySections.belowGradeWalls`),
        t(`${prefix}.inputSummarySections.ceilings`),
        t(`${prefix}.inputSummarySections.floorsOnSoil`),
        t(`${prefix}.inputSummarySections.windows`),
        t(`${prefix}.inputSummarySections.exposedFloors`),
        t(`${prefix}.inputSummarySections.doors`),
        t(`${prefix}.inputSummarySections.skylights`),
      ].map((section) => (
        <Box key={section} mb={6}>
          <Heading as="h2" size="md" mb={4} variant="yellowline">
            {t(`${section}` as any)}
          </Heading>
          <Grid templateColumns="1fr 1fr" gap={6}>
            <TextFormControl
              fieldName={`${section.replace(/\s+/g, "")}_styleA`}
              maxLength={50}
              label={t(`${prefix}.belowGradeWalls.styleA` as any)}
              required={true}
            />
            <TextFormControl
              fieldName={`${section.replace(/\s+/g, "")}_styleB`}
              maxLength={50}
              label={t(`${prefix}.belowGradeWalls.styleB` as any)}
            />
            <TextFormControl
              fieldName={`${section.replace(/\s+/g, "")}_styleC`}
              maxLength={50}
              label={t(`${prefix}.belowGradeWalls.styleC` as any)}
            />
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
              onNext()
            }}
          >
            {t(`${prefix}.next`)}
          </Button>
        )}
      </Flex>
    </Box>
  )
}
