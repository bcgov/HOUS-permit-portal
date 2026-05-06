import { Box, Flex, Image, Link, Spacer, Text } from "@chakra-ui/react"
import { ArrowSquareOut, CaretRight, Info, Pencil, Warning } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { YellowLineSmall } from "../../shared/base/decorative/yellow-line-small"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { PermitApplicationStatusTag } from "../permit-applications/permit-application-status-tag"

interface IPermitProjectCardProps {
  permitProject: IPermitProject
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

export const PermitProjectCard = observer(({ permitProject }: IPermitProjectCardProps) => {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const currentUser = userStore.currentUser

  // Get the first permit application to display some of its details, if available
  const displayApplication = permitProject.recentPermitApplications?.[0]

  // Use project's own title as nickname
  const nickname = permitProject.title
  const tagsOrNickname = displayApplication?.tagsOrNickname || "N/A"
  // Use project's own dates
  const createdAt = permitProject.createdAt
  const updatedAt = permitProject.updatedAt
  // Details from the first permit application
  const viewedAt = displayApplication?.viewedAt
  const status = displayApplication?.status

  // Submitter details from the first permit application
  const projectSubmitter = displayApplication?.submitter
  const isSubmissionCollaboration = projectSubmitter?.id !== currentUser?.id

  // Simplified routing for project card - link to project view/edit
  const routingButtonText = t("ui.view")

  const showNewVersionWarning = permitProject.hasOutdatedDraftApplications

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
      {/* Placeholder for SandboxHeader if projects can be sandboxed */}
      {/* {permitProject.sandbox && <SandboxHeader override sandbox={permitProject.sandbox} />} */}
      <Flex flexDirection={{ base: "column", md: "row" }} gap={6} w="full">
        <Box hideBelow="md">
          <Flex direction="column" flex={{ base: 0, md: 1 }} maxW={{ base: "100%", md: "20%" }}>
            <Box p={2}>
              <Image
                src="/images/logo.png"
                alt={`thumbnail for ${nickname}`}
                w="200px"
                h="110px"
                bg="semantic.infoLight"
                objectFit="contain"
              />
              <Text align="center" mt="1" color="text.secondary" fontSize="sm" fontWeight="bold" lineHeight="1.2">
                {tagsOrNickname}
              </Text>
            </Box>
          </Flex>
        </Box>
        <Box hideFrom="md">
          <Flex justify="space-between" alignItems="center">
            <Image
              src="/images/logo.png"
              alt={`thumbnail for ${nickname}`}
              w="150px"
              h="80px"
              bg="semantic.infoLight"
              objectFit="contain"
            />
            {status && <PermitApplicationStatusTag status={status} />}
          </Flex>
        </Box>
        <Flex direction="column" gap={2} flex={{ base: 0, md: 5 }} maxW={{ base: "100%", md: "75%" }}>
          {showNewVersionWarning && (
            <Flex bg="semantic.warning" {...calloutBannerContainerProps}>
              <Warning size={14} />
              <Text {...calloutBannerTextProps}>
                <Text as="span" fontWeight="bold">
                  {t("ui.actionRequired")}
                </Text>
                {": "}
                {/* Adapt text if projects have versions */}
                {t("permitApplication.newVersionPublished")}
              </Text>
            </Flex>
          )}
          {/* Collaboration callout - use display application's details */}
          {isSubmissionCollaboration && displayApplication && (
            <Flex bg="semantic.info" color={"white"} {...calloutBannerContainerProps}>
              <Info size={14} />
              <Text {...calloutBannerTextProps}>
                <Trans
                  i18nKey={
                    displayApplication.isDraft
                      ? "permitApplication.card.collaborationCalloutDraft"
                      : "permitApplication.card.collaborationCalloutSubmitted"
                  }
                  t={t}
                  components={{ 1: <Text as="span" fontWeight="bold" /> }}
                  values={{
                    authorName: projectSubmitter?.name || projectSubmitter?.fullName, // Use available name fields
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
            to={`/projects/${permitProject.id}`} // Link to project detail/edit page
            rightIcon={<CaretRight size={16} />}
          >
            {nickname}
          </RouterLinkButton>
          <YellowLineSmall />
          <Flex gap={4}>
            {createdAt && (
              <Text>
                {t("permitApplication.startedOn")}{" "}
                <Box hideFrom="md">
                  <br />
                </Box>
                {format(new Date(createdAt), "MMM d, yyyy")}
              </Text>
            )}
            <Box hideBelow="md">{createdAt && updatedAt && <Text>{"  |  "}</Text>}</Box>
            <Box hideFrom="md">{createdAt && updatedAt && <Spacer />}</Box>
            {updatedAt && (
              <Text>
                {t("permitApplication.lastUpdated")}
                <Text as="span">{":  "}</Text>
                <Box hideFrom="md">
                  <br />
                </Box>
                {format(new Date(updatedAt), "MMM d, yyyy")}
              </Text>
            )}
            {viewedAt && (
              <>
                <Box hideBelow="md">
                  <Text>{"  |  "}</Text>
                </Box>
                <Box hideFrom="md">
                  <Spacer />
                </Box>
                <Text>
                  {t("permitApplication.viewedOn")}
                  <Text as="span">{":  "}</Text>
                  <Box hideFrom="md">
                    <br />
                  </Box>
                  {format(new Date(viewedAt), "MMM d, yyyy")}
                </Text>
              </>
            )}
          </Flex>
          <Flex direction={{ base: "column", md: "row" }} gap={4}>
            <Link href={t("permitApplication.seeBestPractices_link")} target="_blank" rel="noopener noreferrer">
              {t("permitApplication.seeBestPractices_CTA")} <ArrowSquareOut />
            </Link>
            <Box hideBelow="md">
              <Text>{"  |  "}</Text>
            </Box>
            <Link href={t("permitApplication.searchKnowledge_link")} target="_blank" rel="noopener noreferrer">
              {t("permitApplication.searchKnowledge_CTA")} <ArrowSquareOut />
            </Link>
          </Flex>
        </Flex>
        <Flex direction="column" align="flex-end" gap={4} flex={{ base: 0, md: 1 }} maxW={{ base: "100%", md: "25%" }}>
          <Box hideBelow="md">{status && <PermitApplicationStatusTag status={status} />}</Box>
          <RouterLinkButton
            to={`/projects/${permitProject.id}`} // Link to project detail/edit page
            variant="primary"
            w={{ base: "full", md: "fit-content" }}
            // Adapt icon based on project state or collaboration status if needed
            leftIcon={<Pencil />}
          >
            {routingButtonText}
          </RouterLinkButton>
        </Flex>
      </Flex>
    </Flex>
  )
})
