/**
 * @file Authenticated route
 */

import {Redirect, Route, RouteProps} from "react-router-dom";

import {useStore} from "~/lib/state";

/**
 * Authenticated route component
 * @param props Route props
 * @returns JSX
 */
export const AuthenticatedRoute: React.FC<RouteProps> = props => {
  // Hooks
  const user = useStore(state => state.user);

  return (
    <Route {...props}>
      {user === undefined ? <Redirect to="/auth" /> : props.children}
    </Route>
  );
};
