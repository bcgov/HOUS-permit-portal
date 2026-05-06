import { InputGroup } from "@/components/ui/input-group"
import {
  Button,
  Dialog,
  Field,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  InputElement,
  Link,
  Portal,
} from "@chakra-ui/react"
import { Info, Key, Prohibit } from "@phosphor-icons/react"
import { addYears } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { IExternalApiKey } from "../../../models/external-api-key"
import { useMst } from "../../../setup/root"
import { IExternalApiKeyParams } from "../../../types/api-request"
import { CopyableValue } from "../../shared/base/copyable-value"
import { DatePickerFormControl, TextFormControl, UrlFormControl } from "../../shared/form/input-form-control"
import { RemoveConfirmationModal } from "../../shared/modals/remove-confirmation-modal"
import { SandboxSelect } from "../../shared/select/selectors/sandbox-select"

interface IProps {}

interface IExternalApiKeyForm extends IExternalApiKeyParams {
  revokedAt?: Date
}

const formFormDefaultValues = (externalApiKey?: IExternalApiKey): IExternalApiKeyForm => {
  return {
    name: externalApiKey?.name || "",
    connectingApplication: externalApiKey?.connectingApplication || "",
    expiredAt: externalApiKey?.expiredAt ?? addYears(new Date(), 2),
    webhookUrl: externalApiKey?.webhookUrl,
    revokedAt: externalApiKey?.revokedAt,
    notificationEmail: externalApiKey?.notificationEmail,
    sandboxId: externalApiKey?.sandboxId ?? null,
  }
}

