# Nulmetingen Digitale Geletterdheid - Web Application

Dit is de complete web-applicatie voor de Nulmetingen DG assessments. De app ondersteunt vier instrumenten voor het meten van digitale geletterdheid bij leerlingen leerjaar 1 en 3 op VMBO en HAVO/VWO niveau.

## Projectstructuur

```
nulmetingen-webapp-complete/
├── backend/                  # Node.js/Express backend
│   ├── server.js            # Express server
│   ├── instrumentData.js    # Instrument definitions
│   ├── package.json
│   └── .env.example
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── StartScreen.js
│   │   │   ├── AssessmentScreen.js
│   │   │   ├── ResultsScreen.js
│   │   │   └── blocks/
│   │   │       ├── SelfRatingBlock.js
│   │   │       ├── MultipleChoiceBlock.js
│   │   │       ├── FileManagementBlock.js
│   │   │       ├── SourceEvaluationBlock.js
│   │   │       └── PhishingDetectionBlock.js
│   │   ├── data/
│   │   │   └── instrumentData.js
│   │   └── App.js
│   ├── public/
│   │   ├── index.html
│   │   └── styles.css
│   └── package.json
├── database/               # Database files
│   ├── schema.sql         # Database schema
│   └── nulmetingen.db     # SQLite database (created at runtime)
├── docs/                  # Documentation
│   ├── README.md          # This file
│   ├── API.md             # API documentation
│   ├── SPECS.md           # Technical specifications
│   └── DEPLOYMENT.md      # Deployment guide
└── config/                # Configuration files
    └── .env.example       # Environment variables template
```

## Instrumenten

### 1. LJ1 VMBO (`lj1-vmbo`)
- **Doelgroep**: Leerjaar 1 VMBO
- **Duur**: 30 minuten
- **Maximale score**: 32 punten

### 2. LJ1 HAVO/VWO (`lj1-hv`)
- **Doelgroep**: Leerjaar 1 HAVO/VWO
- **Duur**: 30 minuten
- **Maximale score**: 33 punten

### 3. LJ3 VMBO (`lj3-vmbo`)
- **Doelgroep**: Leerjaar 3 VMBO
- **Duur**: 30 minuten
- **Maximale score**: 33 punten

### 4. LJ3 HAVO/VWO (`lj3-hv`)
- **Doelgroep**: Leerjaar 3 HAVO/VWO
- **Duur**: 30 minuten
- **Maximale score**: 33 punten

## Blokken per instrument

Elk instrument bestaat uit 5 blokken:

1. **Zelfinschatting** (Self-Rating)
   - Type: Slider 0-100
   - Niet meegenomen in uiteindelijke score
   - Doel: Leerling reflectie

2. **Meerkeuzevragen** (Multiple Choice)
   - 12 vragen per instrument
   - 4 inhoudelijke opties + "Weet ik niet"
   - Randomisatie van antwoordopties per sessie

3. **Bestandsbeheer** (PT1 - File Management)
   - 5-6 praktische taken
   - Bestandssimulatie (geen echte bestanden)
   - Drag-and-drop, contextmenu, undo
   - 5-6 punten

4. **Bronbeoordeling** (PT2 - Source Evaluation)
   - 4 items
   - Mockups van nieuwsartikelen, social media, commerciële sites
   - Twee-stappen: Oordeel + Reden
   - 8 punten

5. **Phishing Detection** (PT3)
   - 4 items
   - E-mails, SMS, WhatsApp mockups
   - Twee-stappen: Veilig/Verdacht + Kenmerk
   - 7 punten

## Installatiehandleiding

### Vereisten
- Node.js 14+ en npm
- SQLite3 (bundled in backend)
- Modern webbrowser (Chrome, Firefox, Safari, Edge)

### Backend setup

```bash
cd backend
npm install
npm start
```

De backend draait op `http://localhost:5000`

### Frontend setup

```bash
cd frontend
npm install
npm start
```

