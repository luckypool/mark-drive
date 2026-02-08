import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout';
import ErrorPage from './pages/ErrorPage';
import NotFoundPage from './pages/NotFoundPage';
import HomeScreen from '../app/index';
import ViewerScreen from '../app/viewer';
import SearchScreen from '../app/search';
import AboutScreen from '../app/about';
import PrivacyScreen from '../app/privacy';
import TermsScreen from '../app/terms';
import LicenseScreen from '../app/license';
import ThirdPartyLicensesScreen from '../app/third-party-licenses';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'viewer', element: <ViewerScreen /> },
      { path: 'search', element: <SearchScreen /> },
      { path: 'about', element: <AboutScreen /> },
      { path: 'privacy', element: <PrivacyScreen /> },
      { path: 'terms', element: <TermsScreen /> },
      { path: 'license', element: <LicenseScreen /> },
      { path: 'third-party-licenses', element: <ThirdPartyLicensesScreen /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
