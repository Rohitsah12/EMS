import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { loginUser, logoutUser, fetchUserProfile } from '@/store/slices/authSlice';
import { LoginCredentials } from '@/types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (credentials: LoginCredentials) => {
    return dispatch(loginUser(credentials));
  };

  const logout = async () => {
    return dispatch(logoutUser());
  };

  const getProfile = async () => {
    return dispatch(fetchUserProfile());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    getProfile,
  };
};