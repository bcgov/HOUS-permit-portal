import { HStack, Stack, StackProps, Text } from "@chakra-ui/react"
import { CheckCircle, Info, Warning, WarningCircle } from "@phosphor-icons/react"
import React from "react"

interface IProps extends Partial<StackProps> {
  type: "warning" | "error" | "success" | "info"
  title: string | JSX.Element
  body?: string | JSX.Element
}

const iconProps = {
  size: 16,
  flexShrink: 0,
  style: {
    marginTop: "var(--chakra-space-1)",
    minWidth: "16px",
    minH: "16px",
  },
}

function getTypeSpecificProps(type: IProps["type"]) {
  switch (type) {
    case "warning":
      return {
        icon: <Warning color={"var(--chakra-colors-semantic-warning)"} aria-label={"Warning icon"} {...iconProps} />,
        backgroundColor: "semantic.warningLight",
        mainColor: "semantic.warning",
      }
    case "error":
      return {
        icon: <WarningCircle color={"var(--chakra-colors-semantic-error)"} aria-label={"Error icon"} {...iconProps} />,
        backgroundColor: "semantic.errorLight",
        mainColor: "semantic.error",
      }
    case "success":
      return {
        icon: (
          <CheckCircle color={"var(--chakra-colors-semantic-success)"} aria-label={"Success icon"} {...iconProps} />
        ),
        backgroundColor: "semantic.successLight",
        mainColor: "semantic.success",
      }
    case "info":
      return {
        icon: <Info color={"var(--chakra-colors-semantic-info)"} aria-label={"Info icon"} {...iconProps} />,
        backgroundColor: "semantic.infoLight",
        mainColor: "semantic.info",
      }
  }
}

export function CalloutBanner({ type, title, body, ...rest }: IProps) {
  const typeSpecificProps = getTypeSpecificProps(type)
  return (
    <HStack
      alignItems={"flex-start"}
      spacing={2}
      w={"full"}
      my={8}
      p={4}
      border={"1px solid"}
      borderColor={typeSpecificProps.mainColor}
      bg={typeSpecificProps.backgroundColor}
      borderRadius={"lg"}
      {...rest}
    >
      {typeSpecificProps.icon}
      {title && body ? (
        <Stack spacing={1}>
          <Text fontSize={"md"} fontWeight={700}>
            {title}
          </Text>
          {typeof body === "string" ? <Text>{body}</Text> : body}
        </Stack>
      ) : (
        <Text>{title}</Text>
      )}
    </HStack>
  )
}
