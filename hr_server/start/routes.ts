/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const AdminUsersController = () => import('#controllers/admin/users_controller')
const AdminTimetablesController = () => import('#controllers/admin/timetables_controller')
const AdminShiftSchedulesController = () => import('#controllers/admin/shift_schedules_controller')
const AdminCheckInsController = () => import('#controllers/admin/check_ins_controller')
const AdminCampusesController = () => import('#controllers/admin/campuses_controller')
const AdminCampusWifisController = () => import('#controllers/admin/campus_wifis_controller')
const AdminPublicHolidaysController = () => import('#controllers/admin/public_holidays_controller')
const AdminUserPermissionsController = () =>
  import('#controllers/admin/user_permissions_controller')
const AdminDailyWorksController = () => import('#controllers/admin/daily_works_controller')
const AdminLeaveTypesController = () => import('#controllers/admin/leave_types_controller')
const AdminAnnouncementsController = () => import('#controllers/admin/announcements_controller')
const AdminDocumentNumberingController = () => import('#controllers/admin/document_numbering_controller')
const AnnouncementsController = () => import('#controllers/announcements_controller')
const LeaveTypesController = () => import('#controllers/leave_types_controller')
const CheckInsController = () => import('#controllers/check_ins_controller')
const CampusesController = () => import('#controllers/campuses_controller')
const PublicHolidaysController = () => import('#controllers/public_holidays_controller')
const UserPermissionsController = () => import('#controllers/user_permissions_controller')
const DailyWorksController = () => import('#controllers/daily_works_controller')
const UserNotesController  = () => import('#controllers/user_notes_controller')

router.get('/test', () => {
  return { hello: 'Hello World' }
})

