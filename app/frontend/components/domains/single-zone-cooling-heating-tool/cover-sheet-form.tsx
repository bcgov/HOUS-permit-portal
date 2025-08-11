import { Box, Checkbox, Divider, Flex, Grid, Heading, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { TextFormControl } from "../../shared/form/input-form-control"

export const CoverSheetForm = () => {
  const { t } = useTranslation()
  const prefix = "singleZoneCoolingHeatingTool.coverSheet"

  return (
    <Box as="form" p={4} borderWidth="1px" borderRadius="lg">
      <Heading as="h2" size="lg" mb={6}>
        {t(`${prefix}.title`)}
      </Heading>
      <Text as="p" mt={8} mb={2}>
        These documents issued for the use of
        <TextFormControl name="buildingLocation.model" width="30%" /> and may not be used by any other persons without
        authorization. Documents for permit and/or construction are signed in red.
      </Text>
      <Text as="p" mt={8} mb={2}>
        Project#
        <TextFormControl name="projectNumber" width="30%" />
      </Text>
      <Text as="p" mt={8} mb={2}>
        {t(`${prefix}.buildingLocation.helpText`)}
      </Text>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <TextFormControl name="buildingLocation.model" label={t(`${prefix}.buildingLocation.model`)} />
        <TextFormControl name="buildingLocation.site" label={t(`${prefix}.buildingLocation.site`)} />
        <TextFormControl name="buildingLocation.lot" label={t(`${prefix}.buildingLocation.lot`)} />
        <TextFormControl name="buildingLocation.address" label={t(`${prefix}.buildingLocation.address`)} />
        <TextFormControl name="buildingLocation.city" label={t(`${prefix}.buildingLocation.city`)} />
        <TextFormControl name="buildingLocation.province" label={t(`${prefix}.buildingLocation.province`)} />
        <TextFormControl name="buildingLocation.postalCode" label={t(`${prefix}.buildingLocation.postalCode`)} />
      </Grid>
      <Divider my={10} />

      <Heading as="h3" size="md" mb={4}>
        {t(`${prefix}.compliance.title`)}
      </Heading>
      <Text as="p" mb={2}>
        {t(`${prefix}.compliance.helpText`)}
      </Text>
      <Flex gap={10}>
        <RadioGroup name="compliance.submittalIsFor">
          <Text as="p" mb={2}>
            Submittal is for:
          </Text>
          <Stack direction="row" spacing={5}>
            <Radio value="aw">{t(`${prefix}.compliance.wholeHouse`)}</Radio>
            <Radio value="ar">{t(`${prefix}.compliance.roomByRoom`)}</Radio>
          </Stack>
        </RadioGroup>
        <RadioGroup name="compliance.units">
          <Text as="p" mb={2}>
            Units:
          </Text>
          <Stack direction="row" spacing={5}>
            <Radio value="bi">{t(`${prefix}.compliance.bim`)}</Radio>
            <Radio value="bm">{t(`${prefix}.compliance.metric`)}</Radio>
          </Stack>
        </RadioGroup>
      </Flex>

      <Heading as="h3" size="md" mt={10} mb={4}>
        {t(`${prefix}.heating.title`)}
      </Heading>
      <TextFormControl name="heating.building" label={t(`${prefix}.heating.building`)} />
      <Text as="p" mt={8} mb={2}>
        {t(`${prefix}.heating.helpText`)}
      </Text>
      <Heading as="h3" size="md" mt={10} mb={4}>
        {t(`${prefix}.cooling.title`)}
      </Heading>
      <TextFormControl name="cooling.nominal" label={t(`${prefix}.cooling.nominal`)} />
      <Text as="p" mt={8} mb={2}>
        <TextFormControl name="cooling.minimumCoolingCapacity" label={t(`${prefix}.cooling.minimumCoolingCapacity`)} />
      </Text>
      <Text as="p" mt={8} mb={2}>
        <TextFormControl name="cooling.maximumCoolingCapacity" label={t(`${prefix}.cooling.maximumCoolingCapacity`)} />
      </Text>
      <Text as="p" mt={8} mb={2}>
        {t(`${prefix}.cooling.helpText`)}
      </Text>

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
        <TextFormControl name="notes" />
      </Text>
      <Divider my={10} />
      <Heading as="h3" size="md" mt={10} mb={4}>
        {t(`${prefix}.calculationPerformedBy.title`)}
      </Heading>
      <Text as="p" mt={8} mb={2}>
        {t(`${prefix}.calculationPerformedBy.helpText`)}
      </Text>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <TextFormControl name="calculationPerformedBy.name" label={t(`${prefix}.calculationPerformedBy.name`)} />
        <TextFormControl name="calculationPerformedBy.company" label={t(`${prefix}.calculationPerformedBy.company`)} />
        <TextFormControl name="calculationPerformedBy.address" label={t(`${prefix}.calculationPerformedBy.address`)} />
        <TextFormControl name="calculationPerformedBy.city" label={t(`${prefix}.calculationPerformedBy.city`)} />
        <TextFormControl
          name="calculationPerformedBy.postalCode"
          label={t(`${prefix}.calculationPerformedBy.postalCode`)}
        />
        <TextFormControl name="calculationPerformedBy.phone" label={t(`${prefix}.calculationPerformedBy.phone`)} />
        <TextFormControl name="calculationPerformedBy.email" label={t(`${prefix}.calculationPerformedBy.email`)} />
        <TextFormControl
          name="calculationPerformedBy.designersSignature"
          label={t(`${prefix}.calculationPerformedBy.designersSignature`)}
        />
        <TextFormControl
          name="calculationPerformedBy.reference1"
          label={t(`${prefix}.calculationPerformedBy.reference1`)}
        />
        <TextFormControl
          name="calculationPerformedBy.reference2"
          label={t(`${prefix}.calculationPerformedBy.reference2`)}
        />
        <TextFormControl name="calculationPerformedBy.date" label={t(`${prefix}.calculationPerformedBy.date`)} />
        <TextFormControl
          name="calculationPerformedBy.signatureDate"
          label={t(`${prefix}.calculationPerformedBy.signatureDate`)}
        />
      </Grid>
    </Box>
  )
}
