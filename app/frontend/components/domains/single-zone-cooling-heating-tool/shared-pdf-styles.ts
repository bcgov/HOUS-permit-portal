import { StyleSheet } from "@react-pdf/renderer"

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 7,
    margin: "15pt",
    backgroundColor: "white",
  },

  // Header section
  headerTable: {
    border: "1pt solid black",
    borderBottom: "none",
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: "row",
    borderBottom: "1pt solid black",
    minHeight: 29,
  },
  headerLeft: {
    flex: 4,
    backgroundColor: "#c0c0c0",
    borderRight: "1pt solid black",
    justifyContent: "center",
  },
  headerLeftNoBg: {
    flex: 4,
    borderRight: "1pt solid black",
    justifyContent: "center",
  },
  headerRight: {
    width: 105,
    textAlign: "center",
    fontSize: 8,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: "Times-Roman",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 7,
    textAlign: "center",
    lineHeight: 1.2,
  },

  // Section headers
  sectionHeader: {
    backgroundColor: "#c0c0c0",
    border: "1pt solid black",
    borderTop: "none",
    fontFamily: "Times-Roman",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 0,
  },

  // Form sections
  formSection: {
    border: "1pt solid black",
    borderTop: "none",
    borderBottom: "none",
  },
  formRow: {
    flexDirection: "row",
    borderBottom: "1pt solid black",
    alignItems: "center",
  },
  formRowLast: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Field styles
  fieldLabel: {
    paddingLeft: 2,
    paddingTop: 1,
    paddingBottom: 3,
    fontSize: 9,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  fieldValue: {
    paddingLeft: 2,
    fontSize: 9,
    paddingTop: 1,
    paddingBottom: 3,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    minHeight: 18,
  },
  fieldValueBorder: {
    padding: 4,
    fontSize: 9,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRight: "1pt solid black",
    minHeight: 18,
  },

  // Checkbox styles (used in some pages)
  checkbox: {
    width: 10,
    height: 10,
    border: "1pt solid black",
    marginRight: 4,
    marginLeft: 2,
    textAlign: "center",
    fontSize: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    width: 10,
    height: 10,
    border: "1pt solid black",
    marginRight: 4,
    marginLeft: 2,
    textAlign: "center",
    fontSize: 7,
    backgroundColor: "black",
    color: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  // Footer styles
  footerSection: {
    marginTop: 20,
    border: "1pt solid black",
  },
  footerRow: {
    flexDirection: "row",
    borderBottom: "1pt solid black",
    minHeight: 80,
  },
  footerLabel: {
    width: 60,
    padding: 3,
    fontSize: 8,
    borderRight: "1pt solid black",
    backgroundColor: "#f5f5f5",
  },
  footerValue: {
    flex: 1,
    padding: 3,
    fontSize: 8,
  },

  // Signature section
  signatureSection: {
    flexDirection: "row",
    marginTop: 5,
    border: "1pt solid black",
    minHeight: 80,
  },
  signatureLeft: {
    flex: 1,
    padding: 8,
    borderRight: "1pt solid black",
    position: "relative",
  },
  signatureRight: {
    flex: 1,
    padding: 8,
  },

  // Bottom section
  bottomSection: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  bottomLeft: {
    flex: 1,
    border: "1pt solid black",
    padding: 8,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "bold",
    color: "blue",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
    //width: 585,
    borderTop: "none",
  },
  bottomRight: {
    border: "1pt solid black",
    //width: 181.5,
    borderTop: "none",
    borderLeft: "none",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },

  // Input field styles
  inputField: {
    borderBottom: "1pt solid black",
    minHeight: 15,
    marginRight: 10,
    paddingLeft: 2,
    flex: 1,
  },

  // Small text
  smallText: {
    fontSize: 7,
  },

  // Bold text
  boldText: {
    fontWeight: "bold",
  },
})

export type PdfStyles = typeof pdfStyles
