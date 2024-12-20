import { FormControl, FormHelperText, FormLabel, Grid, Input, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { RouterLink } from "../../../../../shared/navigation/router-link"
import { GridColumnHeader } from "../../../step-generic/shared/grid/column-header"
import { GridData } from "../../../step-generic/shared/grid/data"

interface IProps {
  isMixedUse?: boolean
}

export const BaselineRequirements = observer(function BaselineRequirementsSummary({ isMixedUse }: IProps) {
  const i18nPrefix = "stepCode.part3.requirementsSummary"
  const { checklist } = usePart3StepCode()

  return (
    <Grid w="full" templateColumns={`repeat(3, auto)`} borderWidth={1} borderTopWidth={0} borderColor="borders.light">
      <GridColumnHeader colSpan={3}>
        <Text>{t(`${i18nPrefix}.baselineRequirements.title`)}</Text>
      </GridColumnHeader>
      <GridData>
        <FormControl>
          <FormLabel>{t(`${i18nPrefix}.requirementMetrics.teui.label`)}</FormLabel>
          <FormHelperText>
            <Trans i18nKey={`${i18nPrefix}.requirementMetrics.teui.units`} components={{ sup: <sup /> }} />
          </FormHelperText>
          <Input isDisabled value={checklist.complianceReport.requirements.baselinePortions.teui || "-"} />
        </FormControl>
      </GridData>
      <GridData>
        <FormControl>
          <FormLabel>{t(`${i18nPrefix}.requirementMetrics.tedi.label`)}</FormLabel>
          <FormHelperText>
            <Trans i18nKey={`${i18nPrefix}.requirementMetrics.tedi.units`} components={{ sup: <sup /> }} />
          </FormHelperText>
          <Input isDisabled value={checklist.complianceReport.requirements.baselinePortions.tedi || "-"} />
        </FormControl>
      </GridData>
      <GridData>
        <FormControl>
          <FormLabel>{t(`${i18nPrefix}.requirementMetrics.ghgi.label`)}</FormLabel>
          <FormHelperText>
            <Trans
              i18nKey={`${i18nPrefix}.requirementMetrics.ghgi.units`}
              components={{ sup: <sup />, sub: <sub /> }}
            />
          </FormHelperText>
          <Input isDisabled value={checklist.complianceReport.requirements.baselinePortions.ghgi || "-"} />
        </FormControl>
      </GridData>
      <GridData colSpan={3}>
        <Text>
          <Trans
            i18nKey={`${i18nPrefix}.baselineRequirements.hint.${isMixedUse ? "mixedUse" : "singleOccupancy"}`}
            components={{
              baselinePerformanceLink: (
                <RouterLink to={`${location.pathname.replace("requirements-summary", "baseline-performance")}`} />
              ),
            }}
          />
        </Text>
      </GridData>
    </Grid>
  )
})
