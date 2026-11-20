import pool from '../config/db.js'

export async function alleLeistungenAbrufen() {
    const [rows] = await pool.query('SELECT * FROM leistung')
    return rows
}

export async function leistungNachIdAbrufen(leistungId) {
    const [rows] = await pool.query('SELECT * FROM leistung WHERE id = ?', [leistungId])
    return rows[0] || null
}