import { Avatar, Box, Button, Divider, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EProjectMembershipStatus } from "../../../types/enums"
import { IProjectInvitation } from "../../../types/types"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { CenterContainer } from "../../shared/containers/center-container"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const AcceptProjectInvitationScreen = observer(() => {
  const { t } = useTranslation()
  const { invitationToken } = useParams<{ invitationToken: string }>()
  const navigate = useNavigate()
  const { projectPeopleStore, userStore, uiStore } = useMst()
  const { fetchProjectInvitation, acceptProjectInvitation, declineProjectInvitation } = projectPeopleStore
  const currentUser = userStore.currentUser

  const [invitation, setInvitation] = useState<IProjectInvitation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchInvitation = async () => {
      if (!invitationToken) {
        navigate("/projects", { replace: true })
        return
      }
      setIsLoading(true)
      const fetched = await fetchProjectInvitation(invitationToken)
      if (!isMounted) return
      if (fetched) {
        setInvitation(fetched)
      } else {
        navigate("/projects", { replace: true })
      }
      setIsLoading(false)
    }

    fetchInvitation()
    return () => {
      isMounted = false
    }
  }, [invitationToken])

  if (isLoading) {
    return (
      <CenterContainer>
        <SharedSpinner my={20} />
      </CenterContainer>
    )
  }

  if (!invitation) return null

  const isExpired = invitation.status === EProjectMembershipStatus.expired

  const handleAccept = async () => {
    if (!invitationToken) return
    setIsSubmitting(true)
    const accepted = await acceptProjectInvitation(invitationToken)
    setIsSubmitting(false)

    if (accepted) {
      const { permitProjectId, projectTitle } = accepted
      uiStore.flashMessage.show(
        EFlashMessageStatus.success,
        t("permitProject.people.invitationScreen.acceptedTitle", { title: projectTitle }),
        t("permitProject.people.invitationScreen.acceptedMessage"),
        5000
      )
      navigate(`/projects/${permitProjectId}/overview`)
    }
  }

  const handleDecline = async () => {
    if (!invitationToken) return
    setIsSubmitting(true)
    const declined = await declineProjectInvitation(invitationToken)
    setIsSubmitting(false)

    if (declined) {
      const { projectTitle } = declined
      uiStore.flashMessage.show(
        EFlashMessageStatus.info,
        null,
        t("permitProject.people.invitationScreen.declinedMessage", { title: projectTitle }),
        5000
      )
      navigate("/projects")
    }
  }

  return (
    <CenterContainer py={12}>
      <Flex
        direction="column"
        gap={6}
        w="full"
        maxW="540px"
        p={10}
        border="1px solid"
        borderColor="border.light"
        borderRadius="md"
        bg="greys.white"
      >
        <Heading as="h1" size="lg" mb={0}>
          {isExpired
            ? t("permitProject.people.invitationScreen.expiredTitle")
            : t("permitProject.people.invitationScreen.title")}
        </Heading>

        {isExpired && (
          <CustomMessageBox
            status={EFlashMessageStatus.info}
            description={t("permitProject.people.invitationScreen.expiredAlert")}
          />
        )}

        <VStack align="stretch" spacing={3}>
          <Heading as="h2" size="md" mb={0}>
            {t("permitProject.people.invitationScreen.projectInformation")}
          </Heading>
          <Box as="dl">
            <Box mb={3}>
              <Text as="dt" fontSize="xs" fontWeight="bold" color="text.secondary">
                {t("permitProject.people.invitationScreen.projectLabel")}
              </Text>
              <Text as="dd" fontSize="md">
                {invitation.projectTitle}
              </Text>
            </Box>
            <Box>
              <Text as="dt" fontSize="xs" fontWeight="bold" color="text.secondary">
                {t("permitProject.people.invitationScreen.invitedByLabel")}
              </Text>
              <Text as="dd" fontSize="md">
                {invitation.invitedByName || t("ui.notProvided")}
              </Text>
            </Box>
          </Box>
        </VStack>

        <Divider borderColor="border.light" />

        <VStack align="stretch" spacing={3}>
          <Heading as="h2" size="md" mb={0}>
            {t("permitProject.people.invitationScreen.yourAccount")}
          </Heading>
          {currentUser && (
            <Flex align="center" gap={3}>
              <Avatar name={currentUser.name} size="sm" bg="semantic.warningLight" color="text.primary" />
              <Box>
                <Text fontWeight="bold" fontSize="md">
                  {currentUser.name}
                </Text>
                <Text fontSize="sm" color="text.secondary">
                  {currentUser.email}
                </Text>
              </Box>
            </Flex>
          )}
        </VStack>

        {isExpired ? (
          <Box pt={2}>
            <RouterLinkButton to="/projects" variant="primary">
              {t("permitProject.people.invitationScreen.goToProjects")}
            </RouterLinkButton>
          </Box>
        ) : (
          <HStack spacing={4} pt={2}>
            <Button variant="primary" onClick={handleAccept} isLoading={isSubmitting}>
              {t("permitProject.people.invitationScreen.acceptInvite")}
            </Button>
            <Button variant="link" onClick={handleDecline} isDisabled={isSubmitting}>
              {t("permitProject.people.invitationScreen.declineInvite")}
            </Button>
          </HStack>
        )}
      </Flex>
    </CenterContainer>
  )
})
