import * as leistungRepository from '../repositories/leistung.repository.js'

export async function holeLeistungen() {
    return await leistungRepository.alleLeistungenAbrufen()
}