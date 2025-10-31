import { View } from "@react-pdf/renderer"
import { t } from "i18next"
import React from "react"
import { theme } from "../../../../../../../styles/theme"
import { Text } from "../../../../../../shared/pdf/text"
import { Input } from "../../../../part-9/checklist/pdf-content/shared/field"
import { zeroCarbonI18nPrefix } from "./i18n-prefix"
import { styles } from "./styles"

interface IProps {
  // Remove zeroCarbonPrefix: string;
}

export const MixedUseZeroCarbonPdf = (_props: IProps) => (
  <>
    <Text style={{ fontSize: 10.5, textAlign: "center" }}>{t(`${zeroCarbonI18nPrefix}.multiOccupancy`)}</Text>
    <View style={styles.fieldInputContainer}>
      <Text style={styles.fieldLabel}>{t(`${zeroCarbonI18nPrefix}.levelRequired`)}</Text>
      <Input value="-" inputStyles={styles.fieldInput} />
    </View>
    {/* Placeholder for Steps graphic */}
    <Text style={{ fontSize: 10.5, color: theme.colors.text.secondary }}>(Steps graphic omitted)</Text>
    <View style={styles.fieldInputContainer}>
      <Text style={styles.fieldLabel}>{t(`${zeroCarbonI18nPrefix}.achieved`)}</Text>
      <Input value="-" inputStyles={styles.fieldInput} />
    </View>
  </>
)
