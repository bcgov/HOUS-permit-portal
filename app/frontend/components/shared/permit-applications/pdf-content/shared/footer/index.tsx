import { Text, View } from "@react-pdf/renderer"
import { format } from "date-fns"
import { t } from "i18next"
import React from "react"
import { IPermitApplication } from "../../../../../../models/permit-application"
import { styles } from "./styles"

export const Footer = ({ permitApplication }: { permitApplication: IPermitApplication }) => {
  return (
    <View
      style={styles.container}
      fixed
      render={({ pageNumber, totalPages }) => (
        <>
          <Field label={t("permitApplication.pdf.id")} value={permitApplication.number} />
          <Field
            label={t("permitApplication.pdf.submissionDate")}
            value={format(permitApplication.submittedAt, "yyyy-MM-dd")}
          />
          <Field label={t("permitApplication.pdf.applicant")} value={permitApplication.submitter.name} />
          <Field label={t("permitApplication.pdf.jurisdiction")} value={permitApplication.jurisdiction.name} />
          <Field
            label={t("permitApplication.pdf.page", { pageNumber: pageNumber, totalPages: totalPages })}
            value={t("site.titleLong")}
          />
        </>
      )}
    />
  )
}

const Field = ({ label, value }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
)
