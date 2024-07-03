import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  Heading,
  StackProps,
  VStack,
} from "@chakra-ui/react"
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
    <AccordionItem ref={ref} borderTopWidth={0}>
      {({ isExpanded }) => (
        <Box borderWidth={1} mb={8} borderColor="greys.grey02" rounded="lg" w="full">
          <AccordionButton
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
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel px={6} py={3}>
            <VStack align="start" spacing={4} {...rest}>
              {children}
            </VStack>
          </AccordionPanel>
        </Box>
      )}
    </AccordionItem>
  )
})
