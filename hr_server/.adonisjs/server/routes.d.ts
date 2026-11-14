import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.admin_login': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.profile.my_shift': { paramsTuple?: []; params?: {} }
    'profile.profile.update_fcm_token': { paramsTuple?: []; params?: {} }
    'check_ins.index': { paramsTuple?: []; params?: {} }
    'check_ins.today': { paramsTuple?: []; params?: {} }
    'check_ins.monthly_summary': { paramsTuple?: []; params?: {} }
    'check_ins.store': { paramsTuple?: []; params?: {} }
    'campuses.index': { paramsTuple?: []; params?: {} }
    'campuses.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'public_holidays.index': { paramsTuple?: []; params?: {} }
    'user_permissions.index': { paramsTuple?: []; params?: {} }
    'user_permissions.store': { paramsTuple?: []; params?: {} }
    'user_permissions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'daily_works.index': { paramsTuple?: []; params?: {} }
    'daily_works.store': { paramsTuple?: []; params?: {} }
    'leave_types.index': { paramsTuple?: []; params?: {} }
    'announcements.index': { paramsTuple?: []; params?: {} }
    'announcements.unread_count': { paramsTuple?: []; params?: {} }
    'announcements.mark_all_read': { paramsTuple?: []; params?: {} }
    'announcements.mark_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_users.index': { paramsTuple?: []; params?: {} }
    'admin.admin_users.store': { paramsTuple?: []; params?: {} }
    'admin.admin_users.import_users': { paramsTuple?: []; params?: {} }
    'admin.admin_users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_timetables.index': { paramsTuple?: []; params?: {} }
    'admin.admin_timetables.store': { paramsTuple?: []; params?: {} }
    'admin.admin_timetables.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_timetables.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_shift_schedules.index': { paramsTuple?: []; params?: {} }
    'admin.admin_shift_schedules.store': { paramsTuple?: []; params?: {} }
    'admin.admin_shift_schedules.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_shift_schedules.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_shift_schedules.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_shift_schedules.assign_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_shift_schedules.unassign_user': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'userId': ParamValue} }
    'admin.admin_check_ins.index': { paramsTuple?: []; params?: {} }
    'admin.admin_check_ins.summary': { paramsTuple?: []; params?: {} }
    'admin.admin_check_ins.monthly': { paramsTuple?: []; params?: {} }
    'admin.admin_check_ins.user_ids': { paramsTuple?: []; params?: {} }
    'admin.admin_campuses.index': { paramsTuple?: []; params?: {} }
    'admin.admin_campuses.store': { paramsTuple?: []; params?: {} }
    'admin.admin_campuses.import_campuses': { paramsTuple?: []; params?: {} }
    'admin.admin_campuses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_campuses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_campus_wifis.index': { paramsTuple: [ParamValue]; params: {'campusId': ParamValue} }
    'admin.admin_campus_wifis.store': { paramsTuple: [ParamValue]; params: {'campusId': ParamValue} }
    'admin.admin_campus_wifis.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'campusId': ParamValue,'id': ParamValue} }
    'admin.admin_public_holidays.index': { paramsTuple?: []; params?: {} }
    'admin.admin_public_holidays.store': { paramsTuple?: []; params?: {} }
    'admin.admin_public_holidays.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_public_holidays.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_user_permissions.index': { paramsTuple?: []; params?: {} }
    'admin.admin_user_permissions.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_user_permissions.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_user_permissions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_daily_works.index': { paramsTuple?: []; params?: {} }
    'admin.admin_daily_works.monthly': { paramsTuple?: []; params?: {} }
    'admin.admin_daily_works.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_daily_works.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_leave_types.index': { paramsTuple?: []; params?: {} }
    'admin.admin_leave_types.store': { paramsTuple?: []; params?: {} }
    'admin.admin_leave_types.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_leave_types.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_announcements.index': { paramsTuple?: []; params?: {} }
    'admin.admin_announcements.store': { paramsTuple?: []; params?: {} }
    'admin.admin_announcements.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_document_numbering.index': { paramsTuple?: []; params?: {} }
    'admin.admin_document_numbering.upsert': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_document_numbering.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_document_numbering.preview': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_document_numbering.consume': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_document_numbering.undo': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.profile.my_shift': { paramsTuple?: []; params?: {} }
    'check_ins.index': { paramsTuple?: []; params?: {} }
    'check_ins.today': { paramsTuple?: []; params?: {} }
    'check_ins.monthly_summary': { paramsTuple?: []; params?: {} }
    'campuses.index': { paramsTuple?: []; params?: {} }
    'campuses.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'public_holidays.index': { paramsTuple?: []; params?: {} }
    'user_permissions.index': { paramsTuple?: []; params?: {} }
    'daily_works.index': { paramsTuple?: []; params?: {} }
    'leave_types.index': { paramsTuple?: []; params?: {} }
    'announcements.index': { paramsTuple?: []; params?: {} }
    'announcements.unread_count': { paramsTuple?: []; params?: {} }
    'admin.admin_users.index': { paramsTuple?: []; params?: {} }
    'admin.admin_timetables.index': { paramsTuple?: []; params?: {} }
    'admin.admin_shift_schedules.index': { paramsTuple?: []; params?: {} }
    'admin.admin_shift_schedules.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_check_ins.index': { paramsTuple?: []; params?: {} }
    'admin.admin_check_ins.summary': { paramsTuple?: []; params?: {} }
    'admin.admin_check_ins.monthly': { paramsTuple?: []; params?: {} }
    'admin.admin_check_ins.user_ids': { paramsTuple?: []; params?: {} }
    'admin.admin_campuses.index': { paramsTuple?: []; params?: {} }
    'admin.admin_campus_wifis.index': { paramsTuple: [ParamValue]; params: {'campusId': ParamValue} }
    'admin.admin_public_holidays.index': { paramsTuple?: []; params?: {} }
    'admin.admin_user_permissions.index': { paramsTuple?: []; params?: {} }
    'admin.admin_daily_works.index': { paramsTuple?: []; params?: {} }
    'admin.admin_daily_works.monthly': { paramsTuple?: []; params?: {} }
    'admin.admin_leave_types.index': { paramsTuple?: []; params?: {} }
    'admin.admin_announcements.index': { paramsTuple?: []; params?: {} }
    'admin.admin_document_numbering.index': { paramsTuple?: []; params?: {} }
    'admin.admin_document_numbering.preview': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.profile.my_shift': { paramsTuple?: []; params?: {} }
    'check_ins.index': { paramsTuple?: []; params?: {} }
    'check_ins.today': { paramsTuple?: []; params?: {} }
    'check_ins.monthly_summary': { paramsTuple?: []; params?: {} }
    'campuses.index': { paramsTuple?: []; params?: {} }
    'campuses.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'public_holidays.index': { paramsTuple?: []; params?: {} }
    'user_permissions.index': { paramsTuple?: []; params?: {} }
    'daily_works.index': { paramsTuple?: []; params?: {} }
    'leave_types.index': { paramsTuple?: []; params?: {} }
    'announcements.index': { paramsTuple?: []; params?: {} }
    'announcements.unread_count': { paramsTuple?: []; params?: {} }
    'admin.admin_users.index': { paramsTuple?: []; params?: {} }
    'admin.admin_timetables.index': { paramsTuple?: []; params?: {} }
    'admin.admin_shift_schedules.index': { paramsTuple?: []; params?: {} }
    'admin.admin_shift_schedules.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_check_ins.index': { paramsTuple?: []; params?: {} }
    'admin.admin_check_ins.summary': { paramsTuple?: []; params?: {} }
    'admin.admin_check_ins.monthly': { paramsTuple?: []; params?: {} }
    'admin.admin_check_ins.user_ids': { paramsTuple?: []; params?: {} }
    'admin.admin_campuses.index': { paramsTuple?: []; params?: {} }
    'admin.admin_campus_wifis.index': { paramsTuple: [ParamValue]; params: {'campusId': ParamValue} }
    'admin.admin_public_holidays.index': { paramsTuple?: []; params?: {} }
    'admin.admin_user_permissions.index': { paramsTuple?: []; params?: {} }
    'admin.admin_daily_works.index': { paramsTuple?: []; params?: {} }
    'admin.admin_daily_works.monthly': { paramsTuple?: []; params?: {} }
    'admin.admin_leave_types.index': { paramsTuple?: []; params?: {} }
    'admin.admin_announcements.index': { paramsTuple?: []; params?: {} }
    'admin.admin_document_numbering.index': { paramsTuple?: []; params?: {} }
    'admin.admin_document_numbering.preview': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.admin_login': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'check_ins.store': { paramsTuple?: []; params?: {} }
    'user_permissions.store': { paramsTuple?: []; params?: {} }
    'daily_works.store': { paramsTuple?: []; params?: {} }
    'announcements.mark_all_read': { paramsTuple?: []; params?: {} }
    'announcements.mark_read': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_users.store': { paramsTuple?: []; params?: {} }
    'admin.admin_users.import_users': { paramsTuple?: []; params?: {} }
    'admin.admin_timetables.store': { paramsTuple?: []; params?: {} }
    'admin.admin_shift_schedules.store': { paramsTuple?: []; params?: {} }
    'admin.admin_shift_schedules.assign_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_campuses.store': { paramsTuple?: []; params?: {} }
    'admin.admin_campuses.import_campuses': { paramsTuple?: []; params?: {} }
    'admin.admin_campus_wifis.store': { paramsTuple: [ParamValue]; params: {'campusId': ParamValue} }
    'admin.admin_public_holidays.store': { paramsTuple?: []; params?: {} }
    'admin.admin_leave_types.store': { paramsTuple?: []; params?: {} }
    'admin.admin_announcements.store': { paramsTuple?: []; params?: {} }
    'admin.admin_document_numbering.consume': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_document_numbering.undo': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'profile.profile.update_fcm_token': { paramsTuple?: []; params?: {} }
    'admin.admin_users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_timetables.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_shift_schedules.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_campuses.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_public_holidays.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_user_permissions.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_user_permissions.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_daily_works.approve': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_daily_works.reject': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_leave_types.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_document_numbering.upsert': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'user_permissions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_timetables.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_shift_schedules.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_shift_schedules.unassign_user': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'userId': ParamValue} }
    'admin.admin_campuses.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_campus_wifis.destroy': { paramsTuple: [ParamValue,ParamValue]; params: {'campusId': ParamValue,'id': ParamValue} }
    'admin.admin_public_holidays.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_user_permissions.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_leave_types.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_announcements.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.admin_document_numbering.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}