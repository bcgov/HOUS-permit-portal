import { Box, Flex, FlexProps, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { CopyLinkButton } from "./copy-link-button"

export interface IInfoRowProps extends Omit<FlexProps, "label"> {
  label: React.ReactNode
  value: React.ReactNode
  subLabel?: React.ReactNode
  isCopyable?: boolean
  copyValue?: string
  isBold?: boolean
  stacked?: boolean
}

export const InfoRow = ({
  label,
  value,
  subLabel = null,
  isCopyable = false,
  copyValue,
  isBold = false,
  stacked = false,
  ...flexProps
}: IInfoRowProps) => {
  if (stacked) {
    return (
      <Flex align="flex-start" gap={2} py={2} w="full" {...flexProps}>
        <VStack align="flex-start" spacing={2} flex={1}>
          <VStack align="flex-start" spacing={0}>
            <Text fontWeight="bold">{label}</Text>
            {subLabel && (
              <Text fontSize="sm" color="text.secondary">
                {subLabel}
              </Text>
            )}
          </VStack>
          <Box fontWeight={isBold ? "bold" : "normal"}>{value}</Box>
        </VStack>
        {isCopyable && <CopyLinkButton value={copyValue || String(value)} iconOnly />}
      </Flex>
    )
  }

  return (
    <Flex
      justify="space-between"
      align="center"
      py={2}
      borderBottom="1px"
      borderColor="border.light"
      _last={{ borderBottom: "none" }}
      w="full"
      {...flexProps}
    >
      <Flex justify="space-between" align="center" w="full" mr={2} gap={4}>
        <VStack align="flex-start" spacing={0}>
          <Text fontWeight="semibold">{label}</Text>
          {subLabel && (
            <Text fontSize="sm" color="text.secondary">
              {subLabel}
            </Text>
          )}
        </VStack>
        <Box fontWeight={isBold ? "bold" : "normal"} textAlign="right">
          {value}
        </Box>
      </Flex>
      {isCopyable && <CopyLinkButton value={copyValue || String(value)} iconOnly />}
    </Flex>
  )
}

export default InfoRow
