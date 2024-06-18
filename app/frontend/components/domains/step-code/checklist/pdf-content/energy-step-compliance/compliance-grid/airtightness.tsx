import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeEnergyComplianceReport } from "../../../../../../../models/step-code-energy-compliance-report"
import { theme } from "../../../../../../../styles/theme"
import { i18nPrefix } from "../../../energy-step-code-compliance/i18n-prefix"
import { Divider } from "../../shared/divider"
import { Field } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"
import { RequirementsMetTag } from "../../shared/requirements-met-tag"
import { VStack } from "../../shared/v-stack"

interface IProps {
  report: IStepCodeEnergyComplianceReport
}
export function Airtightness({ report }: IProps) {
  return (
    <>
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
              <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.ach`)}</Text>
            </GridItem>
            <GridItem style={{ flex: 1 }}>
              <Field
                value={report.achRequirement || "-"}
                hint={t(`${i18nPrefix}.max`)}
                inputStyle={{ justifyContent: "center" }}
                rightElement={
                  <VStack style={{ gap: 1.5 }}>
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.achUnits.numerator`)}
                    </Text>
                    <Divider style={{ marginTop: 0, marginBottom: 0 }} />
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.achUnits.denominator`)}
                    </Text>
                  </VStack>
                }
              />
            </GridItem>
            <GridItem style={{ flex: 1, alignItems: "flex-start" }}>
              <Field
                value={report.ach || "-"}
                inputStyle={{ justifyContent: "center" }}
                rightElement={
                  <VStack style={{ gap: 1.5 }}>
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.achUnits.numerator`)}
                    </Text>
                    <Divider style={{ marginTop: 0, marginBottom: 0 }} />
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.achUnits.denominator`)}
                    </Text>
                  </VStack>
                }
              />
            </GridItem>
          </HStack>
          <HStack style={{ gap: 0, width: "100%", alignItems: "stretch" }}>
            <GridItem style={{ flex: 1 }}>
              {/* TODO: fix subscript (font import) */}
              <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.nla`)}</Text>
            </GridItem>
            <GridItem style={{ flex: 1 }}>
              <Field
                value={report.nlaRequirement || "-"}
                hint={t(`${i18nPrefix}.max`)}
                inputStyle={{ justifyContent: "center" }}
                rightElement={
                  <VStack style={{ gap: 1.5 }}>
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.nlaUnits.numerator`)}
                    </Text>
                    <Divider style={{ marginTop: 0, marginBottom: 0 }} />
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.nlaUnits.denominator`)}
                    </Text>
                  </VStack>
                }
              />
            </GridItem>
            <GridItem style={{ flex: 1, alignItems: "flex-start" }}>
              <Field
                value={report.nla || "-"}
                inputStyle={{ justifyContent: "center" }}
                rightElement={
                  <VStack style={{ gap: 1.5 }}>
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.nlaUnits.numerator`)}
                    </Text>
                    <Divider style={{ marginTop: 0, marginBottom: 0 }} />
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.nlaUnits.denominator`)}
                    </Text>
                  </VStack>
                }
              />
            </GridItem>
          </HStack>
          <HStack style={{ gap: 0, width: "100%", alignItems: "stretch" }}>
            <GridItem style={{ flex: 1 }}>
              {/* TODO: fix subscript (font import) */}
              <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.nlr`)}</Text>
            </GridItem>
            <GridItem style={{ flex: 1 }}>
              <Field
                value={report.nlrRequirement || "-"}
                inputStyle={{ justifyContent: "center" }}
                rightElement={
                  <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                    {t(`${i18nPrefix}.nlrUnits`)}
                  </Text>
                }
              />
            </GridItem>
            <GridItem style={{ flex: 1, alignItems: "flex-start" }}>
              <Field
                value={report.nlr || "-"}
                inputStyle={{ justifyContent: "center" }}
                rightElement={
                  <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                    {t(`${i18nPrefix}.nlrUnits`)}
                  </Text>
                }
              />
            </GridItem>
          </HStack>
        </VStack>

        <GridItem style={{ flexBasis: "25%", minWidth: "25%", justifyContent: "center", borderRightWidth: 0 }}>
          <RequirementsMetTag success={report.meuiPassed} />
        </GridItem>
      </HStack>
    </>
  )
}
