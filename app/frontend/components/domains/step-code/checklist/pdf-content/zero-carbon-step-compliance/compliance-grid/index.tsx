import { Text } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../../styles/theme"
import { i18nPrefix } from "../../../zero-carbon-step-code-compliance/i18n-prefix"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"
import { RequirementsMetTag } from "../../shared/requirements-met-tag"
import { VStack } from "../../shared/v-stack"
import { CO2 } from "./co2"
import { Prescriptive } from "./prescriptive"
import { TotalGHG } from "./total-ghg"
import { ZeroCarbonStep } from "./zero-carbon-step"

interface IProps {
  checklist: IStepCodeChecklist
}

export const ZeroCarbonComplianceGrid = function ZeroCarbonComplianceGrid({ checklist }: IProps) {
  return (
    <VStack style={{ width: "100%", borderWidth: 0.75, borderColor: theme.colors.border.light, gap: 0 }}>
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
        <GridItem style={{ flexBasis: "25%", minWidth: "25%", textAlign: "center" }}>
          <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefix}.proposedMetrics`)}</Text>
        </GridItem>
        <GridItem style={{ flexBasis: "25%", minWidth: "25%", textAlign: "center" }}>
          <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefix}.stepRequirement`)}</Text>
        </GridItem>
        <GridItem style={{ flexBasis: "25%", minWidth: "25%", textAlign: "center" }}>
          <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefix}.result`)}</Text>
        </GridItem>
        <GridItem style={{ flexBasis: "25%", minWidth: "25%", textAlign: "center", borderRightWidth: 0 }}>
          <Text style={{ fontSize: 10.5, fontWeight: 700 }}>{t(`${i18nPrefix}.passFail`)}</Text>
        </GridItem>
      </HStack>

      <ZeroCarbonStep checklist={checklist} />
      <TotalGHG checklist={checklist} />
      <CO2 checklist={checklist} />
      <Prescriptive checklist={checklist} />

      <HStack
        style={{
          width: "100%",
          alignItems: "stretch",
          gap: 0,
        }}
      >
        <GridItem style={{ flexBasis: "75%", minWidth: "75%" }}>
          <Text style={{ fontWeight: 700, fontSize: 10.5 }}>{t(`${i18nPrefix}.requirementsMet`)}</Text>
        </GridItem>
        <GridItem style={{ flexBasis: "25%", minWidth: "25%", justifyContent: "center" }}>
          <RequirementsMetTag success={checklist.zeroCarbonRequirementsPassed} />
        </GridItem>
      </HStack>
    </VStack>
  )
}
