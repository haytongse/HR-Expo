/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_token.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_token.admin_login': {
    methods: ["POST"]
    pattern: '/api/v1/auth/admin/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['adminLogin']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['adminLogin']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_token.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_token_controller').default['destroy']>>>
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.profile.update': {
    methods: ["PUT"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>>
    }
  }
  'profile.profile.update_profile_picture': {
    methods: ["POST"]
    pattern: '/api/v1/account/profile-picture'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updateProfilePicture']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updateProfilePicture']>>>
    }
  }
  'profile.profile.my_shift': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/my-shift'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['myShift']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['myShift']>>>
    }
  }
  'profile.profile.update_fcm_token': {
    methods: ["PUT"]
    pattern: '/api/v1/account/fcm-token'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updateFcmToken']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updateFcmToken']>>>
    }
  }
  'check_ins.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/check-ins'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['index']>>>
    }
  }
  'check_ins.today': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/check-ins/today'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['today']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['today']>>>
    }
  }
  'check_ins.monthly_summary': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/check-ins/monthly-summary'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['monthlySummary']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['monthlySummary']>>>
    }
  }
  'check_ins.store': {
    methods: ["POST"]
    pattern: '/api/v1/check-ins'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/check_ins_controller').default['store']>>>
    }
  }
  'campuses.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/campuses'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campuses_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campuses_controller').default['index']>>>
    }
  }
  'campuses.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/campuses/:code'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { code: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campuses_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campuses_controller').default['show']>>>
    }
  }
  'public_holidays.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/public-holidays'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_holidays_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_holidays_controller').default['index']>>>
    }
  }
  'user_permissions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/permissions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_permissions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_permissions_controller').default['index']>>>
    }
  }
  'user_permissions.store': {
    methods: ["POST"]
    pattern: '/api/v1/permissions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_permissions_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_permissions_controller').default['store']>>>
    }
  }
  'user_permissions.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/permissions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_permissions_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_permissions_controller').default['destroy']>>>
    }
  }
  'daily_works.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/daily-works'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/daily_works_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/daily_works_controller').default['index']>>>
    }
  }
  'daily_works.store': {
    methods: ["POST"]
    pattern: '/api/v1/daily-works'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/daily_works_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/daily_works_controller').default['store']>>>
    }
  }
  'user_notes.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/notes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_notes_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_notes_controller').default['index']>>>
    }
  }
  'user_notes.store': {
    methods: ["POST"]
    pattern: '/api/v1/notes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_notes_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_notes_controller').default['store']>>>
    }
  }
  'user_notes.update': {
    methods: ["PUT"]
    pattern: '/api/v1/notes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_notes_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_notes_controller').default['update']>>>
    }
  }
  'user_notes.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/notes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/user_notes_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/user_notes_controller').default['destroy']>>>
    }
  }
  'leave_types.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/leave-types'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/leave_types_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/leave_types_controller').default['index']>>>
    }
  }
  'announcements.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/announcements'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['index']>>>
    }
  }
  'announcements.unread_count': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/announcements/unread-count'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['unreadCount']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['unreadCount']>>>
    }
  }
  'announcements.mark_all_read': {
    methods: ["POST"]
    pattern: '/api/v1/announcements/read-all'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['markAllRead']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['markAllRead']>>>
    }
  }
  'announcements.mark_read': {
    methods: ["POST"]
    pattern: '/api/v1/announcements/:id/read'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['markRead']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/announcements_controller').default['markRead']>>>
    }
  }
  'admin.admin_users.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['index']>>>
    }
  }
  'admin.admin_users.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').createUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').createUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin.admin_users.import_users': {
    methods: ["POST"]
    pattern: '/api/v1/admin/users/import'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['importUsers']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['importUsers']>>>
    }
  }
  'admin.admin_users.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['update']>>>
    }
  }
  'admin.admin_users.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/users_controller').default['destroy']>>>
    }
  }
  'admin.admin_timetables.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/timetables'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/timetables_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/timetables_controller').default['index']>>>
    }
  }
  'admin.admin_timetables.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/timetables'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/timetables_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/timetables_controller').default['store']>>>
    }
  }
  'admin.admin_timetables.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/timetables/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/timetables_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/timetables_controller').default['update']>>>
    }
  }
  'admin.admin_timetables.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/timetables/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/timetables_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/timetables_controller').default['destroy']>>>
    }
  }
  'admin.admin_shift_schedules.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/shifts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['index']>>>
    }
  }
  'admin.admin_shift_schedules.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/shifts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['store']>>>
    }
  }
  'admin.admin_shift_schedules.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/shifts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['show']>>>
    }
  }
  'admin.admin_shift_schedules.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/shifts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['update']>>>
    }
  }
  'admin.admin_shift_schedules.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/shifts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['destroy']>>>
    }
  }
  'admin.admin_shift_schedules.assign_user': {
    methods: ["POST"]
    pattern: '/api/v1/admin/shifts/:id/assign'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['assignUser']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['assignUser']>>>
    }
  }
  'admin.admin_shift_schedules.unassign_user': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/shifts/:id/users/:userId'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; userId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['unassignUser']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/shift_schedules_controller').default['unassignUser']>>>
    }
  }
  'admin.admin_check_ins.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/check-ins'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/check_ins_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/check_ins_controller').default['index']>>>
    }
  }
  'admin.admin_check_ins.summary': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/check-ins/summary'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/check_ins_controller').default['summary']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/check_ins_controller').default['summary']>>>
    }
  }
  'admin.admin_check_ins.monthly': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/check-ins/monthly'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/check_ins_controller').default['monthly']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/check_ins_controller').default['monthly']>>>
    }
  }
  'admin.admin_check_ins.user_ids': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/check-ins/user-ids'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/check_ins_controller').default['userIds']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/check_ins_controller').default['userIds']>>>
    }
  }
  'admin.admin_campuses.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/campuses'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/campuses_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/campuses_controller').default['index']>>>
    }
  }
  'admin.admin_campuses.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/campuses'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/campuses_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/campuses_controller').default['store']>>>
    }
  }
  'admin.admin_campuses.import_campuses': {
    methods: ["POST"]
    pattern: '/api/v1/admin/campuses/import'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/campuses_controller').default['importCampuses']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/campuses_controller').default['importCampuses']>>>
    }
  }
  'admin.admin_campuses.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/campuses/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/campuses_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/campuses_controller').default['update']>>>
    }
  }
  'admin.admin_campuses.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/campuses/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/campuses_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/campuses_controller').default['destroy']>>>
    }
  }
  'admin.admin_campus_wifis.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/campuses/:campusId/wifis'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { campusId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/campus_wifis_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/campus_wifis_controller').default['index']>>>
    }
  }
  'admin.admin_campus_wifis.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/campuses/:campusId/wifis'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { campusId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/campus_wifis_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/campus_wifis_controller').default['store']>>>
    }
  }
  'admin.admin_campus_wifis.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/campuses/:campusId/wifis/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { campusId: ParamValue; id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/campus_wifis_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/campus_wifis_controller').default['destroy']>>>
    }
  }
  'admin.admin_public_holidays.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/public-holidays'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/public_holidays_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/public_holidays_controller').default['index']>>>
    }
  }
  'admin.admin_public_holidays.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/public-holidays'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/public_holidays_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/public_holidays_controller').default['store']>>>
    }
  }
  'admin.admin_public_holidays.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/public-holidays/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/public_holidays_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/public_holidays_controller').default['update']>>>
    }
  }
  'admin.admin_public_holidays.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/public-holidays/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/public_holidays_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/public_holidays_controller').default['destroy']>>>
    }
  }
  'admin.admin_user_permissions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/permissions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/user_permissions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/user_permissions_controller').default['index']>>>
    }
  }
  'admin.admin_user_permissions.approve': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/permissions/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/user_permissions_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/user_permissions_controller').default['approve']>>>
    }
  }
  'admin.admin_user_permissions.reject': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/permissions/:id/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/user_permissions_controller').default['reject']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/user_permissions_controller').default['reject']>>>
    }
  }
  'admin.admin_user_permissions.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/permissions/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/user_permissions_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/user_permissions_controller').default['destroy']>>>
    }
  }
  'admin.admin_daily_works.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/daily-works'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/daily_works_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/daily_works_controller').default['index']>>>
    }
  }
  'admin.admin_daily_works.monthly': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/daily-works/monthly'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/daily_works_controller').default['monthly']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/daily_works_controller').default['monthly']>>>
    }
  }
  'admin.admin_daily_works.approve': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/daily-works/:id/approve'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/daily_works_controller').default['approve']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/daily_works_controller').default['approve']>>>
    }
  }
  'admin.admin_daily_works.reject': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/daily-works/:id/reject'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/daily_works_controller').default['reject']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/daily_works_controller').default['reject']>>>
    }
  }
  'admin.admin_leave_types.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/leave-types'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/leave_types_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/leave_types_controller').default['index']>>>
    }
  }
  'admin.admin_leave_types.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/leave-types'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/leave_types_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/leave_types_controller').default['store']>>>
    }
  }
  'admin.admin_leave_types.update': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/leave-types/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/leave_types_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/leave_types_controller').default['update']>>>
    }
  }
  'admin.admin_leave_types.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/leave-types/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/leave_types_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/leave_types_controller').default['destroy']>>>
    }
  }
  'admin.admin_announcements.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/announcements'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/announcements_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/announcements_controller').default['index']>>>
    }
  }
  'admin.admin_announcements.store': {
    methods: ["POST"]
    pattern: '/api/v1/admin/announcements'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/announcements_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/announcements_controller').default['store']>>>
    }
  }
  'admin.admin_announcements.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/announcements/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/announcements_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/announcements_controller').default['destroy']>>>
    }
  }
  'admin.admin_document_numbering.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/document-numbering'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/document_numbering_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/document_numbering_controller').default['index']>>>
    }
  }
  'admin.admin_document_numbering.upsert': {
    methods: ["PUT"]
    pattern: '/api/v1/admin/document-numbering/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/document_numbering_controller').default['upsert']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/document_numbering_controller').default['upsert']>>>
    }
  }
  'admin.admin_document_numbering.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/admin/document-numbering/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/document_numbering_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/document_numbering_controller').default['destroy']>>>
    }
  }
  'admin.admin_document_numbering.preview': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/document-numbering/:id/preview'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/document_numbering_controller').default['preview']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/document_numbering_controller').default['preview']>>>
    }
  }
  'admin.admin_document_numbering.consume': {
    methods: ["POST"]
    pattern: '/api/v1/admin/document-numbering/:id/consume'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/document_numbering_controller').default['consume']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/document_numbering_controller').default['consume']>>>
    }
  }
  'admin.admin_document_numbering.undo': {
    methods: ["POST"]
    pattern: '/api/v1/admin/document-numbering/:id/undo'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin/document_numbering_controller').default['undo']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin/document_numbering_controller').default['undo']>>>
    }
  }
}
