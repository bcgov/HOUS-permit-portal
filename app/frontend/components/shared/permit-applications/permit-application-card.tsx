import { Box, Flex, Image, Link, Show, Spacer, Text } from "@chakra-ui/react"
import { ArrowSquareOut, CaretRight, Info, Pencil, Users, Warning } from "@phosphor-icons/react"
import { format } from "date-fns"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { YellowLineSmall } from "../../shared/base/decorative/yellow-line-small"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import SandboxHeader from "../sandbox/sandbox-header"
import { PermitApplicationStatusTag } from "./permit-application-status-tag"

interface IPermitApplicationCardProps {
  permitApplication: IPermitApplication
}

const calloutBannerContainerProps = {
  py: "0.375rem",
  px: 2,
  align: "center",
  gap: "0.375rem",
  w: "fit-content",
  borderRadius: "sm",
}

const calloutBannerTextProps = {
  fontSize: "sm",
  numOfLines: 2,
}

export const PermitApplicationCard = ({ permitApplication }: IPermitApplicationCardProps) => {
  const { id, nickname, permitTypeAndActivity, number, createdAt, updatedAt, viewedAt } = permitApplication
  const { userStore } = useMst()
  const currentUser = userStore.currentUser
  const { t } = useTranslation()

  const { usingCurrentTemplateVersion } = permitApplication

  const showNewVersionWarning = !usingCurrentTemplateVersion && !permitApplication.isSubmitted

  const isSubmissionCollaboration = permitApplication.submitter?.id !== currentUser?.id

  const routingButtonText = (() => {
    if (permitApplication.isSubmitted) return t("ui.view")

    return isSubmissionCollaboration ? t("permitApplication.card.collaborateButton") : t("ui.resume")
  })()

  return (
    <Flex
      bg={showNewVersionWarning ? "semantic.warningLight" : "greys.white"}
      direction="column"
      borderRadius="lg"
      border="1px solid"
      borderColor={showNewVersionWarning ? "semantic.warning" : "border.light"}
      p={8}
      align="center"
      gap={4}
      position="relative"
    >
      {permitApplication.sandbox && <SandboxHeader override sandbox={permitApplication.sandbox} />}
      <Flex flexDirection={{ base: "column", md: "row" }} gap={6} w="full">
        <Show above="md">
          <Flex direction="column" flex={{ base: 0, md: 1 }} maxW={{ base: "100%", md: "20%" }}>
            <Box p={2}>
              <Image
                src="/images/permit_classifications/low_residential.png"
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
              src="/images/permit_classifications/low_residential.png"
              alt={`thumbnail for ${nickname}`}
              w="150px"
              h="80px"
              bg="semantic.infoLight"
              objectFit="contain"
            />
            <PermitApplicationStatusTag permitApplication={permitApplication} />
          </Flex>
        </Show>
        <Flex direction="column" gap={2} flex={{ base: 0, md: 5 }} maxW={{ base: "100%", md: "75%" }}>
          {showNewVersionWarning && (
            <Flex bg="semantic.warning" {...calloutBannerContainerProps}>
              <Warning size={14} />
              <Text {...calloutBannerTextProps}>
                <Text as="span" fontWeight="bold">
                  {t("ui.actionRequired")}
                </Text>
                {": "}
                {t("permitApplication.newVersionPublished")}
              </Text>
            </Flex>
          )}
          {isSubmissionCollaboration && (
            <Flex bg="semantic.info" color={"white"} {...calloutBannerContainerProps}>
              <Info size={14} />
              <Text {...calloutBannerTextProps}>
                <Trans
                  i18nKey={
                    permitApplication.isDraft
                      ? "permitApplication.card.collaborationCalloutDraft"
                      : "permitApplication.card.collaborationCalloutSubmitted"
                  }
                  t={t}
                  components={{ 1: <Text as="span" fontWeight="bold" /> }}
                  values={{
                    authorName: permitApplication.submitter?.name,
                  }}
                />
              </Text>
            </Flex>
          )}
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
            {viewedAt && (
              <>
                <Show above="md">
                  <Text>{"  |  "}</Text>
                </Show>
                <Show below="md">
                  <Spacer />
                </Show>
                <Text>
                  {t("permitApplication.viewedOn")}
                  <Text as="span">{":  "}</Text>
                  <Show below="md">
                    <br />
                  </Show>
                  {format(viewedAt, "MMM d, yyyy")}
                </Text>
              </>
            )}
          </Flex>
          <Flex direction={{ base: "column", md: "row" }} gap={4}>
            <Link href={t("permitApplication.seeBestPractices_link")} isExternal>
              {t("permitApplication.seeBestPractices_CTA")}
              <ArrowSquareOut />
            </Link>
            <Show above="md">
              <Text>{"  |  "}</Text>
            </Show>
            <Link href={t("permitApplication.searchKnowledge_link")} isExternal>
              {t("permitApplication.searchKnowledge_CTA")} <ArrowSquareOut />
            </Link>
          </Flex>
        </Flex>
        <Flex direction="column" align="flex-end" gap={4} flex={{ base: 0, md: 1 }} maxW={{ base: "100%", md: "25%" }}>
          <Show above="md">
            <PermitApplicationStatusTag permitApplication={permitApplication} />
            <Box>
              <Text align="right" variant="tiny_uppercase">
                {t("permitApplication.fields.number")}
              </Text>
              <Text align="right">{number}</Text>
            </Box>
          </Show>
          <RouterLinkButton
            to={`/permit-applications/${id}/edit`}
            variant="primary"
            w={{ base: "full", md: "fit-content" }}
            leftIcon={!permitApplication.isSubmitted && isSubmissionCollaboration ? <Users /> : <Pencil />}
          >
            {routingButtonText}
          </RouterLinkButton>
        </Flex>
      </Flex>
    </Flex>
  )
}
