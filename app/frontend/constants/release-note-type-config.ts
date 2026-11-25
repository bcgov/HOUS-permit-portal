import { Code, FileText } from "@phosphor-icons/react"
import React from "react"
import { EReleaseNoteType } from "../types/enums"

export type TReleaseNoteTypeField = "version" | "name" | "releaseNotesUrl"

type TReleaseNoteTypeBadgeIcon = React.ComponentType<{ size?: number | string; weight?: string }>

export type TReleaseNoteTypeConfig = {
  fields: readonly TReleaseNoteTypeField[]
  showVersionPrefix: boolean
  badge: {
    bg: string
    color: string
    Icon: TReleaseNoteTypeBadgeIcon
  }
}

/**
 * Extension point for release note types on the client.
 * Adding a type: add an enum value, an entry here, i18n keys, and matching
 * release_type + validations on the server.
 * Screens/forms/badges should read this map instead of switching on type.
 */
export const RELEASE_NOTE_TYPE_CONFIG: Record<EReleaseNoteType, TReleaseNoteTypeConfig> = {
  [EReleaseNoteType.software]: {
    fields: ["version", "releaseNotesUrl"],
    showVersionPrefix: true,
    badge: {
      bg: "semantic.infoLight",
      color: "semantic.info",
      Icon: Code,
    },
  },
  [EReleaseNoteType.content]: {
    fields: ["name"],
    showVersionPrefix: false,
    badge: {
      bg: "semantic.specialLight",
      color: "semantic.special",
      Icon: FileText,
    },
  },
}

export const RELEASE_NOTE_TYPES = Object.values(EReleaseNoteType)
