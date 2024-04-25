import { Button, Flex, Heading, Input } from "@chakra-ui/react"
import React, { useRef } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useQuickSubmit } from "../../../hooks/use-quick-submit"
import { useMst } from "../../../setup/root"
import { CenterContainer } from "../../shared/containers/center-container"

interface IAcceptInvitationScreenProps {}

export const AcceptInvitationScreen = ({}: IAcceptInvitationScreenProps) => {
  const { t } = useTranslation()

  const [searchParams] = useSearchParams()
  const user = JSON.parse(decodeURIComponent(searchParams.get("user")))
  const invitationToken = searchParams.get("invitation_token")
  const jurisdictionName = searchParams.get("jurisdiction_name")

  const formMethods = useForm({
    mode: "onSubmit",
    defaultValues: {
      firstName: user.first_name,
      lastName: user.last_name,
      invitationToken: invitationToken,
    },
  })

  const { handleSubmit, formState } = formMethods
  const { userStore } = useMst()
  const { isValid, isSubmitting } = formState
  const formRef = useRef(null)

  const onSubmit = async (values) => {
    await userStore.acceptInvitation(values)
  }

  useQuickSubmit({
    formRef,
    isDisabled: !isValid || isSubmitting,
    onSubmit: handleSubmit(onSubmit),
  })

  return (
    <CenterContainer>
      <Flex direction="column" gap={6} w="full" p={10} border="solid 1px" borderColor="border.light" bg="greys.white">
        <Heading as="h1">
          {t("user.acceptInvitation")} {jurisdictionName}
        </Heading>
        <form action={`/api/auth/keycloak`} method="post">
          <Input hidden={true} name="invitation_token" value={invitationToken} />
          <input type="hidden" name="authenticity_token" value={document.querySelector("[name=csrf-token]").content} />
          <Button variant="primary" w="full" type="submit">
            {t("auth.accept_invite_with_bceid")}
          </Button>
        </form>
      </Flex>
    </CenterContainer>
  )
}
