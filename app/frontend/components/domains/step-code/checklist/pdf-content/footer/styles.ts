import { StyleSheet } from "@react-pdf/renderer"
import { theme } from "../../../../../../styles/theme"

export const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    marginTop: "auto",
    gap: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: theme.colors.text.secondary,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  label: {
    fontSize: 7,
    textTransform: "uppercase",
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: 8,
    fontWeight: 700,
    color: theme.colors.text.secondary,
  },
})
