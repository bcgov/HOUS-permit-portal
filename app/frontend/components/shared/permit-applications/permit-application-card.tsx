import { Box, Flex, Image, Show, Spacer, Text } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { format } from "date-fns"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { YellowLineSmall } from "../../shared/base/decorative/yellow-line-small"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { RouterLink } from "../navigation/router-link"
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
              <Flex direction="column">
                <Image src="https://placehold.co/107x79" alt={`thumbnail for ${nickname}`} w={107} h={79} />
                <Text color="text.link" textTransform="capitalize" fontWeight="bold">
                  {permitTypeAndActivity}
                </Text>
              </Flex>
            </Box>
          </Flex>
        </Show>
        <Show below="md">
          <Flex justify="space-between">
            <Image src="https://placehold.co/90x36" alt={`thumbnail for ${nickname}`} />
            <PermitApplicationStatusTag permitApplication={permitApplication} />
          </Flex>
        </Show>
        <Flex direction="column" gap={4} flex={{ base: 0, md: 1 }} maxW={{ base: "100%", md: "50%" }}>
          <RouterLinkButton
            variant="link"
            whiteSpace="normal"
            overflowWrap="break-word"
            fontSize="lg"
            fontWeight="bold"
            color="text.link"
            to={`${id}/edit`}
            rightIcon={<CaretRight size={16} />}
          >
            {nickname}
          </RouterLinkButton>
          <Show below="md">
            <Text>
              <Text as="span" fontWeight={700}>
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
        </Flex>
        <Flex direction="column" align="flex-end" gap={4} flex={{ base: 0, md: 1 }} maxW={{ base: "100%", md: "30%" }}>
          <Show above="md">
            <PermitApplicationStatusTag permitApplication={permitApplication} />
            <Text>
              <Text as="span" fontWeight={700}>
                {t("permitApplication.fields.number")}
                <Text as="span">{":  "}</Text>
              </Text>
              {number}
            </Text>
          </Show>
          <RouterLinkButton to={`${id}/edit`} variant="primary" w={{ base: "full", md: "fit-content" }}>
            {t("ui.resume")}
          </RouterLinkButton>
        </Flex>
      </Flex>
      <Flex direction={{ base: "column", md: "row" }} gap={4}>
        <RouterLink to={"#"}>{`${t("permitApplication.seeBestPracticesLink")} ${permitTypeAndActivity}`}</RouterLink>
        <Show above="md">
          <Text>{"  |  "}</Text>
        </Show>
        <RouterLink to={"#"}>{t("permitApplication.ask")}</RouterLink>
      </Flex>
    </Flex>
  )
}
