import { Box, Button, Checkbox, Divider, Flex, Grid, Heading, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { NumberFormControl, TextFormControl } from "../../shared/form/input-form-control"
import { BuildingLocationFields } from "./building-location-fields"

interface ICoverSheetFormProps {
  onNext: () => void
}

export const CoverSheetForm = ({ onNext }: ICoverSheetFormProps) => {
  const { t } = useTranslation()
  const prefix = "singleZoneCoolingHeatingTool.coverSheet"

  return (
    <Box as="form" p={4} borderWidth="1px" borderRadius="lg">
      <Box mb={6} backgroundColor="gray.100" p={4} borderRadius="md">
        <Heading as="h2" size="lg" mb={6} textAlign="center" textTransform="uppercase">
          {t(`${prefix}.title`)}
        </Heading>
        <Text as="p" mb={2}>
          {t(`${prefix}.helpText`)}
        </Text>
      </Box>
      <Divider my={10} />
      <BuildingLocationFields i18nPrefix="singleZoneCoolingHeatingTool.coverSheet.buildingLocation" />
      <Divider my={10} />
      <Box mb={6} backgroundColor="gray.100" p={4} borderRadius="md">
        <Heading as="h3" size="md" mb={4} textAlign="center" textTransform="uppercase">
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
        <Heading as="h3" size="md" mb={4} textAlign="center" textTransform="uppercase">
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
        <Heading as="h3" size="md" mb={4} textAlign="center" textTransform="uppercase">
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
        <Heading as="h3" size="md" mb={4} textAlign="center" textTransform="uppercase">
          {t(`${prefix}.attachedDocuments.title`)}
        </Heading>
      </Box>

      <Flex gap={6} mt={8} mb={2}>
        <Checkbox defaultChecked>{t(`${prefix}.attachedDocuments.designSummary`)}</Checkbox>
        <Checkbox defaultChecked>{t(`${prefix}.attachedDocuments.roomByRoomResults`)}</Checkbox>
      </Flex>

      <Text as="p" mt={4} mb={2}>
        {t(`${prefix}.other`)}
        <TextFormControl fieldName="other" />
      </Text>
      <Text as="p" mt={4} mb={2}>
        {t(`${prefix}.notes`)}
        <TextFormControl fieldName="notes" />
      </Text>
      <Divider my={10} />
      <Box mb={6} backgroundColor="gray.100" p={4} borderRadius="md">
        <Heading as="h3" size="md" mb={4} textAlign="center" textTransform="uppercase">
          {t(`${prefix}.calculationPerformedBy.title`)}
        </Heading>
      </Box>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <TextFormControl
          required
          fieldName="calculationPerformedBy.name"
          label={t(`${prefix}.calculationPerformedBy.name`)}
        />
        <Box>
          <TextFormControl
            required
            fieldName="calculationPerformedBy.attestation"
            label={t(`${prefix}.calculationPerformedBy.attestation`)}
          />
          <Text as="p" mt={1} mb={2}>
            {t(`${prefix}.calculationPerformedBy.helpText`)}
          </Text>
        </Box>

        <TextFormControl
          required
          fieldName="calculationPerformedBy.address"
          label={t(`${prefix}.calculationPerformedBy.address`)}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.company"
          label={t(`${prefix}.calculationPerformedBy.company`)}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.city"
          label={t(`${prefix}.calculationPerformedBy.city`)}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.postalCode"
          label={t(`${prefix}.calculationPerformedBy.postalCode`)}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.phone"
          label={t(`${prefix}.calculationPerformedBy.phone`)}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.email"
          label={t(`${prefix}.calculationPerformedBy.email`)}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.fax"
          label={t(`${prefix}.calculationPerformedBy.fax`)}
        />
        <Box width="100%" height="300px" border="1px solid" borderColor="gray.300" p={2} borderRadius="md">
          <Text as="p" mt={1} mb={2}>
            {t(`${prefix}.calculationPerformedBy.designersSignature`)}
          </Text>
        </Box>

        <TextFormControl
          required
          fieldName="calculationPerformedBy.reference1"
          label={t(`${prefix}.calculationPerformedBy.reference1`)}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.reference2"
          label={t(`${prefix}.calculationPerformedBy.reference2`)}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.date"
          label={t(`${prefix}.calculationPerformedBy.date`)}
        />
        <TextFormControl
          required
          fieldName="calculationPerformedBy.reissuedDate"
          label={t(`${prefix}.calculationPerformedBy.reissuedDate`)}
        />
      </Grid>
      <Divider my={10} />
      <Box width="100%" height="300px" border="1px solid" borderColor="gray.300" p={2} borderRadius="md">
        <Text as="p" mt={1} mb={2}>
          {t(`${prefix}.calculationPerformedBy.softwareInfo`)}
        </Text>
      </Box>
      <Button mt={10} mb={10} colorScheme="blue" onClick={onNext}>
        {t(`${prefix}.calculationPerformedBy.next`)}
      </Button>
    </Box>
  )
}
