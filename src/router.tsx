import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout';
import ErrorPage from './pages/ErrorPage';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/HomePage';
import ViewerPage from './pages/ViewerPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import LicensePage from './pages/LicensePage';
import ThirdPartyLicensesPage from './pages/ThirdPartyLicensesPage';
import OpenPage from './pages/OpenPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'viewer', element: <ViewerPage /> },
      { path: 'view', element: <ViewerPage /> },
      { path: 'open', element: <OpenPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'license', element: <LicensePage /> },
      { path: 'third-party-licenses', element: <ThirdPartyLicensesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
