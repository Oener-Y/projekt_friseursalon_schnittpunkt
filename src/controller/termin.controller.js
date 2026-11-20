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
    try {
        const ergebnis = await terminService.erstelleTermin(req.body)
        res.status(201).json(ergebnis)
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ fehler: error.message })
        }
        console.error('Fehler beim Speichern:', error)
        res.status(500).json({ fehler: 'Serverfehler' })
    }
}

export async function getVerfuegbarkeit(req, res) {
    const { mitarbeiter_id, datum, leistung_id } = req.query

    if (!mitarbeiter_id || !datum || !leistung_id) {
        return res.status(400).json({
            fehler: 'Bitte mitarbeiter_id, datum und leistung_id als Parameter übergeben.'
        })
    }

    try {
        const verfuegbareUhrzeiten = await terminService.berechneFreieUhrzeiten(
            mitarbeiter_id,
            datum,
            leistung_id
        )
        res.json(verfuegbareUhrzeiten)
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ fehler: error.message })
        }
        console.error('Fehler beim Berechnen der Verfügbarkeit:', error)
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
            return res.status(404).json({ fehler: 'Der Termin existiert nicht.' })
        }
        console.error('Fehler beim Stornieren:', error)
        res.status(500).json({ fehler: 'Serverfehler' })
    }
}

export async function cancelTerminPerCode(req, res) {
    const { stornocode } = req.body

    try {
        const ergebnis = await terminService.storniereTerminPerCode(stornocode)
        res.json(ergebnis)
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ fehler: error.message })
        }
        console.error('Fehler beim Stornieren per Code:', error)
        res.status(500).json({ fehler: 'Serverfehler' })
    }
}