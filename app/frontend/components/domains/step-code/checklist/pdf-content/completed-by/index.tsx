import { Text, View } from "@react-pdf/renderer"
import { format } from "date-fns"
import { t } from "i18next"
import React, { useContext } from "react"
import { datefnsAppDateFormat } from "../../../../../../constants"
import { theme } from "../../../../../../styles/theme"
import { i18nPrefix } from "../../completed-by/i18n-prefix"
import { CheckBox } from "../shared/check-box"
import { Field } from "../shared/field"
import { HStack } from "../shared/h-stack"
import { VStack } from "../shared/v-stack"
import { StepCodeChecklistContext } from "../step-code-checklist-context"
import { styles } from "../styles"

export const CompletedBy = function StepCodeChecklistPDFCompletedBy() {
  const { checklist } = useContext(StepCodeChecklistContext)

  return (
    <View style={styles.panelContainer} break>
      <View style={styles.panelHeader}>
        <Text style={styles.panelHeaderText}>{t(`${i18nPrefix}.heading`)}</Text>
      </View>
      <View style={styles.panelBody}>
        <Text style={{ fontSize: 12 }}>{t(`${i18nPrefix}.description`)}</Text>
        {/* Energy Advisor */}
        <VStack
          style={{
            alignItems: "flex-start",
            padding: 12,
            borderRadius: 4.5,
            borderColor: theme.colors.border.light,
            borderWidth: 0.75,
            width: "100%",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 12, marginBottom: 6 }}>{t(`${i18nPrefix}.energyAdvisor`)}</Text>
          <HStack style={{ width: "100%" }}>
            <Field label={t(`${i18nPrefix}.name`)} value={checklist.completedBy} style={{ flex: 1 }} />
            <Field label={t(`${i18nPrefix}.company`)} value={checklist.completedByCompany} style={{ flex: 1 }} />
          </HStack>

          <HStack style={{ width: "100%" }}>
            <Field label={t(`${i18nPrefix}.email`)} value={checklist.completedByEmail} style={{ flex: 1 }} />
            <Field label={t(`${i18nPrefix}.phone`)} value={checklist.completedByPhone} style={{ flex: 1 }} />
          </HStack>

          <Field label={t(`${i18nPrefix}.address`)} value={checklist.completedByAddress} />

          <HStack style={{ width: "100%" }}>
            <Field
              label={t(`${i18nPrefix}.organization`)}
              value={checklist.completedByServiceOrganization}
              style={{ flex: 1 }}
            />
            <Field label={t(`${i18nPrefix}.energyAdvisorId`)} value={checklist.energyAdvisorId} style={{ flex: 1 }} />
          </HStack>
        </VStack>

        <VStack style={{ alignItems: "stretch" }}>
          <Text style={{ fontSize: 12 }}>{t(`${i18nPrefix}.date`)}</Text>
          <View style={styles.input}>
            <Text style={{ fontSize: 12 }}>
              {checklist.completedAt ? format(checklist.completedAt, datefnsAppDateFormat) : ""}
            </Text>
          </View>
        </VStack>

        <HStack>
          <CheckBox isChecked={checklist.codeco} />
          <Text style={{ fontSize: 12 }}>{t(`${i18nPrefix}.codeco`)}</Text>
        </HStack>

        <Field label={t(`${i18nPrefix}.pFile`)} value={checklist.pFileNo} />
      </View>
    </View>
  )
}
