const fs = require('fs');
const path = require('path');

// Run from project root
const tablesPath = path.join(process.cwd(), 'src/assets/data/tables.json');
if (!fs.existsSync(tablesPath)) {
    console.error('Cant find tables.json at:', tablesPath);
    process.exit(1);
}

const tables = JSON.parse(fs.readFileSync(tablesPath, 'utf8'));

const keysToKeep = [
    'injuryTable',
    'lifeEventTable',
    'educationEventTable',
    'musteringOutBenefits',
    'medicalBills'
];

const cleanedTables = {};
keysToKeep.forEach(key => {
    if (tables[key]) {
        cleanedTables[key] = tables[key];
    }
});

fs.writeFileSync(tablesPath, JSON.stringify(cleanedTables, null, 4), 'utf8');
console.log('Successfully cleaned up tables.json');