De frontend draait op `http://localhost:3000`

## API Endpoints

### Sessions
- `POST /api/sessions` - Nieuwe sessie starten
- `GET /api/sessions/:sessionId/results` - Resultaten ophalen
- `PUT /api/sessions/:sessionId/end` - Sessie afsluiten

### Responses
- `POST /api/responses` - Antwoord opslaan (MC, PT2, PT3)

### PT1 (File Management)
- `POST /api/pt1-actions` - Bestandsactie loggen
- `POST /api/pt1-final-state` - Eindstatus opslaan

### Self-Rating
- `POST /api/sessions/:sessionId/self-rating` - Zelfbeoordeling opslaan

## Data Logging

### Standaard logging per item:
- `sessionId`: Unieke sessie-ID
- `instrumentId`: Welk instrument
- `blockId`: Welk blok
- `itemId`: Welke vraag/item
- `presentedOptionOrder`: Volgorde van getoonde opties
- `selectedOptionId`: Gekozen antwoord
- `selectedUnknown`: Of "Weet ik niet" gekozen
- `isCorrect`: Juist of fout
- `responseTimeMs`: Reactietijd in milliseconden
- `timestamp`: Moment van opslaan

### PT1 aanvullend:
- `actionType`: Type actie (create, move, rename, etc.)
- `sourcePath`: Bronpad
- `targetPath`: Doelpad
- `oldName`: Oude naam (bij hernoemen)
- `newName`: Nieuwe naam (bij hernoemen)

## Scoring

### Automatische berekening:
- Elk correct antwoord geeft punten
- Verdeling varieert per blok
- "Weet ik niet" = 0 punten
- PT1 scores op basis van voltooide taken

### Rapportage:
- Primair: Percentage van maximumscore
- Secundair: Punten per blok
- Detailering: Correct/incorrect per item

## Randomisatie

Per sessie wordt randomiseerd:
- Volgorde van antwoordopties bij MC-vragen
- Volgorde van redenen bij PT2
- Volgorde van kenmerken bij PT3

**Niet** gerandomiseerd:
- Vraagvolgorde (blijft vast)
- Item-volgorde binnen PT2 en PT3

## Browsercompatibiliteit

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Taalinstelling

- Alle content is Nederlands
- Alleen Nederlands ondersteund in deze versie

## Gebruikersinterface

### Timer
- Zichtbare aftelmeter boven aan scherm
- Waarschuwing als < 5 minuten resterend (rode achtergrond)
- Sessie eindigt automatisch bij tijd op

### Progressie
- Voortgangsbalk bovenaan scherm
- Huidige vraag/onderdeel aangegeven
- Geen terugknoppen in PT2 en PT3

### Feedback
- Direct feedback na antwoord geven
- Resultaten scherm aan einde
- Gedetailleerde score-breakdown

## Veiligheid & Privacy

- Alle data wordt lokaal opgeslagen in SQLite
- Geen persoonlijke gegevens buiten school opgeslagen
- CORS ingeschakeld voor lokale ontwikkeling
- Zelf HTTPS instellen in productie

## Troubleshooting

### Backend start mislukt
- Check of poort 5000 beschikbaar is
- Verwijder `database/nulmetingen.db` en restart

### Frontend laadt niet
- Check of backend draait op `http://localhost:5000`
- Clear browser cache en reload

### Database errors
- Check database directory permissions
- Zorg dat SQLite3 correct geïnstalleerd is

## Verdere ontwikkeling

- [ ] Implementatie file manager met echte drag-and-drop
- [ ] Volledige PT1 implementatie met bestandsboom
- [ ] Export van sessieresultaten naar CSV/Excel
- [ ] Docent dashboard
- [ ] Meervoudige talen
- [ ] Mobile optimalisatie
- [ ] Offline modus
- [ ] Analytics dashboard

## Contact & Support

Voor vragen: pimgeerling@gmail.com
