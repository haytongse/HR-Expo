import { useState, useCallback } from 'react'
import { adminService, LeaveType, Announcement } from '../services/adminService'
import { User, ShiftSchedule, TimeTable, AttendanceSummary, Campus, PublicHoliday, UserPermission } from '../models'

export const useAdminViewModel = () => {
  const [users, setUsers] = useState<User[]>([])
  const [shifts, setShifts] = useState<ShiftSchedule[]>([])
  const [timetables, setTimetables] = useState<TimeTable[]>([])
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([])
  const [permissions, setPermissions] = useState<UserPermission[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try { setUsers(await adminService.getUsers()) }
    catch (e: any) { setError(e.message) }
    finally { setIsLoading(false) }
  }, [])

  const loadShifts = useCallback(async () => {
    setIsLoading(true)
    try { setShifts(await adminService.getShifts()) }
    catch (e: any) { setError(e.message) }
    finally { setIsLoading(false) }
  }, [])

  const loadTimetables = useCallback(async () => {
    setIsLoading(true)
    try { setTimetables(await adminService.getTimetables()) }
    catch (e: any) { setError(e.message) }
    finally { setIsLoading(false) }
  }, [])

  const loadSummary = useCallback(async () => {
    try { setSummary(await adminService.getSummary()) }
    catch (e: any) { setError(e.message) }
  }, [])

  const createUser = async (data: Parameters<typeof adminService.createUser>[0]): Promise<User> => {
    setIsLoading(true)
    try {
      const user = await adminService.createUser(data)
      setUsers(prev => [user, ...prev])
      return user
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
      throw e
    } finally { setIsLoading(false) }
  }

  const updateUser = async (id: number, data: Parameters<typeof adminService.updateUser>[1]) => {
    setIsLoading(true)
    try {
      const updated = await adminService.updateUser(id, data)
      setUsers(prev => prev.map(u => {
        if (u.id !== id) return u
        // Apply permission flags from the request in case the API response omits them
        const permissions = {
          ...(data.allowWifi !== undefined && { allowWifi: data.allowWifi }),
          ...(data.noCheckOut !== undefined && { noCheckOut: data.noCheckOut }),
          ...(data.allowOutside !== undefined && { allowOutside: data.allowOutside }),
        }
        return { ...u, ...updated, ...permissions }
      }))
      return updated
    } catch (e: any) {
      setError(e.response?.data?.message || e.message); throw e
    } finally { setIsLoading(false) }
  }

  const deleteUser = async (id: number) => {
    try {
      await adminService.deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (e: any) { setError(e.message); throw e }
  }

  const createShift = async (data: Partial<ShiftSchedule>) => {
    setIsLoading(true)
    try {
      const shift = await adminService.createShift(data)
      setShifts(prev => [shift, ...prev])
      return shift
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
      throw e
    } finally { setIsLoading(false) }
  }

  const createTimetable = async (data: Partial<TimeTable>) => {
    setIsLoading(true)
    try {
      const timetable = await adminService.createTimetable(data)
      setTimetables(prev => [timetable, ...prev])
      return timetable
    } catch (e: any) {
      setError(e.response?.data?.message || e.message)
      throw e
    } finally { setIsLoading(false) }
  }

  const assignUserToShift = async (shiftId: number, userId: number) => {
    setIsLoading(true)
    try { await adminService.assignUserToShift(shiftId, userId) }
    catch (e: any) { setError(e.message); throw e }
    finally { setIsLoading(false) }
  }

  const loadCampuses = useCallback(async () => {
    try {
      const data = await adminService.getCampuses()
      setCampuses(data)
    } catch {}
  }, [])

  const createCampus = async (data: Parameters<typeof adminService.createCampus>[0]) => {
    setIsLoading(true)
    try {
      const campus = await adminService.createCampus(data)
      await loadCampuses()
      return campus
    } finally {
      setIsLoading(false)
    }
  }

  const addCampusWifi = async (campusId: number, wifiName: string) => {
    await adminService.addCampusWifi(campusId, wifiName)
    await loadCampuses()
  }

  const deleteCampusWifi = async (campusId: number, wifiId: number) => {
    await adminService.deleteCampusWifi(campusId, wifiId)
    await loadCampuses()
  }

  const updateCampus = async (id: number, data: Parameters<typeof adminService.updateCampus>[1]) => {
    setIsLoading(true)
    try {
      await adminService.updateCampus(id, data)
      await loadCampuses()
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCampus = async (id: number) => {
    setIsLoading(true)
    try {
      await adminService.deleteCampus(id)
      await loadCampuses()
    } finally {
      setIsLoading(false)
    }
  }

  const updateShift = async (id: number, data: Partial<ShiftSchedule>) => {
    setIsLoading(true)
    try {
      const updated = await adminService.updateShift(id, data)
      setShifts(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s))
      return updated
    } catch (e: any) { setError(e.message); throw e }
    finally { setIsLoading(false) }
  }

  const deleteShift = async (id: number) => {
    try {
      await adminService.deleteShift(id)
      setShifts(prev => prev.filter(s => s.id !== id))
    } catch (e: any) { setError(e.message); throw e }
  }

  const updateTimetable = async (id: number, data: Partial<TimeTable>) => {
    setIsLoading(true)
    try {
      const updated = await adminService.updateTimetable(id, data)
      setTimetables(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t))
      return updated
    } catch (e: any) { setError(e.message); throw e }
    finally { setIsLoading(false) }
  }

  const deleteTimetable = async (id: number) => {
    try {
      await adminService.deleteTimetable(id)
      setTimetables(prev => prev.filter(t => t.id !== id))
    } catch (e: any) { setError(e.message); throw e }
  }

  // ── Public Holidays ────────────────────────────────────────────────────────
  const loadPublicHolidays = useCallback(async (year?: number) => {
    setIsLoading(true)
    try { setPublicHolidays(await adminService.getPublicHolidays(year)) }
    catch (e: any) { setError(e.message) }
    finally { setIsLoading(false) }
  }, [])

  const createPublicHoliday = async (data: Partial<PublicHoliday>) => {
    setIsLoading(true)
    try {
      const h = await adminService.createPublicHoliday(data)
      setPublicHolidays(prev => [h, ...prev])
    } catch (e: any) { setError(e.response?.data?.message || e.message); throw e }
    finally { setIsLoading(false) }
  }

  const updatePublicHoliday = async (id: number, data: Partial<PublicHoliday>) => {
    setIsLoading(true)
    try {
      const updated = await adminService.updatePublicHoliday(id, data)
      setPublicHolidays(prev => prev.map(h => h.id === id ? { ...h, ...updated } : h))
      return updated
    } catch (e: any) { setError(e.message); throw e }
    finally { setIsLoading(false) }
  }

  const deletePublicHoliday = async (id: number) => {
    try {
      await adminService.deletePublicHoliday(id)
      setPublicHolidays(prev => prev.filter(h => h.id !== id))
    } catch (e: any) { setError(e.message); throw e }
  }

  // ── Leave Requests ─────────────────────────────────────────────────────────
  const loadPermissions = useCallback(async (status?: string) => {
    setIsLoading(true)
    try { setPermissions(await adminService.getPermissions({ status })) }
    catch (e: any) { setError(e.message) }
    finally { setIsLoading(false) }
  }, [])

  const approvePermission = async (id: number, notes?: string) => {
    try {
      await adminService.approvePermission(id, notes)
      setPermissions(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p))
    } catch (e: any) { setError(e.message); throw e }
  }

  const rejectPermission = async (id: number, notes?: string) => {
    try {
      await adminService.rejectPermission(id, notes)
      setPermissions(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p))
    } catch (e: any) { setError(e.message); throw e }
  }

  // ── Leave Types ────────────────────────────────────────────────────────────
  const loadLeaveTypes = useCallback(async () => {
    setIsLoading(true)
    try { setLeaveTypes(await adminService.getLeaveTypes()) }
    catch (e: any) { setError(e.message) }
    finally { setIsLoading(false) }
  }, [])

  const createLeaveType = async (data: Partial<LeaveType>) => {
    setIsLoading(true)
    try {
      const lt = await adminService.createLeaveType(data)
      setLeaveTypes(prev => [lt, ...prev])
    } catch (e: any) { setError(e.response?.data?.message || e.message); throw e }
    finally { setIsLoading(false) }
  }

  const updateLeaveType = async (id: number, data: Partial<LeaveType>) => {
    setIsLoading(true)
    try {
      const updated = await adminService.updateLeaveType(id, data)
      setLeaveTypes(prev => prev.map(lt => lt.id === id ? { ...lt, ...updated } : lt))
      return updated
    } catch (e: any) { setError(e.message); throw e }
    finally { setIsLoading(false) }
  }

  const deleteLeaveType = async (id: number) => {
    try {
      await adminService.deleteLeaveType(id)
      setLeaveTypes(prev => prev.filter(lt => lt.id !== id))
    } catch (e: any) { setError(e.message); throw e }
  }

  // ── Announcements ──────────────────────────────────────────────────────────
  const loadAnnouncements = useCallback(async () => {
    setIsLoading(true)
    try { setAnnouncements(await adminService.getAnnouncements()) }
    catch (e: any) { setError(e.message) }
    finally { setIsLoading(false) }
  }, [])

  const createAnnouncement = async (data: Pick<Announcement, 'title' | 'content'>) => {
    setIsLoading(true)
    try {
      const a = await adminService.createAnnouncement(data)
      setAnnouncements(prev => [a, ...prev])
    } catch (e: any) { setError(e.response?.data?.message || e.message); throw e }
    finally { setIsLoading(false) }
  }

  const deleteAnnouncement = async (id: number) => {
    try {
      await adminService.deleteAnnouncement(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    } catch (e: any) { setError(e.message); throw e }
  }

  return {
    users, shifts, timetables, summary, campuses,
    publicHolidays, permissions, leaveTypes, announcements,
    isLoading, error,
    loadUsers, loadShifts, loadTimetables, loadSummary, loadCampuses,
    createUser, updateUser, deleteUser,
    createShift, updateShift, deleteShift,
    createTimetable, updateTimetable, deleteTimetable,
    assignUserToShift,
    createCampus, updateCampus, deleteCampus, addCampusWifi, deleteCampusWifi,
    loadPublicHolidays, createPublicHoliday, updatePublicHoliday, deletePublicHoliday,
    loadPermissions, approvePermission, rejectPermission,
    loadLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType,
    loadAnnouncements, createAnnouncement, deleteAnnouncement,
  }
}
