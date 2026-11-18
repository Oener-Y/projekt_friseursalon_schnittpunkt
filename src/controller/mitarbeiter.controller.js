import * as mitarbeiterService from '../service/mitarbeiter.service.js'

export async function getMitarbeiter(req, res) {
    try {
        const mitarbeiter = await mitarbeiterService.holeAlleMitarbeiter()
        res.json(mitarbeiter)
    } catch (error) {
        console.error('Fehler im Controller:', error)
        res.status(500).json({ fehler: 'Serverfehler' })
    }
}

export async function getMitarbeiterByLeistung(req, res) {
    const leistungId = req.params.leistungId
    try {
        const mitarbeiter = await mitarbeiterService.holeMitarbeiterNachLeistung(leistungId)
        res.json(mitarbeiter)
    } catch (error) {
        console.error('Fehler im Controller:', error)
        res.status(500).json({ fehler: 'Interner Serverfehler' })
    }
}