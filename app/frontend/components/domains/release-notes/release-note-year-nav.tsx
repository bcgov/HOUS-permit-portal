import { Box, Flex, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"

type ReleaseNoteYearNavProps = {
  years: number[]
  selectedYear: number
  onSelectYear: (year: number) => void
}

export const ReleaseNoteYearNav = observer(function ReleaseNoteYearNav({
  years,
  selectedYear,
  onSelectYear,
}: ReleaseNoteYearNavProps) {
  return (
    <VStack align="stretch" spacing={0} w="180px" flexShrink={0} alignSelf="flex-start" maxH="full" overflowY="auto">
      {years.map((year) => {
        const isSelected = year === selectedYear
        return (
          <Box
            key={year}
            as="button"
            type="button"
            onClick={() => onSelectYear(year)}
            textAlign="left"
            w="full"
            bg={isSelected ? "background.blueLightest" : "transparent"}
            _hover={{ bg: isSelected ? "background.blueLightest" : "greys.grey03" }}
          >
            <Flex align="stretch" minH="43px">
              <Box w="4px" flexShrink={0} bg={isSelected ? "theme.blueAlt" : "transparent"} />
              <Text
                flex={1}
                px={4}
                py={2}
                fontSize="md"
                lineHeight="1.68"
                fontWeight={isSelected ? "bold" : "normal"}
                color={isSelected ? "text.link" : "text.primary"}
              >
                {year}
              </Text>
            </Flex>
          </Box>
        )
      })}
    </VStack>
  )
})
