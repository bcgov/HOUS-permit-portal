import i18n from "i18next"
import { initReactI18next } from "react-i18next"

i18n.use(initReactI18next).init({
  resources: {
    /* English translations */
    en: {
      translation: {
        auth: {
          login: "Login",
          loginInstructions: "Enter the username for your Digital Building Permit Account below.",
          usernameLabel: "Username",
          emailLabel: "Email address",
          organizationLabel: "Organization (optional)",
          organizationHelpText: "Lorem Ipsum Organiation help text",
          passwordLabel: "Password",
          forgotPassword: "Forgot password?",
          register: "Register for account",
          registerButton: "Register",
          forgotPasswordInstructions:
            "Please fill in your username and we'll send instructions on how to reset your password to the email address associated to your account.",
          resetPassword: "Reset Password",
          registerInstructions:
            "Please fill out the following registration form to create your account. Ensure all information is accurate and up-to-date.",
          certifiedProfessional: "I am a certified professional",
          passwordTitle: "Set a Password",
          passwordRequirements:
            "Must be between 8 - 64 characters long, at least one uppercase, one lowercase, one special character, and one number.",
          alreadyHaveAccount: "Already have an account?",
          checkYourEmail: "Please check your email inbox for the confirmation email to activate your account.",
        },
        landing: {
          title: "Digital Building Permit Tool",
        },
        ui: {
          back: "Back",
          show: "Show",
          hide: "Hide",
          loading: "Loading...",
          invalidInput: "Invalid input",
        },
      },
    },
    // ... other languages
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
})

export default i18n
