import pool from '../config/db.js'

export async function alleLeistungenAbrufen() {
    const [rows] = await pool.query('SELECT * FROM leistung')
    return rows
}