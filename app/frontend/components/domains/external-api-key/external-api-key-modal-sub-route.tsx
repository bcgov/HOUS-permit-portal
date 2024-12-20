import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
    sandboxId: null,
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
    navigate(`/jurisdictions/${currentJurisdiction?.id}/api-settings`)
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
    variant: "primaryInverse",
    leftIcon: <Prohibit />,
    isDisabled: externalApiKey && externalApiKey.isRevoked,
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
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <FormProvider {...formMethods}>
        <ModalContent as={"form"} maxW={"container.md"} onSubmit={onSubmit}>
          <ModalHeader>{t(`externalApiKey.modal.${externalApiKey ? "manageTitle" : "createTitle"}`)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns={"1fr 1fr"} gap={6}>
              <GridItem>
                <TextFormControl label={t("externalApiKey.fieldLabels.name")} fieldName={"name"} required />
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
                    <IconButton
                      as={Link}
                      // TODO: Placeholder generic help link for now. Replace with actual link when available
                      href={`https://www2.gov.bc.ca/gov/content?id=A5A88A4CE1D54D95AB23D57858EF11EE`}
                      target={"_blank"}
                      mb={1}
                      minW={6}
                      variant={"tertiary"}
                      aria-label={"Webhook Url info link"}
                      icon={<Info />}
                    />
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
                <FormLabel>{t("externalApiKey.fieldLabels.sandbox")}</FormLabel>
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
                        isDisabled={!!externalApiKey}
                      />
                    )
                  }}
                />
              </GridItem>
              <GridItem colSpan={2}>
                <FormControl isReadOnly>
                  <FormLabel>{t("externalApiKey.fieldLabels.token")}</FormLabel>
                  <CopyableValue
                    CustomDisplay={({ value }) => (
                      <>
                        <InputGroup>
                          <InputLeftElement>
                            <Key />
                          </InputLeftElement>
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
                          variant="link"
                          onClick={() => setShowToken((pastState) => !pastState)}
                          isDisabled={!externalApiKey}
                        >
                          {showToken ? t("ui.hide") : t("ui.show")}
                        </Button>
                      </>
                    )}
                    value={token ?? ""}
                    label={t("externalApiKey.fieldLabels.token")}
                    iconButtonProps={{ isDisabled: !externalApiKey }}
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </ModalBody>

          <ModalFooter justifyContent={externalApiKey ? "space-between" : undefined}>
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
                isDisabled={isSubmitting || !isValid}
                isLoading={isSubmitting}
              >
                {externalApiKey ? t("ui.onlySave") : t("ui.create")}
              </Button>
              <Button variant={"secondary"} onClick={onClose} isDisabled={isSubmitting}>
                {t("ui.cancel")}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </FormProvider>
    </Modal>
  )
})
