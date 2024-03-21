import { Text, View } from "@react-pdf/renderer"
import { format } from "date-fns"
import { t } from "i18next"
import React, { useContext } from "react"
import { PermitApplicationContext } from "../permit-application-context"
import { styles } from "./styles"

export const Footer = () => {
  const permitApplication = useContext(PermitApplicationContext)

  return (
    <View
      style={styles.container}
      fixed
      render={({ pageNumber, totalPages }) => (
        <>
          <Field label={t("permitApplication.id")} value={permitApplication.id} />
          <Field
            label={t("permitApplication.submissionDate")}
            value={format(permitApplication.submittedAt, "yyyy-MM-dd")}
          />
          <Field label={t("permitApplication.applicant")} value={permitApplication.submitter.name} />
          <Field label={t("permitApplication.jurisdiction")} value={permitApplication.jurisdiction.name} />
          <Field
            label={t("permitApplication.page", { pageNumber: pageNumber, totalPages: totalPages })}
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
