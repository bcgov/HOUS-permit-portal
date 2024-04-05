import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { i18nPrefix } from "../../../zero-carbon-step-code-compliance/i18n-prefix"
import { Field } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"
import { RequirementsMetTag } from "../../shared/requirements-met-tag"
import { VStack } from "../../shared/v-stack"

interface IProps {
  checklist: IStepCodeChecklist
}

export function Prescriptive({ checklist }: IProps) {
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
                  checklist.prescriptiveHeatingRequirement
                    ? t(`${i18nPrefix}.prescriptive.${checklist.prescriptiveHeatingRequirement}`)
                    : "-"
                }
                inputStyle={{ justifyContent: "center" }}
              />
            </GridItem>
            <GridItem style={{ flex: 1, alignItems: "flex-start" }}>
              <Field
                value={
                  checklist.prescriptiveHeating ? t(`${i18nPrefix}.prescriptive.${checklist.prescriptiveHeating}`) : "-"
                }
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
                  checklist.prescriptiveHotWaterRequirement
                    ? t(`${i18nPrefix}.prescriptive.${checklist.prescriptiveHotWaterRequirement}`)
                    : "-"
                }
                inputStyle={{ justifyContent: "center" }}
              />
            </GridItem>
            <GridItem style={{ flex: 1, alignItems: "flex-start" }}>
              <Field
                value={
                  checklist.prescriptiveHotWater
                    ? t(`${i18nPrefix}.prescriptive.${checklist.prescriptiveHotWater}`)
                    : "-"
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
                  checklist.prescriptiveOtherRequirement
                    ? t(`${i18nPrefix}.prescriptive.${checklist.prescriptiveOtherRequirement}`)
                    : "-"
                }
                inputStyle={{ justifyContent: "center" }}
              />
            </GridItem>
            <GridItem style={{ flex: 1 }}>
              <Field
                value={
                  checklist.prescriptiveOther ? t(`${i18nPrefix}.prescriptive.${checklist.prescriptiveOther}`) : "-"
                }
                inputStyle={{ justifyContent: "center" }}
              />
            </GridItem>
          </HStack>
        </VStack>

        <GridItem style={{ flexBasis: "25%", minWidth: "25%", justifyContent: "center", borderRightWidth: 0 }}>
          <RequirementsMetTag success={checklist.co2Passed} />
        </GridItem>
      </HStack>
    </>
  )
}
