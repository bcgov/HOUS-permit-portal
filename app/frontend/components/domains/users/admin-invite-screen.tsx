import { Button, Container, Flex, Heading } from "@chakra-ui/react"
import { PaperPlaneTilt, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useQuery } from "../../../hooks/use-query"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { UserInput } from "../../shared/base/inputs/user-input"

interface IAdminInviteScreenProps {}

type TAdminInviteFormData = {
  users: { firstName?: string; lastName?: string; email?: string; role: EUserRoles }[]
}

export const AdminInviteScreen = observer(({}: IAdminInviteScreenProps) => {
  const { t } = useTranslation()
  const {
    userStore: { invite, takenEmails, resetInvitationResponse },
  } = useMst()

  const query = useQuery()
  const prepopulatedEmail = query.get("email")
  const prepopulatedFirstName = query.get("firstName")
  const prepopulatedLastName = query.get("lastName")

  const defaultUserValues = {
    role: EUserRoles.superAdmin,
    email: prepopulatedEmail,
    firstName: prepopulatedFirstName,
    lastName: prepopulatedLastName,
  }

  const formMethods = useForm<TAdminInviteFormData>({
    mode: "onChange",
    defaultValues: {
      users: [defaultUserValues],
    },
  })

  const { handleSubmit, formState, control, reset, setValue } = formMethods

  // Update the form's default values when currentJurisdiction.id changes
  // This happens when navigating from the jurisdiction creation
  useEffect(() => {
    reset({
      users: [defaultUserValues],
    })
  }, [])

  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  })

  const { isSubmitting, isValid } = formState

  const onSubmit = async (formData) => {
    await invite(formData)
  }

  useEffect(() => {
    resetInvitationResponse()
  }, [])

  const navigate = useNavigate()

  return (
    <Container maxW="container.lg" p={8} as="main">
      <Flex direction="column" gap={8}>
        <Flex direction="column">
          <Heading as="h1">{t("user.adminInviteTitle")}</Heading>
        </Flex>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap={6}>
              <Flex direction="column" gap={4}>
                {fields.map((field, index) => (
                  <UserInput key={field.id} index={index} remove={remove} adminOnly />
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
                <Button
                  variant="secondary"
                  isDisabled={isSubmitting}
                  onClick={() => navigate("/configuration-management/users")}
                >
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