export const ExternalApiKeyModalSubRoute = observer(function ExternalApiKeyModalSubRoute() {
  const { t } = useTranslation()
  const { externalApiKeyId } = useParams()
  const navigate = useNavigate()
  const { jurisdictionStore } = useMst()
  const { currentJurisdiction } = jurisdictionStore
  const externalApiKey = currentJurisdiction?.getExternalApiKey(externalApiKeyId)
  const formMethods = useForm<IExternalApiKeyForm>({
    defaultValues: formFormDefaultValues(externalApiKey),
  })
  const { handleSubmit, reset, formState, control } = formMethods
  const { isSubmitting, isValid } = formState
  const [showToken, setShowToken] = useState(false)
  const [token, setToken] = useState("")

  const onClose = () => {
    navigate(`/jurisdictions/${currentJurisdiction?.id}/api-settings`, { replace: true })
  }

  useEffect(() => {
    reset(formFormDefaultValues(externalApiKey))

    if (currentJurisdiction && externalApiKey) {
      ;(async () => {
        const apiKey = await currentJurisdiction.fetchExternalApiKey(externalApiKeyId)

        apiKey?.token && setToken(apiKey.token)
      })()
    }
  }, [currentJurisdiction, externalApiKey])

  const onSubmit = handleSubmit(async (data) => {
    const updatedExternalApiKey = externalApiKey
      ? await currentJurisdiction.updateExternalApiKey(externalApiKey.id, data)
      : await currentJurisdiction.createExternalApiKey(data)

    if (updatedExternalApiKey) {
      externalApiKey
        ? onClose()
        : navigate(`/jurisdictions/${currentJurisdiction?.id}/api-settings/${updatedExternalApiKey.id}/manage`)
    }
  })

  const onRevoke = async () => {
    if (!externalApiKey) {
      return
    }

    const updatedExternalApiKey = await currentJurisdiction.revokeExternalApiKey(externalApiKey.id)

    updatedExternalApiKey && onClose()
  }

  const sharedRevokeButtonProps = {
    color: "error",
    borderColor: "error",
  }
  const revokeButtonProps = {
    variant: "primaryInverse" as const,
    leftIcon: <Prohibit />,
    disabled: externalApiKey && externalApiKey.isRevoked,
    ...sharedRevokeButtonProps,
    _hover: {
      ...sharedRevokeButtonProps,
    },
    _active: {
      ...sharedRevokeButtonProps,
    },

    _focus: {
      ...sharedRevokeButtonProps,
    },
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(e) => {
        if (!e.open) {
          onClose()
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <FormProvider {...formMethods}>
          <Dialog.Positioner>
            <Dialog.Content maxW={"container.md"} asChild>
              <form onSubmit={onSubmit}>
                <Dialog.Header>
                  {t(`externalApiKey.modal.${externalApiKey ? "manageTitle" : "createTitle"}`)}
                </Dialog.Header>
                <Dialog.CloseTrigger />
                <Dialog.Body>
                  <Grid templateColumns={"1fr 1fr"} gap={6}>
                    <GridItem>
                      <TextFormControl label={t("externalApiKey.fieldLabels.name")} fieldName={"name"} required />
                    </GridItem>
                    <GridItem colSpan={2}>
                      <Field.Label>{t("externalApiKey.fieldLabels.sandbox")}</Field.Label>
                      <Controller
                        control={control}
                        name={"sandboxId"}
                        render={({ field: { onChange, value } }) => {
                          return (
                            <SandboxSelect
                              onChange={onChange}
                              value={value}
                              options={currentJurisdiction.sandboxOptions}
                              includeLive
                              disabled={!!externalApiKey}
                            />
                          )
                        }}
                      />
                    </GridItem>
                    <GridItem>
                      <TextFormControl
                        label={t("externalApiKey.fieldLabels.connectingApplication")}
                        fieldName={"connectingApplication"}
                        required
                      />
                    </GridItem>

                    <GridItem>
                      <DatePickerFormControl
                        label={t("externalApiKey.fieldLabels.expiredAt")}
                        fieldName={"expiredAt"}
                        required
                      />
                    </GridItem>
                    <GridItem>
                      <DatePickerFormControl
                        label={t("externalApiKey.fieldLabels.revokedAt")}
                        fieldName={"revokedAt"}
                        inputProps={{ readOnly: true }}
                        showOptional={false}
                        isReadOnly
                      />
                    </GridItem>

                    <GridItem colSpan={2}>
                      <UrlFormControl
                        label={t("externalApiKey.fieldLabels.webhookUrl")}
                        fieldName={"webhookUrl"}
                        LabelInfo={() => (
                          <IconButton mb={1} minW={6} variant={"tertiary"} aria-label={"Webhook Url info link"} asChild>
                            <Link
                              // TODO: Placeholder generic help link for now. Replace with actual link when available
                              href={`https://www2.gov.bc.ca/gov/content?id=A5A88A4CE1D54D95AB23D57858EF11EE`}
                              target={"_blank"}
                            >
                              <Info />
                            </Link>
                          </IconButton>
                        )}
                        inputProps={{ placeholder: t("externalApiKey.fieldPlaceholders.webhookUrl") }}
                        validate
                      />
                    </GridItem>
                    <GridItem colSpan={2}>
                      <TextFormControl
                        label={t("externalApiKey.fieldLabels.notificationEmail")}
                        fieldName={"notificationEmail"}
                        inputProps={{
                          type: "email",
                        }}
                        hint={t("externalApiKey.notificationEmailHint")}
                      />
                    </GridItem>
                    <GridItem colSpan={2}>
                      <Field.Root readOnly>
                        <Field.Label>{t("externalApiKey.fieldLabels.token")}</Field.Label>
                        <CopyableValue
                          CustomDisplay={({ value }) => (
                            <>
                              <InputGroup>
                                <InputElement>
                                  <Key />
                                </InputElement>
                                <Input
                                  overflow={"auto"}
                                  type={showToken ? "text" : "password"}
                                  bg={"greys.grey04"}
                                  value={value}
                                />
                              </InputGroup>
                              <Button
                                px={4}
                                size={"sm"}
                                fontSize={"sm"}
                                variant="plain"
                                onClick={() => setShowToken((pastState) => !pastState)}
                                disabled={!externalApiKey}
                              >
                                {showToken ? t("ui.hide") : t("ui.show")}
                              </Button>
                            </>
                          )}
                          value={token ?? ""}
                          label={t("externalApiKey.fieldLabels.token")}
                          iconButtonProps={{ isDisabled: !externalApiKey }}
                        />
                      </Field.Root>
                    </GridItem>
                  </Grid>
                </Dialog.Body>
                <Dialog.Footer justifyContent={externalApiKey ? "space-between" : undefined}>
                  {externalApiKey && (
                    <RemoveConfirmationModal
                      title={t("externalApiKey.modal.removeConfirmationModal.title")}
                      body={t("externalApiKey.modal.removeConfirmationModal.body")}
                      triggerButtonProps={revokeButtonProps}
                      triggerText={t("ui.revoke")}
                      onRemove={onRevoke}
                    />
                  )}
                  <HStack>
                    <Button
                      variant={"primary"}
                      type={"submit"}
                      disabled={isSubmitting || !isValid}
                      loading={isSubmitting}
                    >
                      {externalApiKey ? t("ui.onlySave") : t("ui.create")}
                    </Button>
                    <Button variant={"secondary"} onClick={onClose} disabled={isSubmitting}>
                      {t("ui.cancel")}
                    </Button>
                  </HStack>
                </Dialog.Footer>
              </form>
            </Dialog.Content>
          </Dialog.Positioner>
        </FormProvider>
      </Portal>
    </Dialog.Root>
  )
})
