import { Container, Flex, Heading, Select, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { BlueTitleBar } from "../../shared/base/blue-title-bar"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { PermitApplicationCard } from "../../shared/permit-applications/permit-application-card"

interface IPermitApplicationIndexScreenProps {}

export interface IPermitApplication {
  id: string
  nickname: string
  jurisdictionName: string
  status: string
  type: string
  number: string
  createdAt: Date
  updatedAt: Date
}

const stubApplications: IPermitApplication[] = [
  {
    id: "27a32891-7e34-480c-830d-ce595c2fe74c",
    nickname: "Cool Draft Permit 1",
    jurisdictionName: "North Cowichan",
    number: "9999",
    type: "residential",
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "27a32891-7e34-480c-830d-ce595c2fe73c",
    nickname: "Cool Draft Permit 2",
    jurisdictionName: "North Cowichan",
    number: "8888",
    type: "residential",
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "27a32891-7e34-480c-130d-ce595c2fe74c",
    nickname: "Cool Draft Permit 3",
    jurisdictionName: "North Cowichan",
    number: "7777",
    type: "residential",
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const PermitApplicationIndexScreen = ({}: IPermitApplicationIndexScreenProps) => {
  const { t } = useTranslation()

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
          {stubApplications.map((pa) => (
            <PermitApplicationCard key={pa.id} permitApplication={pa} />
          ))}
        </Flex>
      </Container>
    </Flex>
  )
}
