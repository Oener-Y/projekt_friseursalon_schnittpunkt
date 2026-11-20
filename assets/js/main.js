document.addEventListener("DOMContentLoaded", function() {
    holeLeistungen()
    holeMitarbeiter()
    initialisiereMitarbeiterButtons()
    initialisiereDatum()
    initialisiereBuchung()
})

function holeLeistungen() {
    fetch('/api/leistungen')
        .then(function(antwort) {
            return antwort.json()
        })
        .then(function(leistungen) {
            const container = document.getElementById('leistungs-container')
            container.innerHTML = ''

            leistungen.forEach(function(leistung) {
                const feldLeistung = document.createElement('div')
                feldLeistung.className = 'card'
                feldLeistung.dataset.id = leistung.id
                feldLeistung.innerHTML = '<h4>' + leistung.name + '</h4>' +
                    '<p>' + leistung.dauer_minuten + ' Min - ' + leistung.preis + ' €</p>'

                feldLeistung.addEventListener('click', function() {
                    const alleLeistungsfelder = document.querySelectorAll('#leistungs-container .card')
                    alleLeistungsfelder.forEach(function(karte) {
                        karte.classList.remove('selected')
                    })

                    feldLeistung.classList.add('selected')
                    ladeUhrzeiten()
                })

                container.appendChild(feldLeistung)
            })
        })
        .catch(function(fehler) {
            console.error('Fehler beim Laden der Leistungen:', fehler)
        })
}

function holeMitarbeiter() {
    fetch('/api/mitarbeiter')
        .then(function(antwort) {
            return antwort.json()
        })
        .then(function(mitarbeiterListe) {
            const container = document.getElementById('mitarbeiter-container')

            mitarbeiterListe.forEach(function(mitarbeiter) {
                const button = document.createElement('button')
                button.type = 'button'
                button.className = 'ma-btn'
                button.textContent = mitarbeiter.name
                button.dataset.id = mitarbeiter.id

                button.addEventListener('click', function() {
                    const alleButtons = document.querySelectorAll('#mitarbeiter-container .ma-btn')
                    alleButtons.forEach(function(btn) {
                        btn.classList.remove('active')
                    })

                    button.classList.add('active')
                    ladeUhrzeiten()
                })

                container.appendChild(button)
            })
        })
        .catch(function(fehler) {
            console.error('Fehler beim Laden der Mitarbeiter:', fehler)
        })
}

function initialisiereMitarbeiterButtons() {
    const alleButtons = document.querySelectorAll('#mitarbeiter-container .ma-btn')
    alleButtons.forEach(function(button) {
        if (button.dataset.listenerAttached === 'true') {
            return
        }
        button.dataset.listenerAttached = 'true'

        button.addEventListener('click', function() {
            const aktuelleButtons = document.querySelectorAll('#mitarbeiter-container .ma-btn')
            aktuelleButtons.forEach(function(btn) {
                btn.classList.remove('active')
            })

            button.classList.add('active')
            ladeUhrzeiten()
        })
    })
}

function formuliereLokalesDatum(datumObjekt) {
    const jahr = datumObjekt.getFullYear()
    const monat = String(datumObjekt.getMonth() + 1).padStart(2, '0')
    const tag = String(datumObjekt.getDate()).padStart(2, '0')
    return jahr + '-' + monat + '-' + tag
}

function initialisiereDatum() {
    const datumInput = document.getElementById('datum-auswahl')
    const heute = new Date()
    const spaeter = new Date(heute.getFullYear(), heute.getMonth() + 3, heute.getDate())

    const heuteText = formuliereLokalesDatum(heute)
    const spaeterText = formuliereLokalesDatum(spaeter)

    datumInput.value = heuteText
    datumInput.min = heuteText
    datumInput.max = spaeterText

    datumInput.addEventListener('change', function() {
        ladeUhrzeiten()
    })
}

