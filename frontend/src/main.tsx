import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { NotificationsProvider } from "./components/NotificationsProvider";

import App from "./App";
import { store } from "./store";
import { ThemeProvider } from "./components/ThemeProvider";
import { ScrollToTop, RouteProgressBar } from "./components/transitions";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <NotificationsProvider>
          <BrowserRouter>
            <ScrollToTop />
            <RouteProgressBar />
            <App />
            <Toaster position="top-right" />
          </BrowserRouter>
        </NotificationsProvider>
      </Provider>
    </ThemeProvider>
  </StrictMode>
);