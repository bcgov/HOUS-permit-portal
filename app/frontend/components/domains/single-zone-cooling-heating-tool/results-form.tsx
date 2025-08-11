import { Box, Divider, Grid, Heading, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { TextFormControl } from "../../shared/form/input-form-control"

export const ResultsForm = () => {
  const { t } = useTranslation()
  const { control } = useFormContext()
  const prefix = "singleZoneCoolingHeatingTool.results"

  const { fields } = useFieldArray({
    control,
    name: "rooms",
  })

  return (
    <Box as="form" p={4} borderWidth="1px" borderRadius="lg">
      <Heading as="h2" size="lg" mb={6}>
        {t(`${prefix}.title`)}
      </Heading>

      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <TextFormControl name="buildingLocation.model" label={t(`${prefix}.buildingLocation.model`)} />
        <TextFormControl name="buildingLocation.site" label={t(`${prefix}.buildingLocation.site`)} />
        <TextFormControl name="buildingLocation.lot" label={t(`${prefix}.buildingLocation.lot`)} />
        <TextFormControl name="buildingLocation.plan" label={t(`${prefix}.buildingLocation.plan`)} />
        <TextFormControl name="buildingLocation.address" label={t(`${prefix}.buildingLocation.address`)} />
        <TextFormControl name="buildingLocation.city" label={t(`${prefix}.buildingLocation.city`)} />
        <TextFormControl name="buildingLocation.province" label={t(`${prefix}.buildingLocation.province`)} />
        <TextFormControl name="buildingLocation.postalCode" label={t(`${prefix}.buildingLocation.postalCode`)} />
      </Grid>
      <Divider my={10} />

      <Heading as="h3" size="md" mb={4}>
        {t(`${prefix}.calculationResults.title`)}
      </Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>{t(`${prefix}.calculationResults.roomName`)}</Th>
            <Th isNumeric>{t(`${prefix}.calculationResults.heating`)}</Th>
            <Th isNumeric>{t(`${prefix}.calculationResults.cooling`)}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {fields.map((field, index) => (
            <Tr key={field.id}>
              <Td>
                <TextFormControl name={`rooms.${index}.roomName`} />
              </Td>
              <Td isNumeric>
                <TextFormControl name={`rooms.${index}.heating`} type="number" />
              </Td>
              <Td isNumeric>
                <TextFormControl name={`rooms.${index}.cooling`} type="number" />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Divider my={10} />
      <TextFormControl name="totalBuildingLoss" label={t(`${prefix}.totalBuildingLoss`)} />
    </Box>
  )
}
