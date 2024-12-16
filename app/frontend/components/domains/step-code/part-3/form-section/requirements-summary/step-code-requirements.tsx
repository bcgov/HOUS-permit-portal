import { FormControl, FormHelperText, FormLabel, Grid, Input, Text, Tooltip } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { RouterLink } from "../../../../../shared/navigation/router-link"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../../part-9/checklist/shared/grid/data"

export const StepCodeRequirements = observer(function StepCodeRequirementsSummary() {
  const i18nPrefix = "stepCode.part3.requirementsSummary"
  const { checklist } = usePart3StepCode()

  return (
    <Grid
      w="full"
      templateColumns={`auto repeat(3, minmax(auto 170px))`}
      borderWidth={1}
      borderTopWidth={0}
      borderColor="borders.light"
    >
      <GridColumnHeader colSpan={4}>
        <Text>{t(`${i18nPrefix}.stepCodeRequirements.title`)}</Text>
      </GridColumnHeader>

      <GridData>
        <FormLabel m={0}>{t(`${i18nPrefix}.stepCodeRequirements.occupancy`)}</FormLabel>
      </GridData>
      <GridData>
        <FormLabel m={0}>{t(`${i18nPrefix}.requirementMetrics.teui.label`)}</FormLabel>
      </GridData>
      <GridData>
        <FormLabel m={0}>{t(`${i18nPrefix}.requirementMetrics.tedi.label`)}</FormLabel>
      </GridData>
      <GridData>
        <FormLabel m={0}>{t(`${i18nPrefix}.requirementMetrics.ghgi.label`)}</FormLabel>
      </GridData>

      {checklist.complianceReport.requirements.stepCodePortions.occupanciesRequirements.map((ocReq) => (
        <>
          <GridData justifyContent="flex-end" borderTop="none">
            <Tooltip label={t(`stepCode.part3.stepCodeOccupancyKeys.${ocReq.occupancy}`)}>
              <Input isDisabled value={t(`stepCode.part3.stepCodeOccupancyKeys.${ocReq.occupancy}`)} />
            </Tooltip>
          </GridData>
          <GridData borderTop="none">
            <FormControl>
              <FormHelperText mt={0}>
                <Trans i18nKey={`${i18nPrefix}.requirementMetrics.teui.units`} components={{ sup: <sup /> }} />
              </FormHelperText>
              <Input isDisabled value={ocReq.teui || "-"} />
            </FormControl>
          </GridData>
          <GridData borderTop="none">
            <FormControl>
              <FormHelperText mt={0}>
                <Trans i18nKey={`${i18nPrefix}.requirementMetrics.tedi.units`} components={{ sup: <sup /> }} />
              </FormHelperText>
              <Input isDisabled value={ocReq.tedi || "-"} />
            </FormControl>
          </GridData>
          <GridData borderTop="none">
            <FormControl>
              <FormHelperText mt={0}>
                <Trans
                  i18nKey={`${i18nPrefix}.requirementMetrics.ghgi.units`}
                  components={{ sup: <sup />, sub: <sub /> }}
                />
              </FormHelperText>
              <Input isDisabled value={ocReq.ghgi || "-"} />
            </FormControl>
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
