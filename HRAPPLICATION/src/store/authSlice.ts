import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number
  fullName: string | null
  email: string
  role: 'admin' | 'user'
  initials: string
  allowWifi?: boolean | null
  noCheckOut?: boolean | null
  allowOutside?: boolean | null
  phoneNumber?: string | null
  address?: string | null
  birthOfDate?: string | null
  campusId?: number | null
  status?: string | null
}

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isLoggedIn = true
      state.error = null
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (!state.user) return
      const payload = action.payload
      // Never overwrite permission flags with null — preserve the existing value
      // if the profile endpoint doesn't return them
      const permissions: Partial<User> = {}
      if (payload.allowWifi    != null) permissions.allowWifi    = payload.allowWifi
      if (payload.noCheckOut   != null) permissions.noCheckOut   = payload.noCheckOut
      if (payload.allowOutside != null) permissions.allowOutside = payload.allowOutside
      state.user = { ...state.user, ...payload, ...permissions }
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isLoggedIn = false
      state.error = null
    },
  },
})

export const { setCredentials, updateUser, logout } = authSlice.actions
export default authSlice.reducer
