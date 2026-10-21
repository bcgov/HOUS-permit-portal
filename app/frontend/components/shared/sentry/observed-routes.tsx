import { setTag } from "@sentry/react"
import React, { useLayoutEffect } from "react"
import { createRoutesFromChildren, matchRoutes, Routes, RoutesProps, useLocation } from "react-router-dom"

export function ObservedRoutes(props: RoutesProps) {
  const location = useLocation()
  const matches = matchRoutes(createRoutesFromChildren(props.children), location)
  const template = matches
    ?.map((match) => match.route.path ?? "")
    .filter(Boolean)
    .join("/")
    .replace(/\/+/g, "/")
  const route =
    template && !template.includes("*") ? (template.startsWith("/") ? template : "/" + template) : "/[unknown]"
  useLayoutEffect(() => {
    setTag("route", route)
  }, [route])
  return <Routes {...props} />
}
