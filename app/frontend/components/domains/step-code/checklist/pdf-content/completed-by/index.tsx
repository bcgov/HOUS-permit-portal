import { Text } from "@react-pdf/renderer"
import { format } from "date-fns"
import { t } from "i18next"
import React from "react"
import { datefnsAppDateFormat } from "../../../../../../constants"
import { IStepCodeChecklist } from "../../../../../../models/step-code-checklist"
import { theme } from "../../../../../../styles/theme"
import { i18nPrefix } from "../../completed-by/i18n-prefix"
import { CheckBox } from "../shared/check-box"
import { Field, Input } from "../shared/field"
import { HStack } from "../shared/h-stack"
import { Panel } from "../shared/panel"
import { VStack } from "../shared/v-stack"

interface IProps {
  checklist: IStepCodeChecklist
}

export const CompletedBy = function StepCodeChecklistPDFCompletedBy({ checklist }: IProps) {
  return (
    <Panel heading={t(`${i18nPrefix}.heading`)} break>
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
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          {t(`${i18nPrefix}.energyAdvisor`)}
        </Text>
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
        <Input
          value={checklist.completedAt ? format(checklist.completedAt, datefnsAppDateFormat) : ""}
          inputStyles={{ fontSize: 12 }}
        />
      </VStack>

      <HStack>
        <CheckBox isChecked={checklist.codeco} />
        <Text style={{ fontSize: 12 }}>{t(`${i18nPrefix}.codeco`)}</Text>
      </HStack>

      <Field label={t(`${i18nPrefix}.pFile`)} value={checklist.pFileNo} />
    </Panel>
  )
}
