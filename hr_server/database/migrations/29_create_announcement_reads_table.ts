import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'announcement_reads'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().notNullable()
      table.integer('user_id').unsigned().notNullable().references('users.id').onDelete('CASCADE')
      table
        .integer('announcement_id')
        .unsigned()
        .notNullable()
        .references('announcements.id')
        .onDelete('CASCADE')
      table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(this.now())
      table.unique(['user_id', 'announcement_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
