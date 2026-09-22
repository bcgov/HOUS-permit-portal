import React from "react"
import { reportTranslation as t } from "../../../../components/report-translation"
import { Input, Text, View } from "../../../../components/step-code-primitives"
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
    {/* Step result is expressed in text for printing. */}

    <View style={styles.fieldInputContainer}>
      <Text style={styles.fieldLabel}>{t(`${zeroCarbonI18nPrefix}.achieved`)}</Text>
      <Input value="-" inputStyles={styles.fieldInput} />
    </View>
  </>
)
