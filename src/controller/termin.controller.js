import * as terminService from '../service/termin.service.js'

export async function getTermine(req, res) {
    try {
        const termine = await terminService.holeAlleTermine()
        res.json(termine)
    } catch (error) {
        console.error('Fehler beim Laden:', error)
        res.status(500).json({ fehler: 'Serverfehler' })
    }
}

export async function createTermin(req, res) {
    const { kunde_id, mitarbeiter_id, leistung_id, datum, uhrzeit } = req.body

    if (!kunde_id || !mitarbeiter_id || !leistung_id || !datum || !uhrzeit) {
        return res.status(400).json({ fehler: 'Bitte alle Pflichtfelder ausfüllen.' })
    }

    try {
        const result = await terminService.erstelleTermin(req.body)
        res.status(201).json({ 
            erfolg: true, 
            nachricht: 'Termin erfolgreich gebucht!', 
            terminId: result.insertId 
        })
    } catch (error) {
        console.error('Fehler beim speichern', error)
        res.status(500).json({ fehler: 'Serverfehler' })
    }
}

export async function getVerfuegbarkeit(req, res) {
    const { mitarbeiter_id, datum } = req.query

    if (!mitarbeiter_id || !datum) {
        return res.status(400).json({ fehler: 'Bitte mitarbeiter_id und datum als Parameter übergeben.' })
    }

    try {
        const rows = await terminService.pruefeVerfuegbarkeit(mitarbeiter_id, datum)
        res.json(rows)
    } catch (error) {
        console.error('Fehler beim Laden', error)
        res.status(500).json({ fehler: 'Serverfehler' })
    }
}

export async function cancelTermin(req, res) {
    const terminId = req.params.id

    try {
        const ergebnis = await terminService.storniereTermin(terminId)
        res.json(ergebnis)
    } catch (error) {
        if (error.message === 'Termin nicht gefunden') {
            return res.status(404).json({ fehler: 'Der Termin existiert nicht.'})
        }
        console.error('Fehler beim stornieren:', error)
        res.status(500).json({ fehler: 'Serverfehler'})
    }
}