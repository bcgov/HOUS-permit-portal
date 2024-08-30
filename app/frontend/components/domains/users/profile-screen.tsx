import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  Container,
  Divider,
  Flex,
  FormControl,
  Heading,
  InputGroup,
  InputRightElement,
  Link,
  Select,
  Switch,
  Table,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { Info, Warning } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { EmailFormControl } from "../../shared/form/email-form-control"
import { TextFormControl } from "../../shared/form/input-form-control"
import { UserEulas } from "../../shared/user-eulas"

interface IProfileScreenProps {}

export const ProfileScreen = observer(({}: IProfileScreenProps) => {
  const { t } = useTranslation()
  const [isEditingEmail, setIsEditingEmail] = useState(false)

  const { userStore } = useMst()
  const { currentUser, updateProfile } = userStore

  const confirmationRequired =
    currentUser.unconfirmedEmail || (currentUser.isUnconfirmed && currentUser.confirmationSentAt)

  const getDefaults = () => {
    const { firstName, lastName, nickname, certified, organization, preference } = currentUser
    return {
      firstName,
      lastName,
      certified,
      organization,
      preferenceAttributes: preference,
    }
  }
  const formMethods = useForm({
    mode: "onSubmit",
    defaultValues: getDefaults(),
  })
  const { handleSubmit, formState, control, reset, setValue } = formMethods
  const { isSubmitting } = formState

  const navigate = useNavigate()

  const onSubmit = async (formData) => {
    await updateProfile(formData)
    setIsEditingEmail(false)
    reset(getDefaults())
  }

  const handleResendConfirmationEmail = async () => {
    await currentUser.resendConfirmation()
  }

  const events = [
    {
      event: t("user.notifications.essential"),
      inAppChecked: false,
      emailChecked: true,
      emailDisabled: true,
    },
    {
      event: t("user.notifications.templateChanged"),
      inAppControl: "preferenceAttributes.enableInAppNewTemplateVersionPublishNotification",
      emailChecked: false,
    },
    {
      event: t("user.notifications.templateCustomized"),
      inAppControl: "preferenceAttributes.enableInAppCustomizationUpdateNotification",
      emailChecked: false,
    },
    {
      event: t("user.notifications.applicationSubmitted"),
      inAppControl: "preferenceAttributes.enableInAppApplicationSubmissionNotification",
      emailControl: "preferenceAttributes.enableEmailApplicationSubmissionNotification",
    },
    {
      event: t("user.notifications.applicationViewed"),
      inAppControl: "preferenceAttributes.enableInAppApplicationViewNotification",
      emailControl: "preferenceAttributes.enableEmailApplicationViewNotification",
    },
    {
      event: t("user.notifications.applicationRevisionsRequested"),
      inAppControl: "preferenceAttributes.enableInAppApplicationRevisionsRequestNotification",
      emailControl: "preferenceAttributes.enableEmailApplicationRevisionsRequestNotification",
    },
    {
      event: t("user.notifications.collaboration"),
      inAppControl: "preferenceAttributes.enableInAppCollaborationNotification",
      emailControl: "preferenceAttributes.enableEmailCollaborationNotification",
    },
    {
      event: t("user.notifications.integrationMapping"),
      inAppControl: "preferenceAttributes.enableInAppIntegrationMappingNotification",
      emailControl: "preferenceAttributes.enableEmailIntegrationMappingNotification",
    },
  ]

  return (
    <Container maxW="container.sm" p={8} as="main">
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex as="section" direction="column" w="full" gap={6}>
            <Heading as="h1" m={0}>
              {t("user.myProfile")}
            </Heading>
            {!currentUser.isSubmitter && (
              <InputGroup>
                <Flex direction="column" w="full">
                  <Select
                    disabled
                    defaultValue={currentUser.role}
                    w={{ base: "100%", md: "50%" }}
                    textTransform="capitalize"
                  >
                    <option value={currentUser.role}>{t(`user.roles.${currentUser.role as EUserRoles}`)}</option>
                  </Select>
                </Flex>
              </InputGroup>
            )}

            <Section>
              <Avatar
                size="xl"
                name={currentUser.name}
                bg={currentUser.name ? "semantic.warningLight" : "greys.grey02"}
                color="text.primary"
              />
              <Flex gap={{ base: 4, md: 6 }} direction={{ base: "column", md: "row" }}>
                <TextFormControl label={t("user.firstName")} fieldName="firstName" required />
                <TextFormControl label={t("user.lastName")} fieldName="lastName" required />
              </Flex>
              {currentUser.isSubmitter && (
                <>
                  <TextFormControl label={t("auth.organizationLabel")} fieldName="organization" />
                  <FormControl>
                    <Controller
                      name="certified"
                      control={control}
                      render={({ field: { onChange, value } }) => {
                        return (
                          <Checkbox isChecked={value} onChange={onChange}>
                            {t("auth.certifiedProfessional")}
                          </Checkbox>
                        )
                      }}
                    />
                  </FormControl>
                </>
              )}
              <Divider my={1} />
              <TextFormControl
                // @ts-ignore
                label={t(`user.omniauthProviders.${currentUser.omniauthProvider as EOmniauthProvider}`)}
                hint={currentUser.omniauthEmail}
                inputProps={{ value: currentUser.omniauthUsername }}
                isDisabled
              />
              {!currentUser.isSuperAdmin && (
                <Alert
                  status="info"
                  borderRadius="sm"
                  gap={1.5}
                  borderWidth={1}
                  borderColor="semantic.info"
                  px={2}
                  py={1.5}
                  fontSize="sm"
                >
                  <Info color="var(--chakra-colors-semantic-info)" />
                  <Text>
                    {t("user.changeBceid")}
                    <Link href={import.meta.env.VITE_BCEID_URL} isExternal>
                      {t("user.changeBceidLinkText")}
                    </Link>
                  </Text>
                </Alert>
              )}
            </Section>

            <Section>
              <Heading as="h3" m={0}>
                {t("user.receiveNotifications")}
              </Heading>
              {currentUser.isUnconfirmed && !currentUser.confirmationSentAt ? (
                <EmailFormControl fieldName="email" label={t("user.notificationsEmail")} showIcon required />
              ) : (
                <>
                  {currentUser.unconfirmedEmail ? (
                    <EmailFormControl
                      label={t("user.notificationsEmail")}
                      showIcon
                      inputProps={{
                        isDisabled: true,
                        value: currentUser.unconfirmedEmail,
                        paddingRight: "98.23px",
                        _disabled: {
                          color: "text.primary",
                          bg: "greys.grey04",
                          borderColor: "border.light",
                        },
                      }}
                      inputRightElement={
                        <InputRightElement pointerEvents="none" width="auto" px={2}>
                          <Flex
                            color="text.primary"
                            borderColor="semantic.warning"
                            borderWidth={1}
                            bg="semantic.warningLight"
                            rounded="xs"
                            px={1.5}
                            py={0.5}
                            fontSize="sm"
                          >
                            {t("ui.unverified")}
                          </Flex>
                        </InputRightElement>
                      }
                    />
                  ) : (
                    <EmailFormControl
                      label={t("user.notificationsEmail")}
                      showIcon
                      inputProps={{
                        isDisabled: true,
                        value: currentUser.email,
                        paddingRight: "82.35px",
                        _disabled: {
                          color: "text.primary",
                          bg: "greys.grey04",
                          borderColor: "border.light",
                        },
                      }}
                      inputRightElement={
                        <InputRightElement pointerEvents="none" width="auto" px={2}>
                          <Tag
                            variant="outline"
                            color="text.primary"
                            borderColor="semantic.success"
                            bg="theme.green.100"
                            rounded="xs"
                          >
                            <TagLabel>{t("ui.verified")}</TagLabel>
                          </Tag>
                        </InputRightElement>
                      }
                    />
                  )}

                  {confirmationRequired && (
                    <Alert
                      status="warning"
                      borderRadius="sm"
                      gap={1.5}
                      borderWidth={1}
                      borderColor="semantic.warning"
                      px={2}
                      py={1.5}
                      fontSize="sm"
                    >
                      <Warning color="var(--chakra-colors-semantic-warning)" />
                      <Text>
                        {currentUser.unconfirmedEmail && !currentUser.isUnconfirmed ? (
                          <Trans
                            i18nKey="user.confirmationRequiredWithEmail"
                            values={{ email: currentUser.email }}
                            components={{
                              1: <Button variant="link" onClick={handleResendConfirmationEmail} />,
                            }}
                          />
                        ) : (
                          <Trans
                            i18nKey="user.confirmationRequired"
                            components={{
                              1: <Button variant="link" onClick={handleResendConfirmationEmail} />,
                            }}
                          />
                        )}
                      </Text>
                    </Alert>
                  )}
                  {isEditingEmail ? (
                    <>
                      <Divider my={4} />
                      <EmailFormControl showIcon label={t("user.newEmail")} fieldName="email" />
                    </>
                  ) : (
                    <Button
                      variant="link"
                      onClick={() => {
                        setIsEditingEmail(true)
                      }}
                    >
                      {t("user.changeEmail")}
                    </Button>
                  )}
                </>
              )}

              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>{t("user.notifications.event")}</Th>
                    <Th>{t("user.notifications.enableNotification")}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {events.map((event, index) => (
                    <EventRow key={index} {...event} />
                  ))}
                </Tbody>
              </Table>
            </Section>

            {!currentUser.isSuperAdmin && <UserEulas />}

            <Flex as="section" gap={4} mt={4}>
              <Button variant="primary" type="submit" isLoading={isSubmitting} loadingText={t("ui.loading")}>
                {t("ui.save")}
              </Button>
              {!currentUser.isUnconfirmed && (
                <Button variant="secondary" isDisabled={isSubmitting} onClick={() => navigate(-1)}>
                  {t("ui.cancel")}
                </Button>
              )}
            </Flex>
            <Text fontSize="xs">
              <Trans
                i18nKey={"user.deleteAccount"}
                components={{
                  1: <Link href={`mailto:digital.codes.permits@gov.bc.ca`}></Link>,
                }}
              />
            </Text>
          </Flex>
        </form>
      </FormProvider>
    </Container>
  )
})

