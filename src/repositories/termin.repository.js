import pool from '../config/db.js'

export async function alleTermineAbrufen() {
    const [rows] = await pool.query('SELECT * FROM termin')
    return rows
}

export async function hatUeberschneidendenTermin(mitarbeiterId, beginnString, endeString, connection = pool) {
    const sql = `
        SELECT id
        FROM termin
        WHERE mitarbeiter_id = ?
          AND status = 'gebucht'
          AND beginn < ?
          AND ende > ?
        LIMIT 1
    `;
    const [rows] = await connection.query(sql, [mitarbeiterId, endeString, beginnString])
    return rows.length > 0
}

export async function terminErstellen(
    kundeId,
    mitarbeiterId,
    leistungId,
    beginn,
    ende,
    status,
    preisZumZeitpunkt,
    stornocode,
    connection = pool
) {
    const sql = `
        INSERT INTO termin (
            kunde_id,
            mitarbeiter_id,
            leistung_id,
            beginn,
            ende,
            status,
            preis_zum_zeitpunkt,
            stornocode
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.query(sql, [
        kundeId,
        mitarbeiterId,
        leistungId,
        beginn,
        ende,
        status,
        preisZumZeitpunkt,
        stornocode
    ])
    return result
}

export async function verfuegbarkeitAbrufen(mitarbeiter_id, datum) {
    const sql = `
        SELECT t.beginn, t.ende, l.dauer_minuten
        FROM termin t
        JOIN leistung l ON t.leistung_id = l.id
        WHERE t.mitarbeiter_id = ?
          AND DATE(t.beginn) = ?
          AND t.status = 'gebucht'
    `;
    const [rows] = await pool.query(sql, [mitarbeiter_id, datum])
    return rows
}

export async function terminLoeschen(terminId) {
    const sql = 'DELETE FROM termin WHERE id = ?'
    const [result] = await pool.query(sql, [terminId])
    return result
}

export async function terminNachStornocodeSuchen(stornocode) {
    const sql = `
        SELECT
            t.id,
            t.beginn,
            t.ende,
            t.status,
            t.stornocode,
            l.name AS leistung_name,
            m.name AS mitarbeiter_name
        FROM termin t
        JOIN leistung l ON t.leistung_id = l.id
        JOIN mitarbeiter m ON t.mitarbeiter_id = m.id
        WHERE t.stornocode = ?
        LIMIT 1
    `;
    const [rows] = await pool.query(sql, [stornocode])
    return rows[0] || null
}

export async function terminStatusAktualisieren(terminId, neuerStatus) {
    const sql = `
        UPDATE termin
        SET status = ?
        WHERE id = ?
    `;
    const [result] = await pool.query(sql, [neuerStatus, terminId])
    return result
}