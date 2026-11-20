import crypto from 'crypto'
import pool from '../config/db.js'
import * as terminRepository from '../repositories/termin.repository.js'
import * as leistungRepository from '../repositories/leistung.repository.js'
import * as mitarbeiterRepository from '../repositories/mitarbeiter.repository.js'
import * as kundeRepository from '../repositories/kunde.repository.js'

function erstelleFehler(nachricht, statusCode) {
    const fehler = new Error(nachricht)
    fehler.statusCode = statusCode
    return fehler
}

function wandleUhrzeitInMinuten(uhrzeitWert) {
    const teile = String(uhrzeitWert).split(':')
    return Number(teile[0]) * 60 + Number(teile[1])
}

function wandleMinutenInUhrzeit(minutenGesamt) {
    const stunden = String(Math.floor(minutenGesamt / 60)).padStart(2, '0')
    const minuten = String(minutenGesamt % 60).padStart(2, '0')
    return stunden + ':' + minuten
}

function formuliereLokalesDatum(datumObjekt) {
    const jahr = datumObjekt.getFullYear()
    const monat = String(datumObjekt.getMonth() + 1).padStart(2, '0')
    const tag = String(datumObjekt.getDate()).padStart(2, '0')
    return jahr + '-' + monat + '-' + tag
}

function formuliereSqlDatetime(datumString, minutenGesamt) {
    return datumString + ' ' + wandleMinutenInUhrzeit(minutenGesamt) + ':00'
}

function extrahiereZeitTeil(datetimeWert) {
    if (datetimeWert instanceof Date) {
        const stunden = String(datetimeWert.getHours()).padStart(2, '0')
        const minuten = String(datetimeWert.getMinutes()).padStart(2, '0')
        return stunden + ':' + minuten
    }
    const text = String(datetimeWert)
    return text.includes('T') ? text.split('T')[1] : text.split(' ')[1]
}

function ermittleOeffnungszeiten(datumString) {
    const teile = datumString.split('-')
    const datumObjekt = new Date(Number(teile[0]), Number(teile[1]) - 1, Number(teile[2]))
    const wochentag = datumObjekt.getDay()

    if (wochentag >= 2 && wochentag <= 5) {
        return { startMinuten: 9 * 60, endeMinuten: 18 * 60 }
    }
    if (wochentag === 6) {
        return { startMinuten: 9 * 60, endeMinuten: 14 * 60 }
    }
    return null
}

function pruefeZeitUndDatumRegeln(datumString, uhrzeitString, dauerMinuten) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datumString)) {
        throw erstelleFehler('Ungültiges Datumsformat.', 400)
    }

    if (!/^\d{2}:\d{2}$/.test(uhrzeitString)) {
        throw erstelleFehler('Ungültiges Uhrzeitformat.', 400)
    }

    const jetzt = new Date()
    const spaeter = new Date(jetzt.getFullYear(), jetzt.getMonth() + 3, jetzt.getDate())
    const heuteText = formuliereLokalesDatum(jetzt)
    const spaeterText = formuliereLokalesDatum(spaeter)

    if (datumString < heuteText) {
        throw erstelleFehler('Termine in der Vergangenheit sind nicht buchbar.', 400)
    }

    if (datumString > spaeterText) {
        throw erstelleFehler('Buchungen sind höchstens drei Monate im Voraus möglich.', 400)
    }

    const oeffnungszeiten = ermittleOeffnungszeiten(datumString)
    if (!oeffnungszeiten) {
        throw erstelleFehler('An diesem Tag hat der Salon geschlossen.', 400)
    }

    const startMinuten = wandleUhrzeitInMinuten(uhrzeitString)
    const endeMinuten = startMinuten + Number(dauerMinuten)

    if (startMinuten % 15 !== 0) {
        throw erstelleFehler('Termine sind nur im Viertelstundentakt buchbar.', 400)
    }

    if (startMinuten < oeffnungszeiten.startMinuten || endeMinuten > oeffnungszeiten.endeMinuten) {
        throw erstelleFehler('Der Termin liegt nicht vollständig innerhalb der Öffnungszeiten.', 400)
    }

    if (datumString === heuteText) {
        const fruehesteMinutenHeute = jetzt.getHours() * 60 + jetzt.getMinutes() + 120
        if (startMinuten < fruehesteMinutenHeute) {
            throw erstelleFehler('Termine müssen mindestens zwei Stunden im Voraus gebucht werden.', 400)
        }
    }

    return { startMinuten, endeMinuten }
}

function istSlotFreiBeiTerminen(slotStart, dauerMinuten, belegteTermine) {
    const slotEnde = slotStart + dauerMinuten

    return !belegteTermine.some(function(termin) {
        const terminStart = wandleUhrzeitInMinuten(extrahiereZeitTeil(termin.beginn))
        const terminEnde = termin.ende
            ? wandleUhrzeitInMinuten(extrahiereZeitTeil(termin.ende))
            : terminStart + Number(termin.dauer_minuten)

        return slotStart < terminEnde && slotEnde > terminStart
    })
}

