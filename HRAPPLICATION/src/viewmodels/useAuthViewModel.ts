import { useDispatch, useSelector } from 'react-redux'
import { authService } from '../services/authService'
import { notificationService } from '../services/notificationService'
import { setCredentials, logout } from '../store/authSlice'
import { RootState } from '../store'

export const useAuthViewModel = () => {
  const dispatch = useDispatch()
  const { user, isLoggedIn, error } = useSelector((s: RootState) => s.auth)

  const login = async (identifier: string, password: string) => {
    const result = await authService.login(identifier, password)
    dispatch(setCredentials({ user: result.user, token: result.token }))
    notificationService.registerToken().catch(() => {})
    return result
  }

  const signOut = async () => {
    await authService.logout()
    dispatch(logout())
  }

  return { user, isLoggedIn, error, login, signOut }
}
