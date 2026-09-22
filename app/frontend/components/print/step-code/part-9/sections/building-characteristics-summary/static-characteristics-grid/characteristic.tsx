import React from "react"
import { theme } from "../../../../../../../styles/theme"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { Field, GridItem, HStack, Text } from "../../../../../components/step-code-primitives"

export function Characteristic({ rowName, lines, isLast = null }) {
  return (
    <HStack
      style={{
        gap: 0,
        width: "100%",
        borderBottomWidth: isLast ? 0 : 0.75,
        borderColor: theme.colors.border.light,
        alignItems: "stretch",
      }}
    >
      {lines.map((line, index) => (
        <React.Fragment key={`buildingCharacteristic${rowName}${generateUUID()}`}>
          {index == 0 && (
            <GridItem style={{ flexBasis: "25%", maxWidth: "25%" }}>
              <Text style={{ fontSize: 10.5, width: "100%" }}>{rowName}</Text>
            </GridItem>
          )}
          <GridItem style={{ flexBasis: "50%", minWidth: "50%" }}>
            <Field value={line.details} />
          </GridItem>
          <GridItem style={{ flexBasis: "25%", minWidth: "25%", borderRightWidth: 0 }}>
            <Field value={line.rsi} inputStyle={{ justifyContent: "center" }} />
          </GridItem>
        </React.Fragment>
      ))}
    </HStack>
  )
}
