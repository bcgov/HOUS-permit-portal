import { Button, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { SwitchButton } from "./buttons/switch-button"

interface IDesignatedReviewerSettingsProps {
  handleBack: () => void
  title: string
  description: string
  isEnabled: boolean
  onToggle: (checked: boolean) => void
}

export const DesignatedReviewerSettings = observer(
  ({ handleBack, title, description, isEnabled, onToggle }: IDesignatedReviewerSettingsProps) => {
    const { t } = useTranslation()

    return (
      <Container maxW="container.lg" p={8} as={"main"}>
        <VStack alignItems={"flex-start"} w={"full"} h={"full"} gap={6}>
          <Button variant="link" onClick={handleBack} leftIcon={<CaretLeft size={20} />} textDecoration="none">
            {t("ui.back")}
          </Button>
          <Heading as="h1" m={0} p={0}>
            {title}
          </Heading>
          <Flex pb={4} justify="space-between" w="100%" borderBottom="1px solid" borderColor="border.light">
            <Text>{description}</Text>
            <SwitchButton isChecked={isEnabled} onChange={(e) => onToggle(e.target.checked)} size={"lg"} />
          </Flex>
        </VStack>
      </Container>
    )
  }
)
