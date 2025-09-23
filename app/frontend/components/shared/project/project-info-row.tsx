import { Flex, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { CopyLinkButton } from "../base/copy-link-button"

interface IProjectInfoRowProps {
  label: React.ReactNode
  value: React.ReactNode
  subLabel?: React.ReactNode
  isCopyable?: boolean
  isBold?: boolean
}

export const ProjectInfoRow = ({
  label,
  value,
  subLabel = null,
  isCopyable = false,
  isBold = false,
}: IProjectInfoRowProps) => (
  <Flex
    justify="space-between"
    align="center"
    py={2}
    borderBottom="1px"
    borderColor="border.light"
    _last={{ borderBottom: "none" }}
    w="full"
  >
    <Flex justify="space-between" align="center" w="full" mr={2}>
      <VStack align="flex-start" spacing={0}>
        <Text>{label}</Text>
        {subLabel && (
          <Text fontSize="sm" color="text.secondary">
            {subLabel}
          </Text>
        )}
      </VStack>
      <Text fontWeight={isBold ? "bold" : "normal"}>{value}</Text>
    </Flex>
    {isCopyable && <CopyLinkButton value={String(value)} iconOnly />}
  </Flex>
)

export default ProjectInfoRow