router
  .group(() => {
    // Auth
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessToken, 'store'])
        router.post('admin/login', [controllers.AccessToken, 'adminLogin'])
        router.post('logout', [controllers.AccessToken, 'destroy']).use(middleware.auth())
      })
      .prefix('auth')
      .as('auth')

    // Authenticated user routes
    router
      .group(() => {
        router.get('/profile', [controllers.Profile, 'show'])
        router.put('/profile', [controllers.Profile, 'update' as any])
        router.post('/profile-picture', [controllers.Profile, 'updateProfilePicture' as any])
        router.get('/my-shift', [controllers.Profile, 'myShift' as any])
        router.put('/fcm-token', [controllers.Profile, 'updateFcmToken'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    // Check-ins (user)
    router
      .group(() => {
        router.get('/', [CheckInsController, 'index'])
        router.get('/today', [CheckInsController, 'today'])
        router.get('/monthly-summary', [CheckInsController, 'monthlySummary'])
        router.post('/', [CheckInsController, 'store'])
      })
      .prefix('check-ins')
      .use(middleware.auth())

    // Campuses
    router
      .group(() => {
        router.get('/', [CampusesController, 'index'])
        router.get('/:code', [CampusesController, 'show'])
      })
      .prefix('campuses')
      .use(middleware.auth())

    // Public Holidays (read-only for users)
    router
      .group(() => {
        router.get('/', [PublicHolidaysController, 'index'])
      })
      .prefix('public-holidays')
      .use(middleware.auth())

    // User Permissions (leave requests)
    router
      .group(() => {
        router.get('/', [UserPermissionsController, 'index'])
        router.post('/', [UserPermissionsController, 'store'])
        router.delete('/:id', [UserPermissionsController, 'destroy'])
      })
      .prefix('permissions')
      .use(middleware.auth())

    // Daily Works (user)
    router
      .group(() => {
        router.get('/', [DailyWorksController, 'index'])
        router.post('/', [DailyWorksController, 'store'])
      })
      .prefix('daily-works')
      .use(middleware.auth())

    // User Notes (personal calendar notes)
    router
      .group(() => {
        router.get('/',     [UserNotesController, 'index'])
        router.post('/',    [UserNotesController, 'store'])
        router.put('/:id',  [UserNotesController, 'update'])
        router.delete('/:id', [UserNotesController, 'destroy'])
      })
      .prefix('notes')
      .use(middleware.auth())

    // Leave Types (read-only for users)
    router
      .group(() => {
        router.get('/', [LeaveTypesController, 'index'])
      })
      .prefix('leave-types')
      .use(middleware.auth())

    // Announcements (user: read published + read tracking)
    router
      .group(() => {
        router.get('/', [AnnouncementsController, 'index'])
        router.get('/unread-count', [AnnouncementsController, 'unreadCount'])
        router.post('/read-all', [AnnouncementsController, 'markAllRead'])
        router.post('/:id/read', [AnnouncementsController, 'markRead'])
      })
      .prefix('announcements')
      .use(middleware.auth())

    // Admin routes
    router
      .group(() => {
        // Users
        router.get('/users', [AdminUsersController, 'index'])
        router.post('/users', [AdminUsersController, 'store'])
        router.post('/users/import', [AdminUsersController, 'importUsers'])
        router.put('/users/:id', [AdminUsersController, 'update'])
        router.delete('/users/:id', [AdminUsersController, 'destroy'])

        // Timetables
        router.get('/timetables', [AdminTimetablesController, 'index'])
        router.post('/timetables', [AdminTimetablesController, 'store'])
        router.put('/timetables/:id', [AdminTimetablesController, 'update'])
        router.delete('/timetables/:id', [AdminTimetablesController, 'destroy'])

        // Shift Schedules
        router.get('/shifts', [AdminShiftSchedulesController, 'index'])
        router.post('/shifts', [AdminShiftSchedulesController, 'store'])
        router.get('/shifts/:id', [AdminShiftSchedulesController, 'show'])
        router.put('/shifts/:id', [AdminShiftSchedulesController, 'update'])
        router.delete('/shifts/:id', [AdminShiftSchedulesController, 'destroy'])
        router.post('/shifts/:id/assign', [AdminShiftSchedulesController, 'assignUser'])
        router.delete('/shifts/:id/users/:userId', [AdminShiftSchedulesController, 'unassignUser'])

        // Check-ins (admin)
        router.get('/check-ins', [AdminCheckInsController, 'index'])
        router.get('/check-ins/summary', [AdminCheckInsController, 'summary'])
        router.get('/check-ins/monthly', [AdminCheckInsController, 'monthly'])
        router.get('/check-ins/user-ids', [AdminCheckInsController, 'userIds'])

        // Campuses (admin)
        router.get('/campuses', [AdminCampusesController, 'index'])
        router.post('/campuses', [AdminCampusesController, 'store'])
        router.post('/campuses/import', [AdminCampusesController, 'importCampuses'])
        router.put('/campuses/:id', [AdminCampusesController, 'update'])
        router.delete('/campuses/:id', [AdminCampusesController, 'destroy'])

        // Campus WiFi names
        router.get('/campuses/:campusId/wifis', [AdminCampusWifisController, 'index'])
        router.post('/campuses/:campusId/wifis', [AdminCampusWifisController, 'store'])
        router.delete('/campuses/:campusId/wifis/:id', [AdminCampusWifisController, 'destroy'])

        // Public Holidays (admin CRUD)
        router.get('/public-holidays', [AdminPublicHolidaysController, 'index'])
        router.post('/public-holidays', [AdminPublicHolidaysController, 'store'])
        router.put('/public-holidays/:id', [AdminPublicHolidaysController, 'update'])
        router.delete('/public-holidays/:id', [AdminPublicHolidaysController, 'destroy'])

        // User Permissions (admin: list, approve, reject, delete)
        router.get('/permissions', [AdminUserPermissionsController, 'index'])
        router.put('/permissions/:id/approve', [AdminUserPermissionsController, 'approve'])
        router.put('/permissions/:id/reject', [AdminUserPermissionsController, 'reject'])
        router.delete('/permissions/:id', [AdminUserPermissionsController, 'destroy'])

        // Daily Works (admin: list, approve, reject)
        router.get('/daily-works', [AdminDailyWorksController, 'index'])
        router.get('/daily-works/monthly', [AdminDailyWorksController, 'monthly'])
        router.put('/daily-works/:id/approve', [AdminDailyWorksController, 'approve'])
        router.put('/daily-works/:id/reject', [AdminDailyWorksController, 'reject'])

        // Leave Types (admin CRUD)
        router.get('/leave-types', [AdminLeaveTypesController, 'index'])
        router.post('/leave-types', [AdminLeaveTypesController, 'store'])
        router.put('/leave-types/:id', [AdminLeaveTypesController, 'update'])
        router.delete('/leave-types/:id', [AdminLeaveTypesController, 'destroy'])

        // Announcements (admin CRUD)
        router.get('/announcements', [AdminAnnouncementsController, 'index'])
        router.post('/announcements', [AdminAnnouncementsController, 'store'])
        router.delete('/announcements/:id', [AdminAnnouncementsController, 'destroy'])

        // Document Numbering (admin CRUD + counter actions)
        router.get('/document-numbering', [AdminDocumentNumberingController, 'index'])
        router.put('/document-numbering/:id', [AdminDocumentNumberingController, 'upsert'])
        router.delete('/document-numbering/:id', [AdminDocumentNumberingController, 'destroy'])
        router.get('/document-numbering/:id/preview', [AdminDocumentNumberingController, 'preview'])
        router.post('/document-numbering/:id/consume', [AdminDocumentNumberingController, 'consume'])
        router.post('/document-numbering/:id/undo', [AdminDocumentNumberingController, 'undo'])
      })
      .prefix('admin')
      .as('admin')
      .use(middleware.admin())
  })
  .prefix('/api/v1')
