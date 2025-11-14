import { Avatar, Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../setup/root"

export const UserInfoSection = observer(() => {
  const { userStore } = useMst()
  const { currentUser } = userStore

  return (
    <Flex align="center" gap={3} w="full" pb={4} borderBottom="1px solid" borderColor="border.light">
      <Avatar name={currentUser?.name} size="md" bg="semantic.warningLight" color="text.primary" />
      <Text fontWeight="bold" fontSize="lg" color="text.primary">
        {currentUser?.name}
      </Text>
    </Flex>
  )
})
