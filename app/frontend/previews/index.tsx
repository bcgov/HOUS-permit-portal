import { Box, Heading, Text } from "@chakra-ui/react"
import React, { Component, ReactNode } from "react"

const modules = import.meta.glob("./cases/*.tsx", { eager: true }) as Record<
  string,
  { default: Record<string, React.ComponentType> }
>

const cases = Object.values(modules).reduce(
  (acc, mod) => ({ ...acc, ...(mod.default ?? {}) }),
  {} as Record<string, React.ComponentType>
)

class PreviewErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <Box p={8} fontFamily="mono" whiteSpace="pre-wrap">
          <Heading size="md">{this.state.error.name}</Heading>
          <Text mt={2}>{this.state.error.message}</Text>
          <Text mt={4} fontSize="sm">
            {this.state.error.stack}
          </Text>
        </Box>
      )
    }
    return this.props.children
  }
}

const PreviewHarness = () => {
  const params = new URLSearchParams(window.location.search)
  const caseId = params.get("case")
  const width = params.get("w")
  const Case = caseId ? cases[caseId] : null

  if (!caseId) {
    const ids = Object.keys(cases)
    return (
      <Box p={8}>
        <Heading size="md" mb={4}>
          Preview cases
        </Heading>
        {ids.length === 0 ? (
          <Text color="text.secondary">No cases registered. Add a file under app/frontend/previews/cases/.</Text>
        ) : (
          ids.map((id) => (
            <Text key={id} as="a" href={`/__preview?case=${id}`} display="block" color="theme.blue">
              {id}
            </Text>
          ))
        )}
      </Box>
    )
  }

  if (!Case) {
    return (
      <Box p={8}>
        <Text>Unknown case: {caseId}</Text>
      </Box>
    )
  }

  return (
    <PreviewErrorBoundary>
      <Box p={8} bg="greys.grey10" minH="100vh">
        <Box
          bg="greys.white"
          w={width ? `${width}px` : "100%"}
          maxW={width ? undefined : "1100px"}
          mx="auto"
          border="1px dashed"
          borderColor="border.light"
        >
          <Case />
        </Box>
      </Box>
    </PreviewErrorBoundary>
  )
}

export default PreviewHarness
