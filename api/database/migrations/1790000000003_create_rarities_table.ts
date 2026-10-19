import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rarities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('game_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('games')
        .onDelete('CASCADE')
      table.string('name', 80).notNullable()
      table.integer('position').notNullable().defaultTo(0)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.unique(['user_id', 'game_id', 'name'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
