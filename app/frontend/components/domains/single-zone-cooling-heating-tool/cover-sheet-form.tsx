import { Box, Checkbox, Divider, Flex, Grid, Heading, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { NumberFormControl, TextFormControl } from "../../shared/form/input-form-control"
import { BuildingLocationFields } from "./building-location-fields"

export const CoverSheetForm = () => {
  const { t } = useTranslation()
  const prefix = "singleZoneCoolingHeatingTool.coverSheet"

  return (
    <Box as="form" p={4} borderWidth="1px" borderRadius="lg">
      <Box mb={6} backgroundColor="gray.100" p={4} borderRadius="md">
        <Heading as="h2" size="lg" mb={6}>
          {t(`${prefix}.title`)}
        </Heading>
        <Text as="p" mb={2}>
          {t(`${prefix}.helpText`)}
        </Text>
      </Box>
      <Box display="flex" gap={10} mb={6}>
        <Box width="80%">
          <TextFormControl fieldName="drawingIssueFor" required label={t(`${prefix}.drawingIssueFor`)} />
          <Text as="p" mb={2}>
            {t(`${prefix}.drawingIssueForHelpText`)}
          </Text>
        </Box>
        <Box width="20%">
          <TextFormControl fieldName="projectNumber" required label={t(`${prefix}.projectNumber`)} />
        </Box>
      </Box>
      <Divider my={10} />
      <Box mb={6} backgroundColor="gray.100" p={4} borderRadius="md">
        <Heading as="h2" size="lg" mb={6}>
          {t(`${prefix}.buildingLocation.title`)}
        </Heading>
      </Box>
      <BuildingLocationFields i18nPrefix="singleZoneCoolingHeatingTool.coverSheet.buildingLocation" />
      <Divider my={10} />
      <Box mb={6} backgroundColor="gray.100" p={4} borderRadius="md">
        <Heading as="h3" size="md" mb={4}>
          {t(`${prefix}.compliance.title`)}
        </Heading>
      </Box>

      <Flex gap={10}>
        <RadioGroup name="compliance.submittalIsFor">
          <Text as="p" mb={2}>
            {t(`${prefix}.compliance.submittalIsFor`)}
          </Text>
          <Stack direction="row" spacing={5}>
            <Radio value="aw">{t(`${prefix}.compliance.wholeHouse`)}</Radio>
            <Radio value="ar">{t(`${prefix}.compliance.roomByRoom`)}</Radio>
          </Stack>
        </RadioGroup>
        <RadioGroup name="compliance.units">
          <Text as="p" mb={2}>
            {t(`${prefix}.compliance.units`)}
          </Text>
          <Stack direction="row" spacing={5}>
            <Radio value="bi">{t(`${prefix}.compliance.imperial`)}</Radio>
            <Radio value="bm">{t(`${prefix}.compliance.metric`)}</Radio>
          </Stack>
        </RadioGroup>
      </Flex>
      <Divider my={10} />
      <Box mb={6} backgroundColor="gray.100" p={4} borderRadius="md">
        <Heading as="h3" size="md" mb={4}>
          {t(`${prefix}.heating.title`)}
        </Heading>
      </Box>
      <NumberFormControl
        width="30%"
        fieldName="heating.building"
        required
        label={t(`${prefix}.heating.building`)}
        inputProps={{ type: "number", step: 1, inputMode: "numeric", pattern: "[0-9]*" }}
        validate={{ isNumber: (v: any) => (!isNaN(Number(v)) && v !== "") || t("ui.invalidInput") }}
        rightElement={
          <Text fontSize="sm" whiteSpace="nowrap" position="absolute" left="50px" top="2">
            {t(`${prefix}.heating.units`)} {t(`${prefix}.heating.unitsHelpText`)}
          </Text>
        }
      />
      <Text as="p" mb={2} mt={2}>
        <Text as="span" fontWeight="bold">
          {t(`${prefix}.heating.helpText`)}
        </Text>
        <br />
        <Text as="span" fontWeight="bold">
          {t(`${prefix}.heating.helpText2`)}
        </Text>
      </Text>
      <Divider my={10} />
      <Box mb={6} backgroundColor="gray.100" p={4} borderRadius="md">
        <Heading as="h3" size="md" mb={4}>
          {t(`${prefix}.cooling.title`)}
        </Heading>
      </Box>
      <NumberFormControl
        width="30%"
        required
        fieldName="cooling.nominal"
        label={t(`${prefix}.cooling.nominal`)}
        rightElement={
          <Text fontSize="sm" whiteSpace="nowrap" position="absolute" left="50px" top="2">
            {t(`${prefix}.cooling.units`)} {t(`${prefix}.cooling.unitsHelpText`)}
          </Text>
        }
      />
      <NumberFormControl
        width="30%"
        required
        fieldName="cooling.minimumCoolingCapacity"
        label={t(`${prefix}.cooling.minimumCoolingCapacity`)}
        rightElement={
          <Text fontSize="sm" whiteSpace="nowrap" position="absolute" left="50px" top="2">
            {t(`${prefix}.cooling.units`)}
          </Text>
        }
      />
      <NumberFormControl
        width="30%"
        required
        fieldName="cooling.maximumCoolingCapacity"
        label={t(`${prefix}.cooling.maximumCoolingCapacity`)}
        rightElement={
          <Text fontSize="sm" whiteSpace="nowrap" position="absolute" left="50px" top="2">
            {t(`${prefix}.cooling.units`)}
          </Text>
        }
      />
      <Text as="p" mt={3} mb={2} fontWeight="bold">
        {t(`${prefix}.cooling.helpText`)}
      </Text>
      <Text as="p" mt={3} mb={2} fontWeight="bold">
        {t(`${prefix}.cooling.helpText2`)}
      </Text>
      <Text as="p" mt={3} mb={2} fontWeight="bold">
        {t(`${prefix}.cooling.helpText3`)}
      </Text>
      <Text as="p" mt={3} mb={2} fontWeight="bold">
        {t(`${prefix}.cooling.helpText4`)}
      </Text>
      <Divider my={10} />
      <Box mb={6} backgroundColor="gray.100" p={4} borderRadius="md">
        <Heading as="h3" size="md" mb={4}>
          {t(`${prefix}.attachedDocuments.title`)}
        </Heading>
      </Box>

      <Heading as="h3" size="md" mt={10} mb={4}>
        {t(`${prefix}.attachedDocuments.title`)}
      </Heading>
      <Text as="p" mt={8} mb={2}>
        <Checkbox defaultChecked>{t(`${prefix}.attachedDocuments.designSummary`)}</Checkbox>
      </Text>
      <Text as="p" mt={8} mb={2}>
        <Checkbox defaultChecked>{t(`${prefix}.attachedDocuments.roomByRoomResults`)}</Checkbox>
      </Text>

      <Text as="p" mt={8} mb={2}>
        {t(`${prefix}.notes`)}
        <TextFormControl fieldName="notes" />
      </Text>
      <Divider my={10} />
      <Heading as="h3" size="md" mt={10} mb={4}>
        {t(`${prefix}.calculationPerformedBy.title`)}
      </Heading>
      <Text as="p" mt={8} mb={2}>
        {t(`${prefix}.calculationPerformedBy.helpText`)}
      </Text>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <TextFormControl fieldName="calculationPerformedBy.name" label={t(`${prefix}.calculationPerformedBy.name`)} />
        <TextFormControl
          fieldName="calculationPerformedBy.company"
          label={t(`${prefix}.calculationPerformedBy.company`)}
        />
        <TextFormControl
          fieldName="calculationPerformedBy.address"
          label={t(`${prefix}.calculationPerformedBy.address`)}
        />
        <TextFormControl fieldName="calculationPerformedBy.city" label={t(`${prefix}.calculationPerformedBy.city`)} />
        <TextFormControl
          fieldName="calculationPerformedBy.postalCode"
          label={t(`${prefix}.calculationPerformedBy.postalCode`)}
        />
        <TextFormControl fieldName="calculationPerformedBy.phone" label={t(`${prefix}.calculationPerformedBy.phone`)} />
        <TextFormControl fieldName="calculationPerformedBy.email" label={t(`${prefix}.calculationPerformedBy.email`)} />
        <TextFormControl
          fieldName="calculationPerformedBy.designersSignature"
          label={t(`${prefix}.calculationPerformedBy.designersSignature`)}
        />
        <TextFormControl
          fieldName="calculationPerformedBy.reference1"
          label={t(`${prefix}.calculationPerformedBy.reference1`)}
        />
        <TextFormControl
          fieldName="calculationPerformedBy.reference2"
          label={t(`${prefix}.calculationPerformedBy.reference2`)}
        />
        <TextFormControl fieldName="calculationPerformedBy.date" label={t(`${prefix}.calculationPerformedBy.date`)} />
        <TextFormControl
          fieldName="calculationPerformedBy.signatureDate"
          label={t(`${prefix}.calculationPerformedBy.signatureDate`)}
        />
      </Grid>
    </Box>
  )
}
