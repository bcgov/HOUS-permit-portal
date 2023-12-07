import { Box, Flex, Heading, Text, ToastPosition, ToastProps, useToast } from "@chakra-ui/react"
import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useMst } from "../../../setup/root"

export const FlashMessage = observer(() => {
  const { uiStore } = useMst()
  const { isVisible, status, title, description, duration, isClosable, position } = uiStore.flashMessage
  const toast = useToast()

  useEffect(() => {
    if (isVisible) {
      toast({
        title,
        description,
        status,
        isClosable,
        duration,
        position: position as ToastPosition,
        render: (props) => <CustomToast {...props} />,
      })
    }
  }, [isVisible, status, title, description])

  return null
})

const CustomToast = ({ title, description, status }: ToastProps) => {
  const iconMap = {
    success: faCircleCheck,
    warning: faTriangleExclamation,
    error: faCircleExclamation,
    info: faCircleInfo,
  }

  return (
    <Flex
      direction="column"
      gap={2}
      bg={`semantic.${status}Light`}
      border="1px solid"
      borderRadius="lg"
      borderColor={`semantic.${status}`}
      p={4}
    >
      <Flex align="flex-start" gap={2}>
        <Box color={`semantic.${status}`}>
          <FontAwesomeIcon style={{ height: 20, width: 20 }} icon={iconMap[status]} />
        </Box>
        <Flex direction="column" gap={2}>
          {title && <Heading fontSize="md">{title}</Heading>}
          {description && <Text>{description}</Text>}
        </Flex>
      </Flex>
    </Flex>
  )
}
