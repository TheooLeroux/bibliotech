#!/usr/bin/env node
require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Timestamp ISO-safe pour le JSON
const now = new Date().toISOString().replace(/[:.]/g, '-');
const reportsDir = path.resolve(__dirname, '../reports');
const jsonReport = path.join(reportsDir, `test-results-${now}.json`);
const htmlReport = path.join(reportsDir, 'Rapport-de-tests-BiblioTech.html');

// Crée le dossier reports s’il n’existe pas
fs.mkdirSync(reportsDir, { recursive: true });

console.log('🏃 Lancement des tests en mode verbose et génération des rapports…');
execSync(
    `npx jest --runInBand --json --outputFile="${jsonReport}"`,
    { stdio: 'inherit' }
);

console.log(`✅ Rapport JSON généré dans ${jsonReport}`);
console.log(`✅ Rapport HTML généré dans ${htmlReport}`);
