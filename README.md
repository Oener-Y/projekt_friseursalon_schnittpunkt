-- Friseursalon Schnittpunkt --
Das ist mein Projekt für den Friseursalon Schnittpunkt. Kunden können hier online einen Termin buchen und mit einem Stornocode auch wieder absagen.

Was das Projekt macht:
Kunden können eine Leistung aussuchen (z. B. Herren- oder Damenschnitt, Färben).
Man kann einen bestimmten Mitarbeiter wählen oder „Egal“ klicken.
Man sucht ein Datum und eine freie Uhrzeit aus und gibt Name, Telefonnummer und E-Mail ein.
Nach dem Buchen bekommt man einen Stornocode.
Auf der Seite Termin stornieren kann man den Termin mit dem Stornocode bis 24 Stunden vorher wieder absagen.

So startet man das Projekt:
1. Repository herunterladen oder klonen.
2. Im Projektordner npm install im Terminal ausführen.
3. In MySQL Workbench die Datei Projekt Friseursalon Schnittpunkt.sql ausführen, damit die Datenbank und die Tabellen erstellt werden.
4. Die Datei .env.example kopieren und als .env speichern. Darin dann die eigenen Datenbankdaten (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PORT) eintragen.
5. Im Terminal npm start eingeben.
6. Im Browser http://localhost:3000/index.html öffnen. Zum Stornieren gibt es http://localhost:3000/stornieren.html.

Annahmen und Entscheidungen:
Wenn jemand mit derselben E-Mail nochmal bucht, wird kein neuer Kunde angelegt, sondern Name und Telefonnummer werden aktualisiert.
Den Preis speichere ich beim Termin extra mit ab (preis_zum_zeitpunkt), falls sich Preise später ändern.
Bei „Egal“ nimmt das Programm einfach den ersten passenden Mitarbeiter, der zu der Zeit frei ist.
Stornierte Termine werden nicht gelöscht, sondern bekommen den Status storniert.

Was noch fehlt:
Den Bereich für den Salon (Übersicht pro Tag, Mitarbeiter-Login, Leistungen ändern oder neu anlegen) habe ich nicht geschafft.