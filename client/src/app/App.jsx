/**
 * App.jsx
 * Root application component.
 * Wraps the route tree with providers.
 */

import { AppProviders } from './providers.jsx';
import { AppRoutes } from './routes.jsx';

const App = () => {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;
