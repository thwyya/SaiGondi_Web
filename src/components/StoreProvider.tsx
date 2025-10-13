'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { fetchCurrentUser, finishInitialLoad, setInitialState } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      dispatch(setInitialState({ accessToken, refreshToken }));
      dispatch(fetchCurrentUser()); 
    } else {
      dispatch(finishInitialLoad());
    }
  }, [dispatch]);

  return <>{children}</>;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AppInitializer>{children}</AppInitializer>
    </Provider>
  );
}