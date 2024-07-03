import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../styles/theme"
import { i18nPrefix } from "../../compliance-summary/i18n-prefix"
import { Divider } from "../shared/divider"
import { Field, Input } from "../shared/field"
import { Panel } from "../shared/panel"

interface IProps {
  checklist: IStepCodeChecklist
}
export const ComplianceSummary = function StepCodeChecklistPDFComplianceSummary({ checklist }: IProps) {
  const report = checklist.selectedReport
  return (
    <Panel heading={t(`${i18nPrefix}.heading`)} break>
      <Field
        label={t(`${i18nPrefix}.compliancePath.label`)}
        value={t(`${i18nPrefix}.compliancePath.options.${checklist.compliancePath}`)}
      />
      <View style={{ display: "flex", flexDirection: "row", gap: 18 }}>
        <ComplianceBox
          heading={t(`${i18nPrefix}.energyStepCode.heading`)}
          stepRequiredLabel={t(`${i18nPrefix}.energyStepCode.stepRequired`) + ": "}
          stepRequired={report.energy.requiredStep}
          stepProposedLabel={t(`${i18nPrefix}.energyStepCode.stepProposed`) + ": "}
          stepProposed={report.energy.proposedStep}
        />

        <ComplianceBox
          heading={t(`${i18nPrefix}.zeroCarbonStepCode.heading`)}
          stepRequiredLabel={t(`${i18nPrefix}.zeroCarbonStepCode.stepRequired`) + ": "}
          stepRequired={report.zeroCarbon.requiredStep}
          stepProposedLabel={t(`${i18nPrefix}.zeroCarbonStepCode.stepProposed`) + ": "}
          stepProposed={report.zeroCarbon.proposedStep}
        />
      </View>

      <Divider />

      <View style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
        <Text style={{ fontWeight: "bold", fontSize: 12 }}>{t(`${i18nPrefix}.planInfo.title`)}</Text>
        <View style={{ display: "flex", flexDirection: "row", gap: 6, width: "100%" }}>
          <Field label={t(`${i18nPrefix}.planInfo.author`)} value={checklist.planAuthor} style={{ flex: 1 }} />
          <Field label={t(`${i18nPrefix}.planInfo.version`)} value={checklist.planVersion} style={{ flex: 1 }} />
          <Field label={t(`${i18nPrefix}.planInfo.date`)} value={checklist.planDate} style={{ flex: 1 }} />
        </View>
      </View>
    </Panel>
  )
}

function ComplianceBox({ heading, stepRequired, stepRequiredLabel, stepProposed, stepProposedLabel }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 4.5,
        borderWidth: 0.75,
        borderColor: theme.colors.greys.grey02,
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: 700 }}>{heading}</Text>
      <View style={{ alignItems: "stretch", gap: 6 }}>
        <Text style={{ fontSize: 12 }}>{stepRequiredLabel}</Text>
        <View
          style={{
            alignItems: "center",
            borderRadius: 4.5,
            backgroundColor: theme.colors.semantic.infoLight,
            paddingLeft: 9,
            paddingRight: 9,
            paddingTop: 4.5,
            paddingBottom: 4.5,
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          <Text>{stepRequired}</Text>
        </View>
      </View>

      {/* TODO: step graphic */}

      <View style={{ alignItems: "stretch", gap: 6 }}>
        <Text style={{ fontSize: 12 }}>{stepProposedLabel}</Text>
        <Input value={stepProposed} inputStyles={{ justifyContent: "center" }} />
      </View>
    </View>
  )
}
