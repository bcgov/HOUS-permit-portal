import { theme } from "../../../../../../../styles/theme"

// Helper styles
export const styles = {
  table: {
    display: "flex" as const,
    flexDirection: "column" as const,
    borderStyle: "solid" as const,
    borderWidth: 0.75,
    borderColor: theme.colors.greys.grey02,
    marginBottom: 12,
  },
  tableRow: {
    display: "flex" as const,
    flexDirection: "row" as const,
  },
  tableCell: {
    flex: 1,
    padding: 6,
    fontSize: 10.5,
    borderStyle: "solid" as const,
    borderRightWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: theme.colors.greys.grey02,
    textAlign: "center" as const, // Center text in cells
    justifyContent: "center" as const, // Center content vertically
    alignItems: "center" as const, // Center content horizontally
  },
  tableHeaderCell: {
    fontWeight: "bold" as const,
    backgroundColor: theme.colors.greys.grey04,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold" as const,
    marginBottom: 6,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  inputStyle: {
    textAlign: "center" as const,
    width: "100%", // Make input fill cell
  },
  // New style for smaller text, e.g., units
  smallText: {
    fontSize: 9,
    color: theme.colors.text.secondary,
    marginTop: 2, // Add some space above units
  },
}
