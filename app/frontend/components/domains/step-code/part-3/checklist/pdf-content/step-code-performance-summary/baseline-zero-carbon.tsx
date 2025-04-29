import { Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { zeroCarbonI18nPrefix } from "./i18n-prefix"
import { styles } from "./styles"

interface IProps {
  // Remove zeroCarbonPrefix: string;
}

export const BaselineZeroCarbonPdf = (_props: IProps) => (
  <>
    <View style={styles.fieldInputContainer}>
      <Text style={styles.fieldLabel}>{t(`${zeroCarbonI18nPrefix}.levelRequired`)}</Text>
      <Text style={{ fontWeight: "bold", fontSize: 12 }}>{t(`${zeroCarbonI18nPrefix}.notRequired`)}</Text>
    </View>
    <View style={styles.fieldInputContainer}>
      <Text style={styles.fieldLabel}>{t(`${zeroCarbonI18nPrefix}.achieved`)}</Text>
      <Text style={{ fontWeight: "bold", fontSize: 12 }}>{t(`${zeroCarbonI18nPrefix}.notRequired`)}</Text>
    </View>
  </>
)