export async function holeAlleTermine() {
    return await terminRepository.alleTermineAbrufen()
}

export async function erstelleTermin(daten) {
    const {
        kunde_name,
        kunde_telefonnummer,
        kunde_email,
        mitarbeiter_id,
        leistung_id,
        datum,
        uhrzeit
    } = daten

    const nameBereinigt = String(kunde_name || '').trim()
    const telefonBereinigt = String(kunde_telefonnummer || '').trim()
    const emailBereinigt = String(kunde_email || '').trim().toLowerCase()

    if (!nameBereinigt || !telefonBereinigt || !emailBereinigt || !mitarbeiter_id || !leistung_id || !datum || !uhrzeit) {
        throw erstelleFehler('Bitte alle Pflichtfelder vollständig ausfüllen.', 400)
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailBereinigt)) {
        throw erstelleFehler('Bitte eine gültige E-Mail-Adresse eingeben.', 400)
    }

    const leistung = await leistungRepository.leistungNachIdAbrufen(leistung_id)
    if (!leistung) {
        throw erstelleFehler('Die gewählte Leistung existiert nicht.', 404)
    }

    const dauerMinuten = Number(leistung.dauer_minuten)
    const { startMinuten, endeMinuten } = pruefeZeitUndDatumRegeln(datum, uhrzeit, dauerMinuten)
    const beginnSql = formuliereSqlDatetime(datum, startMinuten)
    const endeSql = formuliereSqlDatetime(datum, endeMinuten)

    const zustaendigeMitarbeiter = await mitarbeiterRepository.mitarbeiterLeistungAbrufen(leistung_id)
    const berechtigteIds = new Set(
        zustaendigeMitarbeiter.map(function(person) {
            return Number(person.id)
        })
    )

    if (String(mitarbeiter_id) !== 'egal') {
        const gewaehlteId = Number(mitarbeiter_id)
        if (!berechtigteIds.has(gewaehlteId)) {
            throw erstelleFehler('Die gewählte Person bietet diese Leistung nicht an.', 400)
        }
    } else if (zustaendigeMitarbeiter.length === 0) {
        throw erstelleFehler('Für diese Leistung steht aktuell niemand zur Verfügung.', 400)
    }

    const verbindung = await pool.getConnection()

    try {
        await verbindung.beginTransaction()

        let gewaehlterMitarbeiterId = null

        if (String(mitarbeiter_id) === 'egal') {
            for (const person of zustaendigeMitarbeiter) {
                const istBelegt = await terminRepository.hatUeberschneidendenTermin(
                    person.id,
                    beginnSql,
                    endeSql,
                    verbindung
                )
                if (!istBelegt) {
                    gewaehlterMitarbeiterId = person.id
                    break
                }
            }

            if (!gewaehlterMitarbeiterId) {
                throw erstelleFehler('Zu dieser Uhrzeit ist leider keine passende Person mehr frei.', 409)
            }
        } else {
            gewaehlterMitarbeiterId = Number(mitarbeiter_id)
            const istBelegt = await terminRepository.hatUeberschneidendenTermin(
                gewaehlterMitarbeiterId,
                beginnSql,
                endeSql,
                verbindung
            )

            if (istBelegt) {
                throw erstelleFehler('Dieser Zeitraum ist für die gewählte Person bereits belegt.', 409)
            }
        }

        let kunde = await kundeRepository.kundeNachEmailSuchen(emailBereinigt, verbindung)
        let kundeId = null

        if (kunde) {
            kundeId = kunde.id
            await kundeRepository.kundeAktualisieren(kundeId, nameBereinigt, telefonBereinigt, verbindung)
        } else {
            kundeId = await kundeRepository.kundeAnlegen(nameBereinigt, telefonBereinigt, emailBereinigt, verbindung)
        }

        const stornocode = crypto.randomUUID()
        const preisZumZeitpunkt = Number(leistung.preis)

        const ergebnis = await terminRepository.terminErstellen(
            kundeId,
            gewaehlterMitarbeiterId,
            Number(leistung_id),
            beginnSql,
            endeSql,
            'gebucht',
            preisZumZeitpunkt,
            stornocode,
            verbindung
        )

        await verbindung.commit()

        return {
            erfolg: true,
            nachricht: 'Termin erfolgreich gebucht!',
            terminId: ergebnis.insertId,
            stornocode: stornocode,
            beginn: beginnSql,
            ende: endeSql,
            mitarbeiter_id: gewaehlterMitarbeiterId,
            preis_zum_zeitpunkt: preisZumZeitpunkt
        }
    } catch (error) {
        await verbindung.rollback()
        throw error
    } finally {
        verbindung.release()
    }
}

export async function pruefeVerfuegbarkeit(mitarbeiter_id, datum) {
    return await terminRepository.verfuegbarkeitAbrufen(mitarbeiter_id, datum)
}

