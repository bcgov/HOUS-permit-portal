import { Box, BoxProps, HStack, Text } from "@chakra-ui/react"
import { Empty } from "@phosphor-icons/react"
import React from "react"

export interface IEmptyResultsBoxProps extends BoxProps {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
}

export const EmptyResultsBox = ({ title, description, icon, ...boxProps }: IEmptyResultsBoxProps) => {
  return (
    <Box border="1px" borderColor="border.light" borderRadius="md" p={4} {...boxProps}>
      <HStack align="start" spacing={2}>
        <Box mt={1} flexShrink={0}>
          {icon ?? <Empty size={18} />}
        </Box>
        <Box>
          {title && (
            <Text fontWeight="bold" mb={description ? 1 : 0}>
              {title}
            </Text>
          )}
          {description &&
            (typeof description === "string" ? (
              <Text fontSize={title ? "sm" : undefined} fontWeight={title ? undefined : "bold"}>
                {description}
              </Text>
            ) : (
              description
            ))}
        </Box>
      </HStack>
    </Box>
  )
}
