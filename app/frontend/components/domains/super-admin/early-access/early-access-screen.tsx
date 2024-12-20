import { Container, Flex, Heading } from "@chakra-ui/react"
import { BookOpen, FileLock } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { HomeScreenBox } from "../../home/home-screen-box"

export const EarlyAccessScreen = ({}) => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.md" py={16}>
      <Flex direction="column" align="center" w="full">
        <Heading as="h1" mb={8}>
          {t("home.earlyAccess.title")}
        </Heading>
        <Flex direction="column" align="center" w="full" gap={6}>
          <HomeScreenBox
            title={t("home.earlyAccess.previews.title")}
            description={t("home.earlyAccess.previews.description")}
            icon={<FileLock size={24} />}
            href="requirement-templates"
          />
          <HomeScreenBox
            title={t("home.earlyAccess.requirements.title")}
            description={t("home.earlyAccess.requirements.description")}
            icon={<BookOpen size={24} />}
            href="requirements-library"
          />
        </Flex>
      </Flex>
    </Container>
  )
}
