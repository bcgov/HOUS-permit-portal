import { format } from "date-fns"
import React from "react"
import { datefnsTableDateTimeFormat } from "../../../../constants"

export const FormattedDateTime = ({ date }: { date?: Date | null }) => {
  if (!date) return null

  return <>{format(date, datefnsTableDateTimeFormat)}</>
}
