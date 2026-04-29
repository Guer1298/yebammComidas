# VPS Deployment

Este proyecto puede funcionar completo en una sola VPS con:

- `Nginx` sirviendo el frontend
- `Node/Express` corriendo el backend con `PM2`
- `PostgreSQL` instalado en la misma VPS

La idea es que todo quede en un solo origen:

- `http://TU_IP/` -> frontend
- `http://TU_IP/api` -> backend

## 1. Instalar sistema base

```bash
apt update && apt upgrade -y
apt install -y nginx git curl ufw postgresql postgresql-contrib
```

## 2. Firewall

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

## 3. Instalar Node.js 22

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22
nvm alias default 22
```

## 4. Instalar PM2

```bash
npm install -g pm2
```

## 5. Crear base de datos local

```bash
sudo -u postgres psql
```

Dentro de `psql`:

```sql
CREATE USER proyectoc_user WITH PASSWORD 'proyectoc_password';
CREATE DATABASE proyectoc_db OWNER proyectoc_user;
\q
```

## 6. Clonar el repo

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/Guer1298/yebammComidas.git
cd yebammComidas
```

## 7. Backend

```bash
cd /var/www/yebammComidas/proyectoc/backend
cp .env.example .env
```

Edita `.env` y deja algo así:

```bash
DATABASE_URL="postgresql://proyectoc_user:proyectoc_password@127.0.0.1:5432/proyectoc_db?schema=public"
PORT=3000
JWT_SECRET="una-clave-larga-y-segura"
NODE_ENV="production"
FRONTEND_URL="http://TU_IP"
```

Si usas Cloudinary, completa las 3 variables.

Instala y prepara Prisma:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

Si quieres datos demo:

```bash
npm run prisma:seed
```

Levanta el backend:

```bash
pm2 start dist/app/server.js --name yebaam-api
pm2 save
pm2 startup
```

## 8. Frontend

```bash
cd /var/www/yebammComidas/proyectoc/frontend
cp .env.example .env.production
```

Para VPS, el frontend debe usar:

```bash
VITE_API_URL=/api
```

Compila:

```bash
npm install
npm run build
```

## 9. Nginx

Backend + frontend en el mismo dominio/IP:

```bash
cat > /etc/nginx/sites-available/yebaam <<'EOF'
server {
  listen 80;
  server_name TU_IP;

  root /var/www/yebammComidas/proyectoc/frontend/dist;
  index index.html;

  location ^~ /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
EOF

ln -sf /etc/nginx/sites-available/yebaam /etc/nginx/sites-enabled/yebaam
nginx -t
systemctl reload nginx
```

## 10. Verificar

```bash
curl http://TU_IP/health
curl http://TU_IP/api/businesses
```

## 11. URLs finales

- Frontend: `http://TU_IP/`
- Backend: `http://TU_IP/api`

## 12. Lo que no debes hacer

- No uses `localhost` en `DATABASE_URL` si el backend va a leer otra máquina.
- No pongas `VITE_API_URL` apuntando a `localhost` en producción.
- No publiques secretos en el repo.
