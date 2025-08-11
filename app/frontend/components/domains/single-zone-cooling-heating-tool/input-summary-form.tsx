import { Box, Divider, Grid, Heading } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { TextFormControl } from "../../shared/form/input-form-control"

export const InputSummaryForm = () => {
  const { t } = useTranslation()
  const prefix = "singleZoneCoolingHeatingTool.inputSummary"

  return (
    <Box as="form" p={4} borderWidth="1px" borderRadius="lg">
      <Heading as="h2" size="lg" mb={6}>
        {t(`${prefix}.title`)}
      </Heading>

      <Divider my={10} />
      <Heading as="h3" size="md" mb={4}>
        {t(`${prefix}.calculationBasedOn.title`)}
      </Heading>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <TextFormControl
          name="calculationBasedOn.dimensionalInfo"
          label={t(`${prefix}.calculationBasedOn.dimensionalInfo`)}
        />
        <TextFormControl name="calculationBasedOn.frontFacing" label={t(`${prefix}.calculationBasedOn.frontFacing`)} />
        <TextFormControl name="calculationBasedOn.attachment" label={t(`${prefix}.calculationBasedOn.attachment`)} />
        <TextFormControl
          name="calculationBasedOn.airTightness"
          label={t(`${prefix}.calculationBasedOn.airTightness`)}
        />
        <TextFormControl name="calculationBasedOn.assumed" label={t(`${prefix}.calculationBasedOn.assumed`)} />
        <TextFormControl name="calculationBasedOn.stories" label={t(`${prefix}.calculationBasedOn.stories`)} />
      </Grid>
      <Divider my={10} />

      <Heading as="h3" size="md" mb={4}>
        {t(`${prefix}.climateData.title`)}
      </Heading>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <TextFormControl name="climateData.weather" label={t(`${prefix}.climateData.weather`)} />
        <TextFormControl name="climateData.internalGains" label={t(`${prefix}.climateData.internalGains`)} />
        <TextFormControl name="climateData.assumed1" label={t(`${prefix}.climateData.assumed1`)} />
        <TextFormControl name="climateData.windExposure" label={t(`${prefix}.climateData.windExposure`)} />
        <TextFormControl name="climateData.occupants" label={t(`${prefix}.climateData.occupants`)} />
        <TextFormControl name="climateData.assumed2" label={t(`${prefix}.climateData.assumed2`)} />
        <TextFormControl name="climateData.windSheilding" label={t(`${prefix}.climateData.windSheilding`)} />
        <TextFormControl name="climateData.ventilated" label={t(`${prefix}.climateData.ventilated`)} />
        <TextFormControl name="climateData.hrvErv" label={t(`${prefix}.climateData.hrvErv`)} />
        <TextFormControl name="climateData.atticTemp" label={t(`${prefix}.climateData.atticTemp`)} />
      </Grid>

      <Grid templateColumns="1fr 1fr" gap={6} my={10}>
        <Box>
          <Heading as="h3" size="md" mb={4}>
            {t(`${prefix}.heatingDesignConditions.title`)}
          </Heading>
          <TextFormControl
            name="heatingDesignConditions.outdoorTemp"
            label={t(`${prefix}.heatingDesignConditions.outdoorTemp`)}
          />
          <TextFormControl
            name="heatingDesignConditions.indoorTemp"
            label={t(`${prefix}.heatingDesignConditions.indoorTemp`)}
          />
          <TextFormControl
            name="heatingDesignConditions.soilConductivity"
            label={t(`${prefix}.heatingDesignConditions.soilConductivity`)}
          />
          <TextFormControl name="heatingDesignConditions.temp" label={t(`${prefix}.heatingDesignConditions.temp`)} />
          <TextFormControl
            name="heatingDesignConditions.groundReflect"
            label={t(`${prefix}.heatingDesignConditions.groundReflect`)}
          />
          <TextFormControl
            name="heatingDesignConditions.dailyTemp"
            label={t(`${prefix}.heatingDesignConditions.dailyTemp`)}
          />
        </Box>
        <Box>
          <Heading as="h3" size="md" mb={4}>
            {t(`${prefix}.coolingDesignConditions.title`)}
          </Heading>
          <TextFormControl
            name="coolingDesignConditions.outdoorTemp"
            label={t(`${prefix}.coolingDesignConditions.outdoorTemp`)}
          />
          <TextFormControl name="coolingDesignConditions.range" label={t(`${prefix}.coolingDesignConditions.range`)} />
          <TextFormControl
            name="coolingDesignConditions.indoorTemp"
            label={t(`${prefix}.coolingDesignConditions.indoorTemp`)}
          />
          <TextFormControl
            name="coolingDesignConditions.altitude"
            label={t(`${prefix}.coolingDesignConditions.altitude`)}
          />
          <TextFormControl
            name="coolingDesignConditions.latitude"
            label={t(`${prefix}.coolingDesignConditions.latitude`)}
          />
        </Box>
      </Grid>
      <Divider my={10} />

      {/* Sections for Above Grade Walls, Below Grade Walls, Ceilings, etc. */}
      {["aboveGradeWalls", "belowGradeWalls", "ceilings", "floorsOnSoil", "windows", "exposedFloors", "doors"].map(
        (section) => (
          <Box key={section} mb={6}>
            <Heading as="h4" size="md" mb={4}>
              {t(`${prefix}.${section}.title`)}
            </Heading>
            <Grid templateColumns="1fr 1fr" gap={6}>
              <TextFormControl name={`${section}.styleA`} label={t(`${prefix}.${section}.styleA`)} />
              <TextFormControl name={`${section}.styleB`} label={t(`${prefix}.${section}.styleB`)} />
              <TextFormControl name={`${section}.styleC`} label={t(`${prefix}.${section}.styleC`)} />
            </Grid>
          </Box>
        )
      )}
    </Box>
  )
}
