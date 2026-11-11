import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'announcements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().notNullable()
      table.string('title').notNullable()
      table.text('body').nullable()
      table.dateTime('scheduled_at').nullable()
      table.integer('created_by').unsigned().nullable()
      table.foreign('created_by').references('users.id').onDelete('SET NULL')
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
