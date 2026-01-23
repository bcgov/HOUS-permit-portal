import { StyleSheet, Text, View } from "@react-pdf/renderer"
import React from "react"

const styles = StyleSheet.create({
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
})

export const Checkbox: React.FC<{ checked?: boolean; text: string }> = ({ checked = false, text }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 20 }}>
    <View style={checked ? styles.checkboxChecked : styles.checkbox}>
      {checked && <Text style={{ color: "white" }}>X</Text>}
    </View>
    <Text style={{ fontSize: 6 }}>{text}</Text>
  </View>
)

export const LabeledCheckboxBox: React.FC<{
  checked?: boolean
  text: string
  corner: string
  width?: number
  height?: number
}> = ({ checked = false, text, corner, width = 200, height = 20 }) => (
  <View
    style={{
      width,
      height,
      position: "relative",
      justifyContent: "center",
      paddingLeft: 4,
      marginLeft: 6,
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={checked ? styles.checkboxChecked : styles.checkbox}>
        {checked && <Text style={{ color: "white" }}>X</Text>}
      </View>
      <Text style={{ fontSize: 6 }}>{text}</Text>
    </View>
    <Text style={{ position: "absolute", right: 2, bottom: 1, fontSize: "4pt" }}>{corner}</Text>
  </View>
)
