import pool from '../config/db.js'

export async function kundeNachEmailSuchen(email, connection = pool) {
    const [rows] = await connection.query(
        'SELECT * FROM kunde WHERE LOWER(email) = LOWER(?) LIMIT 1',
        [email]
    )
    return rows[0] || null
}

export async function kundeAnlegen(name, telefonnummer, email, connection = pool) {
    const [result] = await connection.query(
        'INSERT INTO kunde (name, telefonnummer, email) VALUES (?, ?, ?)',
        [name, telefonnummer, email]
    )
    return result.insertId
}

export async function kundeAktualisieren(id, name, telefonnummer, connection = pool) {
    await connection.query(
        'UPDATE kunde SET name = ?, telefonnummer = ? WHERE id = ?',
        [name, telefonnummer, id]
    )
}