export async function berechneFreieUhrzeiten(mitarbeiterId, datumString, leistungId) {
    const datumFormatGueltig = /^\d{4}-\d{2}-\d{2}$/.test(datumString)
    if (!datumFormatGueltig) {
        throw erstelleFehler('Ungültiges Datumsformat.', 400)
    }

    const jetzt = new Date()
    const spaeter = new Date(jetzt.getFullYear(), jetzt.getMonth() + 3, jetzt.getDate())
    const heuteText = formuliereLokalesDatum(jetzt)
    const spaeterText = formuliereLokalesDatum(spaeter)

    if (datumString < heuteText) {
        throw erstelleFehler('Termine in der Vergangenheit sind nicht buchbar.', 400)
    }

    if (datumString > spaeterText) {
        throw erstelleFehler('Buchungen sind höchstens drei Monate im Voraus möglich.', 400)
    }

    const oeffnungszeiten = ermittleOeffnungszeiten(datumString)
    if (!oeffnungszeiten) {
        return []
    }

    const leistung = await leistungRepository.leistungNachIdAbrufen(leistungId)
    if (!leistung) {
        throw erstelleFehler('Die gewählte Leistung existiert nicht.', 404)
    }

    const dauerMinuten = Number(leistung.dauer_minuten)
    const istHeute = datumString === heuteText
    const fruehesteMinutenHeute = jetzt.getHours() * 60 + jetzt.getMinutes() + 120

    const moeglicheSlots = []
    for (
        let slotStart = oeffnungszeiten.startMinuten;
        slotStart + dauerMinuten <= oeffnungszeiten.endeMinuten;
        slotStart += 15
    ) {
        if (istHeute && slotStart < fruehesteMinutenHeute) {
            continue
        }
        moeglicheSlots.push(slotStart)
    }

    if (String(mitarbeiterId) === 'egal') {
        const zustaendigeMitarbeiter = await mitarbeiterRepository.mitarbeiterLeistungAbrufen(leistungId)

        if (!zustaendigeMitarbeiter || zustaendigeMitarbeiter.length === 0) {
            return []
        }

        const belegteListenProPerson = await Promise.all(
            zustaendigeMitarbeiter.map(function(person) {
                return terminRepository.verfuegbarkeitAbrufen(person.id, datumString)
            })
        )

        const freieSlotsEgal = moeglicheSlots.filter(function(slotStart) {
            return belegteListenProPerson.some(function(belegteTermine) {
                return istSlotFreiBeiTerminen(slotStart, dauerMinuten, belegteTermine)
            })
        })

        return freieSlotsEgal.map(wandleMinutenInUhrzeit)
    }

    const belegteTermine = await terminRepository.verfuegbarkeitAbrufen(mitarbeiterId, datumString)
    const freieSlots = moeglicheSlots.filter(function(slotStart) {
        return istSlotFreiBeiTerminen(slotStart, dauerMinuten, belegteTermine)
    })

    return freieSlots.map(wandleMinutenInUhrzeit)
}

export async function storniereTermin(terminId) {
    const result = await terminRepository.terminLoeschen(terminId)

    if (result.affectedRows === 0) {
        throw new Error('Termin nicht gefunden')
    }
    return { erfolg: true, nachricht: 'Termin wurde erfolgreich storniert.' }
}

export async function storniereTerminPerCode(stornocode) {
    const codeBereinigt = String(stornocode || '').trim()

    if (!codeBereinigt) {
        throw erstelleFehler('Bitte geben Sie Ihren Stornocode ein.', 400)
    }

    const termin = await terminRepository.terminNachStornocodeSuchen(codeBereinigt)
    if (!termin) {
        throw erstelleFehler('Zu diesem Stornocode wurde kein Termin gefunden.', 404)
    }

    if (termin.status === 'storniert') {
        throw erstelleFehler('Dieser Termin wurde bereits storniert.', 409)
    }

    if (termin.status === 'erledigt') {
        throw erstelleFehler('Ein bereits erledigter Termin kann nicht mehr storniert werden.', 409)
    }

    const terminBeginn = new Date(termin.beginn)
    const jetzt = new Date()
    const vierundzwanzigStundenInMillisekunden = 24 * 60 * 60 * 1000
    const verbleibendeZeit = terminBeginn.getTime() - jetzt.getTime()

    if (verbleibendeZeit < vierundzwanzigStundenInMillisekunden) {
        throw erstelleFehler(
            'Eine Stornierung ist nur bis mindestens 24 Stunden vor Terminbeginn möglich. Bitte wenden Sie sich telefonisch an den Salon.',
            400
        )
    }

    await terminRepository.terminStatusAktualisieren(termin.id, 'storniert')

    return {
        erfolg: true,
        nachricht: 'Ihr Termin wurde erfolgreich storniert.',
        termin: {
            id: termin.id,
            leistung: termin.leistung_name,
            mitarbeiter: termin.mitarbeiter_name,
            beginn: termin.beginn,
            status: 'storniert'
        }
    }
}