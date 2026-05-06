import { Field, Grid, GridItem, Input } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../../../../hooks/resources/use-part-3-step-code"
import { roundMetric } from "../../../../../../../../utils/utility-functions"
import { GridData } from "../../../../../part-9/checklist/shared/grid/data"

const i18nPrefix = "stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding"

export const StepCodeWholeBuildingSummary = observer(function StepCodeWholeBuildingSummary() {
  const { checklist } = usePart3StepCode()
  const { requirements, adjustedResults, complianceSummary } = checklist.complianceReport.performance
  const teuiComplies = !!complianceSummary.teui
  const tediComplies = !!complianceSummary.tedi?.wholeBuilding
  const ghgiComplies = !!complianceSummary.ghgi

  return (
    <Grid templateColumns="160px repeat(3, 1fr)" borderRightWidth={1} borderBottomWidth={1} borderColor="borders.light">
      <GridItem />
      <GridData>
        <Field.Root>
          <Field.Label m={0}>{t("stepCode.part3.metrics.teui.label")}</Field.Label>
          <Field.HelperText mt={0}>
            <Trans i18nKey={"stepCode.part3.metrics.teui.units"} components={{ sup: <sup />, sub: <sub /> }} />
          </Field.HelperText>
        </Field.Root>
      </GridData>
      <GridData>
        <Field.Root>
          <Field.Label m={0}>{t("stepCode.part3.metrics.tedi.label")}</Field.Label>
          <Field.HelperText mt={0}>
            <Trans i18nKey={"stepCode.part3.metrics.tedi.units"} components={{ sup: <sup />, sub: <sub /> }} />
          </Field.HelperText>
        </Field.Root>
      </GridData>
      <GridData>
        <Field.Root>
          <Field.Label m={0}>{t("stepCode.part3.metrics.ghgi.label")}</Field.Label>
          <Field.HelperText mt={0}>
            <Trans i18nKey={"stepCode.part3.metrics.ghgi.units"} components={{ sup: <sup />, sub: <sub /> }} />
          </Field.HelperText>
        </Field.Root>
      </GridData>
      <GridData>
        <Field.Label>{t(`${i18nPrefix}.requirements`)}</Field.Label>
      </GridData>
      <GridData justifyContent="center">
        <Input disabled value={roundMetric(requirements.wholeBuilding.teui)} />
      </GridData>
      <GridData justifyContent="center">
        <Input disabled value={roundMetric(requirements.wholeBuilding.tedi)} />
      </GridData>
      <GridData justifyContent="center">
        <Input disabled value={roundMetric(requirements.wholeBuilding.ghgi)} />
      </GridData>
      <GridData>
        <Field.Label>{t(`${i18nPrefix}.performance`)}</Field.Label>
      </GridData>
      <GridData justifyContent="center">
        <Input disabled value={roundMetric(adjustedResults.teui)} />
      </GridData>
      <GridData justifyContent="center">
        <Input disabled value={roundMetric(adjustedResults.tedi?.wholeBuilding)} />
      </GridData>
      <GridData justifyContent="center">
        <Input disabled value={roundMetric(adjustedResults.ghgi)} />
      </GridData>
      <GridData>
        <Field.Label>{t(`${i18nPrefix}.compliance`)}</Field.Label>
      </GridData>
      <GridData justifyContent="center">
        <Input
          disabled
          _disabled={{ bg: teuiComplies ? "semantic.successLight" : "semantic.errorLight" }}
          value={teuiComplies ? t("ui.yes") : t("ui.no")}
        />
      </GridData>
      <GridData justifyContent="center">
        <Input
          disabled
          _disabled={{ bg: tediComplies ? "semantic.successLight" : "semantic.errorLight" }}
          value={tediComplies ? t("ui.yes") : t("ui.no")}
        />
      </GridData>
      <GridData justifyContent="center">
        <Input
          disabled
          _disabled={{
            bg: ghgiComplies
              ? "semantic.successLight"
              : requirements.wholeBuilding.ghgi
                ? "semantic.errorLight"
                : "greys.grey04",
          }}
          value={ghgiComplies ? t("ui.yes") : requirements.wholeBuilding.ghgi ? t("ui.no") : t("ui.na")}
        />
      </GridData>
    </Grid>
  )
})
