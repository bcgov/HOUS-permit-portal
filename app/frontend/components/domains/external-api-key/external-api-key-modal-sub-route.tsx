import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"
import { Key } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"
import { IExternalApiKey } from "../../../models/external-api-key"
import { useMst } from "../../../setup/root"
import { IExternalApiKeyParams } from "../../../types/api-request"
import { CopyableValue } from "../../shared/base/copyable-value"
import { DatePickerFormControl, TextFormControl, UrlFormControl } from "../../shared/form/input-form-control"

interface IProps {}

interface IExternalApiKeyForm extends IExternalApiKeyParams {
  revokedAt?: Date
}

const formFormDefaultValues = (externalApiKey?: IExternalApiKey): IExternalApiKeyForm => {
  return {
    name: externalApiKey?.name || "",
    expiredAt: externalApiKey?.expiredAt,
    webhookUrl: externalApiKey?.webhookUrl,
    revokedAt: externalApiKey?.revokedAt,
  }
}

export const ExternalApiKeyModalSubRoute = observer(function ExternalApiKeyModalSubRoute({}: IProps) {
  const { t } = useTranslation()
  const { externalApiKeyId } = useParams()
  const navigate = useNavigate()
  const { jurisdictionStore } = useMst()
  const { currentJurisdiction } = jurisdictionStore
  const externalApiKey = currentJurisdiction?.getExternalApiKey(externalApiKeyId)
  const formMethods = useForm<IExternalApiKeyForm>({
    defaultValues: formFormDefaultValues(externalApiKey),
  })
  const { handleSubmit, reset, formState } = formMethods
  const { isSubmitting, isValid } = formState
  const [showToken, setShowToken] = useState(false)
  const [token, setToken] = useState("")

  const onClose = () => {
    navigate(`/jurisdictions/${currentJurisdiction?.id}/external-api-keys`)
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
        : navigate(`/jurisdictions/${currentJurisdiction?.id}/external-api-keys/${updatedExternalApiKey.id}/edit`)
    }
  })

  return (
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <FormProvider {...formMethods}>
        <ModalContent as={"form"} maxW={"container.md"} onSubmit={onSubmit}>
          <ModalHeader>{t(`externalApiKey.modal.${externalApiKey ? "editTitle" : "createTitle"}`)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns={"1fr 1fr"} gap={6}>
              <GridItem>
                <TextFormControl label={t("externalApiKey.fieldLabels.name")} fieldName={"name"} required />
              </GridItem>
              <GridItem>
                <UrlFormControl label={t("externalApiKey.fieldLabels.webhookUrl")} fieldName={"webhookUrl"} validate />
              </GridItem>
              <GridItem>
                <DatePickerFormControl
                  inputProps={{ isClearable: true }}
                  label={t("externalApiKey.fieldLabels.expiredAt")}
                  fieldName={"expiredAt"}
                />
              </GridItem>
              <GridItem>
                <DatePickerFormControl
                  label={t("externalApiKey.fieldLabels.revokedAt")}
                  fieldName={"revokedAt"}
                  inputProps={{ readOnly: true }}
                  isReadOnly
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
                            overflow={"auto "}
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

          <ModalFooter>
            <HStack>
              <Button
                variant={"primary"}
                type={"submit"}
                isDisabled={isSubmitting || !isValid}
                isLoading={isSubmitting}
              >
                {t("ui.onlySave")}
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
