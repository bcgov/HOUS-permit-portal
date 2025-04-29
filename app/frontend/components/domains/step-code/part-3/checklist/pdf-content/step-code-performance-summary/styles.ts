import { theme } from "../../../../../../../styles/theme"

export const styles = {
  column: {
    flex: 1,
    display: "flex" as const, // Use 'as const' for literal type
    flexDirection: "column" as const,
    gap: 12,
    padding: 12,
    borderRadius: 4.5,
    borderWidth: 0.75,
    borderColor: theme.colors.greys.grey02,
    alignItems: "center" as const, // Use 'as const' for literal type
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: 700 as const, // Use 'as const' for literal type
    textAlign: "center" as const, // Use 'as const' for literal type
  },
  fieldLabel: {
    fontSize: 10.5,
    color: theme.colors.text.primary,
    marginBottom: 3,
    textAlign: "center" as const, // Use 'as const' for literal type
  },
  fieldInputContainer: {
    minWidth: 100, // Adjust as needed
    alignItems: "center" as const, // Use 'as const' for literal type
    width: "100%", // Ensure container takes width for input centering
  },
  fieldInput: {
    textAlign: "center" as const, // Use 'as const' for literal type
    width: "100%", // Make input fill its container
  },
  resultText: {
    fontSize: 10.5,
    textAlign: "center" as const, // Use 'as const' for literal type
    marginTop: 6,
  },
}
