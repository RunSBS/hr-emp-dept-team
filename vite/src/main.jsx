import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import Router from './main/Router.jsx';
import AuthProvider from "./main/AuthProvider.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <BrowserRouter>
          <AuthProvider>
              <Router />
          </AuthProvider>
      </BrowserRouter>
  </StrictMode>,
)
