// Phase 5: Auto-generate revealText for all career CHOICE options
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src/assets/data/careers');

function describeEffect(e) {
    if (!e || !e.type) return null;
    switch (e.type) {
        case 'SKILL_MOD':
            return e.value > 0
                ? 'Gain **' + e.target + ' +' + e.value + '**'
                : 'Lose **' + e.target + ' ' + e.value + '**';
        case 'STAT_MOD':
            return e.value > 0
                ? '**' + e.target + ' +' + e.value + '** (permanent)'
                : '**' + e.target + ' ' + e.value + '** (permanent)';
        case 'EJECT_CAREER':
            return 'You are **ejected from this career**' + (e.note ? ' — ' + e.note : '');
        case 'FORCE_CAREER':
            return 'Next career term **must** be ' + (e.career || e.value || 'as specified');
        case 'PROMOTION':
            return 'Receive a **promotion** and rank bonus';
        case 'LOSE_BENEFIT':
            return 'Lose **' + (e.value || 1) + ' Benefit Roll(s)**';
        case 'RESOURCE_MOD':
            if (e.target === 'benefit_rolls')
                return e.value > 0
                    ? 'Gain **' + e.value + ' extra Benefit Roll(s)**'
                    : 'Lose **' + Math.abs(e.value) + ' Benefit Roll(s)**';
            if (e.target === 'next_advancement_dm')
                return '**+' + e.value + ' DM** to your next Advancement roll';
            if (e.target === 'next_qualification_dm')
                return '**+' + e.value + ' DM** to your next Qualification roll';
            if (e.target === 'next_benefit_dm')
                return '**+' + e.value + ' DM** to your next Benefit roll';
            if (e.target === 'shipShares')
                return 'Gain **' + e.value + ' Ship Share(s)**';
            return null;
        case 'ADD_NPC': {
            const role = (e.value && (e.value.type || e.value.role)) || 'NPC';
            const note = (e.value && e.value.notes) ? ' — ' + e.value.notes : '';
            return 'Gain a **' + role + '**' + note;
        }
        case 'ROLL_CHECK':
            return 'Roll **' + (e.stat || '?') + ' ' + (e.checkTarget || '?') + '+** — success and failure lead to different outcomes';
        case 'TRIGGER_EVENT':
            return 'Triggers a follow-up event';
        case 'ROLL_TABLE':
            return 'Roll on a sub-table to determine the outcome';
        case 'LOG_ENTRY':
            return null; // not surfaced
        default:
            return null;
    }
}

function buildRevealText(effects) {
    if (!effects || effects.length === 0) return null;
    const parts = effects.map(describeEffect).filter(Boolean);
    if (parts.length === 0) return null;
    return parts.join('. ') + '.';
}

const SKIP_LABELS = new Set([
    'Continue', 'Proceed', 'Accept Fate', 'Accept', 'Acknowledge',
    'Roll Injury', 'Roll Mishap', 'Roll Life Event', 'Roll Unusual Event',
    'Full Recovery', 'Check Severity', 'Accept Change'
]);

let totalUpdated = 0;
let filesUpdated = 0;

for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    const filePath = path.join(dir, f);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let changed = false;

    for (const table of [data.eventTable, data.mishapTable]) {
        if (!table) continue;
        for (const entry of table) {
            if (!entry.gameEvent || !entry.gameEvent.ui || !entry.gameEvent.ui.options) continue;
            for (const opt of entry.gameEvent.ui.options) {
                if (opt.revealText) continue;
                if (!opt.effects || opt.effects.length === 0) continue;
                if (SKIP_LABELS.has(opt.label)) continue;
                const text = buildRevealText(opt.effects);
                if (text) {
                    opt.revealText = text;
                    changed = true;
                    totalUpdated++;
                }
            }
        }
    }

    if (changed) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        filesUpdated++;
        console.log('Updated: ' + f);
    }
}

console.log('\nDone. Files updated: ' + filesUpdated + ' | Options with revealText added: ' + totalUpdated);
