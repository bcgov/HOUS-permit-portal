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

interface IProps {
  isMixedUse?: boolean
}

export const WholeBuildingRequirements = observer(function WholeBuildingRequirementsSummary({ isMixedUse }: IProps) {
  const i18nPrefix = "stepCode.part3.requirementsSummary"
  const { checklist } = usePart3StepCode()
  const { requirements } = checklist.complianceReport.performance

  return (
    <Grid w="full" templateColumns={`repeat(3, auto)`} borderWidth={1} borderTopWidth={0} borderColor="borders.light">
      <GridColumnHeader colSpan={3}>
        <Text>{t(`${i18nPrefix}.wholeBuildingRequirements.title`)}</Text>
      </GridColumnHeader>
      <GridData>
        <Field.Root>
          <Field.Label>{t("stepCode.part3.metrics.teui.label")}</Field.Label>
          <Field.HelperText>
            <Trans i18nKey={"stepCode.part3.metrics.teui.units"} components={{ sup: <sup /> }} />
          </Field.HelperText>
          <Input disabled value={roundMetric(requirements.wholeBuilding.teui)} />
        </Field.Root>
      </GridData>
      <GridData>
        <Field.Root>
          <Field.Label>{t("stepCode.part3.metrics.tedi.label")}</Field.Label>
          <Field.HelperText>
            <Trans i18nKey={"stepCode.part3.metrics.tedi.units"} components={{ sup: <sup /> }} />
          </Field.HelperText>
          <Input disabled value={roundMetric(requirements.wholeBuilding.tedi)} />
        </Field.Root>
      </GridData>
      <GridData>
        <Field.Root>
          <Field.Label>{t("stepCode.part3.metrics.ghgi.label")}</Field.Label>
          <Field.HelperText>
            <Trans i18nKey={"stepCode.part3.metrics.ghgi.units"} components={{ sup: <sup />, sub: <sub /> }} />
          </Field.HelperText>
          <Input disabled value={roundMetric(requirements.wholeBuilding.ghgi)} />
        </Field.Root>
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
