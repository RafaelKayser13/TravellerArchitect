import { Component, inject, computed, signal, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceService } from '../../../../core/services/dice.service';
import { CAREERS } from '../../../../data/careers';

import { DiceDisplayService } from '../../../../core/services/dice-display.service';

import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-mustering-out',
    standalone: true,
    imports: [CommonModule, FormsModule, StepHeaderComponent],
    templateUrl: './mustering-out.component.html',
    styleUrls: ['./mustering-out.component.scss']
})
export class MusteringOutComponent {
    protected characterService = inject(CharacterService);
    protected diceService = inject(DiceService);
    protected diceDisplay = inject(DiceDisplayService);

    character = this.characterService.character;

    // Logic state
    totalRolls = computed(() => {
        const char = this.character();
        const allocated = char.finances.benefitRollsAllocated || {};
        const sum = Object.values(allocated).reduce((a, b) => a + b, 0);
        // Note: We don't subtract debt here because spendBenefitRoll handles it? 
        // Actually, the user says the system eliminates leftover rolls.
        // We want this to be the REMAINING rolls.
        return sum;
    });

    // We'll track how many were used IN THIS SESSION to show progress if needed, 
    // but the completion check should be totalRolls() === 0.
    rollsUsed = signal(0); 
    
    cashRolls = computed(() => this.character().finances.cashRollsSpent || 0);
    maxCashRolls = 3;

    benefitsLog = signal<string[]>([]);

    // Selected Career for rolling
    selectedCareerName = signal<string | null>(null);

    // NPC Generation Prompt
    isNpcPrompt = false;
    pendingNpcType: import('../../../../core/models/career.model').NpcType = 'contact';
    npcNameInput = '';

    careerPools = computed(() => {
        const char = this.character();
        const allocated = char.finances.benefitRollsAllocated || {};
        return Object.keys(allocated)
            .filter(name => allocated[name] > 0)
            .map(name => ({
                name,
                count: allocated[name]
            }));
    });

    @Output() complete = new EventEmitter<void>();

    // Pension Logic derived from CharacterService
    pension = this.characterService.pension;

    currentCareerDef = computed(() => {
        const name = this.selectedCareerName();
        if (!name) return null;
        return CAREERS.find(c => c.name === name) || null;
    });

    ngOnInit() {
        // Auto-select first career with rolls
        const pools = this.careerPools();
        if (pools.length > 0) {
            this.selectedCareerName.set(pools[0].name);
        }
    }

    selectCareer(name: string) {
        this.selectedCareerName.set(name);
    }

