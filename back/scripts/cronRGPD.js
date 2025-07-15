const cron = require('node-cron');
const { User } = require('../models');

// Fonction d'envoi d'email (à implémenter avec nodemailer)
const sendMail = async (params) => {
    console.log('📧 Email à envoyer:', params);
    // TODO: Implémenter avec nodemailer ou service d'email
    return true; // Simulation d'envoi réussi
};

cron.schedule('0 2 * * *', async () => {
    const MS_DAY    = 24*3600*1000;
    const THREE_YEARS = 3*365*MS_DAY;  // 3 ans d'inactivité
    const NOTIF_1MONTH  = 30*MS_DAY;   // 1 mois avant
    const NOTIF_1WEEK   = 7*MS_DAY;    // 1 semaine avant
    const nowMs     = Date.now();

    const users = await User.findAll({
        where: { role: 'user', is_active: true }
    });

    for (const u of users) {
        const lastMs   = new Date(u.last_login).getTime();
        const anonMs   = lastMs + THREE_YEARS;
        const n1month  = anonMs - NOTIF_1MONTH;
        const n1week   = anonMs - NOTIF_1WEEK;

        // –1 mois
        if (nowMs >= n1month && nowMs < n1month + MS_DAY) {
            await sendMail({ 
                to: u.email,
                subject: 'Votre compte sera anonymisé dans 1 mois - Reconnectez-vous pour éviter cela',
                userId: u.id,
                template: 'inactivity_1month'
            });
            continue;
        }
        // –1 semaine
        if (nowMs >= n1week && nowMs < n1week + MS_DAY) {
            await sendMail({ 
                to: u.email,
                subject: 'URGENT: Votre compte sera anonymisé dans 1 semaine',
                userId: u.id,
                template: 'inactivity_1week'
            });
            continue;
        }
        // Jour J = anonymisation
        if (nowMs >= anonMs && nowMs < anonMs + MS_DAY) {
            // IMPORTANT: Sauvegarder l'email AVANT anonymisation pour pouvoir envoyer le lien de réactivation
            const emailBeforeAnonymization = u.email;
            
            // **On n'affecte pas les livres** : ils restent liés au compte
            const token     = require('crypto').randomBytes(32).toString('hex'); // 32 bytes = plus sécurisé
            const expireMs  = nowMs + 7*MS_DAY; // 1 semaine pour réactiver
            
            await u.update({
                email:               null,
                pseudo:              `anonymized_${u.id}_${Date.now()}`, // Éviter les collisions
                password:            null,
                is_active:           false,
                anonymized_at:       new Date(nowMs),
                reset_token:         token,
                reset_token_expires: new Date(expireMs)
            });
            
            // Envoyer l'email avec l'adresse sauvegardée
            await sendMail({ 
                to: emailBeforeAnonymization,
                subject: 'Compte anonymisé - Lien de réactivation (7 jours)',
                token: token,
                userId: u.id,
                template: 'account_anonymized'
            });
        }
    }
});

module.exports = { sendMail };
