import { Container, Flex, Heading } from "@chakra-ui/react"
import { FileText, Pencil, Tray, Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from ".."
import { useMst } from "../../../../setup/root"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { HomeScreenBox } from "../home-screen-box"

export const ReviewManagerHomeScreen = observer(({ ...rest }: IHomeScreenProps) => {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore

  if (!currentUser?.jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  const jurisdiction = currentUser.jurisdiction

  return (
    <Container maxW="container.md" py={16} as="main">
      <Flex direction="column" align="center" w="full">
        <Heading as="h1" mb={8}>
          {jurisdiction.name}
        </Heading>
        <Flex direction="column" align="center" w="full" gap={6}>
          <HomeScreenBox
            title={t("home.submissionsInboxTitle")}
            description={t("home.submissionsInboxDescription")}
            icon={<Tray size={24} />}
            href={`jurisdictions/${jurisdiction.slug}/submission-inbox`}
            linkText={t("ui.view")}
          />
          <HomeScreenBox
            title={t("home.permitsTitle")}
            description={t("home.permitsDescription")}
            icon={<FileText size={24} />}
            href={`/digital-building-permits`}
          />
          <HomeScreenBox
            title={t("home.configurationManagement.title")}
            description={t("home.configurationManagement.reviewManagerDescription")}
            icon={<Pencil size={24} />}
            href={`jurisdictions/${jurisdiction.slug}/configuration-management`}
          />
          <HomeScreenBox
            title={t("home.userManagementTitle")}
            description={t("home.userManagementDescription")}
            icon={<Users size={24} />}
            href={`jurisdictions/${jurisdiction.slug}/users`}
          />
        </Flex>
      </Flex>
    </Container>
  )
})