function Section({ children }) {
  return (
    <Flex as="section" direction="column" gap={4} w="full" p={6} borderWidth={1} borderColor="border.light">
      {children}
    </Flex>
  )
}

interface IEventRowProps {
  event: string
  inAppControl?: string
  emailControl?: string
  inAppChecked?: boolean
  emailChecked?: boolean
  emailDisabled?: boolean
}

const EventRow: React.FC<IEventRowProps> = ({
  event,
  inAppControl,
  emailControl,
  inAppChecked,
  emailChecked,
  emailDisabled,
}) => {
  const { control } = useFormContext()
  const { t } = useTranslation()

  return (
    <Tr>
      <Td w="45%">{event}</Td>
      <Td w="55%">
        <Flex gap={6} alignItems="center">
          {inAppControl ? (
            <Controller
              name={inAppControl}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Switch isChecked={value} onChange={onChange}>
                  {t("user.inApp")}
                </Switch>
              )}
            />
          ) : (
            <Switch isChecked={inAppChecked}>{t("user.inApp")}</Switch>
          )}

          {emailControl ? (
            <Controller
              name={emailControl}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Switch isChecked={value} onChange={onChange}>
                  {t("user.email")}
                </Switch>
              )}
            />
          ) : (
            <Switch isChecked={emailChecked} disabled={emailDisabled}>
              {t("user.email")}
            </Switch>
          )}
        </Flex>
      </Td>
    </Tr>
  )
}
