cron.schedule('0 2 * * *', async () => {
    const MS_DAY    = 24*3600*1000;
    const TWO_YEARS = 2*365*MS_DAY;
    const NOTIF_30  = 30*MS_DAY;
    const NOTIF_10  = 10*MS_DAY;
    const nowMs     = Date.now();

    const users = await User.findAll({
        where: { role: 'user', is_active: true }
    });

    for (const u of users) {
        const lastMs   = new Date(u.last_connection).getTime();
        const anonMs   = lastMs + TWO_YEARS;
        const n30      = anonMs - NOTIF_30;
        const n10      = anonMs - NOTIF_10;

        // –30j
        if (nowMs >= n30 && nowMs < n30 + MS_DAY) {
            await sendMail({ /* sujet “30 jours avant” */ });
            continue;
        }
        // –10j
        if (nowMs >= n10 && nowMs < n10 + MS_DAY) {
            await sendMail({ /* sujet “10 jours avant” */ });
            continue;
        }
        // Jour J = anonymisation
        if (nowMs >= anonMs && nowMs < anonMs + MS_DAY) {
            // **On n’affecte pas les livres** : ils restent liés au compte
            const token     = require('crypto').randomBytes(20).toString('hex');
            const expireMs  = nowMs + 30*MS_DAY;
            await u.update({
                email:               null,
                pseudo:              `deleted_${u.id}`,
                password:            null,
                is_active:           false,
                anonymized_at:       new Date(nowMs),
                reset_token:         token,
                reset_token_expires: new Date(expireMs)
            });
            await sendMail({ /* mail avec lien réactivation jour J */ });
        }
    }
});
