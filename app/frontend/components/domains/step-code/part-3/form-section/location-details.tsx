import {
  Box,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Link,
  Radio,
  RadioGroup,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { IJurisdictionHeatingDegreeDay } from "../../../../../types/types"
import { climateZoneFromHdd } from "../../../../../utils/climate-zone"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { Part3FormFooter } from "./shared/form-footer"
import { SectionHeading } from "./shared/section-heading"

const TABLE_HEADERS = [
  "stepCode.part3.locationDetails.hdd.tableHdd",
  "stepCode.part3.locationDetails.hdd.tableClimateZone",
  "stepCode.part3.locationDetails.hdd.tableLocation",
] as const

const thProps = {
  borderBottomWidth: 1,
  borderColor: "border.light",
  fontWeight: "bold" as const,
  fontSize: "sm",
  w: "220px",
  h: "46px",
  px: 4,
}

const tdProps = {
  borderTopWidth: 1,
  borderColor: "greys.grey02",
  fontSize: "lg",
  w: "220px",
  minH: "68px",
  px: 4,
}

function hddRowKey(row: IJurisdictionHeatingDegreeDay) {
  return row.id ?? `${row.locationName}-${row.heatingDegreeDays}`
}

function hddForRowId(rows: IJurisdictionHeatingDegreeDay[], id: string | null | undefined) {
  return rows.find((row) => hddRowKey(row) === id)?.heatingDegreeDays ?? null
}

function parseHdd(value: unknown) {
  if (value === "" || value === null || value === undefined) return null
  return Number(value)
}

function defaultHddRowKey(rows: IJurisdictionHeatingDegreeDay[], savedHdd: number | null | undefined) {
  if (rows.length === 1) return hddRowKey(rows[0])
  if (savedHdd == null) return null

  const matches = rows.filter((row) => row.heatingDegreeDays === Number(savedHdd))
  return matches.length === 1 ? hddRowKey(matches[0]) : null
}

function HddRadioTable({
  rows,
  value,
  onChange,
}: {
  rows: IJurisdictionHeatingDegreeDay[]
  value: string | null
  onChange: (id: string) => void
}) {
  return (
    <RadioGroup value={value ?? ""} onChange={onChange}>
      <Box borderWidth={1} borderColor="border.light" borderRadius="sm" overflow="hidden" w="fit-content">
        <Table variant="simple" size="md">
          <Thead>
            <Tr bg="greys.grey04">
              {TABLE_HEADERS.map((key) => (
                <Th key={key} {...thProps}>
                  {t(key)}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => {
              const key = hddRowKey(row)
              const zone = climateZoneFromHdd(row.heatingDegreeDays)

              return (
                <Tr
                  key={key}
                  cursor="pointer"
                  bg={value === key ? "theme.blueLight" : undefined}
                  onClick={() => onChange(key)}
                >
                  <Td {...tdProps}>
                    <Radio value={key}>{row.heatingDegreeDays.toLocaleString()}</Radio>
                  </Td>
                  <Td {...tdProps}>
                    {zone ? t(`stepCode.part3.locationDetails.climateZones.${zone}`) : row.climateZone}
                  </Td>
                  <Td {...tdProps}>{row.locationName}</Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Box>
    </RadioGroup>
  )
}

export const LocationDetails = observer(function Part3StepCodeFormLocationDetails() {
  const { checklist, currentStepCode } = usePart3StepCode()
  const hddRows = [...(currentStepCode?.jurisdiction?.jurisdictionHeatingDegreeDays ?? [])]
  const hasHddRows = hddRows.length > 0

  const { handleSubmit, formState, register, control, reset } = useForm({
    defaultValues: {
      buildingHeight: checklist.buildingHeight && parseFloat(checklist.buildingHeight),
      heatingDegreeDays: checklist.heatingDegreeDays ?? null,
      heatingDegreeDayId: defaultHddRowKey(hddRows, checklist.heatingDegreeDays),
    },
  })
  const { isSubmitting, isValid, isSubmitted, errors } = formState
  const heatingDegreeDays = useWatch({ control, name: "heatingDegreeDays" })
  const derivedClimateZone = climateZoneFromHdd(parseHdd(heatingDegreeDays))

  const onSubmit = async (values) => {
    if (!checklist) return

    const heatingDegreeDaysValue = hasHddRows
      ? hddForRowId(hddRows, values.heatingDegreeDayId)
      : parseHdd(values.heatingDegreeDays)

    const updated = await checklist.update({
      buildingHeight: values.buildingHeight,
      heatingDegreeDays: heatingDegreeDaysValue,
      climateZone: climateZoneFromHdd(heatingDegreeDaysValue),
    })
    if (!updated) throw new Error("Save failed")

    await checklist.completeSection("locationDetails")
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  const jurisdictionSlugOrId = currentStepCode?.jurisdiction?.slug || currentStepCode?.jurisdiction?.id
  const hddReferenceHref = jurisdictionSlugOrId
    ? `/jurisdictions/${jurisdictionSlugOrId}/step-code-requirements#heating-degree-days`
    : null

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        {!isValid && isSubmitted && (
          <CustomMessageBox title={t("stepCode.part3.errorTitle")} status={EFlashMessageStatus.error} />
        )}
        <SectionHeading>{t("stepCode.part3.locationDetails.heading")}</SectionHeading>
        <Text fontSize="md">{t("stepCode.part3.locationDetails.instructions")}</Text>
      </Flex>
      <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
        <FormControl>
          <FormLabel>{t("stepCode.part3.locationDetails.aboveGradeStories.label")}</FormLabel>
          <FormHelperText mb={1} mt={0}>
            {t("stepCode.part3.locationDetails.aboveGradeStories.hint")}
          </FormHelperText>
          <FormHelperText mb={1} mt={0} color="semantic.error">
            <ErrorMessage errors={errors} name="buildingHeight" />
          </FormHelperText>
          <Input
            maxW={"200px"}
            type="number"
            step={0.1}
            textAlign="left"
            {...register("buildingHeight", { required: t("stepCode.part3.locationDetails.aboveGradeStories.error") })}
          />
        </FormControl>
        <FormControl>
          <FormLabel>{t("stepCode.part3.locationDetails.hdd.label")}</FormLabel>
          {hasHddRows && (
            <FormHelperText mb={2} mt={0}>
              {t("stepCode.part3.locationDetails.hdd.selectHint")}
            </FormHelperText>
          )}
          {hddReferenceHref && (
            <FormHelperText mb={2} mt={0}>
              <Trans
                i18nKey="stepCode.part3.locationDetails.hdd.jurisdictionReference"
                components={{
                  a: (
                    <Link
                      href={hddReferenceHref}
                      color="text.link"
                      isExternal
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              />
            </FormHelperText>
          )}
          <FormHelperText mb={1} mt={0} color="semantic.error">
            <ErrorMessage errors={errors} name={hasHddRows ? "heatingDegreeDayId" : "heatingDegreeDays"} />
          </FormHelperText>
          {hasHddRows ? (
            <Controller
              name="heatingDegreeDayId"
              control={control}
              rules={{ required: t("stepCode.part3.locationDetails.hdd.selectError") }}
              render={({ field: { onChange, value } }) => (
                <HddRadioTable rows={hddRows} value={value} onChange={onChange} />
              )}
            />
          ) : (
            <Input
              maxW={"200px"}
              type="number"
              textAlign="left"
              {...register("heatingDegreeDays", { required: t("stepCode.part3.locationDetails.hdd.error") })}
            />
          )}
        </FormControl>
        {!hasHddRows && (
          <FormControl>
            <FormLabel pb={1}>{t("stepCode.part3.locationDetails.climateZone.label")}</FormLabel>
            <FormHelperText mb={1} mt={0}>
              {t("stepCode.part3.locationDetails.climateZone.hint")}
            </FormHelperText>
            <Text fontSize="md" fontWeight="medium">
              {derivedClimateZone
                ? t(`stepCode.part3.locationDetails.climateZones.${derivedClimateZone}`)
                : t("stepCode.part3.locationDetails.climateZone.pending")}
            </Text>
          </FormControl>
        )}
        <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
      </Flex>
    </>
  )
})
