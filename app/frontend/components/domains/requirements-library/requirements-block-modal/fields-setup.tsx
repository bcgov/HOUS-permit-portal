import { Flex, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { FieldsSetupDrawer } from "../fields-setup-drawer"

export const FieldsSetup = observer(function FieldsSetup() {
  const { t } = useTranslation()
  return (
    <Flex as={"section"} flexDir={"column"} flex={1} h={"full"} alignItems={"flex-start"}>
      <Text color={"text.primary"} fontSize={"sm"}>
        {t("requirementsLibrary.modals.configureFields")}
      </Text>

      <VStack
        as={"section"}
        px={6}
        py={"1.875rem"}
        w={"full"}
        border={"1px solid"}
        borderColor={"border.light"}
        borderRadius={"sm"}
        justifyContent={"flex-start"}
        mt={4}
      >
        <Flex w={"full"} justifyContent={"space-between"}>
          <Text>{t("requirementsLibrary.modals.noFormFieldsAdded")}</Text>
          <FieldsSetupDrawer />
        </Flex>
      </VStack>
    </Flex>
  )
})
