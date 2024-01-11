//Reference: https://auth0.com/blog/role-based-access-control-rbac-and-react-apps/
import { rules } from "../../../services/rbac-rules"
import { useMst } from "../../../setup/root"

// use this function if you need an inline check, something like
// <SomeComponent readOnly={can("feedback:manage")} />
export const can = (action, data = {}) => {
  const {
    userStore: { currentUser },
  } = useMst()
  const permissions = currentUser ? rules[currentUser.role] : rules["anonymous"]

  const staticPermissions = permissions?.static
  const dynamicPermissions = permissions?.dynamic

  if (!permissions) {
    return false
  }
  if (staticPermissions && staticPermissions.includes(action)) {
    return true
  }
  if (dynamicPermissions) {
    const permissionCondition = dynamicPermissions[action]

    if (!permissionCondition) {
      return false
    } else {
      return permissionCondition(currentUser, data)
    }
  }

  return false
}

interface ICanProps {
  children: any
  action: string
  data?: any
  onPermissionDeniedRender?: JSX.Element
}

// Use the component if you want a React-y way to wrap a bunch of things for render
export const Can = ({ action, data, onPermissionDeniedRender, children }: ICanProps): JSX.Element => {
  // return content
  if (can(action, data)) {
    return children
  } else if (onPermissionDeniedRender) {
    return onPermissionDeniedRender
  } else {
    return null
  }
}
