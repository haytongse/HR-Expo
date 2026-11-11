import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('full_name').nullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.string('phone_number', 20).nullable()
      table.string('address').nullable()
      table.string('birth_of_date', 20).nullable()
      table.string('profile_picture').nullable()
      table.string('role', 20).notNullable().defaultTo('user')
      table.string('status', 20).notNullable().defaultTo(1)
      table.string('campus_id', 20).nullable()
      table.string('fcm_token').nullable()
      table.string('refresh_token').nullable()
      table.string('expires_in').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