function ladeUhrzeiten() {
    const containerUhrzeiten = document.getElementById('uhrzeit-container')
    const ausgewaehlteLeistung = document.querySelector('#leistungs-container .card.selected')
    const aktiverMitarbeiter = document.querySelector('#mitarbeiter-container .ma-btn.active')
    const datumInput = document.getElementById('datum-auswahl')

    if (!ausgewaehlteLeistung || !aktiverMitarbeiter || !datumInput.value) {
        containerUhrzeiten.innerHTML = '<p style="color: #666; font-size: 14px;">Bitte erst Leistung, Datum und Mitarbeiter wählen.</p>'
        return
    }

    const leistungId = ausgewaehlteLeistung.dataset.id
    const mitarbeiterId = aktiverMitarbeiter.dataset.id
    const datum = datumInput.value

    const abfrageAdresse = '/api/termine/verfuegbarkeit?mitarbeiter_id=' +
        encodeURIComponent(mitarbeiterId) +
        '&datum=' +
        encodeURIComponent(datum) +
        '&leistung_id=' +
        encodeURIComponent(leistungId)

    fetch(abfrageAdresse)
        .then(function(antwort) {
            return antwort.json().then(function(daten) {
                if (!antwort.ok) {
                    throw new Error(daten.fehler || 'Fehler beim Laden der Uhrzeiten.')
                }
                return daten
            })
        })
        .then(function(uhrzeitenListe) {
            zeigeUhrzeitButtons(uhrzeitenListe)
        })
        .catch(function(fehler) {
            containerUhrzeiten.innerHTML = '<p style="color: #666; font-size: 14px;">' + fehler.message + '</p>'
        })
}

function zeigeUhrzeitButtons(uhrzeitenListe) {
    const containerUhrzeiten = document.getElementById('uhrzeit-container')
    containerUhrzeiten.innerHTML = ''

    if (!Array.isArray(uhrzeitenListe) || uhrzeitenListe.length === 0) {
        containerUhrzeiten.innerHTML = '<p style="color: #666; font-size: 14px;">Für diese Auswahl sind keine freien Uhrzeiten verfügbar.</p>'
        return
    }

    uhrzeitenListe.forEach(function(zeitText) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'uhrzeit-btn'
        button.textContent = zeitText

        button.addEventListener('click', function() {
            const alleButtons = document.querySelectorAll('#uhrzeit-container .uhrzeit-btn')
            alleButtons.forEach(function(btn) {
                btn.classList.remove('active')
            })

            button.classList.add('active')
            console.log('Ausgewählte Uhrzeit:', zeitText)
        })

        containerUhrzeiten.appendChild(button)
    })
}

function initialisiereBuchung() {
    const buchenButton = document.getElementById('termin-buchen-btn')
    if (!buchenButton) {
        return
    }

    buchenButton.addEventListener('click', function() {
        const ausgewaehlteLeistung = document.querySelector('#leistungs-container .card.selected')
        const aktiverMitarbeiter = document.querySelector('#mitarbeiter-container .ma-btn.active')
        const datumInput = document.getElementById('datum-auswahl')
        const aktiveUhrzeit = document.querySelector('#uhrzeit-container .uhrzeit-btn.active')
        const nameInput = document.getElementById('kunde-name')
        const telefonInput = document.getElementById('kunde-telefon')
        const emailInput = document.getElementById('kunde-email')
        const rueckmeldungContainer = document.getElementById('buchung-rueckmeldung')

        if (!ausgewaehlteLeistung || !aktiverMitarbeiter || !datumInput.value || !aktiveUhrzeit) {
            rueckmeldungContainer.innerHTML = '<p style="color: #a63a2b;">Bitte Leistung, Mitarbeiter, Datum und eine freie Uhrzeit wählen.</p>'
            return
        }

        const payload = {
            leistung_id: ausgewaehlteLeistung.dataset.id,
            mitarbeiter_id: aktiverMitarbeiter.dataset.id,
            datum: datumInput.value,
            uhrzeit: aktiveUhrzeit.textContent.trim(),
            kunde_name: nameInput.value.trim(),
            kunde_telefonnummer: telefonInput.value.trim(),
            kunde_email: emailInput.value.trim()
        }

        fetch('/api/termine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(function(antwort) {
                return antwort.json().then(function(daten) {
                    if (!antwort.ok) {
                        throw new Error(daten.fehler || 'Buchung fehlgeschlagen.')
                    }
                    return daten
                })
            })
            .then(function(ergebnis) {
                rueckmeldungContainer.innerHTML =
                    '<p style="color: #2c5e2e; font-weight: bold;">' + ergebnis.nachricht + '</p>' +
                    '<p>Ihr Stornocode: <strong>' + ergebnis.stornocode + '</strong></p>'
                ladeUhrzeiten()
            })
            .catch(function(fehler) {
                rueckmeldungContainer.innerHTML = '<p style="color: #a63a2b;">' + fehler.message + '</p>'
            })
    })
}