import { FormControl, FormHelperText, FormLabel, Grid, Input, Text } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { RouterLink } from "../../../../../shared/navigation/router-link"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { GridData } from "../../../part-9/checklist/shared/grid/data"

interface IProps {
  isMixedUse?: boolean
}

export const WholeBuildingRequirements = observer(function WholeBuildingRequirementsSummary({ isMixedUse }: IProps) {
  const i18nPrefix = "stepCode.part3.requirementsSummary"
  const { checklist } = usePart3StepCode()

  return (
    <Grid w="full" templateColumns={`repeat(3, auto)`} borderWidth={1} borderTopWidth={0} borderColor="borders.light">
      <GridColumnHeader colSpan={3}>
        <Text>{t(`${i18nPrefix}.wholeBuildingRequirements.title`)}</Text>
      </GridColumnHeader>
      <GridData>
        <FormControl>
          <FormLabel>{t("stepCode.part3.metrics.teui.label")}</FormLabel>
          <FormHelperText>
            <Trans i18nKey={"stepCode.part3.metrics.teui.units"} components={{ sup: <sup /> }} />
          </FormHelperText>
          <Input isDisabled value={checklist.complianceReport.performance.requirements.wholeBuilding.teui || "-"} />
        </FormControl>
      </GridData>
      <GridData>
        <FormControl>
          <FormLabel>{t("stepCode.part3.metrics.tedi.label")}</FormLabel>
          <FormHelperText>
            <Trans i18nKey={"stepCode.part3.metrics.tedi.units"} components={{ sup: <sup /> }} />
          </FormHelperText>
          <Input isDisabled value={checklist.complianceReport.performance.requirements.wholeBuilding.tedi || "-"} />
        </FormControl>
      </GridData>
      <GridData>
        <FormControl>
          <FormLabel>{t("stepCode.part3.metrics.ghgi.label")}</FormLabel>
          <FormHelperText>
            <Trans i18nKey={"stepCode.part3.metrics.ghgi.units"} components={{ sup: <sup />, sub: <sub /> }} />
          </FormHelperText>
          <Input isDisabled value={checklist.complianceReport.performance.requirements.wholeBuilding.ghgi || "-"} />
        </FormControl>
      </GridData>
      <GridData colSpan={3}>
        <Text>
          <Trans
            i18nKey={`${i18nPrefix}.wholeBuildingRequirements.hint.${isMixedUse ? "mixedUse" : "singleOccupancy"}`}
            components={{
              stepCodePerformanceLink: (
                <RouterLink
                  to={`${location.pathname.replace("requirements-summary", "step-code-performance-requirements")}`}
                />
              ),
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
