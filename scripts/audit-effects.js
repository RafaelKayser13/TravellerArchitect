// Audit all career JSONs for handler mismatches
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../src/assets/data/careers');

// Collect all RESOURCE_MOD targets used across all JSONs
const allResourceTargets = new Set();

// Valid targets per handler (from handler source code)
const RESOURCE_MOD_VALID = new Set([
    'benefit_rolls',
    'next_qualification_dm',
    'next_advancement_dm',
    'nextAdvancementModifier', // alias added
    'paroleThreshold',         // prisoner-specific, handled by updateParoleThreshold()
    'shipShares',
    'next_benefit_dm',
    'next_survival_dm',        // check if handler supports
]);

const KNOWN_TYPES = new Set([
    // CharacterEffectHandler
    'STAT_MOD', 'SKILL_MOD', 'TRAIT_GAIN', 'LOG_ENTRY',
    // CareerEffectHandler
    'FORCE_CAREER', 'EJECT_CAREER', 'PROMOTION',
    // ResourceEffectHandler
    'ADD_ITEM', 'RESOURCE_MOD', 'ADD_NPC', 'LOSE_BENEFIT',
    // RollEffectHandler
    'ROLL_CHECK', 'ROLL_TABLE',
    // CustomEffectHandler
    'CUSTOM', 'TRIGGER_EVENT',
]);

const issues = [];

function scanEffects(effects, context) {
    if (!effects) return;
    for (const e of effects) {
        if (!e.type) {
            issues.push(context + ': effect missing type: ' + JSON.stringify(e));
            continue;
        }
        if (!KNOWN_TYPES.has(e.type)) {
            issues.push(context + ': UNKNOWN effect type [' + e.type + ']');
        }
        if (e.type === 'RESOURCE_MOD') {
            allResourceTargets.add(e.target);
            if (!RESOURCE_MOD_VALID.has(e.target)) {
                issues.push(context + ': RESOURCE_MOD unknown target [' + e.target + ']');
            }
        }
        // STAT_MOD target should be STR/DEX/END/INT/EDU/SOC
        if (e.type === 'STAT_MOD') {
            const valid = ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'];
            if (e.target && !valid.includes(e.target)) {
                issues.push(context + ': STAT_MOD unusual target [' + e.target + '] (not a core stat)');
            }
        }
        // ROLL_CHECK must have stat + checkTarget
        if (e.type === 'ROLL_CHECK') {
            if (!e.stat) issues.push(context + ': ROLL_CHECK missing stat');
            if (!e.checkTarget && e.checkTarget !== 0) issues.push(context + ': ROLL_CHECK missing checkTarget');
        }
    }
}

function scanOptions(options, ctx) {
    if (!options) return;
    for (const opt of options) {
        scanEffects(opt.effects, ctx + ' > [' + opt.label + ']');
    }
}

function scanEvent(ev, ctx) {
    if (!ev) return;
    if (ev.ui && ev.ui.options) scanOptions(ev.ui.options, ctx);
}

for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

    for (const [tableName, table] of [['eventTable', data.eventTable], ['mishapTable', data.mishapTable]]) {
        if (!table) continue;
        for (const entry of table) {
            const ctx = f + ' ' + tableName + '[' + entry.roll + ']';
            if (entry.gameEvent) {
                scanEvent(entry.gameEvent, ctx + '.gameEvent');
                if (entry.gameEvent.subEvents) {
                    for (const sub of entry.gameEvent.subEvents) {
                        scanEvent(sub, ctx + '.subEvent[' + sub.id + ']');
                    }
                }
            }
        }
    }
}

console.log('=== All RESOURCE_MOD targets used ===');
for (const t of [...allResourceTargets].sort()) console.log('  ' + t);

console.log('\n=== Issues (' + issues.length + ') ===');
if (issues.length === 0) {
    console.log('  None!');
} else {
    issues.forEach(i => console.log('  ' + i));
}
