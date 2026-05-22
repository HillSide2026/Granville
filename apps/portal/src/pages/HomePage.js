import React, { useEffect, useState } from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import { portalClient } from "../api/client";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Routes } from "../routes";

import DashboardOverview from "./dashboard/DashboardOverview";
import Accounts from "./Accounts";
import Transactions from "./Transactions";
import Settings from "./Settings";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import NotFound from "./NotFound";

const ShellRoute = ({ component: Component, pageTitle, ...rest }) => {
  const [chrome, setChrome] = useState(null);

  useEffect(() => {
    let mounted = true;

    portalClient.getSession().then((session) => {
      if (mounted) {
        setChrome(session);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => (
        <>
          <Sidebar organization={chrome && chrome.organization} />
          <main className="content">
            <Navbar
              title={pageTitle}
              organization={chrome && chrome.organization}
              profile={chrome && chrome.profile}
              notifications={chrome ? chrome.notifications : []}
            />
            <Component {...props} />
            <Footer organization={chrome && chrome.organization} />
          </main>
        </>
      )}
    />
  );
};

export default function HomePage() {
  return (
    <Switch>
      <Route exact path={Routes.Root.path}>
        <Redirect to={Routes.Signin.path} />
      </Route>

      <Route exact path={Routes.Signin.path} component={SignIn} />
      <Route exact path={Routes.Signup.path} component={SignUp} />

      <ShellRoute
        exact
        path={Routes.Dashboard.path}
        component={DashboardOverview}
        pageTitle="Dashboard"
      />
      <ShellRoute
        exact
        path={Routes.Accounts.path}
        component={Accounts}
        pageTitle="Accounts"
      />
      <ShellRoute
        exact
        path={Routes.Activity.path}
        component={Transactions}
        pageTitle="Activity"
      />
      <ShellRoute
        exact
        path={Routes.Settings.path}
        component={Settings}
        pageTitle="Settings"
      />

      <Route exact path={Routes.NotFound.path} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}
