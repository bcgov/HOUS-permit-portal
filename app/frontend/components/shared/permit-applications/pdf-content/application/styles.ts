import { StyleSheet } from "@react-pdf/renderer"
import { theme } from "../../../../../styles/theme"
import { flexColumn } from "../shared/styles/flex-column"
import { page } from "../shared/styles/page"

type TSectionKey = "sectionHeaderContainer" | "sectionHeaderLine" | "sectionHeading"
const section: Record<TSectionKey, any> = {
  sectionHeaderContainer: {
    ...flexColumn,
    marginTop: 32,
    paddingBottom: 32,
    gap: 8,
  },
  sectionHeaderLine: {
    borderWidth: 4,
    borderColor: theme.colors.theme.yellow,
    width: 36,
    backgroundColor: theme.colors.theme.yellow,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 700,
    color: theme.colors.text.primary,
  },
}

type TPanelKey =
  | "panelContainer"
  | "panelHeaderContainer"
  | "panelHeading"
  | "panelBodyContainer"
  | "requirementFieldContainer"
  | "requirementFieldLabel"
  | "requirementFieldInput"
  | "requirementFieldInputValue"
  | "requirementFieldHint"
  | "requirementFieldChecklist"
  | "requirementFieldChecklistItem"
  | "requirementFieldCheckboxFilled"
  | "requirementFieldCheckboxOutline"
const panel: Record<TPanelKey, any> = {
  panelContainer: {
    ...flexColumn,
    borderColor: theme.colors.border.light,
    marginBottom: 24,
    width: "100%",
  },
  panelHeaderContainer: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 24,
    paddingRight: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.greys.grey04,
    width: "100%",
  },
  panelHeading: {
    fontSize: 12,
    fontWeight: 700,
    color: theme.colors.text.primary,
  },
  panelBodyContainer: {
    ...flexColumn,
    gap: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 24,
    paddingRight: 24,
  },
  requirementFieldContainer: {
    ...flexColumn,
    gap: 4,
    paddingTop: 4,
  },
  requirementFieldLabel: {
    fontSize: 12,
    color: theme.colors.text.primary,
    paddingBottom: 4,
    marginBottom: 4,
  },
  requirementFieldInput: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 28,
    borderColor: theme.colors.border.light,
    borderRadius: 4,
    borderWidth: 1,
    paddingTop: 6,
    paddingBottom: 6,
    marginBottom: 6,
    paddingLeft: 12,
    paddingRight: 12,
  },
  requirementFieldInputValue: {
    fontSize: 12,
    color: theme.colors.text.primary,
  },
  requirementFieldHint: {
    fontSize: 10,
    color: theme.colors.text.secondary,
  },
  requirementFieldChecklist: {
    ...flexColumn,
    gap: 8,
  },
  requirementFieldChecklistItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  requirementFieldCheckboxFilled: {
    width: 8,
    height: 8,
    backgroundColor: theme.colors.text.primary,
  },
  requirementFieldCheckboxOutline: {
    width: 8,
    height: 8,
    backgroundColor: theme.colors.greys.white,
    borderColor: theme.colors.border.dark,
    borderWidth: 1,
  },
}

const fieldset = {
  fieldsetContainer: {},
}

type TColumnKey = "grid" | "row" | "item"
const columns: Record<TColumnKey, any> = {
  grid: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 4,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    gap: 20,
    width: "100%",
  },
  item: {
    flex: 1,
  },
}

export const styles = StyleSheet.create({
  page,
  outerContainer: {
    ...flexColumn,
    overflow: "hidden",
  },
  ...section,
  ...panel,
  ...fieldset,
  ...columns,
})
