import { Box, BoxProps, HStack, IconButton, IconButtonProps, Text } from "@chakra-ui/react"
import { List as ListIcon } from "@phosphor-icons/react/dist/csr/List"
import React, { ReactNode, forwardRef } from "react"

export interface ISectionProps {
  containerProps?: Partial<BoxProps>
  dragHandleProps?: Partial<IconButtonProps>
  sectionName?: string
  children?: ReactNode
}

export const Section = forwardRef<HTMLDivElement, ISectionProps>(function Section(
  { dragHandleProps, sectionName, children, containerProps },
  ref
) {
  return (
    <Box ref={ref} {...containerProps} bg={"white"}>
      <HStack>
        <IconButton variant={"ghost"} aria-label={"section drag handle"} icon={<ListIcon />} {...dragHandleProps} />
        <Text>{sectionName}</Text>
      </HStack>
      {children}
    </Box>
  )
})
