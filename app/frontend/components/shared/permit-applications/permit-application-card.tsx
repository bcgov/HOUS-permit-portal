import { Box, Flex, Image, Link, Show, Spacer, Text } from "@chakra-ui/react"
import { ArrowSquareOut, CaretRight } from "@phosphor-icons/react"
import { format } from "date-fns"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { YellowLineSmall } from "../../shared/base/decorative/yellow-line-small"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { PermitApplicationStatusTag } from "./permit-application-status-tag"

interface IPermitApplicationCardProps {
  permitApplication: IPermitApplication
}

export const PermitApplicationCard = ({ permitApplication }: IPermitApplicationCardProps) => {
  const { id, nickname, permitTypeAndActivity, number, createdAt, updatedAt } = permitApplication
  const { t } = useTranslation()

  return (
    <Flex
      direction="column"
      borderRadius="lg"
      border="1px solid"
      borderColor="border.light"
      p={6}
      align="center"
      gap={4}
    >
      <Flex flexDirection={{ base: "column", md: "row" }} gap={6} w="full">
        <Show above="md">
          <Flex direction="column" flex={{ base: 0, md: 1 }} maxW={{ base: "100%", md: "20%" }}>
            <Box p={2}>
              <Image
                src="images/permit_classifications/low_residential.png"
                alt={`thumbnail for ${nickname}`}
                w="200px"
                h="110px"
                bg="semantic.infoLight"
                objectFit="contain"
              />
              <Text align="center" mt="1" color="text.secondary" fontSize="sm" fontWeight="bold" lineHeight="1.2">
                {permitTypeAndActivity}
              </Text>
            </Box>
          </Flex>
        </Show>
        <Show below="md">
          <Flex justify="space-between" alignItems="center">
            <Image
              src="images/permit_classifications/low_residential.png"
              alt={`thumbnail for ${nickname}`}
              w="150px"
              h="80px"
              bg="semantic.infoLight"
              objectFit="contain"
            />
            <PermitApplicationStatusTag permitApplication={permitApplication} />
          </Flex>
        </Show>
        <Flex direction="column" gap={2} flex={{ base: 0, md: 1 }} maxW={{ base: "100%", md: "50%" }}>
          <RouterLinkButton
            variant="link"
            whiteSpace="normal"
            overflowWrap="break-word"
            fontSize="lg"
            fontWeight="bold"
            color="text.link"
            to={`/permit-applications/${id}/edit`}
            rightIcon={<CaretRight size={16} />}
          >
            {nickname}
          </RouterLinkButton>
          <Show below="md">
            <Text>
              <Text as="span" fontWeight={700} mr="1">
                {t("permitApplication.fields.number")}:
              </Text>
              {number}
            </Text>
          </Show>
          <YellowLineSmall />
          <Flex gap={4}>
            <Text>
              {t("permitApplication.startedOn")}{" "}
              <Show below="md">
                <br />
              </Show>
              {format(createdAt, "MMM d, yyyy")}
            </Text>
            <Show above="md">
              <Text>{"  |  "}</Text>
            </Show>
            <Show below="md">
              <Spacer />
            </Show>
            <Text>
              {t("permitApplication.lastUpdated")}
              <Text as="span">{":  "}</Text>
              <Show below="md">
                <br />
              </Show>
              {format(updatedAt, "MMM d, yyyy")}
            </Text>
          </Flex>
          <Flex direction={{ base: "column", md: "row" }} gap={4}>
            <Link href={t("permitApplication.seeBestPractices_link")} isExternal>
              {t("permitApplication.seeBestPractices_CTA")}
              <ArrowSquareOut></ArrowSquareOut>
            </Link>
            <Show above="md">
              <Text>{"  |  "}</Text>
            </Show>
            <Link href={t("permitApplication.searchKnowledge_link")} isExternal>
              {t("permitApplication.searchKnowledge_CTA")} <ArrowSquareOut></ArrowSquareOut>
            </Link>
          </Flex>
        </Flex>
        <Flex direction="column" align="flex-end" gap={4} flex={{ base: 0, md: 1 }} maxW={{ base: "100%", md: "30%" }}>
          <Show above="md">
            <PermitApplicationStatusTag permitApplication={permitApplication} />
            <Text>
              <Text as="p" align="right" variant="tiny_uppercase">
                {t("permitApplication.fields.number")}
              </Text>
              {number}
            </Text>
          </Show>
          <RouterLinkButton
            to={`/permit-applications/${id}/edit`}
            variant="primary"
            w={{ base: "full", md: "fit-content" }}
          >
            {permitApplication.isSubmitted ? t("ui.view") : t("ui.resume")}
          </RouterLinkButton>
        </Flex>
      </Flex>
    </Flex>
  )
}
