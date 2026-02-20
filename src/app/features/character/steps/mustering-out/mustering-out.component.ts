import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceService } from '../../../../core/services/dice.service';
import { CareerService } from '../../../../core/services/career.service';
import { DiceDisplayService } from '../../../../core/services/dice-display.service';
import { BenefitChoiceService } from '../../../../core/services/benefit-choice.service';
import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';
import { BenefitChoiceDialogComponent } from '../../../shared/benefit-choice-dialog/benefit-choice-dialog.component';
import { FormsModule } from '@angular/forms';
import { EventEngineService } from '../../../../core/services/event-engine.service';
import { NpcInteractionService } from '../../../../core/services/npc-interaction.service';
import { WizardFlowService } from '../../../../core/services/wizard-flow.service';
import { getBenefitEffects } from '../../../../data/events/shared/mustering-out';

@Component({
    selector: 'app-mustering-out',
    standalone: true,
    imports: [CommonModule, FormsModule, StepHeaderComponent, BenefitChoiceDialogComponent],
    templateUrl: './mustering-out.component.html',
    styleUrls: ['./mustering-out.component.scss']
})
export class MusteringOutComponent implements OnInit, OnDestroy {
    protected characterService = inject(CharacterService);
    protected diceService = inject(DiceService);
    protected diceDisplay = inject(DiceDisplayService);
    protected eventEngine = inject(EventEngineService);
    protected npcInteractionService = inject(NpcInteractionService);
    protected careerService = inject(CareerService);
    protected benefitChoiceService = inject(BenefitChoiceService);
    private wizardFlow = inject(WizardFlowService);

    character = this.characterService.character;

    ngOnInit(): void {
        this.wizardFlow.registerValidator(7, () => this.canProceedToNext());
        this.wizardFlow.registerFinishAction(7, () => this.finish());
        // Auto-select first career with rolls
        const pools = this.careerPools();
        if (pools.length > 0) {
            this.selectedCareerName.set(pools[0].name);
        }
    }

    ngOnDestroy(): void {
        this.wizardFlow.unregisterStep(7);
    }

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

    careerPools = computed(() => {
        const char = this.character();
        const allocated = char.finances.benefitRollsAllocated || {};
        
        // Start with careers that have specific rolls
        const result = Object.keys(allocated)
            .filter(name => allocated[name] > 0)
            .map(name => ({
                name,
                count: allocated[name],
                source: name === 'General' ? 'general' : 'specific'
            }));
        
        // If General has rolls, also show all career history as available options
        if ((allocated['General'] || 0) > 0) {
            const careerNames = [...new Set(char.careerHistory.map(h => h.careerName))];
            
            for (const careerName of careerNames) {
                // Don't duplicate if already in list (has specific rolls)
                if (!result.find(p => p.name === careerName)) {
                    result.push({
                        name: careerName,
                        count: allocated['General'] || 0,
                        source: 'general-available'
                    });
                }
            }
        }
        
        return result;
    });

    // Pension Logic derived from CharacterService
    pension = this.characterService.pension;

    currentCareerDef = computed(() => {
        const name = this.selectedCareerName();
        if (!name) return null;
        return this.careerService.getCareer(name) || null;
    });

    selectCareer(name: string) {
        this.selectedCareerName.set(name);
    }


