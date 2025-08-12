import { Box, Button, Divider, Grid, Heading } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { SelectFormControl, TextFormControl } from "../../shared/form/input-form-control"

interface IInputSummaryFormProps {
  onCalculate: () => void
}

export const InputSummaryForm = ({ onCalculate }: IInputSummaryFormProps) => {
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
          fieldName="calculationBasedOn.dimensionalInfo"
          label={t(`${prefix}.calculationBasedOn.dimensionalInfo`)}
        />
        <TextFormControl fieldName="calculationBasedOn.stories" label={t(`${prefix}.calculationBasedOn.stories`)} />
        <TextFormControl fieldName="climateData.weather" label={t(`${prefix}.climateData.weather`)} />
      </Grid>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <TextFormControl
          fieldName="calculationBasedOn.frontFacing"
          label={t(`${prefix}.calculationBasedOn.frontFacing`)}
        />
        <SelectFormControl
          fieldName="calculationBasedOn.assumed"
          label={t(`${prefix}.calculationBasedOn.assumed`)}
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
        />

        <TextFormControl
          fieldName="calculationBasedOn.airTightness"
          label={t(`${prefix}.calculationBasedOn.airTightness`)}
        />
        <SelectFormControl
          fieldName="calculationBasedOn.assumed"
          label={t(`${prefix}.calculationBasedOn.assumed`)}
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
        />

        <TextFormControl
          fieldName="calculationBasedOn.internalShading"
          label={t(`${prefix}.climateData.internalShading`)}
        />
        <SelectFormControl
          fieldName="calculationBasedOn.assumed"
          label={t(`${prefix}.calculationBasedOn.assumed`)}
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
        />

        <TextFormControl fieldName="calculationBasedOn.occupants" label={t(`${prefix}.climateData.occupants`)} />
        <SelectFormControl
          fieldName="calculationBasedOn.assumed"
          label={t(`${prefix}.calculationBasedOn.assumed`)}
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
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
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
        />
        <SelectFormControl
          fieldName="climateData.hrvErv"
          label={t(`${prefix}.climateData.hrvErv`)}
          options={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
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
        "aboveGradeWalls",
        "belowGradeWalls",
        "ceilings",
        "floorsOnSoil",
        "windows",
        "exposedFloors",
        "doors",
        "skylights",
      ].map((section) => (
        <Box key={section} mb={6}>
          <Heading as="h4" size="md" mb={4}>
            {t(`${prefix}.${section}.title` as any)}
          </Heading>
          <Grid templateColumns="1fr 1fr" gap={6}>
            <TextFormControl fieldName={`${section}.styleA`} label={t(`${prefix}.${section}.styleA` as any)} />
            <TextFormControl fieldName={`${section}.styleB`} label={t(`${prefix}.${section}.styleB` as any)} />
            <TextFormControl fieldName={`${section}.styleC`} label={t(`${prefix}.${section}.styleC` as any)} />
          </Grid>
        </Box>
      ))}
      <Divider my={10} />
      <Button onClick={onCalculate}>Calculate</Button>
    </Box>
  )
}
