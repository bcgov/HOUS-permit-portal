import { EMeetingRequestDocumentType } from "../../../../../types/enums"
import { MeetingRequestDocumentFormValue } from "./types"

const getDocumentType = (document: MeetingRequestDocumentFormValue) =>
  document.documentType || EMeetingRequestDocumentType.supporting

export const documentsForType = (
  documents: MeetingRequestDocumentFormValue[],
  documentType: EMeetingRequestDocumentType
) => documents.filter((document) => getDocumentType(document) === documentType)

export const activeDocumentsForType = (
  documents: MeetingRequestDocumentFormValue[],
  documentType: EMeetingRequestDocumentType
) => documentsForType(documents, documentType).filter((document) => !document._destroy)
