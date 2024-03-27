import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React, { useContext } from "react"
import { Field } from "../shared/field"
import { StepCodeChecklistContext } from "../step-code-checklist-context"
import { styles } from "../styles"

export const ProjectInfo = function StepCodeChecklistPDFProjectInfo() {
  const i18nPrefix = "stepCodeChecklist.edit.projectInfo"
  const { checklist } = useContext(StepCodeChecklistContext)

  return (
    <View style={styles.panelContainer}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelHeaderText}>{t(`${i18nPrefix}.heading`)}</Text>
      </View>
      <View style={styles.panelBody}>
        <Text style={styles.panelBodyTitleText}>{t(`${i18nPrefix}.stages.${checklist.stage}`)}</Text>
        <Field label={t(`${i18nPrefix}.permitNum`)} value={checklist.buildingPermitNumber} />
        <Field label={t(`${i18nPrefix}.builder`)} value={checklist.builder} />
        <Field label={t(`${i18nPrefix}.address`)} value={checklist.address} />
        <Field label={t(`${i18nPrefix}.jurisdiction`)} value={checklist.jurisdictionName} />
        <Field label={t(`${i18nPrefix}.pid`)} value={checklist.pid} />
        <View style={{ display: "flex" }}>
          <Field
            label={t(`${i18nPrefix}.buildingType.label`)}
            value={t(`${i18nPrefix}.buildingType.options.${checklist.buildingType}`)}
          />
          <Field label={t(`${i18nPrefix}.dwellingUnits`)} value={checklist.dwellingUnitsCount} />
        </View>
      </View>
    </View>
  )
}