    async rollBenefit(type: 'Cash' | 'Material') {
        const char = this.character();
        const careerName = this.selectedCareerName();
        if (!careerName) return;

        const allocated = char.finances.benefitRollsAllocated || {};
        if ((allocated[careerName] || 0) <= 0) return;

        if (type === 'Cash' && this.cashRolls() >= this.maxCashRolls) return;

        const careerDef = CAREERS.find(c => c.name === careerName);
        if (!careerDef) return;

        const modifiers: { label: string, value: number }[] = [];
        let dm = 0;

        // 1. 2300AD Path Modifiers
        if (char.isSoftPath) {
            dm -= 1;
            modifiers.push({ label: 'Soft Path', value: -1 });
        } else if (char.homeworld?.path === 'Hard') {
            dm += 1;
            modifiers.push({ label: 'Hard Path', value: 1 });
        }

        // 2. Off-World Education (Cash only)
        if (type === 'Cash' && char.education?.offworld) {
            dm -= 1;
            modifiers.push({ label: 'Off-World Edu', value: -1 });
        }

        // 3. Rank Bonus (Rank 5+ DM+1 on ALL rolls)
        // We check the highest rank reached in THIS career
        const careerHistory = char.careerHistory.filter(h => h.careerName === careerName);
        const highestRank = Math.max(...careerHistory.map(h => h.rank), 0);
        if (highestRank >= 5) {
            dm += 1;
            modifiers.push({ label: 'Rank 5+ Bonus', value: 1 });
        }

        // 4. Gambler (Cash only)
        if (type === 'Cash') {
            const gambler = char.skills.find(s => s.name.includes('Gambler'));
            if (gambler && gambler.level >= 1) {
                dm += 1;
                modifiers.push({ label: 'Gambler Skill', value: 1 });
            }
        }

        // Table Data
        const tableData = type === 'Cash' ? careerDef.musteringOutCash : careerDef.musteringOutBenefits;

        const roll = await this.diceDisplay.roll(
            'Benefit: ' + type + ' (' + careerName + ')',
            1,
            dm,
            0,
            '',
            (res) => {
                let r = res + dm;
                if (r < 1) r = 1;
                if (r > 7) r = 7;
                const idx = r - 1;
                if (type === 'Cash') return `Cash: Lv ${careerDef.musteringOutCash[idx]}`;
                return `Benefit: ${careerDef.musteringOutBenefits[idx]}`;
            },
            modifiers,
            tableData
        );

        let finalRoll = roll + dm;
        if (finalRoll > 7) finalRoll = 7;
        if (finalRoll < 1) finalRoll = 1;

        let result = '';
        const tableIndex = finalRoll - 1;

        if (type === 'Cash') {
            const cash = careerDef.musteringOutCash[tableIndex];
            result = `Cash: Lv ${cash}`;
            
            const currentCash = char.finances.cash;
            this.characterService.updateCharacter({
                finances: { ...char.finances, cash: currentCash + cash }
            });

        } else {
            let benefit = careerDef.musteringOutBenefits[tableIndex];
            
            // 2300AD: TAS Membership does not exist, convert to +1 Ship Share
            if (benefit === 'TAS Membership') {
                benefit = 'Ship Share';
                this.characterService.log('**TAS Conversion**: TAS Membership converted to +1 Ship Share (2300AD Rule).');
            }

            result = `Benefit: ${benefit}`;

            if (benefit.includes('INT +')) {
                const int = char.characteristics.int;
                this.characterService.updateCharacter({
                    characteristics: {
                        ...char.characteristics,
                        int: { ...int, value: int.value + 1, modifier: this.diceService.getModifier(int.value + 1) }
                    }
                });
            }
            else if (benefit.includes('EDU +')) {
                const edu = char.characteristics.edu;
                this.characterService.updateCharacter({
                    characteristics: {
                        ...char.characteristics,
                        edu: { ...edu, value: edu.value + 1, modifier: this.diceService.getModifier(edu.value + 1) }
                    }
                });
            }
            else if (benefit.includes('SOC +')) {
                const soc = char.characteristics.soc;
                this.characterService.updateCharacter({
                    characteristics: {
                        ...char.characteristics,
                        soc: { ...soc, value: soc.value + 1, modifier: this.diceService.getModifier(soc.value + 1) }
                    }
                });
            }
            else if (benefit.includes('Ship Share')) {
                const currentShares = char.finances.shipShares || 0;
                this.characterService.updateCharacter({
                    finances: { ...char.finances, shipShares: currentShares + 1 }
                });
                this.characterService.log('**Benefit Gained**: Ship Share (Value: Lv 500,000). Provides Lv 1,000/year dividend.');
            }
            else if (benefit === 'Weapon') {
                // 2300AD: Weapon restriction (Military vs others)
                const isMilitary = ['Army', 'Navy', 'Marine', 'Agent'].includes(careerName);
                const isSpaceborne = ['Spaceborne', 'Belter'].includes(careerName);
                let restriction = 'Slug throwers (Rifle/Pistol only)';
                if (isMilitary || isSpaceborne) {
                    restriction = 'Any (including Lasers)';
                }
                const equipment = [...char.equipment, `Weapon (${restriction})` ];
                this.characterService.updateCharacter({ equipment });
                this.characterService.log(`**Benefit Gained**: Weapon. Restriction: ${restriction}`);
            }
            else if (benefit === 'Armour') {
                 // 2300AD: Armor limit Lv 10,000 / TL 12
                 // Upgrade Rule: If already has armor, limit increases to Lv 25,000
                 const hasArmor = char.equipment.some(e => e.includes('Armour'));
                 const limit = hasArmor ? 'Lv 25,000' : 'Lv 10,000';
                 
                 const equipment = [...char.equipment, `Armour (Limit: ${limit} / TL 12)`];
                 this.characterService.updateCharacter({ equipment });
                 this.characterService.log(`**Benefit Gained**: Armour. Limit: ${limit}.`);
            }
            else if (benefit.includes('Vehicle')) {
                // 2300AD: Vehicle restriction (Lv 300,000 / TL 10 / Unarmed)
                const equipment = [...char.equipment, `${benefit} (Limit: Lv 300,000 / TL 10 / Unarmed)`];
                this.characterService.updateCharacter({ equipment });
                this.characterService.log(`**Benefit Gained**: ${benefit}. Restriction: Lv 300,000 / TL 10 / Unarmed.`);
            }
            else if (benefit === 'TAS Membership') {
                // 2300AD: TAS Membership = +1 Ship Share
                this.characterService.updateFinances({ shipShares: (char.finances.shipShares || 0) + 1 });
                this.characterService.log(`**Benefit Gained**: TAS Membership (Converted to +1 Ship Share).`);
            }
            else if (benefit === 'Yacht') {
                const equipment = [...char.equipment, 'Yacht (Noble Benefit)'];
                this.characterService.updateCharacter({ equipment });
                this.characterService.log('**Benefit Gained**: Yacht (Noble). A personal luxury starship is at your disposal.');
            }
            else if (benefit === 'Free Trader') {
                const currentShares = char.finances.shipShares || 0;
                // In 2300AD, "Free Trader" benefit usually grants 2 Ship Shares or a specific voucher.
                // We'll treat it as +2 Ship Shares to align with the value.
                this.characterService.updateCharacter({
                    finances: { ...char.finances, shipShares: currentShares + 2 }
                });
                this.characterService.log('**Benefit Gained**: Free Trader. Gained 2 Ship Shares.');
            }
            else if (benefit === 'Contact' || benefit === 'Ally' || benefit === 'Rival') {
                this.pendingNpcType = benefit.toLowerCase() as any;
                this.isNpcPrompt = true;
                this.characterService.log(`**Benefit Gained**: ${benefit}. Awaiting record creation...`);
            }
            else {
                const equipment = [...char.equipment, benefit];
                this.characterService.updateCharacter({ equipment });
            }
        }

        this.benefitsLog.update((l: string[]) => [...l, result]);
        this.characterService.spendBenefitRoll(careerName, 1, type === 'Cash');
        console.log(`[MusteringOut] Rolled ${roll}${dm ? (dm > 0 ? '+' + dm : dm) : ''} (${type}): ${result}`);
    }

