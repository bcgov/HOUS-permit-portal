import { Box, Flex, Image, Link, Show, Spacer, Text } from "@chakra-ui/react"
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

  const { primaryPermitApplication } = permitProject

  // Use project's own description as nickname, or fallback to primary app's nickname
  const nickname = permitProject.description || primaryPermitApplication?.nickname
  const permitTypeAndActivity =
    primaryPermitApplication?.permitTypeAndActivity || permitProject.permitTypeAndActivity || "N/A"
  const number = permitProject.number || primaryPermitApplication?.number || "N/A"
  // Use project's createdAt, or fallback to primary app's if available
  const createdAt = permitProject.createdAt || primaryPermitApplication?.createdAt
  const updatedAt = permitProject.updatedAt
  const viewedAt = primaryPermitApplication?.viewedAt
  const status = permitProject.status || primaryPermitApplication?.status

  // Determine if the primary application is submitted. This might influence UI elements.
  const isPrimaryApplicationSubmitted = primaryPermitApplication?.isSubmitted || false
  // Using project's submitter, or fallback to primary app's
  const projectSubmitter = permitProject.submitter || primaryPermitApplication?.submitter
  const isSubmissionCollaboration = projectSubmitter?.id !== currentUser?.id

  // Simplified routing for project card - link to project view/edit
  const routingButtonText = t("ui.view")

  // Placeholder for new version warning logic, adapt if projects have versions
  const showNewVersionWarning = false

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
        <Show above="md">
          <Flex direction="column" flex={{ base: 0, md: 1 }} maxW={{ base: "100%", md: "20%" }}>
            <Box p={2}>
              <Image
                src={
                  primaryPermitApplication?.permitType?.imageUrl || "/images/permit_classifications/low_residential.png"
                } // Use primary app image or fallback
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
              src={
                primaryPermitApplication?.permitType?.imageUrl || "/images/permit_classifications/low_residential.png"
              } // Use primary app image or fallback
              alt={`thumbnail for ${nickname}`}
              w="150px"
              h="80px"
              bg="semantic.infoLight"
              objectFit="contain"
            />
            {/* Ensure PermitApplicationStatusTag can handle project status or adapt */}
            {status && <PermitApplicationStatusTag permitApplication={{ status } as any} />}
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
                {/* Adapt text if projects have versions */}
                {t("permitApplication.newVersionPublished")}
              </Text>
            </Flex>
          )}
          {/* Collaboration callout - adapt if project has direct collaborators or use primary app's */}
          {isSubmissionCollaboration && primaryPermitApplication && (
            <Flex bg="semantic.info" color={"white"} {...calloutBannerContainerProps}>
              <Info size={14} />
              <Text {...calloutBannerTextProps}>
                <Trans
                  i18nKey={
                    primaryPermitApplication.isDraft
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
            to={`/permit-projects/${permitProject.id}`} // Link to project detail/edit page
            rightIcon={<CaretRight size={16} />}
          >
            {nickname}
          </RouterLinkButton>
          <YellowLineSmall />
          <Flex gap={4}>
            {createdAt && (
              <Text>
                {t("permitApplication.startedOn")}{" "}
                <Show below="md">
                  <br />
                </Show>
                {format(new Date(createdAt), "MMM d, yyyy")}
              </Text>
            )}
            <Show above="md">{createdAt && updatedAt && <Text>{"  |  "}</Text>}</Show>
            <Show below="md">{createdAt && updatedAt && <Spacer />}</Show>
            {updatedAt && (
              <Text>
                {t("permitApplication.lastUpdated")}
                <Text as="span">{":  "}</Text>
                <Show below="md">
                  <br />
                </Show>
                {format(new Date(updatedAt), "MMM d, yyyy")}
              </Text>
            )}
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
                  {format(new Date(viewedAt), "MMM d, yyyy")}
                </Text>
              </>
            )}
          </Flex>
          <Flex direction={{ base: "column", md: "row" }} gap={4}>
            <Link href={t("permitApplication.seeBestPractices_link")} isExternal>
              {t("permitApplication.seeBestPractices_CTA")} <ArrowSquareOut />
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
          <Show above="md">{status && <PermitApplicationStatusTag permitApplication={{ status } as any} />}</Show>
          <RouterLinkButton
            to={`/permit-projects/${permitProject.id}`} // Link to project detail/edit page
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
