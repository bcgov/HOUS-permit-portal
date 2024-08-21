import { Button, Container, Flex, Heading, Text } from "@chakra-ui/react"
import { PaperPlaneTilt, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { useQuery } from "../../../hooks/use-query"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { ErrorScreen } from "../../shared/base/error-screen"
import { UserInput } from "../../shared/base/inputs/user-input"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { UserRolesExplanationModal } from "../../shared/user-roles-explanation-modal"

interface IInviteScreenProps {}

type TInviteFormData = {
  users: { firstName?: string; lastName?: string; email?: string; role: EUserRoles; jurisdictionId: string }[]
}

export const InviteScreen = observer(({}: IInviteScreenProps) => {
  const { t } = useTranslation()
  const { currentJurisdiction, error } = useJurisdiction()
  const {
    userStore: { invite, takenEmails, resetInvitationResponse },
  } = useMst()

  const query = useQuery()
  const prepopulatedRole = query.get("role") as EUserRoles
  const prepopulatedEmail = query.get("email")
  const prepopulatedFirstName = query.get("firstName")
  const prepopulatedLastName = query.get("lastName")

  const defaultUserValues = {
    role: prepopulatedRole,
    email: prepopulatedEmail,
    firstName: prepopulatedFirstName,
    lastName: prepopulatedLastName,
    jurisdictionId: currentJurisdiction?.id,
  }

  const formMethods = useForm<TInviteFormData>({
    mode: "onChange",
    defaultValues: {
      users: [defaultUserValues],
    },
  })

  const { handleSubmit, formState, control, reset } = formMethods

  // Update the form's default values when currentJurisdiction.id changes
  // This happens when navigating from the jurisdiction creation
  useEffect(() => {
    reset({
      users: [defaultUserValues],
    })
  }, [currentJurisdiction?.id])

  useEffect(() => {
    resetInvitationResponse()
  }, [])

  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  })

  const { isSubmitting, isValid } = formState

  const onSubmit = async (formData) => {
    await invite(formData)
  }

  const navigate = useNavigate()

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  return (
    <Container maxW="container.lg" p={8} as="main">
      <Flex direction="column" gap={8}>
        <Flex direction="column">
          <Heading as="h1">{t("user.inviteTitle")}</Heading>
          <Text>
            {t("user.inviteInstructions")} <UserRolesExplanationModal />
          </Text>
        </Flex>
        <Heading as="h2">{currentJurisdiction.name}</Heading>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap={6}>
              <Flex direction="column" gap={4}>
                {fields.map((field, index) => (
                  <UserInput key={field.id} index={index} remove={remove} />
                ))}
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={() => append(defaultUserValues)}
                  leftIcon={<Plus size={16} />}
                >
                  {t("user.addUser")}
                </Button>
              </Flex>
              {!R.isEmpty(takenEmails) && (
                <CustomMessageBox
                  status="error"
                  title={t("user.takenErrorTitle")}
                  description={t("user.takenErrorDescription")}
                />
              )}
              <Flex gap={4}>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isSubmitting}
                  isDisabled={!isValid || isSubmitting}
                  loadingText={t("ui.loading")}
                  rightIcon={<PaperPlaneTilt size={16} />}
                >
                  {t("user.sendInvites")}
                </Button>
                <Button variant="secondary" isDisabled={isSubmitting} onClick={() => navigate(-1)}>
                  {t("ui.cancel")}
                </Button>
              </Flex>
            </Flex>
          </form>
        </FormProvider>
      </Flex>
    </Container>
  )
})
