import { View } from "@react-pdf/renderer"
import React from "react"
import { theme } from "../../../../../../../styles/theme"
import { Text } from "../../../../../../shared/pdf/text"

// Interface for Field props
interface IFieldProps {
  value: any
  label?: React.ReactNode | null
  hint?: React.ReactNode | null
  rightElement?: React.ReactNode | null
  style?: object
  inputStyle?: object
}

export function Field({
  value,
  label = null,
  hint = null,
  rightElement = null,
  style = {},
  inputStyle = {},
}: IFieldProps) {
  // Combine default and provided styles for the Field View
  const fieldStyle = {
    width: "100%",
    fontSize: 10.5,
    ...style, // Spread provided styles over defaults
  }

  return (
    <View style={fieldStyle}>
      {label && (
        <Text
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            width: "100%",
            fontSize: 10.5,
            color: theme.colors.text.primary,
            marginBottom: 3,
          }}
        >
          {label}
        </Text>
      )}
      <Input value={value} inputStyles={inputStyle} rightElement={rightElement} />
      {hint && <Text style={{ color: theme.colors.border.base, fontSize: 10.5, marginTop: 6 }}>{hint}</Text>}
    </View>
  )
}

// Interface for Input props (already defined previously)
interface IInputProps {
  value: any
  rightElement?: React.ReactNode | null
  inputStyles?: object
}

export function Input({ value, rightElement = null, inputStyles = {} }: IInputProps) {
  // Check if value is numeric
  const isNumeric = typeof value === "number" || (!isNaN(parseFloat(value)) && isFinite(value))

  // If numeric, round to 8 decimals, then convert back to Number (to remove trailing zeros) and then String.
  // If not numeric, just convert to String.
  const displayValue = isNumeric ? String(Number(Number(value).toFixed(8))) : String(value)

  const combinedStyles = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingLeft: 9,
    paddingRight: rightElement ? 30 : 9,
    borderRadius: 3,
    minHeight: 30,
    backgroundColor: theme.colors.greys.grey04,
    color: theme.colors.text.primary,
    fontSize: 10.5,
    ...inputStyles, // Spread provided styles here, allowing override but ensuring defaults exist
  }

  return (
    <View style={combinedStyles}>
      <Text>{displayValue}</Text>
      {rightElement && (
        <View style={{ position: "absolute", top: 0, right: 0, height: 30, width: 30, justifyContent: "center" }}>
          {rightElement}
        </View>
      )}
    </View>
  )
}
