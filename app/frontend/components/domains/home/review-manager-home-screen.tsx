import { Container, Flex, Heading } from "@chakra-ui/react"
import { BookOpen, FileText, Tray, Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from "."
import { useMst } from "../../../setup/root"
import { HomeScreenBox } from "./home-screen-box"

export const ReviewManagerHomeScreen = observer(({ ...rest }: IHomeScreenProps) => {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { currentUser } = userStore
  const jurisdiction = currentUser.jurisdiction

  return (
    <Container maxW="container.lg" p={8} as="main">
      <Flex direction="column" align="center" w="full">
        {jurisdiction ? (
          <>
            <Heading as="h1" mb={8}>
              {currentUser?.jurisdiction.name}
            </Heading>
            <Flex direction="column" align="center" w="full" gap={6}>
              <HomeScreenBox
                title={t("home.submissionsInboxTitle")}
                description={t("home.submissionsInboxDescription")}
                icon={<Tray size={24} />}
                href={`${jurisdiction.id}/submission-inbox`}
                useViewText
              />
              <HomeScreenBox
                title={t("home.permitsTitle")}
                description={t("home.permitsDescription")}
                icon={<FileText size={24} />}
                href={`${jurisdiction.id}/permit-applications`}
              />{" "}
              <HomeScreenBox
                title={t("home.contentManagementTitle")}
                description={t("home.contentManagementDescription")}
                icon={<BookOpen size={24} />}
                href={`${jurisdiction.id}/content-mangement`}
              />
              <HomeScreenBox
                title={t("home.userManagementTitle")}
                description={t("home.userManagementDescription")}
                icon={<Users size={24} />}
                href={`${jurisdiction.id}/users`}
              />
            </Flex>
          </>
        ) : (
          <></>
        )}
      </Flex>
    </Container>
  )
})
