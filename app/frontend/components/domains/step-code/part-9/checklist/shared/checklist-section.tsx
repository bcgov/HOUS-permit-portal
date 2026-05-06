import { Box, HStack, Heading, StackProps, VStack } from "@chakra-ui/react"
import { LightningA } from "@phosphor-icons/react"
import React, { PropsWithChildren, forwardRef } from "react"

interface IProps extends StackProps {
  heading: string
  isAutoFilled?: boolean
}

export const ChecklistSection = forwardRef<HTMLDivElement, PropsWithChildren<IProps>>(function Section(
  { heading, isAutoFilled, children, ...rest },
  ref
) {
  return (
    <Accordion.Item ref={ref} borderTopWidth={0} value="item-0">
      {({ isExpanded }) => (
        <Box borderWidth={1} mb={8} borderColor="greys.grey02" rounded="lg" w="full">
          <Accordion.ItemTrigger
            justifyContent="space-between"
            px={6}
            bg={isAutoFilled ? "theme.blueLight" : "greys.grey04"}
            color={isAutoFilled ? "text.link" : "text.primary"}
            borderTopRadius="lg"
            borderBottomRadius={isExpanded ? 0 : "lg"}
          >
            <HStack>
              {isAutoFilled && <LightningA />}
              <Heading as="h3" fontSize="md" mb={0}>
                {heading}
              </Heading>
            </HStack>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent px={6} py={3}>
            <Accordion.ItemBody>
              <VStack align="start" gap={4} {...rest}>
                {children}
              </VStack>
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Box>
      )}
    </Accordion.Item>
  )
})
