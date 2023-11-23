import { Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"

export const Navigation = observer(() => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
})

interface IAppRoutesProps {}

const AppRoutes = observer(({}: IAppRoutesProps) => {
  const location = useLocation()

  return (
    <Routes location={location}>
      <Route path="/" element={<Heading>Housing Permit Portal!</Heading>} />
    </Routes>
  )
})
