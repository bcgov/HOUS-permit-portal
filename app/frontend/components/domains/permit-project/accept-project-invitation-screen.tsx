import { Button, Container, Divider, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import { IProjectMembershipInvitation } from "../../../models/project-membership"
import { useMst, useServerAPI } from "../../../setup/root"
import { EProjectMembershipRole } from "../../../types/enums"
import {
  BceidLoginForm,
  BcscLoginForm,
  isLocalPasswordAuthEnabled,
  LocalPasswordLoginForm,
} from "../../shared/auth/login-forms"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { CenterContainer } from "../../shared/containers/center-container"
import { RouterLink } from "../../shared/navigation/router-link"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const AcceptProjectInvitationScreen = observer(() => {
  const api = useServerAPI()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [invitation, setInvitation] = useState<IProjectMembershipInvitation | null>(null)
  const [invalidToken, setInvalidToken] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setInvalidToken(true)
        setLoading(false)
        return
      }
      const response = await api.fetchProjectMembershipInvitation(token)
      if (response.ok) {
        setInvitation(response.data.data)
      } else {
        setInvalidToken(true)
      }
      setLoading(false)
    }
    fetchInvitation()
  }, [token])

  if (loading) return <LoadingScreen />
  if (invalidToken || !invitation) return <InvalidTokenMessage />

  return <Content invitation={invitation} token={token as string} />
})

const Content = observer(function Content({
  invitation,
  token,
}: {
  invitation: IProjectMembershipInvitation
  token: string
}) {
  const { t } = useTranslation()
  const { sessionStore } = useMst()
  const { loggedIn } = sessionStore
  const origin = `${window.location.pathname}${window.location.search}`

  return (
    <CenterContainer>
      <Flex
        direction="column"
        gap={6}
        maxW="500px"
        p={10}
        border="solid 1px"
        borderColor="border.light"
        bg="greys.white"
      >
        <Heading as="h1">{t("permitProject.membershipInvitation.title")}</Heading>
        <Text>
          {t("permitProject.membershipInvitation.invitedBy", {
            name: invitation.inviterName || t("permitProject.membershipInvitation.someone"),
            title: invitation.projectTitle,
          })}
        </Text>
        <VStack spacing={4} w="full" p={4} bg="theme.blueLight" rounded="sm" textAlign="center">
          <Heading as="h2" m={0}>
            {invitation.projectTitle}
          </Heading>
          <Text>{t("permitProject.membershipInvitation.invitedAs")}</Text>
          <Text fontWeight="bold">
            {t(`permitProject.collaborators.membership.${invitation.role as EProjectMembershipRole}`)}
          </Text>
        </VStack>
        <Text fontStyle="italic" fontSize="sm" textAlign="center">
          {t("permitProject.membershipInvitation.sentTo", { email: invitation.invitedEmail })}
        </Text>
        <Divider my={4} />
        {invitation.expired ? (
          <Text>{t("permitProject.membershipInvitation.expired")}</Text>
        ) : loggedIn ? (
          <AcceptButton token={token} projectId={invitation.projectId} />
        ) : (
          <Flex direction="column" gap={6}>
            <Heading as="h3" textAlign="center">
              {t("permitProject.membershipInvitation.signInToAccept")}
            </Heading>
            <BcscLoginForm origin={origin} />
            <BceidLoginForm origin={origin} />
            {isLocalPasswordAuthEnabled && <LocalPasswordLoginForm afterLoginPath={origin} />}
          </Flex>
        )}
      </Flex>
    </CenterContainer>
  )
})

const AcceptButton = observer(function AcceptButton({ token, projectId }: { token: string; projectId: string }) {
  const { t } = useTranslation()
  const api = useServerAPI()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onAccept = async () => {
    setIsSubmitting(true)
    const response = await api.acceptProjectMembershipInvitation(token)
    setIsSubmitting(false)
    if (response.ok) navigate(`/projects/${projectId}`)
  }

  return (
    <Button variant="primary" w="full" onClick={onAccept} isLoading={isSubmitting}>
      {t("permitProject.membershipInvitation.accept")}
    </Button>
  )
})

function InvalidTokenMessage() {
  const { t } = useTranslation()
  return (
    <Container maxW="container.lg">
      <VStack gap={12} my="20" mb="40">
        <VStack>
          <Heading as="h1" mb={0}>
            {t("permitProject.membershipInvitation.invalidToken.title")}
          </Heading>
          <Text>{t("permitProject.membershipInvitation.invalidToken.message")}</Text>
        </VStack>
        <RouterLinkButton to="/">{t("site.pageNotFoundCTA")}</RouterLinkButton>
        <Text>
          {t("site.pageNotFoundContactInstructions")} <RouterLink to="/contact">{t("site.contact")}</RouterLink>
        </Text>
      </VStack>
    </Container>
  )
}
