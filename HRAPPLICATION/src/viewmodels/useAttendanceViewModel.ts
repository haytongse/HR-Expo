import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { attendanceService } from '../services/attendanceService'
import { setTodayCheckIns, addCheckIn, setLoading, setError } from '../store/attendanceSlice'
import { RootState } from '../store'

export const useAttendanceViewModel = () => {
  const dispatch = useDispatch()
  const { todayCheckIns, isLoading, error } = useSelector((s: RootState) => s.attendance)

  const loadTodayCheckIns = useCallback(async () => {
    dispatch(setLoading(true))
    try {
      const data = await attendanceService.getTodayCheckIns()
      dispatch(setTodayCheckIns(data))
    } catch (err: any) {
      dispatch(setError(err.message))
    } finally {
      dispatch(setLoading(false))
    }
  }, [dispatch])

  const checkIn = async (data: Parameters<typeof attendanceService.checkIn>[0]) => {
    dispatch(setLoading(true))
    try {
      const result = await attendanceService.checkIn(data)
      dispatch(addCheckIn(result))
      return result
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Check-in failed'
      dispatch(setError(msg))
      throw new Error(msg)
    } finally {
      dispatch(setLoading(false))
    }
  }

  return { todayCheckIns, isLoading, error, loadTodayCheckIns, checkIn }
}
