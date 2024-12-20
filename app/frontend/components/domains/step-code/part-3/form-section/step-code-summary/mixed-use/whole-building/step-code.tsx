import { FormControl, FormHelperText, FormLabel, Grid, GridItem, Input } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../../../../hooks/resources/use-part-3-step-code"
import { GridData } from "../../../../../part-9/checklist/shared/grid/data"

const i18nPrefix = "stepCode.part3.stepCodeSummary.mixedUse.wholeBuilding"

export const StepCodeWholeBuildingSummary = observer(function StepCodeWholeBuildingSummary() {
  const { checklist } = usePart3StepCode()
  const { requirements, adjustedResults, complianceSummary } = checklist.complianceReport.performance
  const teuiComplies = !!complianceSummary.teui
  const tediComplies = !!complianceSummary.tedi.wholeBuilding
  const ghgiComplies = !!complianceSummary.ghgi

  return (
    <Grid templateColumns="160px repeat(3, 1fr)" borderRightWidth={1} borderBottomWidth={1} borderColor="borders.light">
      <GridItem />

      <GridData>
        <FormControl>
          <FormLabel m={0}>{t("stepCode.part3.metrics.teui.label")}</FormLabel>
          <FormHelperText mt={0}>
            <Trans i18nKey={"stepCode.part3.metrics.teui.units"} components={{ sup: <sup />, sub: <sub /> }} />
          </FormHelperText>
        </FormControl>
      </GridData>
      <GridData>
        <FormControl>
          <FormLabel m={0}>{t("stepCode.part3.metrics.tedi.label")}</FormLabel>
          <FormHelperText mt={0}>
            <Trans i18nKey={"stepCode.part3.metrics.tedi.units"} components={{ sup: <sup />, sub: <sub /> }} />
          </FormHelperText>
        </FormControl>
      </GridData>
      <GridData>
        <FormControl>
          <FormLabel m={0}>{t("stepCode.part3.metrics.ghgi.label")}</FormLabel>
          <FormHelperText mt={0}>
            <Trans i18nKey={"stepCode.part3.metrics.ghgi.units"} components={{ sup: <sup />, sub: <sub /> }} />
          </FormHelperText>
        </FormControl>
      </GridData>

      <GridData>
        <FormLabel>{t(`${i18nPrefix}.requirements`)}</FormLabel>
      </GridData>
      <GridData justifyContent="center">
        <Input
          isDisabled
          value={requirements.wholeBuilding.teui ? parseFloat(requirements.wholeBuilding.teui).toFixed(2) : "-"}
        />
      </GridData>
      <GridData justifyContent="center">
        <Input
          isDisabled
          value={requirements.wholeBuilding.tedi ? parseFloat(requirements.wholeBuilding.tedi).toFixed(2) : "-"}
        />
      </GridData>
      <GridData justifyContent="center">
        <Input
          isDisabled
          value={requirements.wholeBuilding.ghgi ? parseFloat(requirements.wholeBuilding.ghgi).toFixed(2) : "-"}
        />
      </GridData>

      <GridData>
        <FormLabel>{t(`${i18nPrefix}.performance`)}</FormLabel>
      </GridData>
      <GridData justifyContent="center">
        <Input isDisabled value={adjustedResults.teui ? parseFloat(adjustedResults.teui).toFixed(2) : "-"} />
      </GridData>
      <GridData justifyContent="center">
        <Input
          isDisabled
          value={adjustedResults.tedi.wholeBuilding ? parseFloat(adjustedResults.tedi.wholeBuilding).toFixed(2) : "-"}
        />
      </GridData>
      <GridData justifyContent="center">
        <Input isDisabled value={adjustedResults.ghgi ? parseFloat(adjustedResults.ghgi).toFixed(2) : "-"} />
      </GridData>

      <GridData>
        <FormLabel>{t(`${i18nPrefix}.compliance`)}</FormLabel>
      </GridData>
      <GridData justifyContent="center">
        <Input
          isDisabled
          _disabled={{ bg: teuiComplies ? "semantic.successLight" : "semantic.errorLight" }}
          value={teuiComplies ? t("ui.yes") : t("ui.no")}
        />
      </GridData>
      <GridData justifyContent="center">
        <Input
          isDisabled
          _disabled={{ bg: tediComplies ? "semantic.successLight" : "semantic.errorLight" }}
          value={tediComplies ? t("ui.yes") : t("ui.no")}
        />
      </GridData>
      <GridData justifyContent="center">
        <Input
          isDisabled
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
