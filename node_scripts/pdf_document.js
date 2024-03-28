import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer"
import React from "react"

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
})

// Create Document Component
export const PdfDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>{data.title}</Text>
        <Text>{data.content}</Text>
      </View>
    </Page>
  </Document>
)
