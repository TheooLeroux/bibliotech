# 🚀 Guide de Déploiement - BiblioTech API

## 📋 Table des Matières

- [Prérequis](#prérequis)
- [Configuration Locale](#configuration-locale)
- [Base de Données](#base-de-données)
- [Variables d'Environnement](#variables-denvironnement)
- [Déploiement Production](#déploiement-production)
- [Monitoring et Maintenance](#monitoring-et-maintenance)
- [Sécurité](#sécurité)
- [Troubleshooting](#troubleshooting)

## 🔧 Prérequis

### Système
- **Node.js** : >= 16.x (recommandé 18.x LTS)
- **NPM** : >= 8.x
- **MariaDB** : >= 10.6
- **MongoDB** : >= 5.0 (optionnel pour fonctionnalités avancées)

### Outils Recommandés
- **PM2** : Gestionnaire de processus pour production
- **Nginx** : Proxy inverse et serveur web
- **Certbot** : Certificats SSL gratuits
- **Git** : Gestion de version

## 🛠️ Configuration Locale

### 1. Clone du Projet
```bash
git clone https://github.com/votre-username/bibliotech.git
cd bibliotech/back
```

### 2. Installation des Dépendances
```bash
npm install
```

### 3. Configuration Automatique (Développement)
```bash
# Copie .env.example et configure l'environnement
npm run setup:dev
```

### 4. Démarrage Manuel
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## 🗄️ Base de Données

### MariaDB (Principal)

#### Installation Ubuntu/Debian
```bash
sudo apt update
sudo apt install mariadb-server
sudo mysql_secure_installation
```

#### Configuration
```sql
-- Connexion root
sudo mysql -u root -p

-- Création base de données
CREATE DATABASE bibliotech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Création utilisateur
CREATE USER 'bibliotech_user'@'localhost' IDENTIFIED BY 'motdepasse_securise';
GRANT ALL PRIVILEGES ON bibliotech.* TO 'bibliotech_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Import du Schéma
```bash
# Import complet
npm run db:schema

# Ou manuellement
mysql -u bibliotech_user -p bibliotech < bdd/schema-complete.sql
```

### MongoDB (Optionnel)

#### Installation
```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Configuration
```javascript
// Création utilisateur MongoDB
use bibliotech
db.createUser({
  user: "bibliotech_user",
  pwd: "motdepasse_securise",
  roles: [{ role: "readWrite", db: "bibliotech" }]
})
```

## 🔐 Variables d'Environnement

### Fichier `.env` Production
```bash
# === SERVEUR ===
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# === BASE DE DONNÉES MARIADB ===
DB_HOST=localhost
DB_NAME=bibliotech
DB_USER=bibliotech_user
DB_PASSWORD=motdepasse_securise_tres_long
DB_PORT=3306

# === BASE DE DONNÉES MONGODB (Optionnel) ===
MONGO_URI=mongodb://bibliotech_user:motdepasse@localhost:27017/bibliotech

# === JWT SÉCURITÉ ===
JWT_SECRET=cle_jwt_tres_longue_et_securisee_256_bits_minimum
JWT_EXPIRES_IN=7d

# === EMAIL (Production) ===
EMAIL_HOST=smtp.votre-provider.com
EMAIL_PORT=587
EMAIL_USER=noreply@bibliotech.com
EMAIL_PASS=motdepasse_email
EMAIL_FROM=BiblioTech <noreply@bibliotech.com>

# === UPLOAD PATHS ===
UPLOAD_PATH=/var/www/bibliotech/uploads
UPLOAD_MAX_SIZE=52428800

# === SÉCURITÉ ===
CORS_ORIGIN=https://bibliotech.com,https://www.bibliotech.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# === LOGS ===
LOG_LEVEL=info
LOG_FILE=/var/log/bibliotech/app.log

# === RGPD ===
RGPD_NOTIFICATION_DAYS=30
RGPD_WARNING_DAYS=7
RGPD_INACTIVITY_YEARS=3
```

### Sécurisation des Variables
```bash
# Permissions restrictives
chmod 600 .env
chown bibliotech:bibliotech .env

# Exemple de génération JWT secret
openssl rand -base64 64
```

## 🌐 Déploiement Production

### 1. Préparation du Serveur

#### Création Utilisateur Système
```bash
# Création utilisateur dédié
sudo adduser --system --group --shell /bin/bash bibliotech
sudo mkdir -p /var/www/bibliotech
sudo mkdir -p /var/log/bibliotech
sudo chown -R bibliotech:bibliotech /var/www/bibliotech /var/log/bibliotech
```

#### Installation PM2
```bash
# Installation globale
npm install -g pm2

# Configuration PM2 pour l'utilisateur bibliotech
sudo -u bibliotech pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u bibliotech --hp /home/bibliotech
```

### 2. Déploiement de l'Application

#### Transfert des Fichiers
```bash
# Via Git (recommandé)
sudo -u bibliotech git clone https://github.com/votre-repo/bibliotech.git /var/www/bibliotech
cd /var/www/bibliotech/back

# Installation dépendances
sudo -u bibliotech npm ci --production

# Configuration
sudo -u bibliotech cp .env.example .env
# Éditer le .env avec les valeurs de production
```

#### Configuration PM2
```bash
# Fichier ecosystem.config.js
sudo -u bibliotech tee /var/www/bibliotech/back/ecosystem.config.js > /dev/null << 'EOF'
module.exports = {
  apps: [
    {
      name: 'bibliotech-api',
      script: './server.js',
      cwd: '/var/www/bibliotech/back',
      user: 'bibliotech',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: '/var/log/bibliotech/error.log',
      out_file: '/var/log/bibliotech/output.log',
      log_file: '/var/log/bibliotech/combined.log',
      time: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'uploads', 'logs'],
      restart_delay: 4000
    }
  ]
};
EOF

# Démarrage avec PM2
sudo -u bibliotech pm2 start ecosystem.config.js
sudo -u bibliotech pm2 save
```

### 3. Configuration Nginx

#### Installation
```bash
sudo apt install nginx
```

#### Configuration Site
```bash
sudo tee /etc/nginx/sites-available/bibliotech > /dev/null << 'EOF'
server {
    listen 80;
    server_name bibliotech.com www.bibliotech.com;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bibliotech.com www.bibliotech.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/bibliotech.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bibliotech.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    
    # Logs
    access_log /var/log/nginx/bibliotech.access.log;
    error_log /var/log/nginx/bibliotech.error.log;
    
    # Files statiques
    location /uploads/ {
        alias /var/www/bibliotech/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Frontend (si applicable)
    location / {
        root /var/www/bibliotech/front/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Limitations uploads
    client_max_body_size 100M;
}
EOF

# Activation du site
sudo ln -s /etc/nginx/sites-available/bibliotech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL avec Let's Encrypt
```bash
# Installation Certbot
sudo apt install certbot python3-certbot-nginx

# Génération certificat
sudo certbot --nginx -d bibliotech.com -d www.bibliotech.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring et Maintenance

### 1. Monitoring PM2
```bash
# Status des processus
pm2 status

# Logs en temps réel
pm2 logs bibliotech-api

# Monitoring ressources
pm2 monit

# Redémarrage
pm2 restart bibliotech-api

# Reload sans downtime
pm2 reload bibliotech-api
```

### 2. Logs et Debugging
```bash
# Logs application
tail -f /var/log/bibliotech/combined.log

# Logs Nginx
tail -f /var/log/nginx/bibliotech.access.log
tail -f /var/log/nginx/bibliotech.error.log

# Logs système
journalctl -u nginx -f
journalctl -u mariadb -f
```

### 3. Sauvegarde Base de Données
```bash
# Script de sauvegarde
sudo tee /usr/local/bin/backup-bibliotech.sh > /dev/null << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/bibliotech"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="bibliotech"
DB_USER="bibliotech_user"
DB_PASS="motdepasse_securise"

mkdir -p $BACKUP_DIR

# Sauvegarde MariaDB
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/bibliotech_$DATE.sql.gz

# Sauvegarde uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/www/bibliotech uploads/

# Nettoyage (garder 30 jours)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/backup-bibliotech.sh

# Cron quotidien
sudo crontab -e
# Ajouter : 0 2 * * * /usr/local/bin/backup-bibliotech.sh
```

### 4. Mise à Jour Application
```bash
# Script de déploiement
sudo tee /usr/local/bin/deploy-bibliotech.sh > /dev/null << 'EOF'
#!/bin/bash
cd /var/www/bibliotech

# Sauvegarde avant mise à jour
/usr/local/bin/backup-bibliotech.sh

# Mise à jour code
sudo -u bibliotech git pull origin main
cd back

# Mise à jour dépendances
sudo -u bibliotech npm ci --production

# Migration DB si nécessaire
sudo -u bibliotech npm run db:migrate

# Reload application
sudo -u bibliotech pm2 reload bibliotech-api

echo "Deployment completed"
EOF

chmod +x /usr/local/bin/deploy-bibliotech.sh
```

## 🔒 Sécurité

### 1. Firewall UFW
```bash
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status
```

### 2. Sécurisation MariaDB
```bash
# Configuration sécurisée
sudo mysql_secure_installation

# Configuration my.cnf
sudo tee -a /etc/mysql/mariadb.conf.d/99-security.cnf > /dev/null << 'EOF'
[mysqld]
# Binding sécurisé
bind-address = 127.0.0.1

# Désactiver symbolic links
symbolic-links = 0

# Logging
log-error = /var/log/mysql/error.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Limites de sécurité
max_connections = 100
max_user_connections = 50
EOF

sudo systemctl restart mariadb
```

### 3. Mise à Jour Système
```bash
# Mises à jour automatiques
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades

# Configuration
sudo tee /etc/apt/apt.conf.d/20auto-upgrades > /dev/null << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
```

## 🛠️ Troubleshooting

### Problèmes Courants

#### 1. Application ne démarre pas
```bash
# Vérifier logs
pm2 logs bibliotech-api

# Vérifier configuration
node -c server.js

# Vérifier permissions
ls -la /var/www/bibliotech/
```

#### 2. Erreurs Base de Données
```bash
# Test connexion
mysql -u bibliotech_user -p -h localhost bibliotech

# Vérifier statut
sudo systemctl status mariadb

# Logs MariaDB
sudo tail -f /var/log/mysql/error.log
```

#### 3. Erreurs Nginx
```bash
# Test configuration
sudo nginx -t

# Statut service
sudo systemctl status nginx

# Logs erreurs
sudo tail -f /var/log/nginx/error.log
```

#### 4. Problèmes SSL
```bash
# Vérifier certificat
sudo certbot certificates

# Test renouvellement
sudo certbot renew --dry-run

# Vérifier validité
openssl x509 -in /etc/letsencrypt/live/bibliotech.com/cert.pem -text -noout
```

### Commandes de Diagnostic
```bash
# Utilisation ressources
htop
df -h
free -m

# Connexions réseau
netstat -tulpn | grep :4000
ss -tulpn | grep :443

# Processus
ps aux | grep node
ps aux | grep nginx
```

---

## 📞 Support Production

### Contacts d'Urgence
- **DevOps** : devops@bibliotech.com
- **Technique** : tech@bibliotech.com
- **Escalade** : emergency@bibliotech.com

### Monitoring Externe
- **Uptime** : UptimeRobot, Pingdom
- **Performance** : New Relic, DataDog
- **Logs** : ELK Stack, Splunk

**Version** : 1.0.0  
**Dernière mise à jour** : 24 janvier 2025 