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

## Inhaltsstand

Die Seite behauptet nur, was belegt ist. **Echt und bestätigt:** Firmenname,
Telefon/WhatsApp, Adresse (Dream City, Erbil), Facebook, Instagram, die
20 Projekte mit echten Fotos und die Leistungsbeschreibungen.

Vor der öffentlichen Test-URL wurden folgende Platzhalter **entfernt**, weil sie
unter echtem Firmennamen und echter Telefonnummer Unbelegtes behauptet hätten:

| entfernt | wo |
|---|---|
| Kennzahlen 240 / 12 / 45 / 98 % / 85.000 m² | Startseite, Werke, Über uns |
| „12 Jahre im Markt", Gründungsjahr 2014 | Startseite, Über uns |
| drei Kundenstimmen mit Namen | Startseite |
| vier Teamprofile mit Lebensläufen | Über uns |
| Zeitstrahl 2014–2026 | Über uns |
| Akkreditierungen und Versicherungsnachweise | Über uns |
| „zwei Jahre Garantie", „vertragliche Entschädigung bei Verzug" | Startseite, Leistungen, Über uns |
| Standorte Sulaimaniyya und Dohuk | Leistungen, Kontakt |
| E-Mail `info@betton-iq.com` | alle Seiten |

Sobald belegbare Angaben vorliegen, kommen die Abschnitte zurück — der Aufbau
steht noch, es fehlen nur die Zahlen und Namen. Am ehesten lohnen sich zuerst:
eine echte E-Mail-Adresse, die tatsächliche Projektzahl, das Gründungsjahr und
zwei bis drei Kundenstimmen mit Einverständnis.

Weiterhin offen: Titel der zwei neuen Projekte (Innenarchitektur, Hotel) —
sie heißen derzeit nur nach ihrer Gattung.

Das Kontaktformular hat **kein Backend** — `initForm()` in `assets/js/main.js`
simuliert den Versand. Die Stelle für einen echten Endpunkt ist dort kommentiert.
