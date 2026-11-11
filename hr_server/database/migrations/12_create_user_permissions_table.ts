import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_permissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('type', 30).notNullable().defaultTo('leave') // leave | sick | permission
      table.date('start_date').notNullable()
      table.date('end_date').notNullable()
      table.integer('amount_day').notNullable().defaultTo(1)
      table.text('reason').nullable()
      table.string('status', 20).notNullable().defaultTo('pending') // pending | approved | rejected
      table
        .integer('approved_by')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
