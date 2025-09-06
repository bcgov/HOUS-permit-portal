import { Box, Button, Divider, Grid, Heading } from "@chakra-ui/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { uploadFile } from "../../../utils/uploads"
import { SelectFormControl, TextFormControl } from "../../shared/form/input-form-control"
import { BuildingLocationFields } from "./building-location-fields"

interface IInputSummaryFormProps {
  onNext: () => void
}

export const InputSummaryForm = ({ onNext }: IInputSummaryFormProps) => {
  const { t } = useTranslation() as any
  const prefix = "singleZoneCoolingHeatingTool.inputSummary"
  const { setValue } = useFormContext()

  const onUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await uploadFile(file, file.name)
      const url =
        (res as any)?.url ||
        (res as any)?.location ||
        ((res as any)?.signed_url ? (res as any).signed_url.split("?")[0] : null)
      if (url) {
        setValue("f280FormsSet2410xlsx.attachment", url, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
      }
    } catch (err) {
      console.error("File upload failed", err)
    }
  }

  return (
    <Box as="form" p={4} borderWidth="1px" borderRadius="lg">
      <Box mb={6} backgroundColor="gray.100" p={4} borderRadius="md">
        <Heading as="h2" size="lg" mb={6} textAlign="center" textTransform="uppercase">
          {t(`${prefix}.title`)}
        </Heading>
      </Box>

      <BuildingLocationFields i18nPrefix="singleZoneCoolingHeatingTool.inputSummary.buildingLocation" />
      <Divider my={10} />
      <Box mb={6} backgroundColor="gray.100" p={4} borderRadius="md">
        <Heading as="h3" size="md" mb={4} textAlign="center" textTransform="uppercase">
          {t(`${prefix}.calculationBasedOn.title`)}
        </Heading>
      </Box>
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
        <TextFormControl
          fieldName="calculationBasedOn.dimensionalInfo"
          label={t(`${prefix}.calculationBasedOn.dimensionalInfo`)}
        />
      </Grid>
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        <TextFormControl
          fieldName="calculationBasedOn.attachment"
          label={t(`${prefix}.calculationBasedOn.attachment`)}
        />
        <TextFormControl
          fieldName="calculationBasedOn.frontFacing"
          label={t(`${prefix}.calculationBasedOn.frontFacing`)}
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

        <TextFormControl fieldName="calculationBasedOn.stories" label={t(`${prefix}.calculationBasedOn.stories`)} />

        <TextFormControl
          fieldName="calculationBasedOn.airTightness"
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
        />
        <TextFormControl
          fieldName="calculationBasedOn.internalShading"
          label={t(`${prefix}.climateData.internalShading`)}
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

        <TextFormControl fieldName="calculationBasedOn.occupants" label={t(`${prefix}.climateData.occupants`)} />
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

      <Heading as="h3" size="md" mb={4}>
        {t(`${prefix}.climateData.title`)}
      </Heading>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <TextFormControl fieldName="climateData.windExposure" label={t(`${prefix}.climateData.windExposure`)} />
        <TextFormControl fieldName="climateData.windSheilding" label={t(`${prefix}.climateData.windSheilding`)} />
        <SelectFormControl
          fieldName="climateData.ventilated"
          label={t(`${prefix}.climateData.ventilated`)}
          options={[
            { label: t(`${prefix}.climateData.yes`), value: t(`${prefix}.climateData.yes`).toLowerCase() },
            { label: t(`${prefix}.climateData.no`), value: t(`${prefix}.climateData.no`).toLowerCase() },
          ]}
        />
        <SelectFormControl
          fieldName="climateData.hrvErv"
          label={t(`${prefix}.climateData.hrvErv`)}
          options={[
            { label: t(`${prefix}.climateData.yes`), value: t(`${prefix}.climateData.yes`).toLowerCase() },
            { label: t(`${prefix}.climateData.no`), value: t(`${prefix}.climateData.no`).toLowerCase() },
          ]}
        />
        <TextFormControl fieldName="climateData.ase" label={t(`${prefix}.climateData.ase`)} />
        <TextFormControl fieldName="climateData.atre" label={t(`${prefix}.climateData.atre`)} />
      </Grid>

      <Grid templateColumns="1fr 1fr" gap={6} my={10}>
        <Box>
          <Heading as="h3" size="md" mb={4}>
            {t(`${prefix}.heatingDesignConditions.title`)}
          </Heading>
          <TextFormControl
            fieldName="heatingDesignConditions.outdoorTemp"
            label={t(`${prefix}.heatingDesignConditions.outdoorTemp`)}
          />
          <TextFormControl
            fieldName="heatingDesignConditions.indoorTemp"
            label={t(`${prefix}.heatingDesignConditions.indoorTemp`)}
          />
          <TextFormControl
            fieldName="heatingDesignConditions.soilConductivity"
            label={t(`${prefix}.heatingDesignConditions.soilConductivity`)}
          />
          <TextFormControl
            fieldName="heatingDesignConditions.meanSoilTemp"
            label={t(`${prefix}.heatingDesignConditions.meanSoilTemp`)}
          />
          <TextFormControl
            fieldName="heatingDesignConditions.waterTableDepth"
            label={t(`${prefix}.heatingDesignConditions.waterTableDepth`)}
          />
          <TextFormControl
            fieldName="heatingDesignConditions.slabFluidTemp"
            label={t(`${prefix}.heatingDesignConditions.slabFluidTemp`)}
          />
        </Box>
        <Box>
          <Heading as="h3" size="md" mb={4}>
            {t(`${prefix}.coolingDesignConditions.title`)}
          </Heading>
          <TextFormControl
            fieldName="coolingDesignConditions.outdoorTemp"
            label={t(`${prefix}.coolingDesignConditions.outdoorTemp`)}
          />
          <TextFormControl
            fieldName="coolingDesignConditions.range"
            label={t(`${prefix}.coolingDesignConditions.range`)}
          />
          <TextFormControl
            fieldName="coolingDesignConditions.indoorTemp"
            label={t(`${prefix}.coolingDesignConditions.indoorTemp`)}
          />
          <TextFormControl
            fieldName="coolingDesignConditions.latitude"
            label={t(`${prefix}.coolingDesignConditions.latitude`)}
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
          <Heading as="h4" size="md" mb={4}>
            {t(`${section}` as any)}
          </Heading>
          <Grid templateColumns="1fr 1fr" gap={6}>
            <TextFormControl fieldName={`${section}.styleA`} label={t(`${prefix}.belowGradeWalls.styleA` as any)} />
            <TextFormControl fieldName={`${section}.styleB`} label={t(`${prefix}.belowGradeWalls.styleB` as any)} />
            <TextFormControl fieldName={`${section}.styleC`} label={t(`${prefix}.belowGradeWalls.styleC` as any)} />
          </Grid>
        </Box>
      ))}
      <Divider my={10} />
      <Button onClick={onNext}>{t(`${prefix}.submit`)}</Button>
    </Box>
  )
}
