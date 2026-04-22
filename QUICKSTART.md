# Quickstart Guide

## Installatie en eerste run (Windows)

### Vereisten
- Node.js 14+ geïnstalleerd ([nodejs.org](https://nodejs.org))
- npm (meegenomen met Node.js)

### Stap 1: Backend starten

1. Open Command Prompt
2. Navigeer naar de backend folder:
   ```
   cd nulmetingen-webapp-complete\backend
   ```
3. Installeer dependencies (eerste keer):
   ```
   npm install
   ```
4. Start de backend:
   ```
   npm start
   ```
5. Je ziet: `Backend server running on port 5000`

### Stap 2: Frontend starten (andere Command Prompt)

1. Open een **nieuwe** Command Prompt
2. Navigeer naar de frontend folder:
   ```
   cd nulmetingen-webapp-complete\frontend
   ```
3. Installeer dependencies (eerste keer):
   ```
   npm install
   ```
4. Start de frontend:
   ```
   npm start
   ```
5. Je browser opent automatisch `http://localhost:3000`

### Stap 3: Test de applicatie

1. Klik op **"Start Test - Leerjaar 1 VMBO"**
2. Beantwoord de vragen
3. Zie je resultaten aan het einde

## Probleem? Controleer:

- [ ] Node.js en npm zijn geïnstalleerd: `node --version`
- [ ] Poort 5000 en 3000 zijn beschikbaar
- [ ] Je bent in de juiste mappen
- [ ] Dependencies zijn geïnstalleerd (`npm install`)

## Voor productie / volledig instellingen:

Zie `docs/DEPLOYMENT.md` voor:
- Server deployment
- Docker
- SSL/HTTPS
- Database backups
- Monitoring

## Volgende stappen:

1. Bekijk `docs/README.md` voor volledige documentatie
2. Lees `docs/SPECS.md` voor technische details
3. Controleer `backend/server.js` voor API-endpoints

Veel succes!
