import * as terminRepository from '../repositories/termin.repository.js'

export async function holeAlleTermine() {
    return await terminRepository.alleTermineAbrufen()
}

export async function erstelleTermin(daten) {
    const { kunde_id, mitarbeiter_id, leistung_id, datum, uhrzeit } = daten
    return await terminRepository.terminErstellen(kunde_id, mitarbeiter_id, leistung_id, datum, uhrzeit)
}

export async function pruefeVerfuegbarkeit(mitarbeiter_id, datum) {
    return await terminRepository.verfuegbarkeitAbrufen(mitarbeiter_id, datum)
}

export async function storniereTermin(terminId) {
    const result = await terminRepository.terminloeschen(terminId)

    if (result.affectedRows === 0) {
        throw new Error('Termin nicht gefunden')
    }
    return { erfolg: true, nachricht: 'Termin wurde erfolgreich storniert.'}
}