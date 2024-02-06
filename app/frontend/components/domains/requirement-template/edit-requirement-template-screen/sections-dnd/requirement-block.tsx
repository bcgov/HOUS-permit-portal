import { Box, BoxProps, HStack, IconButton, IconButtonProps, Text } from "@chakra-ui/react"
import { List as ListIcon } from "@phosphor-icons/react/dist/csr/List"
import React, { forwardRef } from "react"

export interface IRequirementBlockProps {
  containerProps?: Partial<BoxProps>
  dragHandleProps?: Partial<IconButtonProps>
  requirementBlockName: string
}

export const RequirementBlock = forwardRef<HTMLDivElement, IRequirementBlockProps>(function Section(
  { dragHandleProps, requirementBlockName, containerProps },
  ref
) {
  return (
    <Box ref={ref} {...containerProps} bg={"white"}>
      <HStack>
        <IconButton variant={"ghost"} aria-label={"section drag handle"} icon={<ListIcon />} {...dragHandleProps} />
        <Text>{requirementBlockName}</Text>
      </HStack>
    </Box>
  )
})
