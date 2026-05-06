import { Alert, Box, Button, Field, HStack, Input, VStack } from "@chakra-ui/react"
import { Pencil, Plus, Warning } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { ISubmissionContact } from "../../../../../../types/types"
import { generateUUID } from "../../../../../../utils/utility-functions"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { EmailFormControl } from "../../../../../shared/form/email-form-control"
import { EditableBlockContainer, EditableBlockHeading } from "../shared/editable-block"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  heading?: string | null
  fields: Record<"id", string | null>[]
  fieldArrayName: string
  append: any
  remove: any
  update: any
  getIndex: (field: Record<"id", string | null>) => number
  reset: () => any
}

export const EditableBlock = observer(function SubmissionsInboxSetupEditableBlock({
  heading,
  fields,
  fieldArrayName,
  reset,
  append,
  remove,
  update,
  getIndex,
}: IProps) {
  const [isEditing, setIsEditing] = useState(null)
  const { currentJurisdiction, error } = useJurisdiction()

  const getSubmissionContact = currentJurisdiction?.getSubmissionContact

  const { formState, trigger, getValues } = useFormContext()
  const { errors, isSubmitting, isSubmitted } = formState

  const isValid = () => {
    return (
      isEditing &&
      R.all((f) => {
        const index = getIndex(f)
        const itemErrors = errors[fieldArrayName] && errors[fieldArrayName][index]?.email
        return !itemErrors
      }, fields)
    )
  }

  const handleClickCancel = () => {
    reset()
    setIsEditing(false)
  }

  const onAdd = () => {
    append({ id: null, email: null, title: null, default: false })
  }

  const onRemove = (index: number, contact?: ISubmissionContact) => {
    if (contact) {
      update(index, { _destroy: true, id: contact.id })
    } else {
      remove(index)
    }
  }

  useEffect(() => {
    isSubmitted && setIsEditing(false)
  }, [isSubmitted])

  useEffect(() => {
    !!!isEditing && isSubmitted && reset()
  }, [isEditing])

  useEffect(() => {
    isEditing && trigger()
  }, [isEditing, fields.length])

  return error ? (
    <ErrorScreen error={error} />
  ) : (
    <EditableBlockContainer>
      {heading && (
        <Field.Root flexBasis={"280px"} alignSelf="center">
          <EditableBlockHeading>{heading}</EditableBlockHeading>
        </Field.Root>
      )}
      <VStack flex={1} gap={5} alignSelf="center">
        {fields.map((f, index) => {
          const trueIndex = getIndex(f)
          const contactId = getValues(`${fieldArrayName}.${trueIndex}.id`)
          const contact = contactId && getSubmissionContact && getSubmissionContact(contactId)
          return (
            <React.Fragment key={f.id || generateUUID()}>
              <Input type="hidden" name={`${fieldArrayName}.${trueIndex}.id`} value={contactId || ""} />
              <HStack flex={1} w="full">
                <EmailFormControl
                  pos="relative"
                  label={t(`${i18nPrefix}.emailLabel`)}
                  fieldName={`${fieldArrayName}.${trueIndex}.email`}
                  inputProps={{ disabled: !isEditing }}
                  required={isEditing}
                  validate={isEditing}
                  handleRemove={() => onRemove(trueIndex, contact)}
                  isRemovable={isEditing}
                  hideLabel={index !== 0}
                  showIcon
                />
                {!isEditing && contact && !contact.confirmedAt && (
                  <Alert.Root
                    status="warning"
                    rounded="lg"
                    borderWidth={1}
                    borderColor="semantic.warning"
                    bg="semantic.warningLight"
                    gap={2}
                    color="text.primary"
                    fontSize="xs"
                    alignSelf="end"
                    py={1}
                    px={2}
                    mb={1.5}
                  >
                    <Warning color="var(--chakra-colors-semantic-warning)" size={24} />
                    {t(`${i18nPrefix}.confirmationRequired`)}{" "}
                  </Alert.Root>
                )}
              </HStack>
            </React.Fragment>
          )
        })}
        {isEditing && (
          <Button alignSelf="start" size="sm" variant="plain" onClick={onAdd}>
            <Plus />
            {t(`${i18nPrefix}.addEmail`)}
          </Button>
        )}
      </VStack>
      <Box alignSelf="start">
        {isEditing ? (
          <HStack>
            <Button
              variant="primary"
              type="submit"
              loading={isSubmitting && isEditing}
              disabled={!isValid() || isSubmitting}
            >
              {t("ui.save")}
            </Button>
            <Button variant="secondary" onClick={handleClickCancel} disabled={isSubmitting}>
              {t("ui.cancel")}
            </Button>
          </HStack>
        ) : (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            <Pencil />
            {t("ui.edit")}
          </Button>
        )}
      </Box>
    </EditableBlockContainer>
  )
})
