import { Box, Button, Flex, Grid, Heading, Table, Tbody, Td, Th, Thead, Tr, useToast } from "@chakra-ui/react"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { DatePickerFormControl, NumberFormControl, TextFormControl } from "../../shared/form/input-form-control"

import { useSectionCompletion } from "../../../hooks/use-section-completion"

export const RoomByRoomForm = () => {
  const { t } = useTranslation() as any
  const prefix = "singleZoneCoolingHeatingTool.roomByRoom"
  const { trigger, clearErrors, watch } = useFormContext()
  const toast = useToast()

  const validate = React.useCallback((values: any) => {
    const rows = values?.roomByRoom || {}
    const hasVal = (v: any) => v !== undefined && v !== null && String(v).toString().trim() !== ""
    return Object.values(rows).some((r: any) => hasVal(r?.heating) || hasVal(r?.cooling))
  }, [])

  const canContinue = useSectionCompletion({ key: "calculations", validate })

  React.useEffect(() => {
    clearErrors()
  }, [canContinue, clearErrors])

  return (
    <Box as="form">
      <Box mb={6}>
        <Heading as="h2" size="lg" mb={4} variant="yellowline">
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

      <Grid templateColumns="1fr 150px 150px" gap={4} mt={6} alignItems="center">
        <Box gridColumn="1 / span 1">
          <Heading as="h4" size="sm">
            Ventilation loss (if separate)74 & Latent gain (if separate, value or multiplier)75
          </Heading>
        </Box>
        <Box>
          <NumberFormControl fieldName={`roomByRoomSummary.ventilationLoss`} label="" inputProps={{ step: 1 }} /> Btu/h
        </Box>
        <Box>
          <NumberFormControl fieldName={`roomByRoomSummary.latentGain`} label="" inputProps={{ step: 1 }} /> Btu/h
        </Box>
      </Grid>

      <Grid templateColumns="1fr 150px 150px" gap={4} mt={4} alignItems="center">
        <Box gridColumn="1 / span 1">
          <Heading as="h4" size="sm">
            Total building loss (5.2.7) & Nominal cooling capacity (6.3.1)
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
      <Grid templateColumns="1fr 150px 150px" gap={4} mt={4} alignItems="center">
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
      <Flex justify="flex-start" mt={10} mb={10}>
        {canContinue && (
          <Button
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
              window.location.hash = "#uploads"
            }}
            variant="primary"
          >
            {t(`${prefix}.submit`)}
          </Button>
        )}
      </Flex>
    </Box>
  )
}
