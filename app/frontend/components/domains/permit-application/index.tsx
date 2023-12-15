import { Container, Flex, Heading, Select, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { BlueTitleBar } from "../../shared/base/blue-title-bar"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { PermitApplicationCard } from "../../shared/permit-applications/permit-application-card"

interface IPermitApplicationIndexScreenProps {}

export const PermitApplicationIndexScreen = observer(({}: IPermitApplicationIndexScreenProps) => {
  const { t } = useTranslation()

  const { permitApplicationStore } = useMst()
  const { permitApplications } = permitApplicationStore

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white">
      <BlueTitleBar title={t("permitApplication.indexTitle")} imageSrc={"/images/jurisdiction-bus.svg"} />
      <Container maxW="container.lg">
        <Flex as="section" direction="column" p={6} gap={6}>
          <RouterLinkButton
            to="/permit-applications/new"
            variant="primary"
            alignSelf={{ base: "center", md: "flex-start" }}
          >
            {t("permitApplication.start")}
          </RouterLinkButton>
          <Flex
            gap={6}
            align={{ base: "flex-start", md: "flex-end" }}
            justify="space-between"
            direction={{ base: "column", md: "row" }}
          >
            <Heading fontSize="2xl">{t("permitApplication.drafts")}</Heading>
            <Flex direction="column">
              <Text>{t("ui.sortBy")}</Text>
              <Select mt={1} defaultValue="date-asc" placeholder="Select option">
                <option value="date-asc">Date Submitted Ascending</option>
                <option value="date-desc">Date Submitted Descending</option>
              </Select>
            </Flex>
          </Flex>
          {permitApplications.map((pa) => (
            <PermitApplicationCard key={pa.id} permitApplication={pa as IPermitApplication} />
          ))}
        </Flex>
      </Container>
    </Flex>
  )
})
