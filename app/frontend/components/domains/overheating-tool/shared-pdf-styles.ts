import { StyleSheet } from "@react-pdf/renderer"

const LETTER_PAGE_WIDTH = 618 // 8.5in * 72pt
const MARGIN_LEFT = 2
const MARGIN_RIGHT = 65
const MARGIN_TOP = 20

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 7,
    backgroundColor: "white",
    marginTop: MARGIN_TOP,
    marginLeft: 0,
    marginRight: 0,
  },
  pageInner: {
    width: LETTER_PAGE_WIDTH - (MARGIN_LEFT + MARGIN_RIGHT),
    alignSelf: "center",
  },

  // Header section
  headerTable: {
    border: "1.5pt solid black",
    borderBottom: "none",
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: "row",
    borderBottom: "1.5pt solid black",
    minHeight: 29,
  },
  headerLeft: {
    width: "630pt",
    backgroundColor: "#c0c0c0",
    borderRight: "1pt solid black",
  },
  headerLeftNoBg: {
    width: "630pt",
    borderRight: "1pt solid black",
  },
  headerRight: {
    fontSize: 8,
    width: "150pt",
  },
  headerTitle: {
    fontSize: 14.5,
    fontFamily: "Times-Roman",
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 7,
  },
  fieldNumber: {
    fontSize: "4.5pt",
    letterSpacing: 0,
    textAlign: "right",
    marginRight: "1pt",
  },
  sectionHeader: {
    backgroundColor: "#c0c0c0",
    border: "1pt solid black",
    borderTop: "none",
    fontFamily: "Times-Roman",
    fontSize: "9.5pt",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 0,
    minHeight: "12pt",
  },

  formSection: {
    border: "1pt solid black",
    borderTop: "none",
    borderBottom: "none",
  },
  formRow: {
    flexDirection: "row",
    borderBottom: "1pt solid black",
  },
  // Field styles
  fieldLabel: {
    paddingLeft: 2,
    paddingTop: 1,
    fontSize: 9,
  },
  fieldValue: {
    paddingLeft: 2,
    fontSize: 9,
    paddingTop: 1,
    flex: 1,
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

  // // Bottom section
  bottomSection: {
    flexDirection: "row",
  },
  bottomLeft: {
    border: "1pt solid black",
    padding: 8,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "bold",
    color: "blue",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
    width: 370,
    borderTop: "none",
  },
  bottomRight: {
    border: "1pt solid black",
    width: 185,
    borderTop: "none",
    borderLeft: "none",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  smallText: {
    fontSize: 7,
  },

  boldText: {
    fontWeight: "bold",
  },
})

export type PdfStyles = typeof pdfStyles
