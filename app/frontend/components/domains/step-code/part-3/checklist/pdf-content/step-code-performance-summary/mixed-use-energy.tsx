import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { theme } from "../../../../../../../styles/theme"
import { Input } from "../../../../part-9/checklist/pdf-content/shared/field"
import { energyI18nPrefix } from "./i18n-prefix"
import { styles } from "./styles"

interface IProps {
  // Remove energyPrefix: string;
}

export const MixedUseEnergyPdf = (_props: IProps) => {
  return (
    <>
      <Text style={{ fontSize: 10.5, textAlign: "center" }}>{t(`${energyI18nPrefix}.multiOccupancy`)}</Text>
      <View style={styles.fieldInputContainer}>
        <Text style={styles.fieldLabel}>{t(`${energyI18nPrefix}.stepRequired`)}</Text>
        <Input value="-" inputStyles={styles.fieldInput} />
      </View>
      {/* Placeholder for Steps graphic */}
      <Text style={{ fontSize: 10.5, color: theme.colors.text.secondary }}>(Steps graphic omitted)</Text>
      <View style={styles.fieldInputContainer}>
        <Text style={styles.fieldLabel}>{t(`${energyI18nPrefix}.achieved`)}</Text>
        <Input value="-" inputStyles={styles.fieldInput} />
      </View>
    </>
  )
}
