import React from "react"
import { reportTranslation as t } from "../../../../components/report-translation"
import { Input, Text, View } from "../../../../components/step-code-primitives"
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
      {/* Step result is expressed in text for printing. */}

      <View style={styles.fieldInputContainer}>
        <Text style={styles.fieldLabel}>{t(`${energyI18nPrefix}.achieved`)}</Text>
        <Input value="-" inputStyles={styles.fieldInput} />
      </View>
    </>
  )
}
