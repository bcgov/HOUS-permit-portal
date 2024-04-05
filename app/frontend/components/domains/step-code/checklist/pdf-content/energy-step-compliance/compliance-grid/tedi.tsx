import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { i18nPrefix } from "../../../energy-step-code-compliance/i18n-prefix"
import { Divider } from "../../shared/divider"
import { Field } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"
import { RequirementsMetTag } from "../../shared/requirements-met-tag"
import { VStack } from "../../shared/v-stack"

interface IProps {
  checklist: IStepCodeChecklist
}

export function TEDI({ checklist }: IProps) {
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
              <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.tedi`)}</Text>
            </GridItem>
            <GridItem style={{ flex: 1 }}>
              <Field
                value={checklist.meuiRequirement}
                hint={t(`${i18nPrefix}.max`)}
                inputStyle={{ justifyContent: "center" }}
                rightElement={
                  <VStack style={{ gap: 1.5 }}>
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.tediUnits.numerator`)}
                    </Text>
                    <Divider style={{ marginTop: 0, marginBottom: 0 }} />
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.tediUnits.denominator`)}
                    </Text>
                  </VStack>
                }
              />
            </GridItem>
            <GridItem style={{ flex: 1, alignItems: "flex-start" }}>
              <Field
                value={checklist.meui}
                inputStyle={{ justifyContent: "center" }}
                rightElement={
                  <VStack style={{ gap: 1.5 }}>
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.tediUnits.numerator`)}
                    </Text>
                    <Divider style={{ marginTop: 0, marginBottom: 0 }} />
                    <Text style={{ fontSize: 8.25, color: theme.colors.text.secondary }}>
                      {t(`${i18nPrefix}.tediUnits.denominator`)}
                    </Text>
                  </VStack>
                }
              />
            </GridItem>
          </HStack>
          <HStack style={{ gap: 0, width: "100%", alignItems: "stretch" }}>
            <GridItem style={{ flex: 1 }}>
              <Text style={{ fontSize: 10.5 }}>{t(`${i18nPrefix}.hlr`)}</Text>
            </GridItem>
            <GridItem style={{ flex: 1 }}>
              <Field
                value={checklist.tediHlrPercentRequired || "-"}
                hint={t(`${i18nPrefix}.min`)}
                inputStyle={{ justifyContent: "center" }}
                rightElement={<Text style={{ textAlign: "center", color: theme.colors.text.secondary }}>%</Text>}
              />
            </GridItem>
            <GridItem style={{ flex: 1, alignItems: "flex-start" }}>
              <Field
                value={checklist.tediHlrPercent}
                inputStyle={{ justifyContent: "center" }}
                rightElement={<Text style={{ textAlign: "center", color: theme.colors.text.secondary }}>%</Text>}
              />
            </GridItem>
          </HStack>
        </VStack>

        <GridItem style={{ flexBasis: "25%", minWidth: "25%", justifyContent: "center", borderRightWidth: 0 }}>
          <RequirementsMetTag success={checklist.meuiPassed} />
        </GridItem>
      </HStack>
    </>
  )
}