    async rollBenefit(type: 'Cash' | 'Material') {
        const char = this.character();
        const careerName = this.selectedCareerName();
        if (!careerName) return;

        const allocated = char.finances.benefitRollsAllocated || {};
        const hasSpecificRolls = (allocated[careerName] || 0) > 0;
        const hasGeneralRolls = (allocated['General'] || 0) > 0;
        
        // Check if we can use this career (either has specific rolls or can use General)
        if (!hasSpecificRolls && !hasGeneralRolls) return;

        if (type === 'Cash' && this.cashRolls() >= this.maxCashRolls) return;

        const careerDef = this.careerService.getCareer(careerName);
        if (!careerDef) return;

        const modifiers: { label: string, value: number }[] = [];
        let dm = 0;

        // 1. 2300AD Path Modifiers
        // Hard Path: DM+1 | Soft Path: DM-1
        // Reference: 2300AD Core Rulebook - "A Traveller on the Hard Path adds DM+1 to all Benefit rolls,
        // while a Traveller on the Soft Path has DM-1."
        if (char.isSoftPath) {
            dm -= 1;
            modifiers.push({ label: 'Soft Path', value: -1 });
        } else {
            dm += 1;
            modifiers.push({ label: 'Hard Path', value: 1 });
        }

        // 2. Off-World Education (Rule 258: DM-1 to all benefit rolls)
        if (char.education?.offworld) {
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

        const rollResult = await this.diceDisplay.roll(
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

        let finalRoll = rollResult + dm;
        if (finalRoll > 7) finalRoll = 7;
        if (finalRoll < 1) finalRoll = 1;

        const tableIndex = finalRoll - 1;

        // Determine which pool to debit: specific rolls or general
        const sourceCareer = hasSpecificRolls ? careerName : 'General';
        
        if (type === 'Cash') {
            const cash = careerDef.musteringOutCash[tableIndex];
            const source = sourceCareer === careerName ? careerName : `General (via ${careerName})`;
            const result = `Cash: Lv ${cash} from ${source}`;
            
            this.characterService.updateFinances({ cash: char.finances.cash + cash });
            this.benefitsLog.update((l: string[]) => [...l, result]);
            this.characterService.spendBenefitRoll(sourceCareer, 1, true);
        } else {
            const benefitName = careerDef.musteringOutBenefits[tableIndex];
            const effects = getBenefitEffects(benefitName);
            
            // Register custom handlers
            this.registerMusteringOutHandlers();

            // Apply effects via Engine
            await this.eventEngine.applyEffects(effects);
            
            const source = sourceCareer === careerName ? careerName : `General (via ${careerName})`;
            this.benefitsLog.update((l: string[]) => [...l, `Benefit: ${benefitName} from ${source}`]);
            this.characterService.spendBenefitRoll(sourceCareer, 1, false);
        }

        console.log(`[MusteringOut] Rolled ${rollResult}${dm ? (dm > 0 ? '+' + dm : dm) : ''} (${type})`);

        // Check if rolls for this career are exhausted
        const updatedAlloc = this.character().finances.benefitRollsAllocated || {};
        if ((updatedAlloc[careerName] || 0) <= 0) {
            // Find next career with rolls
            const nextPool = this.careerPools().filter(p => p.count > 0);
            if (nextPool.length > 0) {
                this.selectCareer(nextPool[0].name);
            }
        }
    }

    private registerMusteringOutHandlers() {
        this.eventEngine.registerCustomHandler('AWARD_WEAPON', async () => {
            const careerName = this.selectedCareerName() || '';
            const selected = await this.benefitChoiceService.selectWeapon(careerName);
            if (selected) {
                this.characterService.addItem(selected.name);
                this.characterService.log(`**Benefit Gained**: ${selected.name}. ${selected.description}`);
            }
        });

        this.eventEngine.registerCustomHandler('AWARD_ARMOR', async () => {
            const selected = await this.benefitChoiceService.selectArmor(this.selectedCareerName() || '');
            if (selected) {
                this.characterService.addItem(selected.name);
                this.characterService.log(`**Benefit Gained**: ${selected.name}. ${selected.description}`);
            }
        });

        this.eventEngine.registerCustomHandler('AWARD_VEHICLE', async () => {
            const selected = await this.benefitChoiceService.selectVehicle(this.selectedCareerName() || '');
            if (selected) {
                this.characterService.addItem(selected.name);
                this.characterService.log(`**Benefit Gained**: ${selected.name}. ${selected.description}`);
            }
        });

        this.eventEngine.registerCustomHandler('AWARD_NPC', async (payload) => {
             const type = payload.type || 'Contact';
             const careerName = this.selectedCareerName() || 'Unknown';
             
             // Use our new Interaction Service!
             const npc = await this.npcInteractionService.promptForNpc({
                 role: type,
                 notes: `Gained during Muster Out from ${careerName}`
             });

             if (npc) {
                 this.characterService.addNpc(npc);
                 this.characterService.log(`**Benefit Gained**: Established ${type} relation with ${npc.name}.`);
             }
        });
        
        this.eventEngine.registerCustomHandler('SET_NEURAL_JACK', () => {
            this.characterService.updateCharacter({ hasNeuralJack: true });
            this.characterService.log('**Cybernetics**: Neural Jack interface successfully installed.');
        });
    }

    // Removed old confirmNpcGeneration method

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

        this.wizardFlow.advance();
    }
}
