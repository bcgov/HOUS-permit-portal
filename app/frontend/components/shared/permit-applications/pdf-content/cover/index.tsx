import { Image, Page, Text, View } from "@react-pdf/renderer"
import { format } from "date-fns"
import { t } from "i18next"
import * as R from "ramda"
import React, { useContext } from "react"
import { PermitApplicationContext } from "../shared/permit-application-context"
import { styles } from "./styles"

export const CoverPage = function PermitApplicationPDFCoverPage() {
  const permitApplication = useContext(PermitApplicationContext)

  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.outerContainer}>
        <View style={styles.titleContainer}>
          <Image src={"/images/logo.png"} style={styles.logo} />
          <Text style={styles.title}>{t("site.title")}</Text>
        </View>
        <Text style={styles.subTitle}>{t("permitApplication.for")}</Text>
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
            <Text style={styles.applicationDetailsLabel}>{t("permitApplication.id")}</Text>
            <Text style={styles.applicationDetailsValue}>{permitApplication.number}</Text>
          </View>
          <View style={styles.applicationDetailsRow}>
            <Text style={styles.applicationDetailsLabel}>{t("permitApplication.submissionDate")}</Text>
            <Text style={styles.applicationDetailsValue}>{format(permitApplication.submittedAt, "yyyy-MM-dd")}</Text>
          </View>
          <View style={styles.applicationDetailsRow}>
            <Text style={styles.applicationDetailsLabel}>{t("permitApplication.applicant")}</Text>
            <Text style={styles.applicationDetailsValue}>{permitApplication.submitter.name}</Text>
          </View>
          <View style={R.mergeRight(styles.applicationDetailsRow, { borderBottomWidth: "0pt" })}>
            <Text style={styles.applicationDetailsLabel}>{t("permitApplication.permitType")}</Text>
            <Text
              style={styles.applicationDetailsValue}
            >{`${permitApplication.permitType.name} | ${permitApplication.activity.name}`}</Text>
          </View>
        </View>
      </View>
    </Page>
  )
}
