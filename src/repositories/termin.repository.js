import pool from '../config/db.js'

export async function alleTermineAbrufen() {
    const [rows] = await pool.query('SELECT * FROM termin')
    return rows
}

export async function terminErstellen(kunde_id, mitarbeiter_id, leistung_id, datum, uhrzeit) {
    const sql = `
        INSERT INTO termin (kunde_id, mitarbeiter_id, leistung_id, datum, uhrzeit) 
        VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [kunde_id, mitarbeiter_id, leistung_id, datum, uhrzeit])
    return result
}

export async function verfuegbarkeitAbrufen(mitarbeiter_id, datum) {
    const sql = `
        SELECT t.uhrzeit, l.dauer_minuten 
        FROM termin t
        JOIN leistung l ON t.leistung_id = l.id
        WHERE t.mitarbeiter_id = ? AND t.datum = ?
    `;
    const [rows] = await pool.query(sql, [mitarbeiter_id, datum])
    return rows
}

export async function terminloeschen(terminId) {
    const sql = 'DELETE FROM termin WHERE id = ?'
    const [result] = await pool.query(sql, [terminId])
    return result
}