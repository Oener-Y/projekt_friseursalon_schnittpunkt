import pool from '../config/db.js'

export async function alleMitarbeiterAbrufen() {
    const [rows] = await pool.query('SELECT * FROM mitarbeiter')
    return rows
}

export async function mitarbeiterLeistungAbrufen(leistungId) {
    const sql = `
        SELECT m.* 
        FROM mitarbeiter m
        JOIN mitarbeiter_leistung ml ON m.id = ml.mitarbeiter_id
        WHERE ml.leistung_id = ?
    `;
    const [rows] = await pool.query(sql, [leistungId])
    return rows
}