    async confirmNpcGeneration(overrideName?: string) {
        const { createNpc } = await import('../../../../data/npc-tables');
        const name = overrideName || this.npcNameInput;
        const careerName = this.selectedCareerName() || 'Unknown';
        const npc = createNpc(this.pendingNpcType, `Muster Out: ${careerName}`, '', name);
        this.characterService.addNpc(npc);

        this.isNpcPrompt = false;
        this.npcNameInput = '';
    }

    canProceedToNext(): boolean {
        return this.totalRolls() === 0;
    }

    // Medical Debt: unpaid injuries
    unpaidInjuries = computed(() => {
        const char = this.character();
        return (char.injuries || []).filter(i => !i.treated && i.cost > 0);
    });

    payDebt(injuryId: string) {
        const char = this.character();
        const injury = char.injuries.find(i => i.id === injuryId);
        if (!injury || injury.treated) return;
        if (char.finances.cash < injury.cost) return;

        // Deduct cost from cash
        const newCash = char.finances.cash - injury.cost;
        const newMedicalDebt = Math.max(0, (char.finances.medicalDebt || 0) - injury.cost);

        // Restore the stat that was reduced
        const chars = Object.keys(char.characteristics).reduce((acc, k) => {
            const key = k as keyof typeof char.characteristics;
            acc[key] = { ...char.characteristics[key] };
            return acc;
        }, {} as any) as typeof char.characteristics;

        const statKey = injury.stat.toLowerCase() as keyof typeof chars;
        if (chars[statKey]) {
            chars[statKey].value += injury.reduction;
            chars[statKey].modifier = this.diceService.getModifier(chars[statKey].value);
        }

        // Mark injury as treated
        const updatedInjuries = char.injuries.map(i =>
            i.id === injuryId ? { ...i, treated: true } : i
        );

        this.characterService.updateCharacter({ characteristics: chars });
        this.characterService.updateCharacter({
            finances: { ...char.finances, cash: newCash, medicalDebt: newMedicalDebt },
            injuries: updatedInjuries
        });

        this.characterService.log(`**Debt Paid**: Treated ${injury.name}. Restored ${injury.stat} +${injury.reduction}. Cost: Lv ${injury.cost}.`);
        this.benefitsLog.update((l: string[]) => [...l, `DEBT PAID: ${injury.name} — Lv ${injury.cost}`]);
    }

    finish() {
        const char = this.character();
        let extraCash = 0;

        // 2300AD Spec: German Nationality (1D3 kLv)
        if (char.nationality === 'Germany') {
            const extra = (Math.floor(Math.random() * 3) + 1) * 1000;
            extraCash += extra;
            this.characterService.log(`**German Bonus**: Gained extra Lv ${extra} (1D3 kLv)`);
        }

        // 2300AD Spec: Social Standing Bonus (SOC 10+ adds 1 kLv per term)
        if (char.characteristics.soc.value >= 10) {
            const terms = char.careerHistory.length;
            const extra = terms * 1000;
            extraCash += extra;
            this.characterService.log(`**High SOC Bonus**: Gained extra Lv ${extra} (SOC 10+ bonus x ${terms} terms)`);
        }

        // 2300AD: Standard Issue Equipment (Book 1, pg 11)
        const standardIssue = ['Hand Comp (TL 10)', 'Link Phone (TL 10)', 'Standard Clothing'];
        const existingEquipment = char.equipment || [];
        const newEquipment = [...existingEquipment];
        
        standardIssue.forEach(item => {
            if (!newEquipment.includes(item)) {
                newEquipment.push(item);
            }
        });

        // Save pension and bonuses
        const p = this.pension();
        
        this.characterService.updateCharacter({
            finances: { 
                ...char.finances, 
                pension: p,
                cash: char.finances.cash + extraCash 
            },
            equipment: newEquipment
        });

        this.complete.emit();
    }
}
