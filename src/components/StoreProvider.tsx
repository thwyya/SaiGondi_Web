'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { fetchCurrentUser, finishInitialLoad, setInitialState } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { Suspense } from 'react'; // Import Suspense

// Wrap AppInitializer in Suspense to handle useSearchParams if needed elsewhere,
// but for this component, we are removing the direct dependency for initialization.
function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // This effect should run once on initial load to rehydrate auth state from localStorage.
    const localAccessToken = localStorage.getItem('accessToken');
    const localRefreshToken = localStorage.getItem('refreshToken');

    if (localAccessToken && localRefreshToken) {
      // If tokens are found, set the initial state in Redux
      dispatch(setInitialState({ accessToken: localAccessToken, refreshToken: localRefreshToken }));
      // And then fetch the current user's profile
      dispatch(fetchCurrentUser()); 
    } else {
      // If no tokens, just mark the initial load as finished
      dispatch(finishInitialLoad());
    }
    // The dependency array is empty to ensure this runs only once on mount.
  }, [dispatch]);

  return <>{children}</>;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {/* Wrap AppInitializer in Suspense as a good practice for components that might use client-side hooks */}
      <Suspense fallback={<div>Loading...</div>}>
        <AppInitializer>{children}</AppInitializer>
      </Suspense>
    </Provider>
  );
}