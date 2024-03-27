import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import * as R from "ramda"
import React, { useContext } from "react"
import { theme } from "../../../../../../styles/theme"
import { Divider } from "../shared/divider"
import { Field } from "../shared/field"
import { StepCodeChecklistContext } from "../step-code-checklist-context"
import { styles } from "../styles"

export const ComplianceSummary = function StepCodeChecklistPDFComplianceSummary() {
  const i18nPrefix = "stepCodeChecklist.edit.codeComplianceSummary"
  const { checklist } = useContext(StepCodeChecklistContext)

  return (
    <View style={styles.panelContainer} break>
      <View style={styles.panelHeader}>
        <Text style={styles.panelHeaderText}>{t(`${i18nPrefix}.heading`)}</Text>
      </View>
      <View style={styles.panelBody}>
        <Field
          label={t(`${i18nPrefix}.compliancePath.label`)}
          value={t(`${i18nPrefix}.compliancePath.options.${checklist.compliancePath}`)}
        />
        <View style={{ display: "flex", flexDirection: "row", gap: 18 }}>
          <View style={styles.complianceSummaryContainer}>
            <Text style={styles.complianceSummaryHeading}>{t(`${i18nPrefix}.energyStepCode.heading`)}</Text>
            <View style={styles.stepFormControl}>
              <Text style={styles.stepLabel}>{t(`${i18nPrefix}.energyStepCode.stepRequired`) + ": "}</Text>
              <View style={styles.stepBox}>
                <Text>{checklist.requiredEnergyStep}</Text>
              </View>
            </View>

            {/* TODO: step graphic */}
            {/* <View style={styles.stepsContainer}>
              <EnergySteps checklist={checklist} i18nPrefix={i18nPrefix} />
            </View> */}

            <View style={styles.stepFormControl}>
              <Text style={styles.stepLabel}>{t(`${i18nPrefix}.energyStepCode.stepProposed`) + ": "}</Text>
              <View style={R.mergeRight(styles.input, { justifyContent: "center" })}>
                <Text>{checklist.proposedEnergyStep}</Text>
              </View>
            </View>
          </View>

          <View style={styles.complianceSummaryContainer}>
            <Text style={styles.complianceSummaryHeading}>{t(`${i18nPrefix}.zeroCarbonStepCode.heading`)}</Text>
            <View style={styles.stepFormControl}>
              <Text style={styles.stepLabel}>{t(`${i18nPrefix}.zeroCarbonStepCode.stepRequired`) + ": "}</Text>
              <View style={styles.stepBox}>
                <Text>{checklist.requiredZeroCarbonStep}</Text>
              </View>
            </View>

            <View style={styles.stepFormControl}>
              <Text style={styles.stepLabel}>{t(`${i18nPrefix}.zeroCarbonStepCode.stepProposed`) + ": "}</Text>
              <View style={R.mergeRight(styles.input, { justifyContent: "center" })}>
                <Text>{checklist.proposedZeroCarbonStep}</Text>
              </View>
            </View>
          </View>
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
      </View>
    </View>
  )
}

function EnergySteps({ checklist, i18nPrefix }) {
  return (
    <>
      {[...Array(checklist.numberOfEnergySteps).keys()].map((stepOffset) => {
        const step = parseInt(checklist.minEnergyStep) + stepOffset
        const isRequiredStep = step.toString() == checklist.requiredEnergyStep
        let height = 28.5
        switch (stepOffset) {
          case 0:
            break
          case 1:
            height = height + 24.75
            break
          default:
            height = height + 24.75 + 16.5 * (stepOffset - 1)
            break
        }

        console.log("*** height", height)

        return (
          <View style={styles.stepContainer} key={`energyStepsStep${step}`}>
            {isRequiredStep && <Text style={styles.requiredText}>{t(`${i18nPrefix}.required`)}</Text>}
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1.5,
                flex: 1,
                height: height,
                borderStyle: isRequiredStep ? "solid" : "dashed",
                borderRightWidth: stepOffset + 1 == checklist.numberOfEnergySteps ? 2 : 0,
                borderColor: isRequiredStep ? theme.colors.semantic.info : theme.colors.border.base,
                backgroundColor: isRequiredStep ? theme.colors.semantic.infoLight : theme.colors.greys.grey03,
              }}
            >
              <Text>{t(`${i18nPrefix}.energyStepCode.steps.${step}`)}</Text>
            </View>
          </View>
        )
      })}
    </>
  )
}
