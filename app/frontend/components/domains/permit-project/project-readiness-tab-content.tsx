import { Select, VStack } from "@chakra-ui/react"
import React from "react"

export const ProjectReadinessTabContent = () => {
  return (
    <VStack align="start" spacing={4}>
      <Select placeholder="Select option">
        <option value="part3">Part 3</option>
      </Select>
    </VStack>
  )
}
