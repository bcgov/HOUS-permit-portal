import { Box, Button, Divider, Flex, Grid, Heading, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react"
import React from "react"
import { useFormContext, useFormState } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { uploadFile } from "../../../utils/uploads"
import { DatePickerFormControl, NumberFormControl, TextFormControl } from "../../shared/form/input-form-control"
import { BuildingLocationFields } from "./building-location-fields"

interface IRoomByRoomFormProps {
  onSubmit: () => void
}

export const RoomByRoomForm = ({ onSubmit }: IRoomByRoomFormProps) => {
  const { t } = useTranslation() as any
  const prefix = "singleZoneCoolingHeatingTool.roomByRoom"
  const { setValue } = useFormContext()
  const { isValid, errors } = useFormState()

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
          {t(`singleZoneCoolingHeatingTool.pdfContent.roomByRoomCalculationResults.calculationResultsRoomByRoom`)}
        </Heading>
      </Box>
      <Box mt={8}>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>{t("singleZoneCoolingHeatingTool.pdfContent.roomByRoomCalculationResults.roomName")}</Th>
              <Th isNumeric>
                {t("singleZoneCoolingHeatingTool.pdfContent.roomByRoomCalculationResults.heating")} (Btu/h)
              </Th>
              <Th isNumeric>
                {t("singleZoneCoolingHeatingTool.pdfContent.roomByRoomCalculationResults.cooling")} (Btu/h)
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {Array.from({ length: 39 }, (_, idx) => idx + 1).map((n) => (
              <Tr key={n}>
                <Td>{n}</Td>
                <Td>
                  <TextFormControl fieldName={`roomByRoom.${n}.name`} label="" />
                </Td>
                <Td>
                  <NumberFormControl fieldName={`roomByRoom.${n}.heating`} label="" inputProps={{ step: 1 }} />
                </Td>
                <Td>
                  <NumberFormControl fieldName={`roomByRoom.${n}.cooling`} label="" inputProps={{ step: 1 }} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Summary fields below the table */}
      <Grid templateColumns="1fr 120px 120px" gap={4} mt={6} alignItems="center">
        <Box gridColumn="1 / span 1">
          <Heading as="h4" size="sm">
            Ventilation Loss s (if separate)74 & Latent Gain (if separate, value or multiplier)75
          </Heading>
        </Box>
        <Box>
          <NumberFormControl fieldName={`roomByRoomSummary.ventilationLoss`} label="" inputProps={{ step: 1 }} /> Btu/h
        </Box>
        <Box>
          <NumberFormControl fieldName={`roomByRoomSummary.latentGain`} label="" inputProps={{ step: 1 }} /> Btu/h
        </Box>
      </Grid>

      <Grid templateColumns="1fr 120px 120px" gap={4} mt={4} alignItems="center">
        <Box gridColumn="1 / span 1">
          <Heading as="h4" size="sm">
            Total Building Loss (5.2.7) & Nominal Cooling Capacity (6.3.1)
          </Heading>
        </Box>
        <Box>
          <NumberFormControl fieldName={`roomByRoomSummary.totalBuildingLoss`} label="" inputProps={{ step: 1 }} />{" "}
          Btu/h
        </Box>
        <Box>
          <NumberFormControl fieldName={`roomByRoomSummary.nominalCoolingCapacity`} label="" inputProps={{ step: 1 }} />{" "}
          Btu/h
        </Box>
      </Grid>
      <Grid templateColumns="1fr 120px 120px" gap={4} mt={4} alignItems="center">
        <Box gridColumn="1 / span 1">
          {t(
            "singleZoneCoolingHeatingTool.pdfContent.roomByRoomCalculationResults.seePage1ForHeatingAndCoolingSystemCapacityLimits"
          )}
        </Box>
        <Box>
          <DatePickerFormControl
            fieldName={`roomByRoomSummary.issued`}
            label={t("singleZoneCoolingHeatingTool.pdfContent.roomByRoomCalculationResults.issued")}
          />
        </Box>
      </Grid>
      <Divider my={10} />
      <Flex justify="flex-end" mt={10} mb={10}>
        <Button
          onClick={onSubmit}
          isDisabled={!isValid || Object.keys(errors).length > 0}
          variant={!isValid || Object.keys(errors).length > 0 ? "secondary" : "primary"}
        >
          {t(`${prefix}.submit`)}
        </Button>
      </Flex>
    </Box>
  )
}
