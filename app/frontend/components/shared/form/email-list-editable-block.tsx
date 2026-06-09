import { Alert, Badge, Box, Button, FormControl, HStack, Input, VStack } from "@chakra-ui/react"
import { Pencil, Plus, Warning } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { ReactNode, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { generateUUID } from "../../../utils/utility-functions"
import {
  EditableBlockContainer,
  EditableBlockHeading,
} from "../../domains/home/review-manager/configuration-management-screen/shared/editable-block"
import { EmailFormControl } from "./email-form-control"

interface IEmailListItem {
  id?: string | null
  email?: string | null
  title?: string | null
  default?: boolean
  _destroy?: boolean
  confirmedAt?: string | null
}

interface IEmailListEditableBlockProps {
  heading?: ReactNode
  fields: Record<"id", string | null>[]
  fieldArrayName: string
  append: any
  remove: any
  update?: any
  getIndex: (field: Record<"id", string | null>) => number
  reset: () => void
  emailLabel: string
  addEmailLabel: string
  confirmationRequiredLabel?: string
  getItem?: (id: string) => IEmailListItem | undefined
  buildNewItem?: () => IEmailListItem
  buildDestroyedItem?: (item: IEmailListItem) => IEmailListItem
  showConfirmationWarning?: boolean
}

export const EmailListEditableBlock = observer(function EmailListEditableBlock({
  heading,
  fields,
  fieldArrayName,
  reset,
  append,
  remove,
  update,
  getIndex,
  emailLabel,
  addEmailLabel,
  confirmationRequiredLabel,
  getItem,
  buildNewItem,
  buildDestroyedItem,
  showConfirmationWarning,
}: IEmailListEditableBlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { formState, trigger, getValues } = useFormContext()
  const { t } = useTranslation()
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
    append(buildNewItem?.() ?? { email: null })
  }

  const onRemove = (index: number, item?: IEmailListItem) => {
    if (item && update && buildDestroyedItem) {
      const destroyedItem = buildDestroyedItem(item)
      update(index, destroyedItem)
    } else {
      remove(index)
    }
  }

  const onRestore = (index: number, item?: IEmailListItem) => {
    if (!item || !update) return

    update(index, item)
  }

  useEffect(() => {
    isSubmitted && setIsEditing(false)
  }, [isSubmitted])

  useEffect(() => {
    !isEditing && isSubmitted && reset()
  }, [isEditing])

  useEffect(() => {
    isEditing && trigger()
  }, [isEditing, fields.length])

  return (
    <EditableBlockContainer>
      {heading && (
        <FormControl flexBasis={"280px"} alignSelf="center">
          {typeof heading === "string" ? <EditableBlockHeading>{heading}</EditableBlockHeading> : heading}
        </FormControl>
      )}
      <VStack flex={1} spacing={5} alignSelf="center">
        {fields.map((f, index) => {
          const trueIndex = getIndex(f)
          const itemId = getValues(`${fieldArrayName}.${trueIndex}.id`)
          const isMarkedForDestruction = Boolean(getValues(`${fieldArrayName}.${trueIndex}._destroy`))
          const item = itemId && getItem ? getItem(itemId) : undefined
          return (
            <React.Fragment key={f.id || generateUUID()}>
              <Input type="hidden" name={`${fieldArrayName}.${trueIndex}.id`} value={itemId || ""} />
              <HStack
                flex={1}
                w="full"
                opacity={isMarkedForDestruction ? 0.65 : 1}
                bg={isMarkedForDestruction ? "semantic.errorLight" : undefined}
                borderColor={isMarkedForDestruction ? "semantic.error" : undefined}
                borderWidth={isMarkedForDestruction ? 1 : 0}
                borderRadius="md"
                p={isMarkedForDestruction ? 2 : 0}
              >
                <EmailFormControl
                  pos="relative"
                  label={emailLabel}
                  fieldName={`${fieldArrayName}.${trueIndex}.email`}
                  inputProps={{
                    isDisabled: !isEditing || isMarkedForDestruction,
                    textDecoration: isMarkedForDestruction ? "line-through" : undefined,
                  }}
                  required={isEditing}
                  validate={isEditing && !isMarkedForDestruction}
                  handleRemove={() => onRemove(trueIndex, item)}
                  isRemovable={isEditing && !isMarkedForDestruction}
                  hideLabel={index !== 0}
                  showIcon
                />
                {isEditing && isMarkedForDestruction && (
                  <HStack alignSelf="end" mb={1.5} spacing={2}>
                    <Badge colorScheme="red" variant="subtle">
                      {t("ui.markedForRemoval")}
                    </Badge>
                    <Button size="xs" variant="secondary" onClick={() => onRestore(trueIndex, item)}>
                      {t("ui.undo")}
                    </Button>
                  </HStack>
                )}
                {!isEditing && showConfirmationWarning && item && !item.confirmedAt && confirmationRequiredLabel && (
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
                    <Warning color="var(--chakra-colors-semantic-warning)" size={24} />
                    {confirmationRequiredLabel}{" "}
                  </Alert>
                )}
              </HStack>
            </React.Fragment>
          )
        })}
        {isEditing && (
          <Button alignSelf="start" size="sm" variant="link" leftIcon={<Plus />} onClick={onAdd}>
            {addEmailLabel}
          </Button>
        )}
      </VStack>
      <Box alignSelf="start">
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
