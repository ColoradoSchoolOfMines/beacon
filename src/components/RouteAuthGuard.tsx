/**
 * @file Route auth guard wrapper
 */

import {Redirect, Route, RouteProps} from "react-router-dom";

import {useStore} from "~/lib/state";
import {checkRequiredAuthState, RequiredAuthState} from "~/lib/types";

export interface RouteAuthGuardProps extends RouteProps {
  /**
   * Required authentication state
   */
  requiredState: RequiredAuthState;

  /**
   * Where to redirect to if the current authentication state does not match the required authentication state
   */
  redirectTo?: string;
}

/**
 * Route auth guard wrapper component
 * @param props Route props
 * @param props.requiredState Required authentication state
 * @param props.redirectTo Where to redirect to if the current authentication state does not match the required authentication state
 * @returns JSX
 */
export const RouteAuthGuard: React.FC<RouteAuthGuardProps> = ({
  requiredState,
  redirectTo = "/auth/step/1",
  ...props
}) => {
  // Hooks
  const user = useStore(state => state.user);

  return (
    <Route {...props}>
      {checkRequiredAuthState(user, requiredState) ? (
        props.children
      ) : (
        <Redirect to={redirectTo} />
      )}
    </Route>
  );
};
