# Betton — Design & Construction

Website für **Betton**, ein Büro für Innenarchitektur und Bauausführung in Erbil, Irak.
Statische Seite, arabisch (RTL), ohne Build-Schritt.

## Aufbau

```
index.html        Startseite — Hero, Leistungen, Projektindex, Ablauf, Referenzen
services.html     fünf Leistungen im Detail, Ablauf, FAQ
projects.html     Galerie mit 20 Projekten, Kategoriefilter, Lightbox
about.html        Geschichte, Werte, Zeitstrahl, Team, Akkreditierungen
contact.html      Anfrageformular, Kontaktdaten, Karte, FAQ

assets/css/style.css   Design-System und alle Komponenten
assets/js/main.js      Navigation, Scroll-Reveal, Filter, Lightbox, Zähler, Formular
assets/img/brand/      Logo in Varianten (Chrom, dunkel, Favicon, Social-Vorschau)
assets/img/projects/   Projektfotos, nach Projekt in Unterordnern
```

## Lokal ansehen

Kein Build nötig, aber ein Server ist erforderlich (die Seiten laden Assets über
relative Pfade):

```bash
python -m http.server 8123
# dann http://localhost:8123 öffnen
```

## Gestaltung

Editoriales Layout in warmen Naturtönen: Creme als Grund, Espresso für Schrift und
die zwei dunklen Bänder, Terrakotta als einziger Akzent. Überschriften bewusst leicht
und groß, dünne Linien statt Kästen.

Durchgehendes Formmotiv ist der **Rundbogen** — im Hero, in der Vorschau des
Projektindex und bei allen Abschnittsbildern. Die Kacheln der Galerie bleiben
rechteckig, damit die Form ein Akzent bleibt.

Alle Abstände und Positionen nutzen CSS Logical Properties, damit das RTL-Layout
ohne Spiegelungsregeln funktioniert.

## Barrierefreiheit

- Textfarben gegen den Cremegrund geprüft: durchgehend ≥ 4,5:1 (WCAG AA)
- `prefers-reduced-motion` schaltet alle Bewegung ab
- Ohne JavaScript bleibt die Seite vollständig lesbar — die Scroll-Reveals werden
  nur aktiv, wenn die Klasse `js` gesetzt ist
- Telefonnummern nutzen `unicode-bidi: isolate-override`, damit die Zifferngruppen
  von links nach rechts stehen

## Noch offen

Diese Inhalte sind **Platzhalter** und müssen vor einem echten Livegang durch
belegbare Angaben ersetzt oder entfernt werden:

- Kennzahlen: 240 Projekte, 12 Jahre, 45 Mitarbeitende, 98 % Zufriedenheit
- die drei Kundenstimmen samt Namen
- die vier Teamprofile samt Lebensläufen
- Gründungsjahr 2014 und der komplette Zeitstrahl
- die Liste der Akkreditierungen und Versicherungen
- Zusagen wie „zwei Jahre Garantie" und „vertragliche Entschädigung bei Verzug"
- E-Mail `info@betton-iq.com`, Öffnungszeiten
- Titel der beiden neuen Projekte (Innenarchitektur, Hotel)

Echt und bestätigt sind: Firmenname, Telefon/WhatsApp, Adresse (Dream City, Erbil),
Facebook, Instagram und die Projektfotos.

Das Kontaktformular hat **kein Backend** — `initForm()` in `assets/js/main.js`
simuliert den Versand. Die Stelle für einen echten Endpunkt ist dort kommentiert.
