# Deployment Guide

## Lokale Deployment

### 1. Backend configureren

**Backend starten:**
```bash
cd backend
npm install
node server.js
```

Backend draait op `http://localhost:5000`

**Environment variabelen (.env):**
```
PORT=5000
NODE_ENV=development
DATABASE_PATH=../database/nulmetingen.db
```

### 2. Frontend bouwen

**Build voor productie:**
```bash
cd frontend
npm install
npm run build
```

Dit maakt een geoptimaliseerde productie-build in `frontend/build/`.

**Dev server starten:**
```bash
npm start
```

Frontend draait op `http://localhost:3000`

## Windows Desktop Deployment

Voor lokale Windows-installatie:

1. **Bestanden uitpakken** naar bijvoorbeeld `C:\Users\Pim\Nulmetingen\`

2. **Backend starten**:
   - Open Command Prompt
   - `cd C:\Users\Pim\Nulmetingen\backend`
   - `npm install` (eenmalig)
   - `node server.js`

3. **Frontend openen**:
   - Bouw eerst: `cd C:\Users\Pim\Nulmetingen\frontend && npm run build`
   - Open `C:\Users\Pim\Nulmetingen\frontend\build\index.html` in browser
   - OF: `npm start` voor dev mode

## Server Deployment (VPS/Cloud)

### VPS Setup (Ubuntu 20.04+)

1. **Node.js installeren**:
```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Project klonen**:
```bash
git clone <repo-url> /var/www/nulmetingen
cd /var/www/nulmetingen
```

3. **PM2 installeren** (voor proces management):
```bash
sudo npm install -g pm2
```

4. **Backend starten met PM2**:
```bash
cd backend
npm install
pm2 start server.js --name "nulmetingen-backend"
pm2 startup
pm2 save
```

5. **Frontend bouwen**:
```bash
cd ../frontend
npm install
npm run build
```

6. **Nginx configureren** als reverse proxy:

```nginx
upstream backend {
  server localhost:5000;
}

server {
  listen 80;
  server_name nulmetingen.school.nl;

  # Frontend
  location / {
    root /var/www/nulmetingen/frontend/build;
    try_files $uri /index.html;
  }

  # Backend API
  location /api {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

7. **SSL instellen** (Let's Encrypt):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d nulmetingen.school.nl
```

## Docker Deployment

### Dockerfile (Backend)

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ .

EXPOSE 5000

CMD ["node", "server.js"]
```

### Dockerfile (Frontend)

```dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

FROM node:16-alpine
RUN npm install -g serve

COPY --from=build /app/build /app/build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    volumes:
      - ./database:/app/database
    environment:
      - NODE_ENV=production

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  database:
```

Start met: `docker-compose up`

## Productiebesten

### Security
- [ ] HTTPS inschakelen (SSL certificaat)
- [ ] CORS instellen op specifieke domeinen
- [ ] Input validation in backend
- [ ] Rate limiting
- [ ] Logging & monitoring

### Performance
- [ ] Frontend minification/bundling
- [ ] Database indexen (standaard aanwezig)
- [ ] Caching headers
- [ ] CDN voor statische assets

### Monitoring
- [ ] PM2 monitoring dashboard
- [ ] Log aggregatie
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring

### Backup
- [ ] Dagelijkse database backups
- [ ] Geotografisch verspreide backups
- [ ] Backup-restore testen

## Updates & Maintenance

### Database updates
```bash
sqlite3 database/nulmetingen.db < database/schema.sql
```

### Dependency updates
```bash
npm update
npm audit fix
```

### Log rotation
Zorg voor log rotation in PM2 of Nginx.

## Troubleshooting

### Port 5000/3000 al in gebruik
```bash
# Poort vrijmaken
sudo lsof -i :5000
kill -9 <PID>

# OF ander port gebruiken
PORT=5001 node server.js
```

### Database locked
- Zorg dat maar 1 backend-instance draait
- Restart backend

### Frontend geeft blank page
- Check browser console voor errors
- Verifieer REACT_APP_API_URL
- Clear cache en reload

## Scaling

Voor meer gebruikers:

1. **Load balancing**: Nginx/HAProxy voor meerdere backends
2. **Database**: PostgreSQL i.p.v. SQLite
3. **Session storage**: Redis voor sessiedata
4. **Frontend**: CDN + static hosting (Netlify/Vercel)
5. **Monitoring**: ELK stack of Datadog

## Ondersteuning

- Documentatie: Zie README.md
- Backend API: Zie API.md
- Specs: Zie SPECS.md
