import { Button, Container, Flex, Heading, Text } from "@chakra-ui/react"
import { PaperPlaneTilt, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { ErrorScreen } from "../../shared/base/error-screen"
import { UserInput } from "../../shared/base/inputs/user-input"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { RouterLink } from "../../shared/navigation/router-link"

interface IInviteScreenProps {}

type TInviteFormData = {
  users: { firstName?: string; lastName?: string; email?: string; role: EUserRoles; jurisdictionId: string }[]
}

export const InviteScreen = observer(({}: IInviteScreenProps) => {
  const { t } = useTranslation()
  const { currentJurisdiction, error } = useJurisdiction()
  const {
    userStore: { invite },
  } = useMst()

  const defaultUserValues = {
    role: EUserRoles.reviewManager,
    jurisdictionId: currentJurisdiction?.id,
    firstName: "",
    lastName: "",
  }

  const formMethods = useForm<TInviteFormData>({
    mode: "onChange",
    defaultValues: {
      users: [defaultUserValues],
    },
  })

  const { handleSubmit, formState, control, reset } = formMethods

  // Update the form's default values when currentJurisdiction.id changes
  // This happens when navigating from the jurisdiciton creation
  useEffect(() => {
    reset({
      users: [defaultUserValues],
    })
  }, [currentJurisdiction?.id])

  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  })

  const { isSubmitting } = formState

  const onSubmit = async (formData) => {
    invite(formData)
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
            {t("user.inviteInstructions")} <RouterLink to="#">{t("user.rolesAndPermissions")}</RouterLink>
          </Text>
        </Flex>
        <Heading as="h2">{currentJurisdiction.name}</Heading>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap={6}>
              <Flex direction="column" gap={4}>
                {fields.map((field, index) => (
                  <UserInput key={field.id} index={index} remove={remove} jurisdictionId={currentJurisdiction.id} />
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
              <Flex gap={4}>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isSubmitting}
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
