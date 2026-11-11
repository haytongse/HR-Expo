import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'daily_work_photos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().notNullable()
      table.integer('daily_work_id').unsigned().notNullable()
      table.string('photo_path').notNullable()
      table.timestamp('created_at')

      table.foreign('daily_work_id').references('daily_works.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
