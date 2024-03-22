import { StyleSheet } from "@react-pdf/renderer"
import { theme } from "../../../../../styles/theme"
import { flexColumn } from "../shared/styles/flex-column"
import { page } from "../shared/styles/page"

const borderBase = { borderWidth: 1, borderColor: theme.colors.greys.grey01 }

export const styles = StyleSheet.create({
  page,
  outerContainer: {
    ...flexColumn,
    gap: 56,
    textAlign: "center",
    color: theme.colors.text.primary,
  },
  titleContainer: {
    ...flexColumn,
    gap: 8,
  },
  logo: {
    width: 145.6,
    height: 56,
    marginLeft: "auto",
    marginRight: "auto",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
  },
  subTitle: {
    fontSize: 16,
  },
  calloutBoxOuter: {
    ...flexColumn,
    ...borderBase,
    alignItems: "flex-start",
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  calloutBoxInner: {
    borderLeftWidth: 8,
    borderColor: theme.colors.theme.yellow,
    padding: 32,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  calloutBoxContent: {
    ...flexColumn,
    alignItems: "flex-start",
    gap: 8,
  },
  calloutBoxTitle: {
    fontSize: 16,
    fontWeight: 700, // TODO: requires font import
  },
  calloutBoxDescription: {
    fontSize: 16,
  },
  applicationDetailsContainer: {
    ...flexColumn,
    ...borderBase,
    alignItems: "flex-start",
    borderRadius: 4,
  },
  applicationDetailsRow: {
    ...flexColumn,
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderColor: theme.colors.greys.grey01,
    width: "100%",
    padding: 16,
  },
  applicationDetailsLabel: {
    fontWeight: 700,
    textTransform: "uppercase",
    fontSize: 10,
  },
  applicationDetailsValue: {
    fontSize: 10,
  },
})
