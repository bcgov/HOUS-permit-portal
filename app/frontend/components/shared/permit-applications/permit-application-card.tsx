import { Box, Flex, Image, Show, Spacer, Text, VStack } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { format } from "date-fns"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { YellowLineSmall } from "../../shared/base/decorative/yellow-line-small"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { PermitApplicationTemplateStatusTag } from "./permit-application-status-tag"

interface IPermitApplicationCardProps {
  permitApplication: IPermitApplication
}

export const PermitApplicationCard = ({ permitApplication }: IPermitApplicationCardProps) => {
  const { id, nickname, status, jurisdictionName, permitTypeAndActivity, number, createdAt, updatedAt } =
    permitApplication
  const { t } = useTranslation()

  return (
    <Flex
      flexDirection={{ base: "column", md: "row" }}
      borderRadius="lg"
      border="1px solid"
      borderColor="border.light"
      p={6}
      gap={6}
    >
      <Show above="md">
        <Flex direction="column">
          <Box p={2}>
            <VStack>
              <Image src="https://placehold.co/107x79" alt={`thumbnail for ${nickname}`} />
              <Text color="text.link" textTransform="capitalize" fontWeight="bold">
                {permitTypeAndActivity}
              </Text>
            </VStack>
          </Box>
        </Flex>
      </Show>
      <Show below="md">
        <Flex justify="space-between">
          <Image src="https://placehold.co/90x36" alt={`thumbnail for ${nickname}`} />
          <PermitApplicationTemplateStatusTag status={status} />
        </Flex>
      </Show>
      <Flex direction="column" gap={4}>
        <RouterLinkButton
          variant="link"
          fontSize="lg"
          fontWeight="bold"
          color="text.link"
          to={`${id}`}
          rightIcon={<CaretRight size={16} />}
        >
          {nickname}
        </RouterLinkButton>
        <Show below="md">
          <Text>
            {t("Application ID")}: {number}
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
            {t("permitApplication.lastUpdated")}{" "}
            <Show below="md">
              <br />
            </Show>
            {format(updatedAt, "MMM d, yyyy")}
          </Text>
        </Flex>
        <Flex direction={{ base: "column", md: "row" }} gap={4}>
          <RouterLink to={"#"}>{`${t("permitApplication.seeBestPracticesLink")} ${permitTypeAndActivity}`}</RouterLink>
          <Show above="md">
            <Text>{"  |  "}</Text>
          </Show>
          <RouterLink to={"#"}>{t("permitApplication.ask")}</RouterLink>
        </Flex>
      </Flex>
      <Show above="md">
        <Spacer />
      </Show>
      <Flex direction="column" align="flex-end" gap={2}>
        <Show above="md">
          <PermitApplicationTemplateStatusTag status={status} />
          <Text>
            {t("Application ID")}: {number}
          </Text>
        </Show>
        <RouterLinkButton to={`${id}`} variant="primary" w={{ base: "full", md: "fit-content" }}>
          {t("ui.resume")}
        </RouterLinkButton>
      </Flex>
    </Flex>
  )
}
