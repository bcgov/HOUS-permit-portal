import { Box, Button, Divider, Flex, Grid, GridItem, Heading, Link, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"

type KeyPath = string

const useLabels = () => {
  const { t } = useTranslation() as any
  const labelFor = (path: KeyPath): string => {
    // Cover sheet labels
    if (path.startsWith("buildingLocation."))
      return (t as any)(`singleZoneCoolingHeatingTool.coverSheet.buildingLocation.${path.split(".")[1]}`)
    if (path.startsWith("heating."))
      return (t as any)(`singleZoneCoolingHeatingTool.coverSheet.heating.${path.split(".")[1]}`)
    if (path.startsWith("cooling."))
      return (t as any)(`singleZoneCoolingHeatingTool.coverSheet.cooling.${path.split(".")[1]}`)
    if (path.startsWith("calculationPerformedBy."))
      return (t as any)(`singleZoneCoolingHeatingTool.coverSheet.calculationPerformedBy.${path.split(".")[1]}`)
    if (path.startsWith("compliance."))
      return (t as any)(`singleZoneCoolingHeatingTool.coverSheet.compliance.${path.split(".")[1]}`)

    // Input summary labels
    if (path.startsWith("calculationBasedOn."))
      return (t as any)(`singleZoneCoolingHeatingTool.inputSummary.calculationBasedOn.${path.split(".")[1]}`)
    if (path.startsWith("climateData."))
      return (t as any)(`singleZoneCoolingHeatingTool.inputSummary.climateData.${path.split(".")[1]}`)
    if (path.startsWith("heatingDesignConditions."))
      return (t as any)(`singleZoneCoolingHeatingTool.inputSummary.heatingDesignConditions.${path.split(".")[1]}`)
    if (path.startsWith("coolingDesignConditions."))
      return (t as any)(`singleZoneCoolingHeatingTool.inputSummary.coolingDesignConditions.${path.split(".")[1]}`)

    if (path === "uploads.drawingsPdfUrl")
      return (t as any)("singleZoneCoolingHeatingTool.uploads.fileLabel") || "Drawings PDF"
    return path.split(".").slice(-1)[0]
  }
  return { labelFor }
}

const KeyValue: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <GridItem>
    <Text fontSize="sm" color="gray.600">
      {label}
    </Text>
    {typeof value === "string" && value.startsWith("http") ? (
      <Link href={value} isExternal color="blue.600">
        {value}
      </Link>
    ) : (
      <Text fontWeight="semibold">{String(value ?? "").length ? String(value) : "—"}</Text>
    )}
  </GridItem>
)

export const ReviewForm = observer(function ReviewForm() {
  const { getValues } = useFormContext()
  const values = getValues() || {}
  const { labelFor } = useLabels()
  const { pdfFormStore } = useMst()

  const generate = async () => {
    const formData = getValues()
    const result = await pdfFormStore.createPdfForm({
      formJson: formData,
      formType: "single_zone_cooling_heating_tool",
      status: true,
    })
    if ((result as any)?.success) {
      window.location.href = "#result"
    }
  }

  const section = (title: string, items: Array<[KeyPath, any]>) => (
    <Box>
      <Heading as="h3" size="md" mb={3}>
        {title}
      </Heading>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
        {items.map(([k, v]) => (
          <KeyValue key={k} label={labelFor(k)} value={v} />
        ))}
      </Grid>
    </Box>
  )

  const asList = (obj: any, base: string): Array<[KeyPath, any]> =>
    Object.keys(obj || {}).map((k) => [`${base}.${k}`, obj[k]])

  const roomRows = Array.from({ length: 39 }, (_, i) => i + 1).map((n) => ({
    index: n,
    ...(values?.roomByRoom?.[n] || {}),
  }))

  const hasValue = (v: any) => v !== undefined && v !== null && !(typeof v === "string" && v.trim() === "")
  const nonEmptyRooms = roomRows.filter((r) => hasValue(r.heating) && hasValue(r.cooling))

  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>
        {(useTranslation() as any).t("singleZoneCoolingHeatingTool.review.title") || "Review"}
      </Heading>

      {section("Building location", asList(values?.buildingLocation || {}, "buildingLocation"))}
      <Divider my={6} />

      {section("Compliance", asList(values?.compliance || {}, "compliance"))}
      <Divider my={6} />

      {section("Heating", asList(values?.heating || {}, "heating"))}
      <Divider my={6} />

      {section("Cooling", asList(values?.cooling || {}, "cooling"))}
      <Divider my={6} />

      {section("Calculation performed by", asList(values?.calculationPerformedBy || {}, "calculationPerformedBy"))}
      <Divider my={6} />

      {section("Calculation based on", asList(values?.calculationBasedOn || {}, "calculationBasedOn"))}
      <Divider my={6} />

      {section("Climate data", asList(values?.climateData || {}, "climateData"))}
      <Divider my={6} />

      {section("Heating design conditions", asList(values?.heatingDesignConditions || {}, "heatingDesignConditions"))}
      <Divider my={6} />

      {section("Cooling design conditions", asList(values?.coolingDesignConditions || {}, "coolingDesignConditions"))}
      <Divider my={6} />

      {values?.uploads?.drawingsPdfUrl
        ? section("Uploads", [["uploads.drawingsPdfUrl", values?.uploads?.drawingsPdfUrl]])
        : null}

      <Divider my={6} />
      <Heading as="h3" size="md" mb={3}>
        Room by room
      </Heading>
      <Grid templateColumns={{ base: "1fr", md: "40px 1fr 1fr 1fr" }} gap={2}>
        <GridItem fontWeight="bold">#</GridItem>
        <GridItem fontWeight="bold">Name</GridItem>
        <GridItem fontWeight="bold">Heating</GridItem>
        <GridItem fontWeight="bold">Cooling</GridItem>
        {nonEmptyRooms.map((r) => (
          <React.Fragment key={r.index}>
            <GridItem>{r.index}</GridItem>
            <GridItem>{r?.name || "—"}</GridItem>
            <GridItem>{r?.heating ?? "—"}</GridItem>
            <GridItem>{r?.cooling ?? "—"}</GridItem>
          </React.Fragment>
        ))}
      </Grid>

      <Flex justify="flex-start" mt={10}>
        <Button variant="primary" onClick={generate}>
          {(useTranslation() as any).t("singleZoneCoolingHeatingTool.uploads.generate") || "Continue"}
        </Button>
      </Flex>
    </Box>
  )
})
