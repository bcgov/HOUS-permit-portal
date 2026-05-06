import { InputGroup } from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
import {
  Accordion,
  Alert,
  Avatar,
  Button,
  Checkbox,
  Container,
  Field,
  Flex,
  Heading,
  InputElement,
  Link,
  NativeSelect,
  Separator,
  Table,
  Tag,
  Text,
} from "@chakra-ui/react"
import { Info, Warning } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EUserRoles } from "../../../types/enums"
import { EmailFormControl } from "../../shared/form/email-form-control"
import { TextFormControl } from "../../shared/form/input-form-control"
import { UserEulas } from "../../shared/user-eulas"

interface IProfileScreenProps {}

export const ProfileScreen = observer(({}: IProfileScreenProps) => {
  const { t } = useTranslation()
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [closeAccountAcknowledged, setCloseAccountAcknowledged] = useState(false)

  const { userStore, sessionStore } = useMst()
  const { currentUser, updateProfile } = userStore
  const isManager = currentUser?.isManager

  const confirmationRequired =
    currentUser.unconfirmedEmail || (currentUser.isUnconfirmed && currentUser.confirmationSentAt)

  const getDefaults = () => {
    const { firstName, lastName, nickname, certified, organization, preference, department } = currentUser
    return { firstName, lastName, certified, organization, preferenceAttributes: preference, department }
  }
  const formMethods = useForm({ mode: "onSubmit", defaultValues: getDefaults() })
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

  const handleArchiveMyAccount = async () => {
    setIsArchiving(true)
    const archivedUserId = currentUser.id
    const ok = await currentUser.destroy()

    if (ok && archivedUserId === currentUser.id) {
      await sessionStore.logout()
      return
    }

    setIsArchiving(false)
  }

  const events = [
    { event: t("user.notifications.essential"), inAppChecked: false, emailChecked: false },
    {
      event: t("user.notifications.templateChanged"),
      inAppControl: "preferenceAttributes.enableInAppNewTemplateVersionPublishNotification",
      emailControl: "preferenceAttributes.enableEmailNewTemplateVersionPublishNotification",
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
      event: t("user.notifications.reviewStarted"),
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
      event: t("user.notifications.unmappedApiNotification"),
      inAppControl: "preferenceAttributes.enableInAppUnmappedApiNotification",
      emailControl: "preferenceAttributes.enableEmailUnmappedApiNotification",
    },
  ]

  if (isManager) {
    events.push({
      event: t("user.notifications.resourceReminder"),
      inAppControl: "preferenceAttributes.enableInAppResourceReminderNotification",
      emailControl: "preferenceAttributes.enableEmailResourceReminderNotification",
    })
  }

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
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      disabled
                      defaultValue={currentUser.role}
                      w={{ base: "100%", md: "50%" }}
                      textTransform="capitalize"
                    >
                      <option value={currentUser.role}>{t(`user.roles.${currentUser.role as EUserRoles}`)}</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Flex>
              </InputGroup>
            )}

            <Section>
              <Avatar.Root
                size="xl"
                bg={currentUser.name ? "semantic.warningLight" : "greys.grey02"}
                color="text.primary"
              >
                <Avatar.Fallback name={currentUser.name} />
              </Avatar.Root>
              <Flex gap={{ base: 4, md: 6 }} direction={{ base: "column", md: "row" }}>
                <TextFormControl label={t("user.firstName")} fieldName="firstName" required />
                <TextFormControl label={t("user.lastName")} fieldName="lastName" required />
              </Flex>
              {currentUser.isSubmitter && (
                <>
                  <TextFormControl label={t("auth.organizationLabel")} fieldName="organization" />
                  <Field.Root>
                    <Controller
                      name="certified"
                      control={control}
                      render={({ field: { onChange, value } }) => {
                        return (
                          <Checkbox.Root onCheckedChange={onChange} checked={value}>
                            <Checkbox.HiddenInput />
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                            <Checkbox.Label>{t("auth.certifiedProfessional")}</Checkbox.Label>
                          </Checkbox.Root>
                        )
                      }}
                    />
                  </Field.Root>
                </>
              )}
              <Separator my={1} />
              {currentUser.omniauthProvider !== "bcsc" && (
                <TextFormControl
                  // @ts-ignore
                  label={currentUser.omniauthProviderLabel}
                  hint={currentUser.omniauthEmail}
                  inputProps={{ value: currentUser.omniauthUsername }}
                  isDisabled
                />
              )}
              {!currentUser.isSuperAdmin && (
                <Alert.Root
                  status={EFlashMessageStatus.info}
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
                    <Link href={import.meta.env.VITE_BCEID_URL} target="_blank" rel="noopener noreferrer">
                      {t("user.changeBceidLinkText")}
                    </Link>
                  </Text>
                </Alert.Root>
              )}
              {currentUser.isReviewStaff && (
                <Flex gap={{ base: 4, md: 6 }} direction={{ base: "column", md: "row" }}>
                  <TextFormControl label={t("user.department")} fieldName="department" required />
                </Flex>
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
                      required
                      inputProps={{
                        isDisabled: true,
                        value: currentUser.unconfirmedEmail,
                        paddingRight: "98.23px",
                        _disabled: { color: "text.primary", bg: "greys.grey04", borderColor: "border.light" },
                      }}
                      inputRightElement={
                        <InputElement placement="end" pointerEvents="none" width="auto" px={2}>
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
                        </InputElement>
                      }
                    />
                  ) : (
                    <EmailFormControl
                      label={t("user.notificationsEmail")}
                      showIcon
                      required
                      inputProps={{
                        isDisabled: true,
                        value: currentUser.email,
                        paddingRight: "82.35px",
                        _disabled: { color: "text.primary", bg: "greys.grey04", borderColor: "border.light" },
                      }}
                      inputRightElement={
                        <InputElement placement="end" pointerEvents="none" width="auto" px={2}>
                          <Tag.Root
                            variant="outline"
                            color="text.primary"
                            borderColor="semantic.success"
                            bg="theme.green.100"
                            rounded="xs"
                          >
                            <Tag.Label>{t("ui.verified")}</Tag.Label>
                          </Tag.Root>
                        </InputElement>
                      }
                    />
                  )}

                  {confirmationRequired && (
                    <Alert.Root
                      status={EFlashMessageStatus.warning}
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
                            components={{ 1: <Button variant="plain" onClick={handleResendConfirmationEmail} /> }}
                          />
                        ) : (
                          <Trans
                            i18nKey="user.confirmationRequired"
                            components={{ 1: <Button variant="plain" onClick={handleResendConfirmationEmail} /> }}
                          />
                        )}
                      </Text>
                    </Alert.Root>
                  )}
                  {isEditingEmail ? (
                    <>
                      <Separator my={4} />
                      <EmailFormControl showIcon label={t("user.newEmail")} fieldName="email" required />
                    </>
                  ) : (
                    <Button
                      variant="plain"
                      onClick={() => {
                        setIsEditingEmail(true)
                      }}
                    >
                      {t("user.changeEmail")}
                    </Button>
                  )}
                </>
              )}

              <Table.Root variant="simple">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>{t("user.notifications.event")}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t("user.notifications.enableNotification")}</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {events.map((event, index) => (
                    <EventRow key={index} {...event} />
                  ))}
                </Table.Body>
              </Table.Root>
            </Section>

            {!currentUser.isSuperAdmin && <UserEulas />}

            <Section>
              <Accordion.Root collapsible>
                <Accordion.Item border="none" value="item-0">
                  <Accordion.ItemTrigger px={0}>
                    <Heading as="h3" m={0}>
                      {t("user.closeAccountSectionTitle")}
                    </Heading>
                    <Accordion.ItemIndicator />
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent px={0} pt={2}>
                    <Accordion.ItemBody>
                      <Flex direction="column" gap={4}>
                        <Text>{t("user.closeAccountParagraph1" as any)}</Text>
                        <Text>{t("user.closeAccountParagraph2" as any)}</Text>
                        <Text>{t("user.closeAccountParagraph3" as any)}</Text>
                        <Checkbox.Root
                          onCheckedChange={(e) => setCloseAccountAcknowledged(e.target.checked)}
                          checked={closeAccountAcknowledged}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <Checkbox.Label>{t("user.closeAccountAcknowledge" as any)}</Checkbox.Label>
                        </Checkbox.Root>

                        <Button
                          colorPalette="red"
                          variant="outline"
                          alignSelf="flex-start"
                          loading={isArchiving}
                          loadingText={t("ui.loading")}
                          disabled={!closeAccountAcknowledged || isSubmitting || isArchiving}
                          onClick={handleArchiveMyAccount}
                        >
                          {t("user.archiveMyAccount" as any)}
                        </Button>
                      </Flex>
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </Accordion.Item>
              </Accordion.Root>
            </Section>

            <Flex as="section" gap={4} mt={4}>
              <Button variant="primary" type="submit" loading={isSubmitting} loadingText={t("ui.loading")}>
                {t("ui.save")}
              </Button>
              {!currentUser.isUnconfirmed && (
                <Button variant="secondary" disabled={isSubmitting} onClick={() => navigate(-1)}>
                  {t("ui.cancel")}
                </Button>
              )}
            </Flex>
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
}

const EventRow: React.FC<IEventRowProps> = ({ event, inAppControl, emailControl, inAppChecked, emailChecked }) => {
  const { control } = useFormContext()
  const { t } = useTranslation()

  return (
    <Table.Row>
      <Table.Cell w="45%">{event}</Table.Cell>
      <Table.Cell w="55%">
        <Flex gap={6} alignItems="center">
          {inAppControl ? (
            <Controller
              name={inAppControl}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Switch checked={value} onValueChange={onChange}>
                  {t("user.inApp")}
                </Switch>
              )}
            />
          ) : (
            <Switch checked={inAppChecked} disabled={true}>
              {t("user.inApp")}
            </Switch>
          )}

          {emailControl ? (
            <Controller
              name={emailControl}
              control={control}
              render={({ field: { onChange, value } }) => (
                <Switch checked={value} onValueChange={onChange}>
                  {t("user.email")}
                </Switch>
              )}
            />
          ) : (
            <Switch checked={emailChecked} disabled={true}>
              {t("user.email")}
            </Switch>
          )}
        </Flex>
      </Table.Cell>
    </Table.Row>
  )
}
