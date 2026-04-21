import { FormControl, FormLabel, HStack } from "@chakra-ui/react"
import { format, parse } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { datefnsAppDateFormat } from "../../../constants"
import { IProjectAuditStore } from "../../../stores/project-audit-store"
import { DatePicker } from "../../shared/date-picker"

interface IProps {
  searchModel: IProjectAuditStore
}

function parseOptionalDate(value: string | null | undefined): Date | null {
  if (!value) return null
  try {
    const d = parse(value, datefnsAppDateFormat, new Date())
    return isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

export const AuditDateRangeFilter = observer(function AuditDateRangeFilter({ searchModel }: IProps) {
  const { t } = useTranslation()
  const fromStore = parseOptionalDate(searchModel.fromFilter)
  const toStore = parseOptionalDate(searchModel.toFilter)

  const [fromDate, setFromDate] = useState<Date | null>(() => fromStore)
  const [toDate, setToDate] = useState<Date | null>(() => toStore)

  useEffect(() => {
    setFromDate(fromStore)
    setToDate(toStore)
  }, [searchModel.fromFilter, searchModel.toFilter])

  const handleFromChange = (date: Date | null) => {
    setFromDate(date)
    searchModel.setFromFilter(date ? format(date, datefnsAppDateFormat) : null)
    searchModel.search()
  }

  const handleToChange = (date: Date | null) => {
    setToDate(date)
    searchModel.setToFilter(date ? format(date, datefnsAppDateFormat) : null)
    searchModel.search()
  }

  return (
    <HStack spacing={4}>
      <FormControl>
        <FormLabel htmlFor="audit-date-from">{t("permitProject.activity.fromFilter")}</FormLabel>
        <DatePicker
          id="audit-date-from"
          selected={fromDate}
          onChange={handleFromChange}
          selectsStart
          startDate={fromDate}
          endDate={toDate}
          isClearable
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="audit-date-to">{t("permitProject.activity.toFilter")}</FormLabel>
        <DatePicker
          id="audit-date-to"
          selected={toDate}
          onChange={handleToChange}
          selectsEnd
          startDate={fromDate}
          endDate={toDate}
          minDate={fromDate ?? undefined}
          isClearable
        />
      </FormControl>
    </HStack>
  )
})
