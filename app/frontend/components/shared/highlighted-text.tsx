import { Text } from "@chakra-ui/react"
import React from "react"
import { TChakraColor } from "../../types/types"

type THighlightIndices = readonly [number, number][]

interface IProps {
  text: string
  indices: THighlightIndices | undefined
  highlightColor?: TChakraColor | string
}

export function HighlightedText({ text, indices, highlightColor = "yellow.200" }: IProps) {
  if (!indices?.length) {
    return <>{text}</>
  }

  const sortedIndices = [...indices].sort((a, b) => a[0] - b[0])
  let lastEndIndex = 0
  const parts = []

  sortedIndices.forEach(([start, end]) => {
    const normal = text.slice(lastEndIndex, start)
    const highlighted = text.slice(start, end + 1)
    parts.push(<Text as="span">{normal}</Text>)
    parts.push(
      <Text as="span" bg={highlightColor}>
        {highlighted}
      </Text>
    )
    lastEndIndex = end + 1
  })

  parts.push(<Text as="span">{text.slice(lastEndIndex)}</Text>)

  return <>{parts}</>
}
