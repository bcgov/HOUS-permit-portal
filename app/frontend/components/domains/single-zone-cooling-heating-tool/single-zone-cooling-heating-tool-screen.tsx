import { Button, Container, Flex, Heading, Text, useToast } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"

export const SingleZoneCoolingHeatingToolScreen = observer(() => {
  const { t } = useTranslation() as any
  const { pdfFormStore } = useMst()
  const toast = useToast()
  const formMethods = useForm()
  const { sessionStore } = useMst()
  const { loggedIn } = sessionStore

  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const handleNextFromCoverSheet = () => {
    setActiveTabIndex(1)
  }

  const handleNextRoomByRoom = () => {
    setActiveTabIndex(2)
  }

  const handleSubmit = async () => {
    const formData = formMethods.getValues()

    const result = await pdfFormStore.createPdfForm({
      formJson: formData,
      formType: "single_zone_cooling_heating_tool",
      status: true,
    })
    if (result.success) {
      toast({
        title: "Success",
        description: "Form data saved successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
      window.location.href = "/single-zone-cooling-heating-tool/list"
    } else {
      toast({
        title: "Error",
        description: "Failed to save form data. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="container.lg" pb="36" px="8">
      <Heading as="h1" mt="16" mb="6">
        {t("singleZoneCoolingHeatingTool.title")}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb="4">
        {t("singleZoneCoolingHeatingTool.description")}
      </Text>
      <Flex align="flex-start" bg={"semantic.infoLight"} borderRadius="lg" borderColor={"semantic.info"} p={4}>
        <Flex direction="column" gap={2}>
          <Text>{t("singleZoneCoolingHeatingTool.info")}</Text>
          <Button
            size="sm"
            variant="primary"
            onClick={() => (window.location.href = "/single-zone-cooling-heating-tool/start")}
          >
            {loggedIn ? t(`singleZoneCoolingHeatingTool.start`) : t(`singleZoneCoolingHeatingTool.loginToStart`)}
          </Button>
        </Flex>
      </Flex>
    </Container>
  )
})
