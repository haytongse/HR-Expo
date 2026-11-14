/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_token.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_token.store']['types'],
  },
  'auth.access_token.admin_login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/admin/login',
    tokens: [{"old":"/api/v1/auth/admin/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/admin/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/admin/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/admin/login","type":0,"val":"admin","end":""},{"old":"/api/v1/auth/admin/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_token.admin_login']['types'],
  },
  'auth.access_token.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/auth/logout',
    tokens: [{"old":"/api/v1/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth.access_token.destroy']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.profile.my_shift': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/my-shift',
    tokens: [{"old":"/api/v1/account/my-shift","type":0,"val":"api","end":""},{"old":"/api/v1/account/my-shift","type":0,"val":"v1","end":""},{"old":"/api/v1/account/my-shift","type":0,"val":"account","end":""},{"old":"/api/v1/account/my-shift","type":0,"val":"my-shift","end":""}],
    types: placeholder as Registry['profile.profile.my_shift']['types'],
  },
  'profile.profile.update_fcm_token': {
    methods: ["PUT"],
    pattern: '/api/v1/account/fcm-token',
    tokens: [{"old":"/api/v1/account/fcm-token","type":0,"val":"api","end":""},{"old":"/api/v1/account/fcm-token","type":0,"val":"v1","end":""},{"old":"/api/v1/account/fcm-token","type":0,"val":"account","end":""},{"old":"/api/v1/account/fcm-token","type":0,"val":"fcm-token","end":""}],
    types: placeholder as Registry['profile.profile.update_fcm_token']['types'],
  },
  'check_ins.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/check-ins',
    tokens: [{"old":"/api/v1/check-ins","type":0,"val":"api","end":""},{"old":"/api/v1/check-ins","type":0,"val":"v1","end":""},{"old":"/api/v1/check-ins","type":0,"val":"check-ins","end":""}],
    types: placeholder as Registry['check_ins.index']['types'],
  },
  'check_ins.today': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/check-ins/today',
    tokens: [{"old":"/api/v1/check-ins/today","type":0,"val":"api","end":""},{"old":"/api/v1/check-ins/today","type":0,"val":"v1","end":""},{"old":"/api/v1/check-ins/today","type":0,"val":"check-ins","end":""},{"old":"/api/v1/check-ins/today","type":0,"val":"today","end":""}],
    types: placeholder as Registry['check_ins.today']['types'],
  },
  'check_ins.monthly_summary': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/check-ins/monthly-summary',
    tokens: [{"old":"/api/v1/check-ins/monthly-summary","type":0,"val":"api","end":""},{"old":"/api/v1/check-ins/monthly-summary","type":0,"val":"v1","end":""},{"old":"/api/v1/check-ins/monthly-summary","type":0,"val":"check-ins","end":""},{"old":"/api/v1/check-ins/monthly-summary","type":0,"val":"monthly-summary","end":""}],
    types: placeholder as Registry['check_ins.monthly_summary']['types'],
  },
  'check_ins.store': {
    methods: ["POST"],
    pattern: '/api/v1/check-ins',
    tokens: [{"old":"/api/v1/check-ins","type":0,"val":"api","end":""},{"old":"/api/v1/check-ins","type":0,"val":"v1","end":""},{"old":"/api/v1/check-ins","type":0,"val":"check-ins","end":""}],
    types: placeholder as Registry['check_ins.store']['types'],
  },
  'campuses.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/campuses',
    tokens: [{"old":"/api/v1/campuses","type":0,"val":"api","end":""},{"old":"/api/v1/campuses","type":0,"val":"v1","end":""},{"old":"/api/v1/campuses","type":0,"val":"campuses","end":""}],
    types: placeholder as Registry['campuses.index']['types'],
  },
  'campuses.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/campuses/:code',
    tokens: [{"old":"/api/v1/campuses/:code","type":0,"val":"api","end":""},{"old":"/api/v1/campuses/:code","type":0,"val":"v1","end":""},{"old":"/api/v1/campuses/:code","type":0,"val":"campuses","end":""},{"old":"/api/v1/campuses/:code","type":1,"val":"code","end":""}],
    types: placeholder as Registry['campuses.show']['types'],
  },
  'public_holidays.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/public-holidays',
    tokens: [{"old":"/api/v1/public-holidays","type":0,"val":"api","end":""},{"old":"/api/v1/public-holidays","type":0,"val":"v1","end":""},{"old":"/api/v1/public-holidays","type":0,"val":"public-holidays","end":""}],
    types: placeholder as Registry['public_holidays.index']['types'],
  },
  'user_permissions.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/permissions',
    tokens: [{"old":"/api/v1/permissions","type":0,"val":"api","end":""},{"old":"/api/v1/permissions","type":0,"val":"v1","end":""},{"old":"/api/v1/permissions","type":0,"val":"permissions","end":""}],
    types: placeholder as Registry['user_permissions.index']['types'],
  },
  'user_permissions.store': {
    methods: ["POST"],
    pattern: '/api/v1/permissions',
    tokens: [{"old":"/api/v1/permissions","type":0,"val":"api","end":""},{"old":"/api/v1/permissions","type":0,"val":"v1","end":""},{"old":"/api/v1/permissions","type":0,"val":"permissions","end":""}],
    types: placeholder as Registry['user_permissions.store']['types'],
  },
  'user_permissions.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/permissions/:id',
    tokens: [{"old":"/api/v1/permissions/:id","type":0,"val":"api","end":""},{"old":"/api/v1/permissions/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/permissions/:id","type":0,"val":"permissions","end":""},{"old":"/api/v1/permissions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['user_permissions.destroy']['types'],
  },
  'daily_works.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/daily-works',
    tokens: [{"old":"/api/v1/daily-works","type":0,"val":"api","end":""},{"old":"/api/v1/daily-works","type":0,"val":"v1","end":""},{"old":"/api/v1/daily-works","type":0,"val":"daily-works","end":""}],
    types: placeholder as Registry['daily_works.index']['types'],
  },
  'daily_works.store': {
    methods: ["POST"],
    pattern: '/api/v1/daily-works',
    tokens: [{"old":"/api/v1/daily-works","type":0,"val":"api","end":""},{"old":"/api/v1/daily-works","type":0,"val":"v1","end":""},{"old":"/api/v1/daily-works","type":0,"val":"daily-works","end":""}],
    types: placeholder as Registry['daily_works.store']['types'],
  },
  'leave_types.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/leave-types',
    tokens: [{"old":"/api/v1/leave-types","type":0,"val":"api","end":""},{"old":"/api/v1/leave-types","type":0,"val":"v1","end":""},{"old":"/api/v1/leave-types","type":0,"val":"leave-types","end":""}],
    types: placeholder as Registry['leave_types.index']['types'],
  },
  'announcements.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/announcements',
    tokens: [{"old":"/api/v1/announcements","type":0,"val":"api","end":""},{"old":"/api/v1/announcements","type":0,"val":"v1","end":""},{"old":"/api/v1/announcements","type":0,"val":"announcements","end":""}],
    types: placeholder as Registry['announcements.index']['types'],
  },
  'announcements.unread_count': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/announcements/unread-count',
    tokens: [{"old":"/api/v1/announcements/unread-count","type":0,"val":"api","end":""},{"old":"/api/v1/announcements/unread-count","type":0,"val":"v1","end":""},{"old":"/api/v1/announcements/unread-count","type":0,"val":"announcements","end":""},{"old":"/api/v1/announcements/unread-count","type":0,"val":"unread-count","end":""}],
    types: placeholder as Registry['announcements.unread_count']['types'],
  },
  'announcements.mark_all_read': {
    methods: ["POST"],
    pattern: '/api/v1/announcements/read-all',
    tokens: [{"old":"/api/v1/announcements/read-all","type":0,"val":"api","end":""},{"old":"/api/v1/announcements/read-all","type":0,"val":"v1","end":""},{"old":"/api/v1/announcements/read-all","type":0,"val":"announcements","end":""},{"old":"/api/v1/announcements/read-all","type":0,"val":"read-all","end":""}],
    types: placeholder as Registry['announcements.mark_all_read']['types'],
  },
  'announcements.mark_read': {
    methods: ["POST"],
    pattern: '/api/v1/announcements/:id/read',
    tokens: [{"old":"/api/v1/announcements/:id/read","type":0,"val":"api","end":""},{"old":"/api/v1/announcements/:id/read","type":0,"val":"v1","end":""},{"old":"/api/v1/announcements/:id/read","type":0,"val":"announcements","end":""},{"old":"/api/v1/announcements/:id/read","type":1,"val":"id","end":""},{"old":"/api/v1/announcements/:id/read","type":0,"val":"read","end":""}],
    types: placeholder as Registry['announcements.mark_read']['types'],
  },
  'admin.admin_users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/users',
    tokens: [{"old":"/api/v1/admin/users","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['admin.admin_users.index']['types'],
  },
  'admin.admin_users.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/users',
    tokens: [{"old":"/api/v1/admin/users","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['admin.admin_users.store']['types'],
  },
  'admin.admin_users.import_users': {
    methods: ["POST"],
    pattern: '/api/v1/admin/users/import',
    tokens: [{"old":"/api/v1/admin/users/import","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/import","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/import","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/import","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/import","type":0,"val":"import","end":""}],
    types: placeholder as Registry['admin.admin_users.import_users']['types'],
  },
  'admin.admin_users.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/users/:id',
    tokens: [{"old":"/api/v1/admin/users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_users.update']['types'],
  },
  'admin.admin_users.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/users/:id',
    tokens: [{"old":"/api/v1/admin/users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:id","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_users.destroy']['types'],
  },
  'admin.admin_timetables.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/timetables',
    tokens: [{"old":"/api/v1/admin/timetables","type":0,"val":"api","end":""},{"old":"/api/v1/admin/timetables","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/timetables","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/timetables","type":0,"val":"timetables","end":""}],
    types: placeholder as Registry['admin.admin_timetables.index']['types'],
  },
  'admin.admin_timetables.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/timetables',
    tokens: [{"old":"/api/v1/admin/timetables","type":0,"val":"api","end":""},{"old":"/api/v1/admin/timetables","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/timetables","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/timetables","type":0,"val":"timetables","end":""}],
    types: placeholder as Registry['admin.admin_timetables.store']['types'],
  },
  'admin.admin_timetables.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/timetables/:id',
    tokens: [{"old":"/api/v1/admin/timetables/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/timetables/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/timetables/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/timetables/:id","type":0,"val":"timetables","end":""},{"old":"/api/v1/admin/timetables/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_timetables.update']['types'],
  },
  'admin.admin_timetables.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/timetables/:id',
    tokens: [{"old":"/api/v1/admin/timetables/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/timetables/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/timetables/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/timetables/:id","type":0,"val":"timetables","end":""},{"old":"/api/v1/admin/timetables/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_timetables.destroy']['types'],
  },
  'admin.admin_shift_schedules.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/shifts',
    tokens: [{"old":"/api/v1/admin/shifts","type":0,"val":"api","end":""},{"old":"/api/v1/admin/shifts","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/shifts","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/shifts","type":0,"val":"shifts","end":""}],
    types: placeholder as Registry['admin.admin_shift_schedules.index']['types'],
  },
  'admin.admin_shift_schedules.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/shifts',
    tokens: [{"old":"/api/v1/admin/shifts","type":0,"val":"api","end":""},{"old":"/api/v1/admin/shifts","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/shifts","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/shifts","type":0,"val":"shifts","end":""}],
    types: placeholder as Registry['admin.admin_shift_schedules.store']['types'],
  },
  'admin.admin_shift_schedules.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/shifts/:id',
    tokens: [{"old":"/api/v1/admin/shifts/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/shifts/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/shifts/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/shifts/:id","type":0,"val":"shifts","end":""},{"old":"/api/v1/admin/shifts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_shift_schedules.show']['types'],
  },
  'admin.admin_shift_schedules.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/shifts/:id',
    tokens: [{"old":"/api/v1/admin/shifts/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/shifts/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/shifts/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/shifts/:id","type":0,"val":"shifts","end":""},{"old":"/api/v1/admin/shifts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_shift_schedules.update']['types'],
  },
  'admin.admin_shift_schedules.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/shifts/:id',
    tokens: [{"old":"/api/v1/admin/shifts/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/shifts/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/shifts/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/shifts/:id","type":0,"val":"shifts","end":""},{"old":"/api/v1/admin/shifts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_shift_schedules.destroy']['types'],
  },
  'admin.admin_shift_schedules.assign_user': {
    methods: ["POST"],
    pattern: '/api/v1/admin/shifts/:id/assign',
    tokens: [{"old":"/api/v1/admin/shifts/:id/assign","type":0,"val":"api","end":""},{"old":"/api/v1/admin/shifts/:id/assign","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/shifts/:id/assign","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/shifts/:id/assign","type":0,"val":"shifts","end":""},{"old":"/api/v1/admin/shifts/:id/assign","type":1,"val":"id","end":""},{"old":"/api/v1/admin/shifts/:id/assign","type":0,"val":"assign","end":""}],
    types: placeholder as Registry['admin.admin_shift_schedules.assign_user']['types'],
  },
  'admin.admin_shift_schedules.unassign_user': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/shifts/:id/users/:userId',
    tokens: [{"old":"/api/v1/admin/shifts/:id/users/:userId","type":0,"val":"api","end":""},{"old":"/api/v1/admin/shifts/:id/users/:userId","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/shifts/:id/users/:userId","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/shifts/:id/users/:userId","type":0,"val":"shifts","end":""},{"old":"/api/v1/admin/shifts/:id/users/:userId","type":1,"val":"id","end":""},{"old":"/api/v1/admin/shifts/:id/users/:userId","type":0,"val":"users","end":""},{"old":"/api/v1/admin/shifts/:id/users/:userId","type":1,"val":"userId","end":""}],
    types: placeholder as Registry['admin.admin_shift_schedules.unassign_user']['types'],
  },
  'admin.admin_check_ins.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/check-ins',
    tokens: [{"old":"/api/v1/admin/check-ins","type":0,"val":"api","end":""},{"old":"/api/v1/admin/check-ins","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/check-ins","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/check-ins","type":0,"val":"check-ins","end":""}],
    types: placeholder as Registry['admin.admin_check_ins.index']['types'],
  },
  'admin.admin_check_ins.summary': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/check-ins/summary',
    tokens: [{"old":"/api/v1/admin/check-ins/summary","type":0,"val":"api","end":""},{"old":"/api/v1/admin/check-ins/summary","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/check-ins/summary","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/check-ins/summary","type":0,"val":"check-ins","end":""},{"old":"/api/v1/admin/check-ins/summary","type":0,"val":"summary","end":""}],
    types: placeholder as Registry['admin.admin_check_ins.summary']['types'],
  },
  'admin.admin_check_ins.monthly': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/check-ins/monthly',
    tokens: [{"old":"/api/v1/admin/check-ins/monthly","type":0,"val":"api","end":""},{"old":"/api/v1/admin/check-ins/monthly","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/check-ins/monthly","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/check-ins/monthly","type":0,"val":"check-ins","end":""},{"old":"/api/v1/admin/check-ins/monthly","type":0,"val":"monthly","end":""}],
    types: placeholder as Registry['admin.admin_check_ins.monthly']['types'],
  },
  'admin.admin_check_ins.user_ids': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/check-ins/user-ids',
    tokens: [{"old":"/api/v1/admin/check-ins/user-ids","type":0,"val":"api","end":""},{"old":"/api/v1/admin/check-ins/user-ids","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/check-ins/user-ids","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/check-ins/user-ids","type":0,"val":"check-ins","end":""},{"old":"/api/v1/admin/check-ins/user-ids","type":0,"val":"user-ids","end":""}],
    types: placeholder as Registry['admin.admin_check_ins.user_ids']['types'],
  },
  'admin.admin_campuses.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/campuses',
    tokens: [{"old":"/api/v1/admin/campuses","type":0,"val":"api","end":""},{"old":"/api/v1/admin/campuses","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/campuses","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/campuses","type":0,"val":"campuses","end":""}],
    types: placeholder as Registry['admin.admin_campuses.index']['types'],
  },
  'admin.admin_campuses.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/campuses',
    tokens: [{"old":"/api/v1/admin/campuses","type":0,"val":"api","end":""},{"old":"/api/v1/admin/campuses","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/campuses","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/campuses","type":0,"val":"campuses","end":""}],
    types: placeholder as Registry['admin.admin_campuses.store']['types'],
  },
  'admin.admin_campuses.import_campuses': {
    methods: ["POST"],
    pattern: '/api/v1/admin/campuses/import',
    tokens: [{"old":"/api/v1/admin/campuses/import","type":0,"val":"api","end":""},{"old":"/api/v1/admin/campuses/import","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/campuses/import","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/campuses/import","type":0,"val":"campuses","end":""},{"old":"/api/v1/admin/campuses/import","type":0,"val":"import","end":""}],
    types: placeholder as Registry['admin.admin_campuses.import_campuses']['types'],
  },
  'admin.admin_campuses.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/campuses/:id',
    tokens: [{"old":"/api/v1/admin/campuses/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/campuses/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/campuses/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/campuses/:id","type":0,"val":"campuses","end":""},{"old":"/api/v1/admin/campuses/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_campuses.update']['types'],
  },
  'admin.admin_campuses.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/campuses/:id',
    tokens: [{"old":"/api/v1/admin/campuses/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/campuses/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/campuses/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/campuses/:id","type":0,"val":"campuses","end":""},{"old":"/api/v1/admin/campuses/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_campuses.destroy']['types'],
  },
  'admin.admin_campus_wifis.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/campuses/:campusId/wifis',
    tokens: [{"old":"/api/v1/admin/campuses/:campusId/wifis","type":0,"val":"api","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis","type":0,"val":"campuses","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis","type":1,"val":"campusId","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis","type":0,"val":"wifis","end":""}],
    types: placeholder as Registry['admin.admin_campus_wifis.index']['types'],
  },
  'admin.admin_campus_wifis.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/campuses/:campusId/wifis',
    tokens: [{"old":"/api/v1/admin/campuses/:campusId/wifis","type":0,"val":"api","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis","type":0,"val":"campuses","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis","type":1,"val":"campusId","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis","type":0,"val":"wifis","end":""}],
    types: placeholder as Registry['admin.admin_campus_wifis.store']['types'],
  },
  'admin.admin_campus_wifis.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/campuses/:campusId/wifis/:id',
    tokens: [{"old":"/api/v1/admin/campuses/:campusId/wifis/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis/:id","type":0,"val":"campuses","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis/:id","type":1,"val":"campusId","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis/:id","type":0,"val":"wifis","end":""},{"old":"/api/v1/admin/campuses/:campusId/wifis/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_campus_wifis.destroy']['types'],
  },
  'admin.admin_public_holidays.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/public-holidays',
    tokens: [{"old":"/api/v1/admin/public-holidays","type":0,"val":"api","end":""},{"old":"/api/v1/admin/public-holidays","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/public-holidays","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/public-holidays","type":0,"val":"public-holidays","end":""}],
    types: placeholder as Registry['admin.admin_public_holidays.index']['types'],
  },
  'admin.admin_public_holidays.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/public-holidays',
    tokens: [{"old":"/api/v1/admin/public-holidays","type":0,"val":"api","end":""},{"old":"/api/v1/admin/public-holidays","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/public-holidays","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/public-holidays","type":0,"val":"public-holidays","end":""}],
    types: placeholder as Registry['admin.admin_public_holidays.store']['types'],
  },
  'admin.admin_public_holidays.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/public-holidays/:id',
    tokens: [{"old":"/api/v1/admin/public-holidays/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/public-holidays/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/public-holidays/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/public-holidays/:id","type":0,"val":"public-holidays","end":""},{"old":"/api/v1/admin/public-holidays/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_public_holidays.update']['types'],
  },
  'admin.admin_public_holidays.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/public-holidays/:id',
    tokens: [{"old":"/api/v1/admin/public-holidays/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/public-holidays/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/public-holidays/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/public-holidays/:id","type":0,"val":"public-holidays","end":""},{"old":"/api/v1/admin/public-holidays/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_public_holidays.destroy']['types'],
  },
  'admin.admin_user_permissions.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/permissions',
    tokens: [{"old":"/api/v1/admin/permissions","type":0,"val":"api","end":""},{"old":"/api/v1/admin/permissions","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/permissions","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/permissions","type":0,"val":"permissions","end":""}],
    types: placeholder as Registry['admin.admin_user_permissions.index']['types'],
  },
  'admin.admin_user_permissions.approve': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/permissions/:id/approve',
    tokens: [{"old":"/api/v1/admin/permissions/:id/approve","type":0,"val":"api","end":""},{"old":"/api/v1/admin/permissions/:id/approve","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/permissions/:id/approve","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/permissions/:id/approve","type":0,"val":"permissions","end":""},{"old":"/api/v1/admin/permissions/:id/approve","type":1,"val":"id","end":""},{"old":"/api/v1/admin/permissions/:id/approve","type":0,"val":"approve","end":""}],
    types: placeholder as Registry['admin.admin_user_permissions.approve']['types'],
  },
  'admin.admin_user_permissions.reject': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/permissions/:id/reject',
    tokens: [{"old":"/api/v1/admin/permissions/:id/reject","type":0,"val":"api","end":""},{"old":"/api/v1/admin/permissions/:id/reject","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/permissions/:id/reject","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/permissions/:id/reject","type":0,"val":"permissions","end":""},{"old":"/api/v1/admin/permissions/:id/reject","type":1,"val":"id","end":""},{"old":"/api/v1/admin/permissions/:id/reject","type":0,"val":"reject","end":""}],
    types: placeholder as Registry['admin.admin_user_permissions.reject']['types'],
  },
  'admin.admin_user_permissions.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/permissions/:id',
    tokens: [{"old":"/api/v1/admin/permissions/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/permissions/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/permissions/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/permissions/:id","type":0,"val":"permissions","end":""},{"old":"/api/v1/admin/permissions/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_user_permissions.destroy']['types'],
  },
  'admin.admin_daily_works.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/daily-works',
    tokens: [{"old":"/api/v1/admin/daily-works","type":0,"val":"api","end":""},{"old":"/api/v1/admin/daily-works","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/daily-works","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/daily-works","type":0,"val":"daily-works","end":""}],
    types: placeholder as Registry['admin.admin_daily_works.index']['types'],
  },
  'admin.admin_daily_works.monthly': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/daily-works/monthly',
    tokens: [{"old":"/api/v1/admin/daily-works/monthly","type":0,"val":"api","end":""},{"old":"/api/v1/admin/daily-works/monthly","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/daily-works/monthly","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/daily-works/monthly","type":0,"val":"daily-works","end":""},{"old":"/api/v1/admin/daily-works/monthly","type":0,"val":"monthly","end":""}],
    types: placeholder as Registry['admin.admin_daily_works.monthly']['types'],
  },
  'admin.admin_daily_works.approve': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/daily-works/:id/approve',
    tokens: [{"old":"/api/v1/admin/daily-works/:id/approve","type":0,"val":"api","end":""},{"old":"/api/v1/admin/daily-works/:id/approve","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/daily-works/:id/approve","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/daily-works/:id/approve","type":0,"val":"daily-works","end":""},{"old":"/api/v1/admin/daily-works/:id/approve","type":1,"val":"id","end":""},{"old":"/api/v1/admin/daily-works/:id/approve","type":0,"val":"approve","end":""}],
    types: placeholder as Registry['admin.admin_daily_works.approve']['types'],
  },
  'admin.admin_daily_works.reject': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/daily-works/:id/reject',
    tokens: [{"old":"/api/v1/admin/daily-works/:id/reject","type":0,"val":"api","end":""},{"old":"/api/v1/admin/daily-works/:id/reject","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/daily-works/:id/reject","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/daily-works/:id/reject","type":0,"val":"daily-works","end":""},{"old":"/api/v1/admin/daily-works/:id/reject","type":1,"val":"id","end":""},{"old":"/api/v1/admin/daily-works/:id/reject","type":0,"val":"reject","end":""}],
    types: placeholder as Registry['admin.admin_daily_works.reject']['types'],
  },
  'admin.admin_leave_types.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/leave-types',
    tokens: [{"old":"/api/v1/admin/leave-types","type":0,"val":"api","end":""},{"old":"/api/v1/admin/leave-types","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/leave-types","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/leave-types","type":0,"val":"leave-types","end":""}],
    types: placeholder as Registry['admin.admin_leave_types.index']['types'],
  },
  'admin.admin_leave_types.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/leave-types',
    tokens: [{"old":"/api/v1/admin/leave-types","type":0,"val":"api","end":""},{"old":"/api/v1/admin/leave-types","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/leave-types","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/leave-types","type":0,"val":"leave-types","end":""}],
    types: placeholder as Registry['admin.admin_leave_types.store']['types'],
  },
  'admin.admin_leave_types.update': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/leave-types/:id',
    tokens: [{"old":"/api/v1/admin/leave-types/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/leave-types/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/leave-types/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/leave-types/:id","type":0,"val":"leave-types","end":""},{"old":"/api/v1/admin/leave-types/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_leave_types.update']['types'],
  },
  'admin.admin_leave_types.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/leave-types/:id',
    tokens: [{"old":"/api/v1/admin/leave-types/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/leave-types/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/leave-types/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/leave-types/:id","type":0,"val":"leave-types","end":""},{"old":"/api/v1/admin/leave-types/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_leave_types.destroy']['types'],
  },
  'admin.admin_announcements.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/announcements',
    tokens: [{"old":"/api/v1/admin/announcements","type":0,"val":"api","end":""},{"old":"/api/v1/admin/announcements","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/announcements","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/announcements","type":0,"val":"announcements","end":""}],
    types: placeholder as Registry['admin.admin_announcements.index']['types'],
  },
  'admin.admin_announcements.store': {
    methods: ["POST"],
    pattern: '/api/v1/admin/announcements',
    tokens: [{"old":"/api/v1/admin/announcements","type":0,"val":"api","end":""},{"old":"/api/v1/admin/announcements","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/announcements","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/announcements","type":0,"val":"announcements","end":""}],
    types: placeholder as Registry['admin.admin_announcements.store']['types'],
  },
  'admin.admin_announcements.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/announcements/:id',
    tokens: [{"old":"/api/v1/admin/announcements/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/announcements/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/announcements/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/announcements/:id","type":0,"val":"announcements","end":""},{"old":"/api/v1/admin/announcements/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_announcements.destroy']['types'],
  },
  'admin.admin_document_numbering.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/document-numbering',
    tokens: [{"old":"/api/v1/admin/document-numbering","type":0,"val":"api","end":""},{"old":"/api/v1/admin/document-numbering","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/document-numbering","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/document-numbering","type":0,"val":"document-numbering","end":""}],
    types: placeholder as Registry['admin.admin_document_numbering.index']['types'],
  },
  'admin.admin_document_numbering.upsert': {
    methods: ["PUT"],
    pattern: '/api/v1/admin/document-numbering/:id',
    tokens: [{"old":"/api/v1/admin/document-numbering/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/document-numbering/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/document-numbering/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/document-numbering/:id","type":0,"val":"document-numbering","end":""},{"old":"/api/v1/admin/document-numbering/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_document_numbering.upsert']['types'],
  },
  'admin.admin_document_numbering.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/admin/document-numbering/:id',
    tokens: [{"old":"/api/v1/admin/document-numbering/:id","type":0,"val":"api","end":""},{"old":"/api/v1/admin/document-numbering/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/document-numbering/:id","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/document-numbering/:id","type":0,"val":"document-numbering","end":""},{"old":"/api/v1/admin/document-numbering/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['admin.admin_document_numbering.destroy']['types'],
  },
  'admin.admin_document_numbering.preview': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/document-numbering/:id/preview',
    tokens: [{"old":"/api/v1/admin/document-numbering/:id/preview","type":0,"val":"api","end":""},{"old":"/api/v1/admin/document-numbering/:id/preview","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/document-numbering/:id/preview","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/document-numbering/:id/preview","type":0,"val":"document-numbering","end":""},{"old":"/api/v1/admin/document-numbering/:id/preview","type":1,"val":"id","end":""},{"old":"/api/v1/admin/document-numbering/:id/preview","type":0,"val":"preview","end":""}],
    types: placeholder as Registry['admin.admin_document_numbering.preview']['types'],
  },
  'admin.admin_document_numbering.consume': {
    methods: ["POST"],
    pattern: '/api/v1/admin/document-numbering/:id/consume',
    tokens: [{"old":"/api/v1/admin/document-numbering/:id/consume","type":0,"val":"api","end":""},{"old":"/api/v1/admin/document-numbering/:id/consume","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/document-numbering/:id/consume","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/document-numbering/:id/consume","type":0,"val":"document-numbering","end":""},{"old":"/api/v1/admin/document-numbering/:id/consume","type":1,"val":"id","end":""},{"old":"/api/v1/admin/document-numbering/:id/consume","type":0,"val":"consume","end":""}],
    types: placeholder as Registry['admin.admin_document_numbering.consume']['types'],
  },
  'admin.admin_document_numbering.undo': {
    methods: ["POST"],
    pattern: '/api/v1/admin/document-numbering/:id/undo',
    tokens: [{"old":"/api/v1/admin/document-numbering/:id/undo","type":0,"val":"api","end":""},{"old":"/api/v1/admin/document-numbering/:id/undo","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/document-numbering/:id/undo","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/document-numbering/:id/undo","type":0,"val":"document-numbering","end":""},{"old":"/api/v1/admin/document-numbering/:id/undo","type":1,"val":"id","end":""},{"old":"/api/v1/admin/document-numbering/:id/undo","type":0,"val":"undo","end":""}],
    types: placeholder as Registry['admin.admin_document_numbering.undo']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
