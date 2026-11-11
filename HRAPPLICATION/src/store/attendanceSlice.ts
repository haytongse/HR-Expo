import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CheckIn {
  id: number
  userId: number | null
  scanType: 'check_in' | 'check_out'
  time: string | null
  createdAt: string
}

interface AttendanceState {
  todayCheckIns: CheckIn[]
  isLoading: boolean
  error: string | null
}

const initialState: AttendanceState = {
  todayCheckIns: [],
  isLoading: false,
  error: null,
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setTodayCheckIns(state, action: PayloadAction<CheckIn[]>) {
      state.todayCheckIns = action.payload
    },
    addCheckIn(state, action: PayloadAction<CheckIn>) {
      state.todayCheckIns.push(action.payload)
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
  },
})

export const { setTodayCheckIns, addCheckIn, setLoading, setError } = attendanceSlice.actions
export default attendanceSlice.reducer
