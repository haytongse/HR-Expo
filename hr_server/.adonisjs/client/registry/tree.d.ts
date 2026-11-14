/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessToken: {
      store: typeof routes['auth.access_token.store']
      adminLogin: typeof routes['auth.access_token.admin_login']
      destroy: typeof routes['auth.access_token.destroy']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
      myShift: typeof routes['profile.profile.my_shift']
      updateFcmToken: typeof routes['profile.profile.update_fcm_token']
    }
  }
  checkIns: {
    index: typeof routes['check_ins.index']
    today: typeof routes['check_ins.today']
    monthlySummary: typeof routes['check_ins.monthly_summary']
    store: typeof routes['check_ins.store']
  }
  campuses: {
    index: typeof routes['campuses.index']
    show: typeof routes['campuses.show']
  }
  publicHolidays: {
    index: typeof routes['public_holidays.index']
  }
  userPermissions: {
    index: typeof routes['user_permissions.index']
    store: typeof routes['user_permissions.store']
    destroy: typeof routes['user_permissions.destroy']
  }
  dailyWorks: {
    index: typeof routes['daily_works.index']
    store: typeof routes['daily_works.store']
  }
  leaveTypes: {
    index: typeof routes['leave_types.index']
  }
  announcements: {
    index: typeof routes['announcements.index']
    unreadCount: typeof routes['announcements.unread_count']
    markAllRead: typeof routes['announcements.mark_all_read']
    markRead: typeof routes['announcements.mark_read']
  }
  admin: {
    adminUsers: {
      index: typeof routes['admin.admin_users.index']
      store: typeof routes['admin.admin_users.store']
      importUsers: typeof routes['admin.admin_users.import_users']
      update: typeof routes['admin.admin_users.update']
      destroy: typeof routes['admin.admin_users.destroy']
    }
    adminTimetables: {
      index: typeof routes['admin.admin_timetables.index']
      store: typeof routes['admin.admin_timetables.store']
      update: typeof routes['admin.admin_timetables.update']
      destroy: typeof routes['admin.admin_timetables.destroy']
    }
    adminShiftSchedules: {
      index: typeof routes['admin.admin_shift_schedules.index']
      store: typeof routes['admin.admin_shift_schedules.store']
      show: typeof routes['admin.admin_shift_schedules.show']
      update: typeof routes['admin.admin_shift_schedules.update']
      destroy: typeof routes['admin.admin_shift_schedules.destroy']
      assignUser: typeof routes['admin.admin_shift_schedules.assign_user']
      unassignUser: typeof routes['admin.admin_shift_schedules.unassign_user']
    }
    adminCheckIns: {
      index: typeof routes['admin.admin_check_ins.index']
      summary: typeof routes['admin.admin_check_ins.summary']
      monthly: typeof routes['admin.admin_check_ins.monthly']
      userIds: typeof routes['admin.admin_check_ins.user_ids']
    }
    adminCampuses: {
      index: typeof routes['admin.admin_campuses.index']
      store: typeof routes['admin.admin_campuses.store']
      importCampuses: typeof routes['admin.admin_campuses.import_campuses']
      update: typeof routes['admin.admin_campuses.update']
      destroy: typeof routes['admin.admin_campuses.destroy']
    }
    adminCampusWifis: {
      index: typeof routes['admin.admin_campus_wifis.index']
      store: typeof routes['admin.admin_campus_wifis.store']
      destroy: typeof routes['admin.admin_campus_wifis.destroy']
    }
    adminPublicHolidays: {
      index: typeof routes['admin.admin_public_holidays.index']
      store: typeof routes['admin.admin_public_holidays.store']
      update: typeof routes['admin.admin_public_holidays.update']
      destroy: typeof routes['admin.admin_public_holidays.destroy']
    }
    adminUserPermissions: {
      index: typeof routes['admin.admin_user_permissions.index']
      approve: typeof routes['admin.admin_user_permissions.approve']
      reject: typeof routes['admin.admin_user_permissions.reject']
      destroy: typeof routes['admin.admin_user_permissions.destroy']
    }
    adminDailyWorks: {
      index: typeof routes['admin.admin_daily_works.index']
      monthly: typeof routes['admin.admin_daily_works.monthly']
      approve: typeof routes['admin.admin_daily_works.approve']
      reject: typeof routes['admin.admin_daily_works.reject']
    }
    adminLeaveTypes: {
      index: typeof routes['admin.admin_leave_types.index']
      store: typeof routes['admin.admin_leave_types.store']
      update: typeof routes['admin.admin_leave_types.update']
      destroy: typeof routes['admin.admin_leave_types.destroy']
    }
    adminAnnouncements: {
      index: typeof routes['admin.admin_announcements.index']
      store: typeof routes['admin.admin_announcements.store']
      destroy: typeof routes['admin.admin_announcements.destroy']
    }
    adminDocumentNumbering: {
      index: typeof routes['admin.admin_document_numbering.index']
      upsert: typeof routes['admin.admin_document_numbering.upsert']
      destroy: typeof routes['admin.admin_document_numbering.destroy']
      preview: typeof routes['admin.admin_document_numbering.preview']
      consume: typeof routes['admin.admin_document_numbering.consume']
      undo: typeof routes['admin.admin_document_numbering.undo']
    }
  }
}
