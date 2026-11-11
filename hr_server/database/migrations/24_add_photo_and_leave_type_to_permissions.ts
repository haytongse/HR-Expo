import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_permissions'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table
        .integer('leave_type_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('leave_types')
        .onDelete('SET NULL')
      table.string('photo_path').nullable()
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropForeign('leave_type_id')
      table.dropColumn('leave_type_id')
      table.dropColumn('photo_path')
    })
  }
}
