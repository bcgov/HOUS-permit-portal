import { Text } from "@react-pdf/renderer"
import React from "react"
import { theme } from "../../../../../../../styles/theme"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { Field } from "../../shared/field"
import { GridItem } from "../../shared/grid-item"
import { HStack } from "../../shared/h-stack"

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
