import React from "react"
import { IMeetingRequestDocument } from "../../../../../types/types"

export type MeetingRequestDocumentFormValue = Partial<IMeetingRequestDocument>

export interface SummarySectionProps {
  title: string
  sectionKey: string
  children: React.ReactNode
}
