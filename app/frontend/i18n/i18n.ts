import i18n from "i18next"
import { initReactI18next } from "react-i18next"

i18n.use(initReactI18next).init({
  resources: {
    /* English translations */
    en: {
      translation: {
        auth: {
          login: "Login",
          logout: "Logout",
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
          title: "Building Permit Hub",
          intro:
            "Co-created with a variety of pilot local jurisdictions for the people of B.C. to help create more homes faster.",
          easilyUpload: "Easily upload all your required building permitting information such as pdf files",
          bestPractices: "Get best-practices from  provincial and local jurisdictions",
          easyToFollow: "Easy to follow instructions of what is required for your building permit application",
          accessMyPermits: "Access My Housing Building Permits",
          accessExplanation:
            "Digital Building Permit Account uses the same or different login as BCeID. Need to explain this to users clearly what they’re logging in with.",
          whoForTitle: "Who is this for?",
          whoFor: [
            "I want to build a houseplex",
            "I want to build a small building on my property",
            "Industry professionals",
            "Building Permits in BC for Housing",
          ],
          iNeed: "What do I need?",
          whyUseTitle: "Why use this tool?",
          whyUse:
            "This is a housing building permitting tool pilot to help all communities in BC receive and process building permit applications faster and more efficiently.  This tool links into the single application portal for Provincial natural resource permits that may also be required for some housing building permit applications.",
          iNeedLong: "What do I need for a housing building permit?",
          reqsVary:
            "Permit requirements vary by local jurisdiction and depend on the geography of the surrounding location.",
          whereTitle: "Where",
          findAuthority: "Find your local building permitting authority.",
          locationOr: "Location or Civic Address",
          withinXRiver: "Within x km of a river",
          withinXForest: "Within x km of a forest",
          withinXProtected: "Within x km of a protected land",
          whatType: "What type of housing are you building?",
          dontSee: "Don't see the type that you're looking for?",
          whenNotNecessaryQ: "When is a permit not necessary?",
          whenNotNecessaryA:
            "Projects that are for the interior of your home, minor repairs. Things like fence, sheds may depend on local jurisdiction and geography.",
          expectQ: "What can I expect?",
          expectA: "After submitting your permit application through this tool, lorem ipsum dolor sit amet.",
          createdQ: "Why was this tool created?",
          createdA:
            "Becoming a North American leader of digital permitting and construction by digitally integrating permit systems and tools across the housing development sector across B.C. is a commitment of the 2023 Ministry of Housing Homes for People Plan.",
        },
        ui: {
          back: "Back",
          show: "Show",
          hide: "Hide",
          search: "Search",
          loading: "Loading...",
          invalidInput: "Invalid input",
          selectPlaceholder: "Select",
          selectApplicable: "Select applicable:",
          clickHere: "Click here",
          feedbackLink: "Tell us what you think",
        },
        localJurisdiction: {
          title: "Local Housing Permits",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          checklist: "Checklist",
          lookOut: "Things to look out for",
          startApplication: "Start a Permit Application",
          contactInfo: "Contact information",
          didNotFind: "I didn't find what I was looking for",
        },
        site: {
          navBarTitle: "Building Permit Hub",
          beta: "Beta",
          linkHome: "Navigate home",
          home: "Home",
          title: "Digital Permit Tool",
          description: "Lorem ipsum here is the site description",
          keywords: "BC, british columba, permit, portal, hub, permitting, permit application",
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
