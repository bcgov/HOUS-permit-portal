import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionItemProps,
  AccordionPanel,
  Box,
  Heading,
  Stack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { forwardRef } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EDocumentReferenceDocumentType } from "../../../../../types/enums"
import { IDocumentReference } from "../../../../../types/types"
import { DatePickerFormControl, TextFormControl } from "../../../../shared/form/input-form-control"

const i18nPrefix = "stepCode.part3.documentReferences"

type TDefaultDocumentType = Exclude<EDocumentReferenceDocumentType, "other">

interface IDocumentReferenceStepCodeForm {
  defaultDocumentReferencesAttributes: (Exclude<IDocumentReference, "documentType"> & {
    documentType: TDefaultDocumentType
  })[]
  otherDocumentReferencesAttributes: (Exclude<IDocumentReference, "documentType"> & {
    documentType: EDocumentReferenceDocumentType.other
  })[]
}

function initializeDocumentReferenceForm(
  documentReferencesAttributes: IDocumentReference[] | undefined
): IDocumentReferenceStepCodeForm {
  const otherDocumentReferencesAttributes = (documentReferencesAttributes
    ?.filter((documentReference) => documentReference.documentType === EDocumentReferenceDocumentType.other)
    ?.map((documentReference) => ({
      ...documentReference,
      dateIssued:
        typeof documentReference?.dateIssued === "number"
          ? new Date(documentReference?.dateIssued)
          : documentReference?.dateIssued,
    })) ?? []) as IDocumentReferenceStepCodeForm["otherDocumentReferencesAttributes"]
  const defaultDocumentReferencesAttributes: IDocumentReferenceStepCodeForm["defaultDocumentReferencesAttributes"] =
    Object.values(EDocumentReferenceDocumentType)
      .filter((documentType) => documentType !== EDocumentReferenceDocumentType.other)
      .map((documentType) => {
        const existingDocumentReference = documentReferencesAttributes?.find(
          (documentReference) => documentReference.documentType === documentType
        )
        return {
          ...(existingDocumentReference ?? {}),
          documentType,
          dateIssued:
            typeof existingDocumentReference?.dateIssued === "number"
              ? new Date(existingDocumentReference?.dateIssued)
              : existingDocumentReference?.dateIssued,
        }
      })

  return {
    defaultDocumentReferencesAttributes,
    otherDocumentReferencesAttributes,
  }
}

export const DocumentReferences = observer(function DocumentaReferences() {
  const { t } = useTranslation()
  const formMethods = useForm<IDocumentReferenceStepCodeForm>({
    mode: "onChange",
    defaultValues: initializeDocumentReferenceForm(undefined),
  })
  const { fields: defaultDocumentReferencesAttributes } = useFieldArray({
    control: formMethods.control,
    name: "defaultDocumentReferencesAttributes",
  })

  return (
    <Stack direction="column" w="full">
      <Heading as="h2" fontSize="2xl" variant="yellowline">
        {t(`${i18nPrefix}.heading`)}
      </Heading>

      <FormProvider {...formMethods}>
        <Stack as="form" spacing={7} mt={3}>
          <Accordion as={Stack} spacing={2} allowToggle allowMultiple>
            {defaultDocumentReferencesAttributes.map((field, index) => (
              <DocumentReferenceAccordionItem key={field.id} documentType={field.documentType} index={index} />
            ))}
          </Accordion>
        </Stack>
      </FormProvider>
    </Stack>
  )
})

interface IDocumentReferenceAccordionItemProps extends AccordionItemProps {
  documentType: TDefaultDocumentType
  index: number
}

/**
 * An accordion item component that displays document reference content.
 * @component
 */
export const DocumentReferenceAccordionItem = observer(
  forwardRef<HTMLDivElement, IDocumentReferenceAccordionItemProps>(function DocumentReferenceAccordionItem(
    { documentType, index, ...props },
    ref
  ) {
    const { t } = useTranslation()

    const datePickerPortalId = `datePickerPortal-${documentType}`

    return (
      <AccordionItem border="none" ref={ref} {...props}>
        <h3>
          <AccordionButton background={"greys.grey04"} borderTopRadius={"lg"} px={6}>
            <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
              {t(`${i18nPrefix}.documentTypes.${documentType}`)}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h3>
        <AccordionPanel as={Stack} spacing={8} px={6} pt={4} pb={"1.8rem"}>
          <TextFormControl
            maxW={"26.875rem"}
            fieldName={`defaultDocumentReferencesAttributes.${index}.documentName`}
            label={t(`${i18nPrefix}.documentFields.documentName`)}
            showOptional={false}
            required
          />

          {/* The date picker portal is needed to ensure the date picker is not cut off by the accordion */}
          <Box id={datePickerPortalId}>
            <DatePickerFormControl
              fieldName={`defaultDocumentReferencesAttributes.${index}.dateIssued`}
              label={t(`${i18nPrefix}.documentFields.dateIssued`)}
              showOptional={false}
              inputProps={{
                portalId: datePickerPortalId,
                isClearable: true,
              }}
              maxW={"12.5rem"}
              required
            />
          </Box>
          <TextFormControl
            maxW={"26.875rem"}
            fieldName={`defaultDocumentReferencesAttributes.${index}.preparedBy`}
            label={t(`${i18nPrefix}.documentFields.preparedBy`)}
            showOptional={false}
            required
          />
        </AccordionPanel>
      </AccordionItem>
    )
  })
)
