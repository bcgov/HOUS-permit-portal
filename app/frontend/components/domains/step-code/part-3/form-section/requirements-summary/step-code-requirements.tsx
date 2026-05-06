import { Tooltip } from "@/components/ui/tooltip"
import { Field, Grid, Input, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { roundMetric } from "../../../../../../utils/utility-functions"
import { RouterLink } from "../../../../../shared/navigation/router-link"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../../part-9/checklist/shared/grid/data"

export const StepCodeRequirements = observer(function StepCodeRequirementsSummary() {
  const i18nPrefix = "stepCode.part3.requirementsSummary"
  const { checklist } = usePart3StepCode()

  return (
    <Grid
      w="full"
      templateColumns={`auto repeat(3,minmax(auto,190px)`}
      borderWidth={1}
      borderTopWidth={0}
      borderColor="borders.light"
    >
      <GridColumnHeader colSpan={4}>
        <Text>{t(`${i18nPrefix}.stepCodeRequirements.title`)}</Text>
      </GridColumnHeader>
      <GridData>
        <Field.Label m={0}>{t(`${i18nPrefix}.stepCodeRequirements.occupancy`)}</Field.Label>
      </GridData>
      <GridData>
        <Field.Label m={0}>{t("stepCode.part3.metrics.teui.label")}</Field.Label>
      </GridData>
      <GridData>
        <Field.Label m={0}>{t("stepCode.part3.metrics.tedi.label")}</Field.Label>
      </GridData>
      <GridData>
        <Field.Label m={0}>{t("stepCode.part3.metrics.ghgi.label")}</Field.Label>
      </GridData>
      {checklist.complianceReport.performance.requirements.stepCodePortions.occupanciesRequirements.map((ocReq) => (
        <>
          <GridData justifyContent="flex-end" borderTop="none">
            <Tooltip content={t(`stepCode.part3.stepCodeOccupancyKeys.${ocReq.occupancy}`)}>
              <Input disabled value={t(`stepCode.part3.stepCodeOccupancyKeys.${ocReq.occupancy}`)} />
            </Tooltip>
          </GridData>
          <GridData borderTop="none">
            <Field.Root>
              <Field.HelperText mt={0}>
                <Trans i18nKey={"stepCode.part3.metrics.teui.units"} components={{ sup: <sup /> }} />
              </Field.HelperText>
              <Input disabled value={roundMetric(ocReq.teui)} />
            </Field.Root>
          </GridData>
          <GridData borderTop="none">
            <Field.Root>
              <Field.HelperText mt={0}>
                <Trans i18nKey={"stepCode.part3.metrics.tedi.units"} components={{ sup: <sup /> }} />
              </Field.HelperText>
              <Input disabled value={roundMetric(ocReq.tedi)} />
            </Field.Root>
          </GridData>
          <GridData borderTop="none">
            <Field.Root>
              <Field.HelperText mt={0}>
                <Trans i18nKey={"stepCode.part3.metrics.ghgi.units"} components={{ sup: <sup />, sub: <sub /> }} />
              </Field.HelperText>
              <Input disabled value={roundMetric(ocReq.ghgi)} />
            </Field.Root>
          </GridData>
        </>
      ))}
      <GridData colSpan={4}>
        <Text>
          <Trans
            i18nKey={`${i18nPrefix}.stepCodeRequirements.hint`}
            components={{
              stepCodePerformanceLink: (
                <RouterLink
                  to={`${location.pathname.replace("requirements-summary", "step-code-performance-requirements")}`}
                />
              ),
            }}
          />
        </Text>
      </GridData>
    </Grid>
  )
})
