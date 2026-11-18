import * as mitarbeiterRepository from '../repositories/mitarbeiter.repository.js'

export async function holeAlleMitarbeiter() {
    return await mitarbeiterRepository.alleMitarbeiterAbrufen()
}

export async function holeMitarbeiterNachLeistung(leistungId) {
    return await mitarbeiterRepository.mitarbeiterLeistungAbrufen(leistungId)
}