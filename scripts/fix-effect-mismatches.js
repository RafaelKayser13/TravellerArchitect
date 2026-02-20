// Fix all effect mismatches across 14 career JSONs
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src/assets/data/careers');

let totalChanges = 0;

function fixEffects(effects) {
    if (!effects) return;
    for (let i = 0; i < effects.length; i++) {
        const e = effects[i];

        // --- Fix RESOURCE_MOD target aliases ---
        if (e.type === 'RESOURCE_MOD') {
            if (e.target === 'benefitModifier') {
                e.target = 'benefit_rolls';
                e.value = e.value || 1;
                totalChanges++;
            }
            if (e.target === 'nextQualificationModifier') {
                e.target = 'next_qualification_dm';
                totalChanges++;
            }
            if (e.target === 'next_career_free_qual') {
                // merchant mishap[5]: free qualification to next career
                // Map to next_qualification_dm with a high value to auto-qualify
                e.target = 'next_qualification_dm';
                e.value = 100;
                totalChanges++;
            }
        }

        // --- Fix TRIGGER_SUBVENT → TRIGGER_EVENT ---
        if (e.type === 'TRIGGER_SUBVENT') {
            e.type = 'TRIGGER_EVENT';
            totalChanges++;
        }

        // --- Fix ADD_MULTIPLE_NPC → ADD_NPC ---
        if (e.type === 'ADD_MULTIPLE_NPC') {
            e.type = 'ADD_NPC';
            // Ensure value is present
            if (!e.value) e.value = { type: 'contact', notes: 'Gained via Event', count: '1d3' };
            totalChanges++;
        }

        // --- Fix BENEFIT_ROLL → RESOURCE_MOD ---
        if (e.type === 'BENEFIT_ROLL') {
            e.type = 'RESOURCE_MOD';
            e.target = 'benefit_rolls';
            if (e.value === undefined) e.value = 1;
            totalChanges++;
        }
    }
}

function fixOptions(options) {
    if (!options) return;
    for (const opt of options) {
        fixEffects(opt.effects);
    }
}

function fixEvent(ev) {
    if (!ev) return;
    if (ev.ui && ev.ui.options) fixOptions(ev.ui.options);
    if (ev.subEvents) {
        for (const sub of ev.subEvents) fixEvent(sub);
    }
}

for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const filePath = path.join(dir, f);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const before = totalChanges;

    for (const table of [data.eventTable, data.mishapTable]) {
        if (!table) continue;
        for (const entry of table) {
            if (entry.gameEvent) fixEvent(entry.gameEvent);
        }
    }

    if (totalChanges > before) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(f + ': ' + (totalChanges - before) + ' fix(es)');
    }
}

console.log('\nTotal changes: ' + totalChanges);
