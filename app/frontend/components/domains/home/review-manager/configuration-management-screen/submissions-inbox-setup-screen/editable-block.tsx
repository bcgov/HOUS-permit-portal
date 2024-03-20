import { Alert, Box, Button, FormControl, FormLabel, HStack, Input, VStack } from "@chakra-ui/react"
import { Pencil, Plus, Warning } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useParams } from "react-router-dom"
import { useMst } from "../../../../../../setup/root"
import { generateUUID } from "../../../../../../utils/utility-functions"
import { EmailFormControl } from "../../../../../shared/form/email-form-control"
import { EditableBlockContainer, EditableBlockHeading } from "../shared/editable-block"
import { i18nPrefix } from "./i18n-prefix"

interface IProps {
  heading: string
  headingLabel: string
  permitTypeId: string
  fields: Record<"id", string>[]
  fieldArrayName: string
  append: any
  remove: any
  getIndex: (field: Record<"id", string>) => number
  reset: () => any
}

export const EditableBlock = observer(function SubmissionsInboxSetupEditableBlock({
  heading,
  headingLabel,
  permitTypeId,
  fields,
  fieldArrayName,
  reset,
  append,
  remove,
  getIndex,
}: IProps) {
  const [isEditing, setIsEditing] = useState(null)

  const { jurisdictionId } = useParams()
  const {
    jurisdictionStore: { getJurisdictionById },
  } = useMst()
  const jurisdiction = getJurisdictionById(jurisdictionId)

  const getPermitTypeSubmissionContact = jurisdiction?.getPermitTypeSubmissionContact

  const { formState, trigger, getValues } = useFormContext()
  const { errors, isSubmitting, isSubmitted } = formState

  const isValid = () => {
    // Check if the subset of fields for a particular index is valid
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
    append({ permitTypeId, email: null })
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

  return (
    <EditableBlockContainer>
      <FormControl flexBasis={"280px"} alignSelf="start">
        <FormLabel>{headingLabel}</FormLabel>
        <EditableBlockHeading>{heading}</EditableBlockHeading>
      </FormControl>
      <VStack flex={1} spacing={5} alignSelf="end">
        {fields.map((f, index) => {
          const trueIndex = getIndex(f)
          const contactId = getValues(`${fieldArrayName}.${trueIndex}.id`)
          const contact = contactId && getPermitTypeSubmissionContact && getPermitTypeSubmissionContact(contactId)

          return (
            <React.Fragment key={f.id || generateUUID()}>
              <Input type="hidden" name={`${fieldArrayName}.${trueIndex}.id`} value={contactId} />
              <Input type="hidden" name={`${fieldArrayName}.${trueIndex}.permitTypeId`} value={permitTypeId} />
              <HStack flex={1} w="full">
                <EmailFormControl
                  pos="relative"
                  label={t(`${i18nPrefix}.emailLabel`)}
                  fieldName={`${fieldArrayName}.${trueIndex}.email`}
                  inputProps={{ isDisabled: !isEditing }}
                  required={isEditing}
                  validate={isEditing}
                  handleRemove={() => remove(trueIndex)}
                  isRemovable={isEditing && fields.length > 1}
                  hideLabel={index !== 0}
                  showIcon
                />
                {!isEditing && contact && !contact.confirmedAt && (
                  <Alert
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
                    <Warning color="var(--chakra-colors-semantic-warning)" />
                    {t(`${i18nPrefix}.confirmationRequired`)}{" "}
                  </Alert>
                )}
              </HStack>
            </React.Fragment>
          )
        })}
        {isEditing && (
          <Button alignSelf="start" size="sm" variant="link" leftIcon={<Plus />} onClick={onAdd}>
            {t(`${i18nPrefix}.addEmail`)}
          </Button>
        )}
      </VStack>
      <Box alignSelf="start">
        <FormLabel visibility="hidden">PLACEHOLDER</FormLabel>
        {isEditing ? (
          <HStack>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting && isEditing}
              isDisabled={!isValid() || isSubmitting}
            >
              {t("ui.save")}
            </Button>
            <Button variant="secondary" onClick={handleClickCancel} isDisabled={isSubmitting}>
              {t("ui.cancel")}
            </Button>
          </HStack>
        ) : (
          <Button variant="primary" leftIcon={<Pencil />} onClick={() => setIsEditing(true)}>
            {t("ui.edit")}
          </Button>
        )}
      </Box>
    </EditableBlockContainer>
  )
})
