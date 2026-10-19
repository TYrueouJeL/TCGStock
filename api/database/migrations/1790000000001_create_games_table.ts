import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * The four supported trading card games. They are shared by every user
 * and inserted here so a fresh database is usable right away.
 */
export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('slug', 32).notNullable().unique()
      table.string('name', 64).notNullable()
      table.string('color', 16).notNullable()
      table.integer('position').notNullable().defaultTo(0)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.defer(async (db) => {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
      await db.table(this.tableName).multiInsert([
        { slug: 'onepiece', name: 'One Piece', color: '#c8262f', position: 1, created_at: now },
        { slug: 'pokemon', name: 'Pokémon', color: '#d9a400', position: 2, created_at: now },
        { slug: 'wankul', name: 'Wankul', color: '#1f9a72', position: 3, created_at: now },
        { slug: 'riftbound', name: 'Riftbound', color: '#7a3fd1', position: 4, created_at: now },
      ])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
