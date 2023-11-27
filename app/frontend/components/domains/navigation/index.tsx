import { Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"
import { ForgotPasswordScreen } from "../authentication/forgot-password-screen"
import { LoginScreen } from "../authentication/login-screen"
import { RegisterScreen } from "../authentication/register-screen"

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
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/" element={<Heading>Housing Permit Portal!</Heading>} />
    </Routes>
  )
})
