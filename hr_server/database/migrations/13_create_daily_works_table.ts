import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'daily_works'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().notNullable()
      table.integer('user_id').unsigned().notNullable()
      table.integer('campus_id').unsigned().nullable()
      table.integer('year').notNullable()
      table.integer('month').notNullable()
      table.integer('day').notNullable()
      table.string('time', 20).notNullable()
      table.string('photo_path').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at').nullable()

      table.foreign('user_id').references('users.id').onDelete('CASCADE')
      table.foreign('campus_id').references('campuses.id').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
