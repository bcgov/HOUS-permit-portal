import { Text, View } from "@react-pdf/renderer"
import { format } from "date-fns"
import { t } from "i18next"
import React from "react"
import { IPermitApplication } from "../../../../../../models/permit-application"
import { theme } from "../../../../../../styles/theme"

export const Footer = ({
  permitApplication,
  stepCode,
}: {
  permitApplication?: IPermitApplication
  stepCode?: { jurisdictionName?: string }
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: "auto",
        gap: 16,
        paddingTop: 12,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderColor: theme.colors.text.secondary,
      }}
      fixed
      render={(props) => {
        const { pageNumber } = props as { pageNumber: number }
        const totalPages = (props as any).totalPages as number | undefined
        return (
          <>
            {!!permitApplication ? (
              <>
                <Field label={t("permitApplication.pdf.id")} value={permitApplication.number} />
                <Field
                  label={t("permitApplication.pdf.submissionDate")}
                  value={format(permitApplication.submittedAt, "yyyy-MM-dd")}
                />
                <Field
                  label={t("permitApplication.pdf.applicant")}
                  value={`${permitApplication.submitter.firstName} ${permitApplication.submitter.lastName}`}
                />
                <Field label={t("permitApplication.pdf.jurisdiction")} value={permitApplication.jurisdiction.name} />
              </>
            ) : (
              !!stepCode && <Field label={t("permitApplication.pdf.jurisdiction")} value={stepCode.jurisdictionName} />
            )}
            <Field label={t("permitApplication.pdf.page", { pageNumber, totalPages })} value={t("site.titleLong")} />
          </>
        )
      }}
    />
  )
}

const Field = ({ label, value }) => (
  <View style={{ gap: 2 }}>
    <Text style={{ fontSize: 7, textTransform: "uppercase", color: theme.colors.text.secondary }}>{label}</Text>
    <Text style={{ fontSize: 8, fontWeight: 700, color: theme.colors.text.secondary }}>{value}</Text>
  </View>
)
