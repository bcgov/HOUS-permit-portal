import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../../models/step-code-zero-carbon-compliance-report"
import { theme } from "../../../../../../../styles/theme"
import { i18nPrefix } from "../../../../../../domains/step-code/part-9/checklist/zero-carbon-step-code-compliance/i18n-prefix"
import { reportTranslation as t } from "../../../../../components/report-translation"
import {
  Field,
  GridItem,
  HStack,
  RequirementsMetTag,
  Text,
  VStack,
} from "../../../../../components/step-code-primitives"

interface IProps {
  report: IStepCodeZeroCarbonComplianceReport
}

export function Prescriptive({ report }: IProps) {
  return (
    <>
      <HStack
        style={{
          width: "100%",
          alignItems: "stretch",
          backgroundColor: theme.colors.greys.grey03,
          borderBottomWidth: 0.75,
          borderColor: theme.colors.border.light,
          gap: 0,
        }}
      >
        <GridItem style={{ flexBasis: "100%", minWidth: "100%" }}>
          <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefix}.prescriptive.title`)}</Text>
        </GridItem>
      </HStack>
      <HStack
        style={{
          width: "100%",
          alignItems: "stretch",
          borderBottomWidth: 0.75,
          borderColor: theme.colors.border.light,
          gap: 0,
        }}
      >
        <VStack style={{ flexBasis: "75%", minWidth: "75%", gap: 0 }}>
          <HStack
            style={{
              gap: 0,
              width: "100%",
              alignItems: "stretch",
              borderBottomWidth: 0.75,
              borderColor: theme.colors.border.light,
            }}
          >
            <GridItem style={{ flex: 1 }}>
              <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.prescriptive.heating`)}</Text>
            </GridItem>
            <GridItem style={{ flex: 1 }}>
              <Field
                value={
                  report.prescriptiveHeatingRequirement
                    ? t(`${i18nPrefix}.prescriptive.${report.prescriptiveHeatingRequirement}`)
                    : "-"
                }
                inputStyle={{ justifyContent: "center" }}
              />
            </GridItem>
            <GridItem style={{ flex: 1, alignItems: "flex-start" }}>
              <Field
                value={report.prescriptiveHeating ? t(`${i18nPrefix}.prescriptive.${report.prescriptiveHeating}`) : "-"}
                inputStyle={{ justifyContent: "center" }}
              />
            </GridItem>
          </HStack>
          <HStack
            style={{
              gap: 0,
              width: "100%",
              alignItems: "stretch",
              borderBottomWidth: 0.75,
              borderColor: theme.colors.border.light,
            }}
          >
            <GridItem style={{ flex: 1 }}>
              <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.prescriptive.hotWater`)}</Text>
            </GridItem>
            <GridItem style={{ flex: 1 }}>
              <Field
                value={
                  report.prescriptiveHotWaterRequirement
                    ? t(`${i18nPrefix}.prescriptive.${report.prescriptiveHotWaterRequirement}`)
                    : "-"
                }
                inputStyle={{ justifyContent: "center" }}
              />
            </GridItem>
            <GridItem style={{ flex: 1, alignItems: "flex-start" }}>
              <Field
                value={
                  report.prescriptiveHotWater ? t(`${i18nPrefix}.prescriptive.${report.prescriptiveHotWater}`) : "-"
                }
                inputStyle={{ justifyContent: "center" }}
              />
            </GridItem>
          </HStack>
          <HStack style={{ gap: 0, width: "100%", alignItems: "stretch" }}>
            <GridItem style={{ flex: 1 }}>
              <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.prescriptive.other`)}</Text>
            </GridItem>
            <GridItem style={{ flex: 1 }}>
              <Field
                value={
                  report.prescriptiveOtherRequirement
                    ? t(`${i18nPrefix}.prescriptive.${report.prescriptiveOtherRequirement}`)
                    : "-"
                }
                inputStyle={{ justifyContent: "center" }}
              />
            </GridItem>
            <GridItem style={{ flex: 1 }}>
              <Field
                value={report.prescriptiveOther ? t(`${i18nPrefix}.prescriptive.${report.prescriptiveOther}`) : "-"}
                inputStyle={{ justifyContent: "center" }}
              />
            </GridItem>
          </HStack>
        </VStack>

        <GridItem style={{ flexBasis: "25%", minWidth: "25%", justifyContent: "center", borderRightWidth: 0 }}>
          <RequirementsMetTag success={report.co2Passed} />
        </GridItem>
      </HStack>
    </>
  )
}
