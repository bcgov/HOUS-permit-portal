import { Image, Page, Text, View } from "@react-pdf/renderer"
import { format } from "date-fns"
import { t } from "i18next"
import React from "react"
import { IPermitApplication } from "../../../../../models/permit-application"
import { theme } from "../../../../../styles/theme"
import { Divider } from "../../../../domains/step-code/checklist/pdf-content/shared/divider"
import { page } from "../shared/styles/page"

interface IProps {
  permitApplication: IPermitApplication
  subTitle: string
  assetDirectoryPath?: string
}

export const CoverPage = function PermitApplicationPDFCoverPage({
  permitApplication,
  subTitle,
  assetDirectoryPath,
}: IProps) {
  const logoUrl = `${import.meta.env.SSR ? assetDirectoryPath : ""}/images/logo.png`
  return (
    <Page size="LETTER" style={page}>
      <View style={{ alignItems: "stretch", gap: 42, width: "100%" }}>
        <View style={{ alignItems: "center", gap: 6 }}>
          <Image src={logoUrl} style={{ width: 109.2, height: 42 }} />
          <Text style={{ fontWeight: 700, fontSize: 13.5 }}>{t("site.title")}</Text>
        </View>
        <Text style={{ fontWeight: 700, fontSize: 12, textAlign: "center" }}>{subTitle}</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: theme.colors.greys.grey01,
            borderRadius: 6,
          }}
        >
          <View
            style={{
              borderLeftWidth: 6,
              borderColor: theme.colors.theme.yellow,
              padding: 24,
              borderTopLeftRadius: 6,
              borderBottomLeftRadius: 6,
            }}
          >
            <View style={{ gap: 6, fontSize: 12 }}>
              <Text style={{ fontWeight: 700 }}>{permitApplication.fullAddress}</Text>
              <Text>{permitApplication.jurisdiction.name}</Text>
            </View>
          </View>
        </View>
        <View
          style={{
            alignItems: "stretch",
            gap: 7.5,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: theme.colors.greys.grey01,
            fontSize: 8.25,
            paddingTop: 7.5,
            paddingBottom: 7.5,
          }}
        >
          <Row label={t("permitApplication.pdf.id")} value={permitApplication.number} />
          <Row
            label={t("permitApplication.pdf.submissionDate")}
            value={format(permitApplication.submittedAt, "yyyy-MM-dd")}
          />
          <Row
            label={t("permitApplication.pdf.applicant")}
            value={`${permitApplication.submitter.firstName} ${permitApplication.submitter.lastName}`}
          />
          <Row
            label={t("permitApplication.pdf.permitType")}
            value={`${permitApplication.permitType.name} | ${permitApplication.activity.name}`}
            isLast
          />
        </View>
      </View>
    </Page>
  )
}

function Row({ label, value, isLast = false }) {
  return (
    <>
      <View
        style={{
          gap: 6,
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        <Text style={{ fontWeight: 700, textTransform: "uppercase" }}>{label}</Text>
        <Text>{value}</Text>
      </View>
      {!isLast && <Divider style={{ borderColor: theme.colors.greys.grey01, marginTop: 0, marginBottom: 0 }} />}
    </>
  )
}
