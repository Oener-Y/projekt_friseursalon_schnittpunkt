document.addEventListener("DOMContentLoaded", function() {
    const formular = document.getElementById('storno-formular')
    const eingabe = document.getElementById('stornocode-eingabe')
    const rueckmeldung = document.getElementById('storno-rueckmeldung')

    if (!formular) {
        return
    }

    formular.addEventListener('submit', function(ereignis) {
        ereignis.preventDefault()

        const codeWert = eingabe.value.trim()
        if (!codeWert) {
            rueckmeldung.innerHTML = '<p style="color: #a63a2b;">Bitte geben Sie einen Stornocode ein.</p>'
            return
        }

        fetch('/api/termine/stornieren', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stornocode: codeWert })
        })
            .then(function(antwort) {
                return antwort.json().then(function(daten) {
                    if (!antwort.ok) {
                        throw new Error(daten.fehler || 'Stornierung fehlgeschlagen.')
                    }
                    return daten
                })
            })
            .then(function(ergebnis) {
                rueckmeldung.innerHTML =
                    '<p style="color: #2c5e2e; font-weight: bold;">' + ergebnis.nachricht + '</p>' +
                    '<p>Leistung: ' + ergebnis.termin.leistung + ' bei ' + ergebnis.termin.mitarbeiter + '</p>'
                eingabe.value = ''
            })
            .catch(function(fehler) {
                rueckmeldung.innerHTML = '<p style="color: #a63a2b;">' + fehler.message + '</p>'
            })
    })
})