import i18n from "i18next"
import { initReactI18next } from "react-i18next"

export const defaultNS = "translation"
export const fallbackNS = "translation"

const options = {
  resources: {
    /* English translations */
    en: {
      translation: {
        auth: {
          login: "Login",
          logout: "Logout",
          submit: "Submit",
          or: "or",
          bceid_login: "Login with BCeID",
          accept_invite_with_bceid: "Connect with BCeID",
          role: "Role",
          loginInstructions: "Enter the username for your Digital Building Permit Account below.",
          usernameLabel: "Username",
          emailLabel: "Email address",
          userFirstNameLabel: "First Name",
          userLastNameLabel: "Last Name",
          organizationLabel: "Organization (optional)",
          organizationHelpText: "Lorem Ipsum Organiation help text",
          passwordLabel: "Password",
          forgotPassword: "Forgot password?",
          passwordTooWeak: "Password too weak",
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
          yes: "Yes",
          no: "No",
          show: "Show",
          hide: "Hide",
          change: "Change",
          search: "Search",
          loading: "Loading...",
          invalidInput: "Invalid input",
          invalidEmail: "Invalid email",
          selectPlaceholder: "Select",
          selectApplicable: "Select applicable:",
          clickHere: "Click here",
          clickToEdit: "Click to edit",
          clickToShow: "Click to show",
          feedbackLink: "Tell us what you think",
          sortBy: "Sort by",
          resume: "Resume",
          cancel: "Cancel",
          remove: "Remove",
          save: "Save Changes",
          onlySave: "Save",
          done: "Done",
          manage: "Manage",
          view: "View",
          totalItems: "Total Items",
          doLater: "Do this later",
          add: "Add",
          edit: "Edit",
          optional: "(optional)",
          archive: "Remove and Archive",
          restore: "Restore",
          seeArchivedButton: "See Archived",
          seeUnarchivedButton: "See Unarchived",
          never: "never",
          submit: "Submit",
          select: "Select",
          notAvailable: "Not available yet",
          isRequired: "{{field}} is required",
          use: "Use",
          publish: "Publish",
          neverMind: "Never mind",
          download: "Download",
          expandAll: "Expand all",
          collapseAll: "Collapse all",
          toTop: "Go to top",
          asc: "Ascending",
          desc: "Descending",
          returnHome: "Return to home",
        },
        contact: {
          fields: {
            name: "Name",
            title: "Title",
            department: "Department",
            email: "Email",
            phoneNumber: "Phone no.",
            extension: "Extension",
          },
        },
        jurisdiction: {
          edit: {
            displayDescriptionLabel: "Jurisdiction Description (public)",
            addDescription: "Click to add a description",
            displayChecklistLabel: "Permit Application Checklist (public)",
            addChecklist: "Click to add a permit application checklist",
            displayLookOutLabel: '"Look Out" Section (public)',
            addLookOut: 'Click to add a "Look Out" section',
            displayContactSummaryLabel: "Contact Summary Section (public)",
            addContactSummary: "Click to add a Contact Summary section",
            clickToEditContacts: "Click to edit contacts",
            clickToShowContacts: "Click to show contacts as they will be seen",
            clickToEditMap: "Click to edit map coordinates",
            clickToShowMap: "Click to show map as it will be seen",
          },
          new: {
            title: "Create New Jurisdiction",
            createButton: "Create Jurisdiction",
            nameLabel: "Name of local jurisdiction",
            nextStep: "The next step is to invite users",
          },
          index: {
            title: "Manage Jurisdictions",
            description: "Below is a list of all jurisdictions in the system",
            createButton: "Create New Jurisdiction",
            tableHeading: "Local Governments",
            users: "Users",
            about: "About",
          },
          fields: {
            reverseQualifiedName: "Name",
            reviewManagersSize: "Managers",
            reviewersSize: "Reviewers",
            localityType: "Locality Type",
            permitApplicationsSize: "Applications Received",
            templatesUsed: "Templates Used",
            mapPosition: "Map position",
          },
          lat: "Latitude",
          lng: "Longitude",
          title: "Local Housing Permits",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          checklist: "Checklist",
          lookOut: "Things to look out for",
          startApplication: "Start a Permit Application",
          contactInfo: "Contact information",
          didNotFind: "I didn't find what I was looking for",
          viewAs: "View As",
          name: "Name",
          managers: "Managers",
          reviewers: "Reviewers",
          applicationsReceived: "Applications Received",
          templatesUsed: "Templates Used",
        },
        permitApplication: {
          indexTitle: "My Active Permits",
          start: "Start a Permit Application",
          drafts: "Draft Permits",
          startedOn: "Started on",
          lastUpdated: "Last updated",
          seeBestPracticesLink: "See best practices for",
          ask: "Ask a question",
          pidLabel: "Parcel Identification (PID) No.",
          addressLabel: "Address",
          columns: {
            number: "Application #",
            permit_classification: "Types",
            submitter: "Submitter",
            submitted_at: "Submitted At",
            status: "Status",
          },
          submissionInbox: {
            title: "Submissions Inbox",
            tableHeading: "Permit Applications",
            submissionsSentTo: "All submissions are sent to: {{email}}",
          },
          fields: {
            number: "Application #",
          },
          new: {
            locationHeading: "Location for permit",
            permitTypeHeading: "Permit type",
            workTypeHeading: "Work Type",
            submitted: "Your application has been submitted",
            hearBack: "If you don't hear back by Lorem days,",
            contactInstruction:
              "here are instructions of what to do and the local government building permit to contact. Instruction text here lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            whatsNextTitle: "What's next?",
            ready: "Ready to submit this application?",
            bySubmitting: "By submitting this application",
            confirmation: "Lorem ipsum submitting blah de blah filler lorem",
            yourReference: "For reference, your BC Building Permit Hub Application # is {{ number }}",
            whatsNext:
              "Lorem ipsum what to expext next. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
            emailed:
              "A confirmation email has also been sent to the applicant and {{ jurisdictionName }}'s building permit office",
          },
          edit: {
            saveDraft: "Save and finish later",
            submit: "Submit application",
            permit: "Permit",
            fullAddress: "Full Address",
            pidPin: "PID / PIN",
          },
        },
        requirementsLibrary: {
          associationsInfo: "Sections, tags, etc...",
          index: {
            title: "Requirements Library",
            description: "List of all Requirement Blocks in the system that can be used inside Templates.",
            tableHeading: "Requirement Blocks",
            createButton: "Create New Requirement Block",
          },
          fieldsDrawer: {
            formFields: "Form Fields",
            useButton: "Use",
            dummyOption: "Option",
          },
          modals: {
            displayDescriptionLabel: "Instruction/Description (public)",
            addDescriptionTrigger: "Add instructions/description for this block",
            create: {
              triggerButton: "Create New Requirement Block",
              title: "New Requirement Block",
            },
            edit: {
              title: "Edit Requirement Block",
            },
            clickToWriteDisplayName: "Click to write display name",
            blockSetupTitle: "Block Setup",
            internalUse: "For internal use only",
            configureFields: "Configure the form fields below that submitters will see:",
            noFormFieldsAdded: "No form fields have been added yet, start by clicking the Add button.",
            defaultRequirementLabel: "Label",
            addHelpText: "Add help text",
            helpTextPlaceHolder: "Help text",
            optionalForSubmitters: "This field is optional for submitters",
            optionsMenu: {
              triggerButton: "Options",
              remove: "Remove",
              conditionalLogic: "Conditional Logic",
              dataValidation: "Data Validation",
            },
            addOptionButton: "Add another option",
            editWarning: "Any changes made here will be reflected in all templates that use this requirement block.",
          },
          fields: {
            name: "Name",
            description: "Description",
            associations: "Associations",
            formFields: "Form Fields",
            updatedAt: "Updated At",
            requirementSku: "Requirement SKU",
          },
          fieldDescriptions: {
            description: "Provide some context for admins and managers for this fieldset.",
            associations: "Assign a tag to help organize and find this requirement block easier.",
            requirementSku: "Generated unique identifier",
          },
          requirementTypeLabels: {
            shortText: "Short Text",
            address: "Address",
            date: "Date",
            number: "Number",
            textArea: "Text Area",
            radio: "Select Radio Options",
            multiSelectCheckbox: "Multi-Select Checkboxes",
            select: "Single Select Dropdown",
            signature: "Signature",
            generalContact: "General Contact",
            fileUpload: "File Upload",
            phone: "Phone",
            email: "E-mail",
          },
          descriptionMaxLength: "(Max length: 250 characters)",
          unitLabels: {
            option: {
              noUnit: "(no unit)",
              mm: "mm - millimeters",
              cm: "cm- centimeters",
              m: "m - meters",
              in: "in - inches",
              ft: "ft - feet",
              mi: "mi - miles",
              sqm: "sqm - sq meters",
              sqft: "sqft - sq feet",
            },
            display: {
              noUnit: "(no unit)",
              mm: "millimeters (mm)",
              cm: "centimeters (cm)",
              m: "meters (m)",
              in: "inches (in)",
              ft: "feet (ft)",
              mi: "miles (mi)",
              sqm: "sq meters (sqm)",
              sqft: "sq feet (sqft)",
            },
          },
        },
        home: {
          jurisdictionsTitle: "Jurisdictions",
          jurisdictionsDescription: "Invite or remove Managers or Reviewers in the Building Permit Hub System.",
          permitTemplateCatalogueTitle: "Permit Templates Catalogue",
          permitTemplateCatalogueDescription:
            "Create and manage permit templates for each permit type that Local Gov can use as a standardized base.",
          requirementsLibraryTitle: "Requirements Library",
          requirementsLibraryDescription:
            "Create and manage requirement blocks that can be used inside of permit templates.",
          contentManagementTitle: "Content Management",
          contentManagementDescription: "Customize content in one centralized place.",
          superAdminTitle: "Admin Home",
          submissionsInboxTitle: "Submissions Inbox",
          submissionsInboxDescription: "View all submitted building permit applications.",
          permitsTitle: "Digital Building Permits",
          permitsDescription:
            "Control what permit types you want available for submitters to apply with on BC Building Permit Hub.",
          userManagementTitle: "User Management",
          userManagementDescription: "Invite or remove Managers or Reviewers in the Building Permit Hub System.",
          auditLogTitle: "Audit Log",
        },
        admin: {},
        errors: {
          fetchJurisdiction: "Something went wrong fetching the jurisdiction",
          fetchPermitApplication: "Something went wrong fetching the permit application",
          fetchRequirementTemplate: "Something went wrong fetching the requirement template",
          fetchOptions: "Something went wrong fetching options",
        },
        user: {
          fields: {
            role: "Role",
            email: "Email",
            name: "Name",
            createdAt: "Date Added",
            lastSignIn: "Last Sign In",
          },
          index: {
            tableHeading: "User Accounts",
            inviteButton: "Invite users",
          },
          changeRole: "Change Role",
          addUser: "Add more emails",
          invite: "Invite",
          firstName: "First Name",
          lastName: "Last Name",
          oldPassword: "Old Password",
          newPassword: "New Password",
          myProfile: "My Profile",
          inviteTitle: "Invite Users",
          inviteSuccess: "Invite sent!",
          inviteError: "Email taken",
          sendInvites: "Send Invites",
          acceptInvitation: "Accept Invitation to",
          acceptInstructions: "Enter your login and other user info below to finalize your account creation.",
          rolesAndPermissions: "User Roles & Permissions",
          inviteInstructions:
            "Enter the email addresses of whom you wish to invite below.  For details about permissions for each role, please see",
          // Leave in snake case so we can use: t(`user.roles.${role}`)

          roles: {
            submitter: "submitter",
            review_manager: "review manager",
            reviewer: "reviewer",
            super_admin: "super admin",
          },
        },
        requirementTemplate: {
          edit: {
            clickToWriteDescription: "Click to write description",
            title: "Permit Application Builder",
            dndTitle: "Drag to reorder",
            addSectionButton: "Add Section",
            addRequirementButton: "Add Requirement",
            saveDraft: "Save as Draft",
            closeEditor: "Close Editor",
            sectionsSidebarTitle: "Contents",
            reorderButton: "Reorder",
            removeConfirmationModal: {
              title: "Are you sure you want to remove this section?",
              body: "Any requirements inside this section will also be removed along with it.",
            },
            emptyTemplateSectionText: "Start by clicking the Add Section button",
            goToTop: "Go to top",
            collapseAll: "Collapse All",
          },
          fields: {
            status: "Status",
            permitType: "Permit Type",
            activity: "Work Type",
            description: "Description",
            version: "Version",
            jurisdictionsSize: "Used By",
          },
          status: {
            published: "Published",
            scheduled: "Scheduled",
            draft: "Draft",
          },
          index: {
            tableHeading: "Templates",
            title: "Permit Templates Catalogue",
            description:
              "List of all permit templates in the system that’s been created by the Super Admin. Only Published templates will be visible to jurisdictions and submitters.",
            createButton: "Create new template",
            seeArchivedButton: "See Archived",
          },
          new: {
            title: "Create New Template",
            typePrompt: "What kind of building permit is this?",
            descriptionHelpText:
              "Provide some context for managers and admin on what kinds of buildings this permit is meant for.",
            createButton: "Create template",
          },
        },
        site: {
          title: "Building Permit Hub",
          titleLong: "BC Building Permit Hub",
          adminNavBarTitle: "Building Permit Hub - Admin Panel",
          beta: "Beta",
          linkHome: "Navigate home",
          didYouFind: "Did you find what you were looking for?",
          territorialAcknowledgement:
            "The B.C. Public Service acknowledges the territories of First Nations around B.C. and is grateful to carry out our work on these lands. We acknowledge the rights, interests, priorities, and concerns of all Indigenous Peoples - First Nations, Métis, and Inuit - respecting and acknowledging their distinct cultures, histories, rights, laws, and governments.",
          home: "Home",
          contact: "Contact us",
          help: "Help",
          aboutTitle: "About",
          disclaimerTitle: "Disclaimer",
          copyrightHolder: "Government of British Columbia.",
          description: "Lorem ipsum here is the site description",
          keywords: "BC, british columba, permit, portal, hub, permitting, permit application",
          activePermits: "Active Permits",
          approvedPermits: "Approved Permits",
          myAccount: "My Account",
          giveFeedback: "Give Feedback",
          error: "Something went wrong, please try refreshing the page",
          menu: "Menu",
          somethingWrong: "Something went wrong",
          pageNotFound: "404 - The page you are looking for could not be found",
          seeConsoleForDetails: "See the browser console for details",
          breadcrumb: {
            jurisdictions: "Manage Jurisdictions",
            new: "Create New",
            invite: "Invite",
            requirementsLibrary: "Requirements Library",
            requirementTemplates: "Permit Templates Catalogue",
            edit: "Edit",
            users: "Users",
            editTemplate: "Edit template",
            permitApplications: "Permit Applications",
            submissionInbox: "Submission Inbox",
            configuration: "Configure Jurisdiction",
            sucessfulSubmission: "Application submitted",
          },
          questionSupport: "Question Support",
        },
      },
    },
    // ... other languages
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
}

i18n.use(initReactI18next).init(options)

export type TTranslationResources = (typeof options)["resources"]

export default i18n
