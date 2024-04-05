import { Page, Text, View } from "@react-pdf/renderer"
// import { Image } from "@react-pdf/renderer"
import { format } from "date-fns"
import { t } from "i18next"
import * as R from "ramda"
import React from "react"
import { IPermitApplication } from "../../../../../models/permit-application"
import { styles } from "./styles"

export const CoverPage = function PermitApplicationPDFCoverPage({
  permitApplication,
}: {
  permitApplication: IPermitApplication
}) {
  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.outerContainer}>
        <View style={styles.titleContainer}>
          {/* TOOD: fix image (and font) loading when downloading via SSR */}
          {/* <Image src={"/images/logo.png"} style={styles.logo} /> */}
          <Text style={styles.title}>{t("site.title")}</Text>
        </View>
        <Text style={styles.subTitle}>{t("permitApplication.pdf.for")}</Text>
        <View style={styles.calloutBoxOuter}>
          <View style={styles.calloutBoxInner}>
            <View style={styles.calloutBoxContent}>
              <Text style={styles.calloutBoxTitle}>{permitApplication.fullAddress}</Text>
              <Text style={styles.calloutBoxDescription}>{permitApplication.jurisdiction.name}</Text>
            </View>
          </View>
        </View>
        <View style={styles.applicationDetailsContainer}>
          <View style={styles.applicationDetailsRow}>
            <Text style={styles.applicationDetailsLabel}>{t("permitApplication.pdf.id")}</Text>
            <Text style={styles.applicationDetailsValue}>{permitApplication.number}</Text>
          </View>
          <View style={styles.applicationDetailsRow}>
            <Text style={styles.applicationDetailsLabel}>{t("permitApplication.pdf.submissionDate")}</Text>
            <Text style={styles.applicationDetailsValue}>{format(permitApplication.submittedAt, "yyyy-MM-dd")}</Text>
          </View>
          <View style={styles.applicationDetailsRow}>
            <Text style={styles.applicationDetailsLabel}>{t("permitApplication.pdf.applicant")}</Text>
            <Text style={styles.applicationDetailsValue}>{permitApplication.submitter.name}</Text>
          </View>
          <View style={R.mergeRight(styles.applicationDetailsRow, { borderBottomWidth: "0pt" })}>
            <Text style={styles.applicationDetailsLabel}>{t("permitApplication.pdf.permitType")}</Text>
            <Text
              style={styles.applicationDetailsValue}
            >{`${permitApplication.permitType.name} | ${permitApplication.activity.name}`}</Text>
          </View>
        </View>
      </View>
    </Page>
  )
}
