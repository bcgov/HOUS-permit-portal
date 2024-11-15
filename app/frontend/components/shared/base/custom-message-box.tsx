import { Box, Flex, FlexProps, Heading, HeadingProps, Text, ToastProps } from "@chakra-ui/react"
import { CheckCircle, Info, Warning, WarningCircle } from "@phosphor-icons/react"
import React from "react"
import ReactMarkdown from "react-markdown"

interface ICustomMessageBoxProps
  extends Omit<FlexProps, "id" | "title">,
    Omit<ToastProps, "position" | "title" | "id"> {
  title?: React.ReactNode // Allow title to be any ReactNode
  description?: string | React.ReactNode // Allow description to be any ReactNode
  children?: React.ReactNode
  headingProps?: Partial<HeadingProps>
}

const iconMap = {
  success: <CheckCircle size={24} aria-label={"success icon"} />,
  warning: <Warning size={24} aria-label={"warning icon"} />,
  error: <WarningCircle size={24} aria-label={"error icon"} />,
  info: <Info size={24} aria-label={"info icon"} />,
  spacial: <Info size={24} aria-label={"info icon"} />,
}

export const CustomMessageBox = ({
  title,
  description,
  status,
  children,
  headingProps,
  ...rest
}: ICustomMessageBoxProps) => {
  return (
    <Flex
      direction="column"
      gap={2}
      bg={`semantic.${status}Light`}
      border="1px solid"
      borderRadius="lg"
      borderColor={`semantic.${status}`}
      p={4}
      {...rest}
    >
      <Flex align="flex-start" gap={2} whiteSpace={"normal"}>
        <Box color={`semantic.${status}`}>{iconMap[status]}</Box>
        <Flex direction="column" gap={2}>
          {title && (
            <Heading as="h3" fontSize="md" {...headingProps}>
              {title}
            </Heading>
          )}

          {typeof description === "string" ? <ReactMarkdown>{description}</ReactMarkdown> : <Text>{description}</Text>}
          {children}
        </Flex>
      </Flex>
    </Flex>
  )
}
