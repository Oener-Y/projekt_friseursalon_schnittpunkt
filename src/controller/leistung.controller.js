import * as leistungService from '../service/leistung.service.js'

export async function getLeistungen(req, res) {
    try {
        const leistungen = await leistungService.holeLeistungen()
        res.json(leistungen)
    } catch (error) {
        console.error('Fehler beim Laden:', error)
        res.status(500).json({ fehler: 'Serverfehler' })
    }
}