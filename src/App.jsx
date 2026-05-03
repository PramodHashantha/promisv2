import React, { lazy, Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';

const AppDevtools = import.meta.env.DEV
  ? lazy(() => import("./components/dev/AppDevtools"))
  : () => null;

import "react-quill/dist/quill.snow.css";
import "react-circular-progressbar/dist/styles.css";
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";

import NavigationProvider from "./contentApi/navigationProvider";
import SideBarToggleProvider from "./contentApi/sideBarToggleProvider";
import { AuthProvider } from "./context/AuthContext";
import ThemeCustomizer from "./components/shared/ThemeCustomizer";
import { NetworkProvider } from "./context/NetworkContext";
import NetworkBanner from "./components/shared/NetworkBanner";
import { NotificationProvider } from "./context/NotificationContext";
import ToastContainer from "./components/shared/Notification/ToastContainer";
import { router } from "./route/router";
import { queryClient } from "./utils/api/queryClient";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NetworkProvider>
        <NotificationProvider>
          <ToastContainer />
          <AuthProvider>
            <NavigationProvider>
              <SideBarToggleProvider>
                <RouterProvider router={router} />
              </SideBarToggleProvider>
            </NavigationProvider>
            <ThemeCustomizer />
            <NetworkBanner />
          </AuthProvider>
        </NotificationProvider>
      </NetworkProvider>
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <AppDevtools />
        </Suspense>
      )}
    </QueryClientProvider>
  );
};

export default App;
