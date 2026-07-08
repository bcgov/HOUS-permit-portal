import { EMeetingRequestDocumentType } from "../../../../../types/enums"
import { MeetingRequestDocumentFormValue } from "./types"

const getDocumentType = (document: MeetingRequestDocumentFormValue) =>
  document.documentType || EMeetingRequestDocumentType.supporting

export const activeDocumentsForType = (
  documents: MeetingRequestDocumentFormValue[],
  documentType: EMeetingRequestDocumentType
) => documents.filter((document) => !document._destroy && getDocumentType(document) === documentType)
