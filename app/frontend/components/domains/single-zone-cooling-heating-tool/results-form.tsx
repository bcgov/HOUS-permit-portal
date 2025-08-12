import { Box, Divider, Heading, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { TextFormControl } from "../../shared/form/input-form-control"

export const ResultsForm = () => {
  const { t } = useTranslation()
  const { control, getValues } = useFormContext()
  const prefix = "singleZoneCoolingHeatingTool.results"

  const { fields } = useFieldArray({
    control,
    name: "rooms",
  })

  const formData = getValues()

  const renderTableRows = (data, parentKey = "") => {
    return Object.entries(data).map(([key, value]) => {
      const currentKey = parentKey ? `${parentKey}.${key}` : key

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return renderTableRows(value, currentKey)
      }

      if (key === "rooms") {
        return null
      }

      return (
        <Tr key={currentKey}>
          <Td>{t(currentKey, { ns: "singleZoneCoolingHeatingTool" })}</Td>
          <Td>{value.toString()}</Td>
        </Tr>
      )
    })
  }

  return (
    <Box as="form" p={4} borderWidth="1px" borderRadius="lg">
      <Heading as="h2" size="lg" mb={6}>
        {t(`${prefix}.title`)}
      </Heading>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Field</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>{renderTableRows(formData)}</Tbody>
      </Table>
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
                <TextFormControl fieldName={`rooms.${index}.roomName`} />
              </Td>
              <Td isNumeric>
                <TextFormControl fieldName={`rooms.${index}.heating`} type="number" />
              </Td>
              <Td isNumeric>
                <TextFormControl fieldName={`rooms.${index}.cooling`} type="number" />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
