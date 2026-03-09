import { Box, Text } from "@chakra-ui/react"
import React from "react"

export const VersionInfoMenuItem = ({ ...rest }: React.ComponentProps<typeof Box>) => {
  return (
    import.meta.env.VITE_RELEASE_VERSION && (
      <Box bg="greys.grey03" _hover={{ cursor: "auto" }} {...rest}>
        <Text textAlign="center" w="full" color="greys.grey90" fontWeight={"thin"} fontStyle="italic" fontSize="sm">
          {import.meta.env.VITE_RELEASE_VERSION}
        </Text>
      </Box>
    )
  )
}
