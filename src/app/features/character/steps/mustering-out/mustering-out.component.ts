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
        return Object.values(allocated).reduce((a, b) => a + b, 0);
    });

    rollsUsed = signal(0);
    cashRolls = signal(0);
    maxCashRolls = 3;

    benefitsLog = signal<string[]>([]);

    // Selected Career for rolling
    selectedCareerName = signal<string | null>(null);

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

        // 1. Path Modifier
        if (char.homeworld?.path === 'Hard') {
            dm += 1;
            modifiers.push({ label: 'Hard Path', value: 1 });
        } else if (char.homeworld?.path === 'Soft') {
            dm -= 1;
            modifiers.push({ label: 'Soft Path', value: -1 });
        }

        // 2. Off-World Education (Cash only)
        if (type === 'Cash' && char.education?.offworld) {
            dm -= 1;
            modifiers.push({ label: 'Off-World Edu', value: -1 });
        }

        // 3. Rank Bonus (Rank 5+ DM+1 on Material)
        // We check the highest rank reached in THIS career
        const careerHistory = char.careerHistory.filter(h => h.careerName === careerName);
        const highestRank = Math.max(...careerHistory.map(h => h.rank), 0);
        if (type === 'Material' && highestRank >= 5) {
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
            this.cashRolls.update((v: number) => v + 1);

            const currentCash = char.finances.cash;
            this.characterService.updateCharacter({
                finances: { ...char.finances, cash: currentCash + cash }
            });

        } else {
            const benefit = careerDef.musteringOutBenefits[tableIndex];
            result = `Benefit: ${benefit}`;

            if (benefit.includes('INT +')) {
                const int = char.characteristics.int;
                this.characterService.updateCharacteristics({
                    ...char.characteristics,
                    int: { ...int, value: int.value + 1, modifier: this.diceService.getModifier(int.value + 1) }
                });
            }
            else if (benefit.includes('EDU +')) {
                const edu = char.characteristics.edu;
                this.characterService.updateCharacteristics({
                    ...char.characteristics,
                    edu: { ...edu, value: edu.value + 1, modifier: this.diceService.getModifier(edu.value + 1) }
                });
            }
            else if (benefit.includes('SOC +')) {
                const soc = char.characteristics.soc;
                this.characterService.updateCharacteristics({
                    ...char.characteristics,
                    soc: { ...soc, value: soc.value + 1, modifier: this.diceService.getModifier(soc.value + 1) }
                });
            }
            else if (benefit.includes('Ship Share')) {
                this.characterService.updateCharacter({
                    finances: { ...char.finances, shipShares: char.finances.shipShares + 1 }
                });
            }
            else if (benefit === 'Weapon') {
                const equipment = [...char.equipment, 'Weapon (Select Later)'];
                this.characterService.updateCharacter({ equipment });
            }
            else {
                const equipment = [...char.equipment, benefit];
                this.characterService.updateCharacter({ equipment });
            }
        }

        this.benefitsLog.update((l: string[]) => [...l, result]);
        this.characterService.spendBenefitRoll(careerName, 1);
        this.rollsUsed.update((v: number) => v + 1);
        console.log(`[MusteringOut] Rolled ${roll}${dm ? (dm > 0 ? '+' + dm : dm) : ''} (${type}): ${result}`);
    }

    canProceedToNext(): boolean {
        return this.rollsUsed() >= this.totalRolls();
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

        this.characterService.updateCharacteristics(chars);
        this.characterService.updateCharacter({
            finances: { ...char.finances, cash: newCash, medicalDebt: newMedicalDebt },
            injuries: updatedInjuries
        });

        this.characterService.log(`**Debt Paid**: Treated ${injury.name}. Restored ${injury.stat} +${injury.reduction}. Cost: Lv ${injury.cost}.`);
        this.benefitsLog.update((l: string[]) => [...l, `DEBT PAID: ${injury.name} — Lv ${injury.cost}`]);
    }

    finish() {
        // Save pension to character finances
        const p = this.pension();
        if (p > 0) {
            const char = this.character();
            this.characterService.updateCharacter({
                finances: { ...char.finances, pension: p }
            });
        }
        // Mark character as finished
        this.characterService.updateCharacter({ isFinished: true });
        this.complete.emit();
    }
}
