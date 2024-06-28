import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeZeroCarbonComplianceReport } from "../../../../../../../models/step-code-zero-carbon-compliance-report"
import { theme } from "../../../../../../../styles/theme"
import { i18nPrefix } from "../../../zero-carbon-step-code-compliance/i18n-prefix"
import { Divider } from "../../shared/divider"
import { Field } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"
import { RequirementsMetTag } from "../../shared/requirements-met-tag"
import { VStack } from "../../shared/v-stack"

interface IProps {
  report: IStepCodeZeroCarbonComplianceReport
}

export function CO2({ report }: IProps) {
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
          <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefix}.co2.title`)}</Text>
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
              <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.co2.perFloorArea.label`)}</Text>
            </GridItem>
            <GridItem style={{ flex: 1 }}>
              <Field
                value={report.co2Requirement}
                hint={t(`${i18nPrefix}.max`)}
                inputStyle={{ justifyContent: "center" }}
                rightElement={
                  <VStack style={{ gap: 1.5 }}>
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.co2.perFloorArea.units.numerator`)}
                    </Text>
                    <Divider style={{ marginTop: 0, marginBottom: 0 }} />
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.co2.perFloorArea.units.denominator`)}
                    </Text>
                  </VStack>
                }
              />
            </GridItem>
            <GridItem style={{ flex: 1, alignItems: "flex-start" }}>
              <Field
                value={report.co2 || "-"}
                inputStyle={{ justifyContent: "center" }}
                rightElement={
                  <VStack style={{ gap: 1.5 }}>
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.co2.perFloorArea.units.numerator`)}
                    </Text>
                    <Divider style={{ marginTop: 0, marginBottom: 0 }} />
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.co2.perFloorArea.units.denominator`)}
                    </Text>
                  </VStack>
                }
              />
            </GridItem>
          </HStack>
          <HStack style={{ gap: 0, width: "100%", alignItems: "stretch" }}>
            <GridItem style={{ flex: 1 }}>
              <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.co2.max.label`)}</Text>
            </GridItem>
            <GridItem style={{ flex: 1 }}>
              <Field
                value={report.co2MaxRequirement || "-"}
                hint={t(`${i18nPrefix}.max`)}
                inputStyle={{ justifyContent: "center" }}
                rightElement={
                  <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                    {t(`${i18nPrefix}.co2.max.units`)}
                  </Text>
                }
              />
            </GridItem>
            <GridItem style={{ flex: 1, alignItems: "flex-start" }}>
              <Field
                value={report.totalGhg || "-"}
                inputStyle={{ justifyContent: "center" }}
                rightElement={
                  <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                    {t(`${i18nPrefix}.co2.max.units`)}
                  </Text>
                }
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
