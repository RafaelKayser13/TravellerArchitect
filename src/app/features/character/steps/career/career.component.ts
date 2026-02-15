import { Component, inject, computed, signal, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceService } from '../../../../core/services/dice.service';
import { CAREERS } from '../../../../data/careers';
import { CareerDefinition, Assignment } from '../../../../core/models/career.model';
import { DiceDisplayService } from '../../../../core/services/dice-display.service';
import { NATIONALITIES } from '../../../../data/nationalities';

const MILITARY_CAREERS = ['Army', 'Navy', 'Marine'];
const MEDICAL_MILITARY_BUCKET = ['Army', 'Navy', 'Marine'];

type CareerState = 'CHOOSE_CAREER' | 'QUALIFICATION' | 'QUALIFICATION_FAILURE' | 'BASIC_TRAINING' | 'SKILL_TRAINING' | 'SURVIVAL' | 'EVENT' | 'MISHAP' | 'ADVANCEMENT' | 'CHANGE_ASSIGNMENT' | 'LEAVING_HOME' | 'TERM_END' | 'MUSTER_OUT';

import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';

@Component({
    selector: 'app-career',
    standalone: true,
    imports: [CommonModule, FormsModule, StepHeaderComponent],
    templateUrl: './career.component.html',
    styleUrls: ['./career.component.scss']
})
export class CareerComponent implements OnInit {
    protected characterService = inject(CharacterService);
    protected diceService = inject(DiceService);
    protected diceDisplay = inject(DiceDisplayService);

    careers = CAREERS;

    // State Signals
    currentState = signal<CareerState>('CHOOSE_CAREER');
    currentTerm = computed(() => this.characterService.character().careerHistory.length + 1);
    currentAge = computed(() => this.characterService.character().age);

    // Selection
    selectedCareer: CareerDefinition | null = null;
    selectedAssignment: Assignment | null = null;

    // Turn Data
    rollLog: string[] = [];
    lastRoll = 0;
    lastTarget = 0;
    lastDm = 0;
    success = false;
    leavingHomeSuccess = false;
    termEventLog = signal<string[]>([]);

    // Event Text
    currentEventText = '';
    showCyberneticOption = false;

    // Mustering Out State
    benefitRollsTotal = 0;
    benefitRollsRemaining = 0;
    cashRollsTaken = 0;
    benefitsLog: string[] = [];

    // New Advancement State
    bonusSkillRolls = signal(0);
    currentRank = signal(0);
    isCommissionedCurrent = signal(false);
    mandatoryContinue = false;
    forcedOut = false;
    isCommissionAttempt = false;

    // Change Assignment
    nextAssignment: Assignment | null = null;

    // --- NEW: Event Effects State ---
    isSkillChoicePrompt = false;
    skillChoices: string[] = [];
    isNpcPrompt = false;
    pendingNpcType: import('../../../../core/models/career.model').NpcType = 'contact';
    pendingNpcOrigin = '';
    npcNameInput = '';

    isSkillCheckOutcome = false;
    skillCheckMessage = '';

    isConnectionsRuleEligible = false;
    connectionsSkillChoices: string[] = [];

    // Life Event State
    isLifeEventChoice = false;
    lifeEventChoiceNote = '';
    lifeEventChoiceOptions: string[] = [];
    currentLifeEventRoll = 0;

    isSubRollActive = false;
    subRollTable: { roll: number, result: string }[] = [];
    subRollTitle = '';

    // Injury State
    isInjuryPrompt = false;
    injuryRoll = 0;
    injurySeverity = '';
    injuryMajorLoss = 0;
    pendingInjuryStats: string[] = [];
    selectedInjuryStat = '';

    isInjuryDecisionActive = false;
    medicalCoverage = 0;
    medicalRestorationCost = 0;
    medicalDebtCalculated = 0;

    // 2300AD: Career Specific States
    isForeignLegionActive = false;
    isNeuralJackPrompt = false;
    isNpcConversionPrompt = false;
    neuralJackCostType: 'cash' | 'benefit' = 'cash';

    // Prisoner System
    paroleThreshold = signal(7);
    isStatReductionChoice = false;
    statReductionValue = 0;

    // Merchant System
    benefitRollsToBet = 0;
    isGamblingPrompt = false;

    constructor() { }

    ngOnInit() {
        const char = this.characterService.character();
        if (char.forcedCareer) {
            const forced = this.careers.find(c => c.name.toLowerCase() === char.forcedCareer?.toLowerCase());
            if (forced) {
                this.characterService.log(`**Enforcing Forced Career**: ${forced.name}`);
                this.selectCareer(forced);
                // For Prisoner, it's usually automatic success
                if (forced.name === 'Prisoner') {
                    // Logic to jump to qualification/basic training
                }
            }
        }
    }

    // --- 1. CHOOSE CAREER ---
    private addToEventLog(message: string) {
        this.termEventLog.update(log => [...log, message]);
    }

    selectCareer(career: CareerDefinition) {
        if (this.isCareerDisabled(career)) {
            this.log(`REJECTED: ${this.getDisabledReason(career)}`);
            return;
        }

        this.termEventLog.set([]); // Reset log for new career
        this.selectedCareer = career;
        this.selectedAssignment = null;

        // Initialize per-career state
        this.currentRank.set(0);
        this.isCommissionedCurrent.set(false);
        this.isNpcConversionPrompt = false;
        this.isNeuralJackPrompt = false;

        // 2300AD: Academy Honors starts at Rank 1
        const char = this.characterService.character();
        if (char.education?.academy && char.education?.honors && this.isMilitaryCareer()) {
            this.currentRank.set(1);
            this.isCommissionedCurrent.set(true);
        }

        // REMOVED FORCED SCROLL RESET to prevent jumping
    }

    isCareerDisabled(career: CareerDefinition): boolean {
        const char = this.characterService.character();
        const nation = NATIONALITIES.find(n => n.name === char.nationality);
        const tier = nation?.tier || 3;

        // 1. Nation Tier Restriction (Term 1)
        if (this.currentTerm() === 1 && tier >= 5) {
            const forbidden = ['Scout', 'Merchant', 'Navy'];
            if (forbidden.includes(career.name)) return true;
        }

        // 2. Re-entry Ban (Ejected)
        if (char.ejectedCareers?.includes(career.name)) return true;

        // 4. Academy Service Obligation (Forced Career)
        if (char.forcedCareer && char.forcedCareer !== career.name) return true;

        // 3. Attribute Requirements
        if (career.minAttributes) {
            for (const [stat, min] of Object.entries(career.minAttributes)) {
                const charStat = (char.characteristics as any)[stat.toLowerCase()];
                if (charStat && charStat.value < min) return true;
                // Special case for DEX or INT (Entertainer)
                if (stat.includes('dex or int')) {
                    if (char.characteristics.dex.value < 5 && char.characteristics.int.value < 5) return true;
                }
            }
        }

        // 4. Spacer/Army Rule (Term 1)
        if (this.currentTerm() === 1 && char.originType === 'Spacer' && career.name === 'Army') return true;

        return false;
    }

    getDisabledReason(career: CareerDefinition): string {
        const char = this.characterService.character();
        const nation = NATIONALITIES.find(n => n.name === char.nationality);
        const tier = nation?.tier || 3;

        if (this.currentTerm() === 1 && tier >= 5) {
            const forbidden = ['Scout', 'Merchant', 'Navy'];
            if (forbidden.includes(career.name)) return `Requires Tier 4 nation (Current: Tier ${tier})`;
        }

        if (char.ejectedCareers?.includes(career.name)) return 'Ejected recently (barred for 1 term)';

        if (char.forcedCareer && char.forcedCareer !== career.name) {
            return `SERVICE_OBLIGATION: Academy graduate must serve in ${char.forcedCareer}.`;
        }

        if (career.minAttributes) {
            for (const [stat, min] of Object.entries(career.minAttributes)) {
                const charStat = (char.characteristics as any)[stat.toLowerCase()];
                if (charStat && charStat.value < min) return `Requires ${stat.toUpperCase()} ${min}`;
                if (stat.includes('dex or int')) {
                    if (char.characteristics.dex.value < 5 && char.characteristics.int.value < 5) return `Requires DEX or INT 5`;
                }
            }
        }

        if (this.currentTerm() === 1 && char.originType === 'Spacer' && career.name === 'Army') return 'Spacers cannot join Army in Term 1';

        return '';
    }

    selectAssignment(assignment: Assignment) {
        this.selectedAssignment = assignment;

        // 2300AD: French Foreign Legion Prompt
        const char = this.characterService.character();
        if (this.selectedCareer?.name === 'Army' && ['French Empire', 'Generic Tier 3'].includes(char.nationality)) {
            this.lifeEventChoiceNote = 'The French Foreign Legion offers immediate enlistment. (Qual DM+1, Survival DM-1). Do you wish to join?';
            this.lifeEventChoiceOptions = ['Join Foreign Legion', 'Standard Enlistment'];
            this.isLifeEventChoice = true;
        }

        // REMOVED FORCED SCROLL TO BOTTOM to prevent jumping
    }

    async qualify() {
        const career = this.selectedCareer;
        if (!career) return;

        this.characterService.log(`## Qualification Attempt: ${career.name}`);

        const char = this.characterService.character();
        let autoQualify = false;

        // 2300AD: Nation Tier Restriction (Term 1)
        const nation = NATIONALITIES.find(n => n.name === char.nationality);
        const tier = nation?.tier || 3;
        if (this.currentTerm() === 1 && tier >= 5) {
            const forbidden = ['Scout', 'Merchant', 'Navy'];
            if (forbidden.includes(career.name)) {
                this.log(`REJECTED: ${char.nationality} (Tier ${tier}) does not have the infrastructure for ${career.name} careers yet.`);
                this.currentState.set('QUALIFICATION_FAILURE');
                return;
            }
        }

        if (career.qualificationTarget === 0) autoQualify = true;
        if (career.name === 'Prisoner') autoQualify = true;
        if ((career.name === 'Noble' || (career as any).name === 'Elite') && (char.characteristics as any).soc.value >= 10) autoQualify = true;
        if (career.name === 'Spaceborne' && char.originType === 'Spacer') autoQualify = true;
        
        // 2300AD: Academy Graduation Forced Career
        if (char.forcedCareer === career.name) autoQualify = true;

        if (autoQualify) {
            this.characterService.log(`**Automatic Qualification for ${career.name}**`);
            this.success = true;

            // Clear forced career after entry
            if (char.forcedCareer === career.name) {
                this.characterService.updateCharacter({ forcedCareer: '' });
            }

            this.applyRankBonus(0);
            this.currentState.set('BASIC_TRAINING');
            return;
        }

        this.log(`Attempting to join ${career.name}...`);

        const history = char.careerHistory || [];
        const numPrevCareers = new Set(history.map((c: any) => c.careerName)).size;
        let dm = -1 * numPrevCareers;

        // 2300AD: Age Penalty for Military Careers
        const ageThreshold = career.name === 'Navy' ? 34 : 30;
        if (char.age >= ageThreshold && MILITARY_CAREERS.includes(career.name)) {
            dm -= 2;
            this.log(`Age ${ageThreshold}+ Military Penalty: -2 DM to Qualification.`);
        }

        // Handle dual-stat qualification (e.g., "DEX or INT")
        let stat = career.qualificationStat.toLowerCase();
        let charStatKey = stat;

        if (stat.includes(' or ')) {
            const options = stat.split(' or ');
            const mod1 = this.diceService.getModifier((char.characteristics as any)[options[0]].value + (char.characteristics as any)[options[0]].modifier);
            const mod2 = this.diceService.getModifier((char.characteristics as any)[options[1]].value + (char.characteristics as any)[options[1]].modifier);
            // Use better stat
            charStatKey = mod1 >= mod2 ? options[0] : options[1];
            this.log(`Dual-Qualification Choice: Using ${charStatKey.toUpperCase()} (Better Modifier)`);
        }

        const charStat = (char.characteristics as any)[charStatKey];
        const statMod = this.diceService.getModifier(charStat.value + charStat.modifier);
        const target = career.qualificationTarget;

        const modifiers: { label: string, value: number }[] = [];
        if (dm !== 0) modifiers.push({ label: 'Previous Careers', value: dm });
        if (statMod !== 0) modifiers.push({ label: `Stat (${charStatKey.toUpperCase()})`, value: statMod });
        if (this.isForeignLegionActive) modifiers.push({ label: 'French Foreign Legion', value: 1 });

        // Apply persisted Qualification DM (from Life Events/Education)
        const nextQualDm = char.nextQualificationDm || 0;
        if (nextQualDm !== 0) {
            modifiers.push({ label: 'Event Bonus', value: nextQualDm });
        }

        let universityMod = 0;
        if (char.education?.university === true) {
            const cName = career.name;
            const aName = this.selectedAssignment?.name || '';

            let eligible = ['Agent', 'Army', 'Marine', 'Scholar', 'Scout'].includes(cName);
            if (cName === 'Citizen' && aName === 'Corporate') eligible = true;
            if (cName === 'Entertainer' && aName === 'Journalist') eligible = true;

            if (eligible) {
                universityMod = char.education.honors ? 2 : 1;
                const label = char.education.honors ? 'University Honors' : 'University Grad';
                modifiers.push({ label: label, value: universityMod });
            }
        }

        // Persisted Qualification DMs already added to modifiers and calculation from line 330

        const rollResult = await this.diceDisplay.roll(
            `Qualification: ${career.name}`, 2, statMod + dm + universityMod + nextQualDm + (this.isForeignLegionActive ? 1 : 0), target, charStatKey.toUpperCase(), undefined, modifiers
        );

        const total = rollResult + statMod + dm + universityMod + nextQualDm + (this.isForeignLegionActive ? 1 : 0);
        this.log(`Rolled ${total} vs ${target}`);

        if (total >= target) {
            this.success = true;
            this.characterService.log(`**Qualified for ${career.name}** (${this.selectedAssignment?.name})`);
            this.log('Qualified!');
            
            // Clear used bonuses
            this.characterService.updateCharacter({ nextQualificationDm: 0, forcedCareer: '' });
            
            // 2300AD: Academy Honors Commission
            if (char.education?.academy && char.education?.honors && this.isMilitaryCareer()) {
                this.characterService.log(`**Academy Honors**: Automatic Commission to Rank 1 (Officer)`);
                this.log('Honors Commission Applied.');
                
                this.isCommissionedCurrent.set(true);
                this.currentRank.set(1);
                
                this.applyRankBonus(1);
                this.currentState.set('BASIC_TRAINING'); 
            } else if (char.nationality === 'Japan' && char.japaneseRankBonus && this.isMilitaryCareer() && char.careerHistory.length === 0) {
                this.characterService.log(`**Japanese Bonus**: Automatic Commission to Rank 1 (Officer)`);
                this.log('Japanese Rank Bonus Applied.');
                
                this.isCommissionedCurrent.set(true);
                this.currentRank.set(1);
                this.characterService.updateCharacter({ japaneseRankBonus: false });
                
                this.applyRankBonus(1);
                this.currentState.set('BASIC_TRAINING');
            } else {
                // Apply Rank 0 bonus immediately after qualification
                this.applyRankBonus(0);
                this.currentState.set('BASIC_TRAINING');
            }
        } else {
            this.success = false;
            this.characterService.log(`**Failed Qualification** for ${career.name}.`);
            this.log('Failed Qualification.');

            // Clear used bonuses
            this.characterService.updateCharacter({ nextQualificationDm: 0, forcedCareer: '' });

            if (this.currentAge() === 18) {
                this.currentState.set('QUALIFICATION_FAILURE');
            } else {
                this.characterService.log('Entering the Draft...');
                await this.runDraft();
            }
        }
    }

    async chooseDraft() {
        this.characterService.log('Choosing the Draft...');
        await this.runDraft();
    }

    async chooseDrifter() {
        this.characterService.log('Choosing Drifter path...');
        const drifter = this.careers.find(c => c.name === 'Drifter');
        if (drifter) {
            this.selectedCareer = drifter;
            this.selectedAssignment = drifter.assignments[0];
            this.applyRankBonus(0);
            this.currentState.set('BASIC_TRAINING');
        }
    }

    /**
     * Apply rank bonus for a given rank level.
     * Uses bonusSkill/bonusValue from the career data.
     * For officer ranks, checks officerRanks first.
     */
    private applyRankBonus(rankLevel: number) {
        if (!this.selectedCareer || !this.selectedAssignment) return;

        // Check officer ranks first if commissioned
        let rankData = null;
        if (this.isCommissioned() && this.selectedCareer.officerRanks) {
            rankData = this.selectedCareer.officerRanks.find(r => r.level === rankLevel);
        }
        // Fallback to enlisted ranks
        if (!rankData) {
            rankData = this.selectedAssignment.ranks.find(r => r.level === rankLevel);
        }

        if (!rankData || !rankData.bonusSkill) return;

        const skill = rankData.bonusSkill;
        const value = rankData.bonusValue;

        if (skill.includes('(trait)')) {
            this.characterService.log(`**Rank ${rankLevel} Bonus** (${this.selectedCareer.name}): Gained Trait ${skill}`);
            this.log(`Rank ${rankLevel} Bonus: ${skill}`);
            return;
        }

        if (typeof value === 'number') {
            // Skill bonus (e.g. 'Gun Combat (slug)' at level 1)
            this.characterService.ensureSkillLevel(skill, value);
            this.characterService.log(`**Rank ${rankLevel} Bonus** (${this.selectedCareer.name}): ${skill} set to ${value}`);
            this.log(`Rank ${rankLevel} Bonus: ${skill} ${value}`);
        } else if (typeof value === 'string') {
            // Stat bonus (e.g. 'SOC +1' or 'SOC 10 or +1')
            if (value.includes('+1')) {
                this.increaseStat(skill, 1);
                this.characterService.log(`**Rank ${rankLevel} Bonus** (${this.selectedCareer.name}): ${skill} +1`);
                this.log(`Rank ${rankLevel} Bonus: ${skill} +1`);
            } else if (value.includes('10 or +1') || value.includes('12 or +1')) {
                const targetScore = value.includes('12') ? 12 : 10;
                const char = this.characterService.character();
                const statKey = skill.toLowerCase() as keyof typeof char.characteristics;
                const current = (char.characteristics as any)[statKey]?.value || 0;
                if (current < targetScore) {
                    this.increaseStat(skill, targetScore - current);
                    this.characterService.log(`**Rank ${rankLevel} Bonus** (${this.selectedCareer.name}): ${skill} set to ${targetScore}`);
                } else {
                    this.increaseStat(skill, 1);
                    this.characterService.log(`**Rank ${rankLevel} Bonus** (${this.selectedCareer.name}): ${skill} +1`);
                }
                this.log(`Rank ${rankLevel} Bonus: ${skill} ${value}`);
            }
        }
    }

    /**
     * Check if the current career is a military career.
     */
    isMilitaryCareer(): boolean {
        return !!this.selectedCareer && MILITARY_CAREERS.includes(this.selectedCareer.name);
    }

    // --- 2. TRAINING & SKILLS ---

    // SAFETY FLAG
    basicTrainingGrantedThisTerm = false;

    private grantBasicTrainingSkills() {
        const term = this.currentTerm();
        this.log(`grantBasicTrainingSkills: Term ${term}`);

        if (term === 1) {
            if (this.basicTrainingGrantedThisTerm) {
                this.log('Basic Training already granted this term. Skipping.');
                return;
            }

            const serviceSkills = this.selectedCareer?.serviceSkills || [];
            let skillsToGrant = [...serviceSkills];

            // 2300AD: Citizens get all Service and Assignment skills at 0
            // (Note: The rulebook says "covers all Service and Assignment skills")
            if (this.selectedCareer?.name === 'Citizen' && this.selectedAssignment) {
                skillsToGrant = [...serviceSkills, ...this.selectedAssignment.skillTable];
            }

            this.log(`grantBasicTrainingSkills: Skills found: ${skillsToGrant.length} (${skillsToGrant.join(', ')})`);

            if (skillsToGrant.length > 0) {
                skillsToGrant.forEach(s => {
                    this.log(`Adding Skill: ${s} at Level 0`);
                    this.characterService.addSkill(s, 0, true);
                });
                this.log(`Basic Training: Acquired ALL Service Skills at Level 0.`);
                this.characterService.log(`**Basic Training** (${this.selectedCareer?.name}): Received all Service Skills at Level 0`);
                this.basicTrainingGrantedThisTerm = true;
            }
        }
    }

    performBasicTraining() {
        this.grantBasicTrainingSkills();
        this.currentState.set('SKILL_TRAINING');
    }

    async attemptCommission() {
        if (!this.selectedCareer || !this.selectedAssignment) return;

        // Ensure basic training is granted if this is the first term
        this.grantBasicTrainingSkills();

        this.isCommissionAttempt = true;
        this.success = false;

        const stat = this.selectedAssignment.advancementStat.toLowerCase();
        const target = this.selectedAssignment.advancementTarget;
        const char = this.characterService.character();
        const charStat = (char.characteristics as any)[stat];
        const statMod = this.diceService.getModifier(charStat.value + charStat.modifier);

        const modifiers: { label: string, value: number }[] = [];
        if (statMod !== 0) modifiers.push({ label: `Stat (${stat.toUpperCase()})`, value: statMod });

        // 2300AD: Academy Graduation grants DM+2 to Commission
        let academyBonus = 0;
        if (char.education?.academy && !char.education?.honors && this.isMilitaryCareer()) {
            academyBonus = 2;
            modifiers.push({ label: 'Academy Grad', value: 2 });
        }

        const rollLabels = academyBonus > 0 ? 'Commission Check (+2 Academy)' : 'Commission Check';
        const roll = await this.diceDisplay.roll(
            rollLabels, 2, statMod + academyBonus, target, stat.toUpperCase(), undefined, modifiers
        );

        const total = roll + statMod + academyBonus;
        this.log(`Commission Check: ${total} vs ${target}`);

        if (total >= target) {
            this.success = true;
            this.isCommissionedCurrent.set(true);
            this.currentRank.set(1);
            const rankTitle = this.getOfficerRankTitle(1);
            this.characterService.log(`**Commission Granted** (${this.selectedCareer.name}): Promoted to ${rankTitle} (Officer Rank 1)`);
            this.log(`Commissioned! You are now a ${rankTitle} (Officer Rank 1).`);
            // Apply Officer Rank 1 bonus immediately
            this.applyRankBonus(1);
            this.bonusSkillRolls.update(v => v + 1);
            this.characterService.log(`Commission grants **1 Extra Skill Roll**`);
            this.log('Commission successful! Gain 1 Extra Skill Roll.');
            this.currentState.set('SKILL_TRAINING');
        } else {
            this.success = false;
            this.characterService.log(`**Commission Failed** (${this.selectedCareer.name})`);
            this.log('Commission failed.');
            this.currentState.set('SKILL_TRAINING');
        }
    }

    // --- Commission Helpers ---

    canAttemptCommission(): boolean {
        if (!this.selectedCareer) return false;
        // Only military careers can attempt Commission
        if (!MILITARY_CAREERS.includes(this.selectedCareer.name)) return false;
        if (!this.selectedCareer.officerSkills) return false;

        // If already commissioned, can't attempt again
        if (this.isCommissioned()) return false;
        if (this.isCommissionAttempt) return false; // Already attempted this term (success or fail)

        // Rule: Term 1 OR SOC 9+
        const char = this.characterService.character();
        const soc = char.characteristics.soc.value;

        return this.currentTerm() === 1 || soc >= 9;
    }

    isCommissioned(): boolean {
        return this.isCommissionedCurrent();
    }

    /**
     * Get the officer rank title for a given level.
     */
    getOfficerRankTitle(rank: number): string {
        if (!this.selectedCareer?.officerRanks) return `Officer Rank ${rank}`;
        const r = this.selectedCareer.officerRanks.find(data => data.level === rank);
        return r ? r.title : `Officer Rank ${rank}`;
    }

    async runDraft() {
        // 2300AD Draft Table: 1-3=Army, 4-5=Marine, 6=Navy
        const draftTable = [
            { roll: 1, career: 'Army' }, { roll: 2, career: 'Army' },
            { roll: 3, career: 'Army' }, { roll: 4, career: 'Marine' },
            { roll: 5, career: 'Marine' }, { roll: 6, career: 'Navy' }
        ];

        const rollSource = await this.diceDisplay.roll('Draft', 1, 0, 0, '', undefined, [], draftTable);
        const roll = rollSource;

        let draftedCareerName = '';
        if (roll <= 3) draftedCareerName = 'Army';
        else if (roll <= 5) draftedCareerName = 'Marine';
        else draftedCareerName = 'Navy';

        let draftTarget = this.careers.find(c => c.name.includes(draftedCareerName));
        // Fallback for Marine vs Marines naming discrepancy
        if (!draftTarget && draftedCareerName === 'Marine') {
            draftTarget = this.careers.find(c => c.name === 'Marines');
        }

        if (draftTarget) {
            this.characterService.log(`**Drafted** into ${draftTarget.name} (${draftTarget.assignments[0].name})`);
            this.log(`Drafted into ${draftTarget.name}.`);
            this.selectedCareer = draftTarget;
            this.selectedAssignment = draftTarget.assignments[0];
            // Apply Rank 0 bonus immediately after draft assignment
            this.applyRankBonus(0);
            this.currentState.set('BASIC_TRAINING');
        } else {
            this.log('Draft failed. You are a Drifter.');
            const drifter = this.careers.find(c => c.name === 'Drifter');
            if (drifter) {
                this.characterService.log(`**Draft Fallback**: Assigned to ${drifter.name}`);
                this.selectedCareer = drifter;
                this.selectedAssignment = drifter.assignments[0];
                this.applyRankBonus(0);
                this.currentState.set('BASIC_TRAINING');
            }
        }
    }

    // --- Specialization Logic ---

    readonly GENERIC_SKILLS: { [key: string]: string[] } = {
        'Art': ['Holography', 'Instrument', 'Performer', 'Visual Media', 'Write'],
        'Drive': ['Hover', 'Mole', 'Track', 'Walker', 'Wheel'],
        'Electronics': ['Comms', 'Computers', 'Remote Ops', 'Sensors'],
        'Engineer': ['Life Support', 'M-Drive', 'Power', 'Stutterwarp'],
        'Flyer': ['Airship', 'Ornithopter', 'Rotor', 'Vectored Thrust', 'Wing'],
        'Gun Combat': ['Archaic', 'Energy', 'Slug'],
        'Gunner': ['Capital', 'Ortillery', 'Screen', 'Turret'],
        'Heavy Weapons': ['Artillery', 'Man Portable', 'Vehicle'],
        'Language': ['French', 'German', 'Spanish', 'Pentapod', 'Zhargon', 'English', 'Japanese'],
        'Melee': ['Blade', 'Bludgeon', 'Unarmed'],
        'Pilot': ['Capital Ships', 'Small Craft', 'Spacecraft'],
        'Profession': ['Belter', 'Biologicals', 'Civil Engineering', 'Construction', 'Hydroponics', 'Polymers'],
        'Science': ['Archaeology', 'Astronomy', 'Biology', 'Chemistry', 'Cosmology', 'Cybernetics', 'Economics', 'Genetics', 'History', 'Linguistics', 'Philosophy', 'Physics', 'Planetology', 'Psionicology', 'Psychology', 'Robotics', 'Sophontology', 'Xenology'],
        'Seafarer': ['Ocean Ship', 'Personal', 'Sail', 'Submarine'],
        'Animals': ['Handling', 'Training', 'Veterinary'],
        'Athletics': ['Dexterity', 'Endurance', 'Strength'],
        'Tactics': ['Military', 'Naval']
    };

    showSkillSelection = false;
    skillSelectionOptions: string[] = [];
    pendingSkillName = '';
    pendingSkillLevel = 1;

    async handleSkillReward(skillName: string, level: number) {
        // addSkill now returns boolean (choiceRequired)
        const choiceRequired = this.characterService.addSkill(skillName, level);

        if (choiceRequired && this.GENERIC_SKILLS[skillName]) {
            this.pendingSkillName = skillName;
            this.pendingSkillLevel = level;
            this.skillSelectionOptions = this.GENERIC_SKILLS[skillName];
            this.showSkillSelection = true;
            this.log(`Select specialization for ${skillName}...`);
        } else if (choiceRequired) {
            // If it's generic but we don't have list (shouldn't happen with current data)
            this.log(`Warning: Specialization required for ${skillName} but no options found.`);
        }
    }

    confirmSpecialization(spec: string) {
        const fullName = `${this.pendingSkillName} (${spec})`;
        this.characterService.addSkill(fullName, this.pendingSkillLevel);
        this.showSkillSelection = false;
        this.log(`Selected info: ${fullName}`);
    }

    // --- Skill Roll ---

    async rollSkill(tableType: 'Personal' | 'Service' | 'Specialist' | 'Advanced' | 'Officer') {
        if (!this.selectedCareer) return;

        const char = this.characterService.character();
        if (tableType === 'Advanced' && (char.characteristics.edu.value + char.characteristics.edu.modifier) < 8) {
            this.log('Education 8+ required for Advanced Education.');
            return;
        }
        if (tableType === 'Officer' && this.selectedCareer.officerSkills && !this.isCommissioned()) {
            this.log('Commission required for Officer skills.');
            return;
        }

        let table: string[] = [];
        if (tableType === 'Personal') table = this.selectedCareer.personalSkills;
        else if (tableType === 'Service') table = this.selectedCareer.serviceSkills;
        else if (tableType === 'Advanced') table = this.selectedCareer.advancedEducation;
        else if (tableType === 'Officer' && this.selectedCareer.officerSkills) table = this.selectedCareer.officerSkills;
        else if (tableType === 'Specialist' && this.selectedAssignment) table = this.selectedAssignment.skillTable;

        const roll = await this.diceDisplay.roll(
            `${tableType} Skill`, 1, 0, 0, '',
            (res) => { const idx = res - 1; return table[idx] || 'Unknown'; }, [], table
        );

        const reward = table[roll - 1];
        if (!reward) return;

        this.log(`Rolled ${roll} on ${tableType}: ${reward}`);
        this.characterService.log(`**Skill Roll** (${tableType}): Rolled ${roll} → ${reward}`);

        if (reward.includes('+1') && (reward.includes('STR') || reward.includes('DEX') || reward.includes('END') || reward.includes('INT') || reward.includes('EDU') || reward.includes('SOC'))) {
            const stat = reward.split(' ')[0];
            this.characterService.log(`**Skill Table Stat Bonus**: ${stat} +1`);
            this.increaseStat(stat, 1);
        } else {
            await this.handleSkillReward(reward, 1);
        }

        // Handle Flow
        // If it was a bonus roll (from Advancement or Commission)
        if (this.bonusSkillRolls() > 0) {
            this.bonusSkillRolls.update(v => v - 1);
            const remaining = this.bonusSkillRolls();
            this.log(`Bonus Roll Used. ${remaining} remaining.`);
            if (remaining > 0) return; // Stay for more rolls?

            // If no more bonus rolls, go to end term logic
            // But wait, if this was the INITIAL skill roll?
            // The "Standard" flow is Basic/Skill -> Survival.
            // The "Bonus" flow comes AFTER Advancement.

            // Check if we have passed Survival/Event checks (by checking currentEventText)
            if (this.currentEventText) {
                // Post-Event Bonus Roll done.
                this.transitionToEndOfTerm();
                return;
            }
        }

        // Standard Flow
        if (this.currentTerm() === 1 && this.currentState() === 'BASIC_TRAINING') {
            this.currentState.set('SURVIVAL');
        } else if (this.currentState() === 'SKILL_TRAINING') {
            // If we are here and have NOT done Event yet, go to Survival.
            if (!this.currentEventText) {
                this.currentState.set('SURVIVAL');
            } else {
                // If we HAVE done Event, this was likely a bonus roll that exhausted.
                this.transitionToEndOfTerm();
            }
        }
    }

    getRank(): number {
        return this.currentRank();
    }

    // --- 3. SURVIVAL & EVENT ---

    async rollSurvival() {
        if (!this.selectedAssignment || !this.selectedCareer) return;

        const stat = this.selectedAssignment.survivalStat.toLowerCase();
        const target = this.selectedAssignment.survivalTarget;
        const char = this.characterService.character();
        const charStat = (char.characteristics as any)[stat];
        const statMod = this.diceService.getModifier(charStat.value + charStat.modifier);

        let hwDm = 0;
        let fflDm = this.isForeignLegionActive ? -1 : 0;
        const modifiers: { label: string, value: number }[] = [];

        if (statMod !== 0) modifiers.push({ label: `Stat (${stat.toUpperCase()})`, value: statMod });
        if (fflDm !== 0) modifiers.push({ label: 'French Foreign Legion', value: fflDm });

        if (!char.hasLeftHome && char.homeworld && char.homeworld.survivalDm < 0) {
            hwDm = char.homeworld.survivalDm;
            modifiers.push({ label: 'Homeworld Gravity', value: hwDm });
        }

        const nextSurvDm = char.nextSurvivalDm || 0;
        if (nextSurvDm !== 0) modifiers.push({ label: 'Bonus DMs', value: nextSurvDm });

        const rollLabels = this.isForeignLegionActive ? 'Survival Check (FFL)' : 'Survival Check';
        const rollResult = await this.diceDisplay.roll(rollLabels, 2, statMod + hwDm + fflDm + nextSurvDm, target, stat.toUpperCase(), undefined, modifiers);
        const total = rollResult + statMod + hwDm + fflDm + nextSurvDm;
        this.log(`Survival Check: ${total} vs ${target}`);

        // Clear used bonuses
        this.characterService.updateCharacter({ nextSurvivalDm: 0 });

        if (total >= target) {
            this.success = true;
            this.characterService.log(`**Survival Check** (${this.selectedCareer?.name}): Passed (${total} vs ${target})`);
            this.log('Survived the term.');
            this.addToEventLog(`SURVIVAL: Successful (${total} vs ${target})`);

            // 2300AD: Neural Jack Installation Prompt (Military Terms 1-3, Tier 3+ nations)
            const tier3Nations = ['France', 'United States', 'Germany', 'United Kingdom', 'Manchuria', 'Australia', 'Canada', 'Japan', 'Russia', 'Argentina', 'Brazil', 'Azania', 'Mexico', 'Texas', 'Ukraine', 'Inca Republic', 'Trilon Corp', 'Life Foundation'];
            if (this.currentTerm() <= 3 && this.isMilitaryCareer() && tier3Nations.includes(char.nationality)) {
                const hasJack = char.equipment.some(e => e.includes('Neural Jack'));
                if (!hasJack) {
                    this.lifeEventChoiceNote = 'Military service offers Neural Jack installation. Enhance your combat capabilities. Cost: Lv 10,000 or 1 Benefit Roll Debt. Do you wish to install?';
                    this.lifeEventChoiceOptions = ['Install (Lv 10,000)', 'Install (Benefit Debt)', 'Decline'];
                    this.isLifeEventChoice = true;
                }
            }

            this.currentState.set('EVENT');
            setTimeout(() => {
                const content = document.querySelector('.wizard-content');
                if (content) content.scrollTop = content.scrollHeight;
            }, 100);
            this.generateEvent();
        } else {
            this.success = false;
            this.showCyberneticOption = true;
            this.characterService.log(`**Survival Check** (${this.selectedCareer?.name}): Failed! (${total} vs ${target})`);
            this.log('Survival Check Failed!');
        }
    }

    resolveSurvivalFailure(acceptCybernetic: boolean) {
        this.showCyberneticOption = false;
        if (acceptCybernetic) {
            this.success = true;
            this.characterService.log(`**Cybernetic Implant** accepted. Avoided Mishap. Debt: -1 Benefit Roll.`);
            this.log('Accepted Cybernetic Implant. Avoided Mishap. Debt: -1 Benefit Roll.');
            
            // Gain relevant implant
            const implant = this.injurySeverity === 'Missing Eye or Limb' ? 'Cybernetic Limb' : 'Cybernetic Augment';
            const char = this.characterService.character();
            this.characterService.updateCharacter({ 
                equipment: [...char.equipment, `${implant} (Benefit Debt)`] 
            });
            
            // Spend the benefit roll debt
            this.characterService.spendBenefitRoll(undefined, 1);

            this.currentState.set('EVENT');
            this.generateEvent();
        } else {
            const isDrifter = this.selectedCareer?.name === 'Drifter';
            const careerName = this.selectedCareer?.name || 'Unknown';
            const logMsg = isDrifter ? `**Survival Check Failed** but stayed in career (Drifter Rule). Rolling Mishap...` : `**Mishap!** Injured and ejected from ${careerName}.`;
            this.characterService.log(logMsg);
            this.log(isDrifter ? 'Survival Check Failed! Rolling Mishap (Stay in Career).' : 'Mishap! You are injured and ejected from the career.');

            if (!isDrifter && careerName !== 'Spaceborne') {
                this.forcedOut = true;
                this.characterService.ejectFromCareer(careerName);
            }

            this.currentState.set('MISHAP');
            this.generateMishap();
        }
    }

    async generateEvent() {
        if (!this.selectedCareer) return;
        const table = this.selectedCareer.eventTable;
        const roll = await this.diceDisplay.roll('Event Roll', 2, 0, 0, '', (result) => {
            const e = table.find(ev => ev.roll === result);
            return e ? e.description : 'Standard Life Event.';
        }, [], table);

        const event = table.find(e => e.roll === roll);
        this.currentEventText = event ? event.description : 'Standard Event.';
        this.addToEventLog(`EVENT: ${this.currentEventText}`);
        this.characterService.log(`**Event** (Roll ${roll}): ${this.currentEventText}`);
        this.log(`Event Roll ${roll}: ${this.currentEventText}`);

        if (event?.effects) {
            for (const effect of event.effects) {
                await this.applyEventEffect(effect);
            }
        }

        // 2300AD: Check for special term constraints
        this.checkSpecial2300ADConstraints();
    }

    private checkSpecial2300ADConstraints() {
        if (!this.selectedCareer) return;
        const char = this.characterService.character();

        // Neural Jack Check (Term 1-3, Tier 3+ nation)
        if (this.currentTerm() <= 3 && this.isMilitaryCareer() && ['French Empire', 'America', 'Generic Tier 3'].includes(char.nationality)) {
            // This is usually handled by term events, but could be a global prompt
        }
    }

    async applyEventEffect(effect: import('../../../../core/models/career.model').CareerEventEffect) {
        if (!this.selectedCareer) return;
        const char = this.characterService.character();

        switch (effect.type) {
            case 'life-event':
                await this.generateLifeEvent();
                break;

            case 'mishap':
                this.currentState.set('MISHAP');
                this.generateMishap();
                break;

            case 'skill-choice':
                if (effect.skills) {
                    this.skillChoices = effect.skills;
                    this.isSkillChoicePrompt = true;
                }
                break;

            case 'skill-gain':
                if (effect.skill) {
                    await this.handleSkillReward(effect.skill, effect.value || 1);
                }
                break;

            case 'stat-bonus':
                if (effect.stat) {
                    this.increaseStat(effect.stat, effect.value || 1);
                }
                break;

            case 'benefit-dm':
                this.characterService.updateDm('benefit', effect.value || 1);
                break;

            case 'advancement-dm':
                this.characterService.updateDm('advancement', effect.value || 1);
                break;

            case 'qualification-dm':
                this.characterService.updateDm('qualification', effect.value || 1);
                break;

            case 'auto-promotion':
                // Logic for auto-promotion or commission
                this.characterService.log(`**Auto-Promotion**: Gained rank due to event effect.`);
                this.success = true; // This will be handled in advancement flow
                break;

            case 'npc':
                this.pendingNpcType = effect.npcType || 'contact';
                this.pendingNpcOrigin = `${this.selectedCareer.name} Term ${this.currentTerm()}`;
                this.isNpcPrompt = true;
                break;

            case 'injury':
                await this.generateInjury();
                break;

            case 'skill-check':
                if (effect.checkSkills && effect.target) {
                    await this.runSkillCheck(effect);
                }
                break;

            case 'lose-benefit':
                // Losing 1 benefit roll this term
                this.characterService.updateFinances({ benefitRollDebt: (char.finances.benefitRollDebt || 0) + 1 });
                this.characterService.log(`**Benefit Lost**: One Benefit roll removed.`);
                break;

            case 'any-skill-up':
                // Special prompt for "any skill"
                this.characterService.log(`**Any Skill +1**: Choose a skill to increase.`);
                this.log('Increase any ONE skill by +1 level.');
                break;

            case 'extra-roll':
                this.bonusSkillRolls.update(v => v + 1);
                this.log('Gain 1 extra skill reward roll.');
                break;

            case 'benefit-mod':
                this.characterService.updateFinances({ benefitRollMod: effect.value || 1 });
                this.characterService.log(`**Benefit Modifier**: Gained +${effect.value || 1} to a single Benefit Roll.`);
                break;

            case 'choice':
                this.lifeEventChoiceNote = effect.note || 'Select an outcome:';
                this.lifeEventChoiceOptions = effect.skills || (effect.note?.includes('Undercover') ? ['Rogue', 'Citizen'] : ['Accept', 'Refuse']);
                this.isLifeEventChoice = true;
                break;

            case 'career-force':
                if (effect.skill) {
                    this.characterService.setNextCareer(effect.skill);
                    this.characterService.log(`**Forced Career**: Next career must be ${effect.skill}.`);
                }
                break;

            case 'forced-out':
                if (effect.value !== 0) {
                    this.forcedOut = true;
                    this.characterService.log(`**Mishap Outcome**: Ejected from career.`);
                } else {
                    this.forcedOut = false;
                    this.characterService.log(`**Mishap Outcome**: Managed to stay in career.`);
                }
                break;

            case 'lose-cash-benefits':
                this.characterService.clearCareerCashHistory(this.selectedCareer?.name || '');
                this.characterService.log(`**Mishap Outcome**: Lost all accumulated cash benefits for this career.`);
                break;

            case 'stat-reduction-choice':
                this.isStatReductionChoice = true;
                this.statReductionValue = effect.value || -1;
                this.characterService.log(`**Choice Required**: Reduce one characteristic by ${Math.abs(this.statReductionValue)}.`);
                break;

            case 'bet-benefit-rolls':
                this.benefitRollsToBet = effect.value || 0;
                this.isGamblingPrompt = true;
                this.characterService.log(`**Event Outcome**: Optional gambling of benefit rolls.`);
                break;

            case 'parole-mod':
                const mod = effect.value || 0;
                this.paroleThreshold.update(v => Math.max(2, v - mod));
                this.characterService.log(`**Prison Event**: Parole Threshold modified by ${mod}. Now: ${this.paroleThreshold()}.`);
                break;

            case 'trait-gain':
                if (effect.note) {
                    this.characterService.log(`**Trait Gained**: ${effect.note}`);
                    this.characterService.updateCharacter({ notes: (char.notes || '') + `\n- ${effect.note}` });
                }
                break;

            case 'npc-note':
                // For "Work Comes Home", we need to mark an existing NPC
                if (char.npcs.length > 0) {
                    this.pendingNpcType = 'rival'; // Default to rival for Agent mishap
                    this.pendingNpcOrigin = effect.note || 'Marked NPC';
                    this.isNpcConversionPrompt = true;
                    this.log('Select an NPC to mark or suffer injury.');
                } else {
                    await this.applyEventEffect({ type: 'injury' });
                }
                break;

            case 'sub-roll':
                await this.handleSubRoll(effect);
                break;

            case 'narrative':
                if (effect.note) this.characterService.log(`**Event Detail**: ${effect.note}`);
                break;

            case 'neural-jack':
                this.isNeuralJackPrompt = true;
                break;
        }
    }

    async handleSubRoll(effect: import('../../../../core/models/career.model').CareerEventEffect) {
        if (effect.note?.includes('Unusual Event')) {
            const results = [
                { roll: 1, result: 'Psionic Potential Detected' },
                { roll: 2, result: 'Contact with Aliens' },
                { roll: 3, result: 'Ancient Artifact Found' },
                { roll: 4, result: 'Amnesia' },
                { roll: 5, result: 'Government Contact' },
                { roll: 6, result: 'Ancient Technology' }
            ];
            const roll = await this.diceDisplay.roll('Unusual Event', 1, 0, 0, '', (res) => results.find(r => r.roll === res)?.result || '', [], results);

            this.characterService.log(`**Unusual Event** (Roll ${roll}): ${results[roll - 1].result}`);
            this.currentEventText += ` [Unusual Event: ${results[roll - 1].result}]`;

            if (roll === 1) this.characterService.setPsionicPotential(true);
            if (roll === 2) {
                this.applyEventEffect({ type: 'npc', npcType: 'contact', note: 'Alien Contact' });
                this.handleSkillReward('Science (Xenology)', 1);
                this.characterService.log('**Alien Contact**: Gained knowledge of alien biology and culture (Science (Xenology) 1).');
            }
            if (roll === 3) this.characterService.updateFinances({ benefitRollMod: 1 });
            if (roll === 4) this.characterService.log('**Amnesia**: History before this term is a mystery.');
            if (roll === 5) this.applyEventEffect({ type: 'npc', npcType: 'ally', note: 'Govt Ally' });
            if (roll === 6) {
                const resultsSci = [
                    { roll: 1, result: 'Ancient Biology' },
                    { roll: 2, result: 'Ancient Engineering' },
                    { roll: 3, result: 'Ancient Physics' },
                    { roll: 4, result: 'Ancient Computers' },
                    { roll: 5, result: 'Ancient Energy' },
                    { roll: 6, result: 'Ancient Warp Theory' }
                ];
                const sciSubRoll = await this.diceDisplay.roll('Ancient Specialization', 1, 0, 0, '', (res) => resultsSci.find(r => r.roll === res)?.result || '');
                const spec = resultsSci[sciSubRoll - 1].result;
                
                this.handleSkillReward(`Science (${spec})`, 1);
                this.characterService.log(`**Ancient Tech**: Gained knowledge from analyzing a mysterious artifact (Science (${spec}) 1).`);
                this.characterService.updateCharacter({ notes: (this.characterService.character().notes || '') + `\n- Possesses a deactivated Ancient artifact (${spec}).` });
            }
        }
    }

    async handleLifeEventChoice(choice: string) {
        this.isLifeEventChoice = false;
        const outcome = this.getChoiceDescription(choice);
        this.addToEventLog(`CHOICE: ${choice}. OUTCOME: ${outcome}`);
        this.characterService.log(`**Choice Selected**: ${choice}`);

        if (choice === 'Prison') {
            this.characterService.setNextCareer('Prisoner');
            this.forcedOut = true;
            this.currentState.set('MISHAP');
            this.characterService.log('**Crime Consequence**: Sent to Prison.');
        } else if (choice === 'Lose Benefit') {
            const charBefore = this.characterService.character();
            this.characterService.updateFinances({ benefitRollDebt: (charBefore.finances.benefitRollDebt || 0) + 1 });
            this.characterService.log('**Crime Consequence**: Lost one Benefit roll.');
        } else if (this.lifeEventChoiceNote.includes('Betrayal')) {
            if (this.selectedCareer?.name === 'Drifter') {
                if (choice === 'Prison Check') {
                    const roll = await this.diceDisplay.roll('Prison Check', 2, 0, 0);
                    if (roll === 2) {
                        this.characterService.setNextCareer('Prisoner');
                        this.forcedOut = true;
                        this.characterService.log('**Betrayal**: Caught and sent to prison.');
                    } else {
                        this.characterService.log('**Betrayal**: Managed to evade capture.');
                    }
                } else {
                    // "Lose Benefits" choice
                    this.applyEventEffect({ type: 'lose-benefit' });
                    this.characterService.log('**Betrayal**: Managed to flee but lost all benefits of this term.');
                }
            } else if (this.selectedCareer?.name === 'Entertainer') {
                if (choice.includes('Existing Contact')) {
                    this.isNpcConversionPrompt = true;
                    this.pendingNpcType = 'rival';
                    this.characterService.log('**Betrayal**: Selecting a Contact to become a Rival.');
                } else {
                    this.applyEventEffect({ type: 'npc', npcType: 'rival', note: 'Betrayal (Peer)' });
                }
            } else {
                // Generic Betrayal choice
                if (choice === 'Convert NPC') {
                    this.isNpcConversionPrompt = true;
                    this.pendingNpcType = 'rival'; // Or enemy based on context
                } else {
                    this.applyEventEffect({ type: 'npc', npcType: 'rival', note: 'Betrayal' });
                }
            }
        } else if (this.lifeEventChoiceNote.includes('Patron Offer')) {
            if (choice === 'Accept') {
                this.characterService.updateDm('qualification', 4); // For next term
                this.applyEventEffect({ type: 'npc', npcType: 'rival', note: 'Patron (I owe them a favor)' });
                this.characterService.log('**Patron Offer**: Accepted. DM+4 to next Qualification but gained a Rival.');
            }
        } else if (this.lifeEventChoiceNote.includes('Risky Adventure')) {
            if (choice === 'Accept') {
                const rollResult = await this.diceDisplay.roll('Risk Roll', 1, 0, 0);
                if (rollResult === 1) {
                    this.characterService.setNextCareer('Prisoner');
                    this.forcedOut = true;
                    this.characterService.log('**Risky Adventure**: Failed! Sent to prison.');
                } else if (rollResult === 2) {
                    await this.generateInjury();
                    this.characterService.log('**Risky Adventure**: Injured during the attempt.');
                } else if (rollResult >= 5) {
                    this.characterService.updateDm('benefit', 4);
                    this.characterService.log('**Risky Adventure**: Success! Gained DM+4 to a benefit roll.');
                } else {
                    this.characterService.log('**Risky Adventure**: Nothing of interest happened.');
                }
            }
        } else if (this.lifeEventChoiceNote.includes('Celebrity Circles')) {
            if (choice === 'Skill') {
                this.skillChoices = ['Art (any)', 'Carouse', 'Persuade'];
                this.isSkillChoicePrompt = true;
            } else {
                this.applyEventEffect({ type: 'npc', npcType: 'contact', note: 'Celebrity Contact' });
            }
        } else if (this.lifeEventChoiceNote.includes('Political Criticism')) {
            if (choice === 'Criticize') {
                this.characterService.updateDm('advancement', 2);
                this.applyEventEffect({ type: 'npc', npcType: 'enemy', note: 'Political Opponent' });
                this.characterService.log('**Political Criticism**: Criticized the status quo. Gained DM+2 Advancement and an Enemy.');
            } else {
                this.characterService.updateDm('advancement', -2);
                this.characterService.log('**Political Criticism**: Remained silent. DM-2 to Advancement.');
            }
        } else if (this.lifeEventChoiceNote.includes('Commander Error')) {
            if (choice === 'Report') {
                this.characterService.updateDm('advancement', 2);
                this.applyEventEffect({ type: 'npc', npcType: 'enemy', note: 'Commander' });
                this.characterService.log('**Commander Error**: Reported the error. Gained DM+2 Advancement and an Enemy.');
            } else {
                this.applyEventEffect({ type: 'npc', npcType: 'ally', note: 'Commander' });
                this.characterService.log('**Commander Error**: Protected the commander. Gained an Ally.');
            }
        } else if (this.lifeEventChoiceNote.includes('CO Interest')) {
            if (choice.includes('Tactics')) {
                await this.handleSkillReward('Tactics (military)', 1);
            } else {
                this.characterService.updateDm('advancement', 4);
                this.characterService.log('**CO Interest**: Chosen DM+4 to Advancement.');
            }
        } else if (this.lifeEventChoiceNote.includes('Heroism')) {
            if (choice === 'Promotion') {
                this.currentRank.update(v => v + 1);
                this.characterService.log('**Heroism**: Received a promotion.');
            } else {
                this.isCommissionedCurrent.set(true);
                this.currentRank.set(1);
                this.characterService.log('**Heroism**: Received a commission.');
            }
        } else if (this.lifeEventChoiceNote.includes('Black Ops Conflict')) {
            if (choice === 'Recuse') {
                this.forcedOut = true;
                this.applyEventEffect({ type: 'npc', npcType: 'enemy', note: 'Former Commander' });
                this.characterService.log('**Black Ops Conflict**: Recused from mission. Ejected from career and gained an Enemy.');
            } else {
                const rollResult = await this.diceDisplay.roll('Moral Check', 2, 0, 0);
                if (rollResult === 2) {
                    this.applyEventEffect({ type: 'npc', npcType: 'rival', note: 'Moral Rival' });
                    this.increaseStat('SOC', -2);
                    this.characterService.log('**Black Ops Conflict**: Accepted mission but it was a moral disaster. Gained a Rival and lost SOC 2.');
                } else {
                    this.characterService.log('**Black Ops Conflict**: Mission completed. The silence continues.');
                }
            }
        } else if (this.lifeEventChoiceNote.includes('Bribery')) {
            if (choice.includes('Accept')) {
                this.characterService.updateFinances({ cash: this.characterService.character().finances.cash + 5000 });
                this.applyEventEffect({ type: 'npc', npcType: 'rival', note: 'Agent Bribery' });
                this.characterService.log('**Bribery**: Accepted 5000 Lv bribe and gained a Rival.');
            } else {
                this.skillChoices = ['Advocate', 'Investigate'];
                this.isSkillChoicePrompt = true;
                this.characterService.log('**Bribery**: Refused bribe. Choose skill to gain.');
            }
        } else if (this.lifeEventChoiceNote.includes('Foreign Legion')) {
            if (choice.includes('Join')) {
                this.isForeignLegionActive = true;
                this.characterService.updateCharacter({ nationality: 'French Empire' });
                this.characterService.addSkill('Language (French)', 0);
                this.characterService.log('**French Foreign Legion**: Personnel has enlisted in the Legion. Gained Citizenship (French Empire) and Language (French) 0.');
            } else {
                this.isForeignLegionActive = false;
                this.characterService.log('**Army**: Standard service selected.');
            }
        } else if (this.lifeEventChoiceNote.includes('Undercover')) {
            if (choice.includes('Accept')) {
                this.applyEventEffect({ type: 'npc', npcType: 'contact', note: 'Undercover Asset' });
                this.lifeEventChoiceNote = 'Select next career for undercover work:';
                this.lifeEventChoiceOptions = ['Agent', 'Rogue'];
                this.isLifeEventChoice = true;
            } else {
                this.characterService.log('**Undercover**: Refused mission.');
            }
        } else if (this.lifeEventChoiceNote.includes('Neural Jack')) {
            const char = this.characterService.character();
            if (choice.includes('Lv 10,000')) {
                if (char.finances.cash >= 10000) {
                    this.characterService.updateFinances({ cash: char.finances.cash - 10000 });
                    this.characterService.updateCharacter({ equipment: [...char.equipment, 'Neural Jack'] });
                    this.characterService.log('**Neural Jack**: Installed for Lv 10,000.');
                } else {
                    this.log('Insufficient funds for Neural Jack. Option declined.');
                    this.characterService.log('**Neural Jack**: Attempted installation but funds were insufficient.');
                }
            } else if (choice.includes('Benefit Debt')) {
                this.characterService.updateFinances({ benefitRollDebt: (char.finances.benefitRollDebt || 0) + 1 });
                this.characterService.updateCharacter({ equipment: [...char.equipment, 'Neural Jack'] });
                this.characterService.log('**Neural Jack**: Installed. Cost: 1 Benefit Roll.');
            } else {
                this.characterService.log('**Neural Jack**: Installation declined.');
            }
        } else if (this.lifeEventChoiceNote.includes('next career')) {
            this.characterService.setNextCareer(choice);
            this.characterService.log(`**Undercover**: Next career locked to ${choice}.`);
        } else if (this.lifeEventChoiceNote.includes('Courier Duty')) {
            if (choice === 'Diplomat 1') {
                this.characterService.addSkill('Diplomat', 1);
            } else {
                this.characterService.updateDm('advancement', 4);
            }
            this.characterService.log(`**Courier Duty**: Selected ${choice}.`);
        } else if (this.lifeEventChoiceNote.includes('Scientific Interference')) {
            if (choice === 'Accept Interference') {
                this.characterService.updateDm('advancement', -2);
                this.applyEventEffect({ type: 'npc', npcType: 'contact', note: 'Research Sponsor' });
                this.characterService.log('**Scientific Interference**: Accepted. DM-2 to Advancement but gained a Sponsor Contact.');
            } else {
                this.characterService.updateDm('advancement', 2);
                this.applyEventEffect({ type: 'npc', npcType: 'enemy', note: 'Obstructive Bureaucrat' });
                this.characterService.log('**Scientific Interference**: Reported. DM+2 to Advancement but gained an Enemy.');
            }
        } else if (this.lifeEventChoiceNote.includes('Academic Cheating')) {
            if (choice === 'Cheat for DM+2') {
                this.characterService.updateDm('advancement', 2);
                this.applyEventEffect({ type: 'npc', npcType: 'rival', note: 'Peer' });
                this.characterService.log('**Academic Cheating**: Cheated for DM+2 Advancement. Gained a Rival.');
            } else {
                this.characterService.log('**Academic Cheating**: Refused to cheat.');
            }
        } else if (this.lifeEventChoiceNote.includes('Lab Accident')) {
            if (choice === 'Roll Higher Injury') {
                await this.generateInjury();
                this.characterService.log('**Lab Accident**: Suffered severe injury.');
            } else {
                this.applyEventEffect({ type: 'lose-benefit' });
                this.characterService.log('**Lab Accident**: Lost one Benefit roll to cover lab costs.');
            }
        } else if (this.lifeEventChoiceNote.includes('Gather Intel')) {
            const electronics = this.characterService.getSkillLevel('Electronics');
            const deception = this.characterService.getSkillLevel('Deception');
            const best = Math.max(electronics, deception);
            const rollResult = await this.diceDisplay.roll('Intel Check', 2, best, 8);
            if (rollResult + best >= 8) {
                this.characterService.updateDm('advancement', 2);
                this.characterService.log('**Intelligence Gathering**: Success! Gained DM+2 Advancement.');
            } else {
                this.characterService.log('**Intelligence Gathering**: Failed to gather useful data.');
            }
        } else if (this.lifeEventChoiceNote.includes('Rescue Mission')) {
            const medic = this.characterService.getSkillLevel('Medic');
            const eng = this.characterService.getSkillLevel('Engineer');
            const best = Math.max(medic, eng);
            const rollResult = await this.diceDisplay.roll('Rescue Check', 2, best, 8);
            if (rollResult + best >= 8) {
                this.applyEventEffect({ type: 'npc', npcType: 'ally', note: 'Rescued Individual' });
                this.characterService.log('**Rescue Mission**: Success! Gained an Ally.');
            } else {
                this.characterService.log('**Rescue Mission**: Failed to rescue the targets.');
            }
        } else if (this.lifeEventChoiceNote.includes('Ambushed')) {
            if (choice.includes('Flee')) {
                const pilot = this.characterService.getSkillLevel('Pilot (any)');
                const rollResult = await this.diceDisplay.roll('Flee Check (Pilot)', 2, pilot, 8);
                if (rollResult + pilot >= 8) {
                    this.characterService.updateDm('advancement', 2);
                    this.characterService.log('**Ambushed**: Successfully fled. Gained DM+2 Advancement.');
                } else {
                    this.characterService.log('**Ambushed**: Failed to flee smoothly.');
                }
            } else {
                const persuade = this.characterService.getSkillLevel('Persuade');
                const rollResult = await this.diceDisplay.roll('Negotiate Check (Persuade)', 2, persuade, 8);
                if (rollResult + persuade >= 8) {
                    this.applyEventEffect({ type: 'npc', npcType: 'contact', note: 'Local Power' });
                    this.characterService.log('**Ambushed**: Successfully negotiated. Gained a Contact.');
                } else {
                    this.characterService.log('**Ambushed**: Negotiation failed.');
                }
            }
        }
    }

    /**
     * Get outcome description for a given choice to display to the player.
     */
    getChoiceDescription(choice: string): string {
        const note = this.lifeEventChoiceNote || '';
        
        if (choice === 'Prison') return 'ENTRY_DENIED: Mandatory placement in Penal Colony. Current service terminated.';
        if (choice === 'Lose Benefit') return 'FINANCIAL_PENALTY: Sacrifice 1 Benefit Roll to resolve the situation.';
        
        if (note.includes('Patron Offer')) {
            return choice === 'Accept' ? 'DM+4 to next Qualification roll. Gain 1 Rival.' : 'Decline opportunity. No effect.';
        }
        if (note.includes('Risky Adventure')) {
            return choice === 'Accept' ? '2D6 Risk: 1=Prison, 2=Injury, 5+=DM+4 Benefit. High risk/reward.' : 'Decline risk.';
        }
        if (note.includes('Celebrity Circles')) {
            return choice === 'Skill' ? 'Choose 1 level in Art, Carouse, or Persuade.' : 'Gain a Contact from upper social circles.';
        }
        if (note.includes('Political Criticism')) {
            return choice === 'Criticize' ? 'DM+2 to Advancement rolls this term. Gain 1 Enemy.' : 'Remain silent. DM-2 to Advancement rolls.';
        }
        if (note.includes('Commander Error')) {
            return choice === 'Report' ? 'DM+2 to Advancement rolls. Gain 1 Enemy (Commander).' : 'Protect commander. Gain 1 Ally (Commander).';
        }
        if (note.includes('CO Interest')) {
            return choice.includes('Tactics') ? 'Gain Tactics (military) 1.' : 'Gain DM+4 to your next Advancement roll.';
        }
        if (note.includes('Heroism')) {
            return choice === 'Promotion' ? 'Immediate promotion to the next rank.' : 'Receive commission (become an Officer).';
        }
        if (note.includes('Black Ops Conflict')) {
            return choice === 'Recuse' ? 'Ejected from career. Gain 1 Enemy (Former Commander).' : 'Continue mission. Risk Rivalry and SOC-2 loss.';
        }
        if (note.includes('Bribery')) {
            return choice.includes('Accept') ? 'Gain Lv 5,000 cash and 1 Rival.' : 'Refuse bribe. Choose Advocate or Investigate skill.';
        }
        if (note.includes('Foreign Legion')) {
            return choice.includes('Join') ? 'Switch to French Foreign Legion. Gain Citizenship (French) and Language 0.' : 'Continue standard Army service.';
        }
        if (note.includes('Undercover')) {
            return choice.includes('Accept') ? 'Gain 1 Contact. Must transition to Rogue or Agent next term.' : 'Decline mission.';
        }
        if (note.includes('Scientific Interference')) {
            return choice === 'Accept Interference' ? 'DM-2 to Advancement. Gain a Sponsor Contact.' : 'Report bureaucrat. DM+2 to Advancement. Gain an Enemy.';
        }
        if (note.includes('Academic Cheating')) {
            return choice === 'Cheat for DM+2' ? 'DM+2 to Advancement. Gain 1 Rival.' : 'Refuse to cheat.';
        }
        if (note.includes('Lab Accident')) {
            return choice === 'Roll Higher Injury' ? 'Suffer physical injury (Severity Roll required).' : 'Sacrifice 1 Benefit Roll to cover lab costs.';
        }
        if (note.includes('Ambushed')) {
            return choice.includes('Flee') ? 'Skill Check (Pilot): Success=DM+2 Advancement.' : 'Skill Check (Persuade): Success=Gain 1 Contact.';
        }

        return 'RESOLUTION_PROTOCOL: Executing choice-specific logic.';
    }

    async generateLifeEvent() {
        const { LIFE_EVENTS } = await import('../../../../data/life-events');
        const roll = await this.diceDisplay.roll('Life Event', 2, 0, 0, '', (res) => {
            const le = LIFE_EVENTS.find(e => e.roll === res);
            return le ? le.description : 'A normal life event.';
        }, [], LIFE_EVENTS);

        const event = LIFE_EVENTS.find(e => e.roll === roll);
        if (event) {
            this.currentEventText = `[Life Event] ${event.name}: ${event.description}`;
            this.characterService.log(`**Life Event** (Roll ${roll}): ${event.name} - ${event.description}`);
            if (event.effects) {
                for (const effect of event.effects) {
                    await this.applyEventEffect(effect);
                }
            }
        }
    }

    async runSkillCheck(effect: import('../../../../core/models/career.model').CareerEventEffect) {
        if (!effect.checkSkills || !effect.target) return false;

        // Find best skill
        let bestSkill = effect.checkSkills[0];
        let bestLevel = this.characterService.getSkillLevel(bestSkill);

        for (const s of effect.checkSkills) {
            const level = this.characterService.getSkillLevel(s);
            if (level > bestLevel) {
                bestSkill = s;
                bestLevel = level;
            }
        }

        const dm = bestLevel;
        const target = effect.target;

        const rollResult = await this.diceDisplay.roll(
            `Skill Check: ${effect.checkSkills.join('/')}`,
            2, dm, target, bestSkill
        );

        const success = rollResult + dm >= target;
        this.isSkillCheckOutcome = true;

        if (success) {
            this.skillCheckMessage = `Success! (${rollResult + dm} vs ${target})`;
            if (effect.onSuccess) {
                for (const e of effect.onSuccess) {
                    await this.applyEventEffect(e);
                }
            }
        } else {
            this.skillCheckMessage = `Failure! (${rollResult + dm} vs ${target})`;
            if (effect.onFailure) {
                for (const e of effect.onFailure) {
                    await this.applyEventEffect(e);
                }
            }
        }
        return success;
    }

    // --- 2300AD Resolution Methods ---

    selectStatReduction(stat: string) {
        this.isStatReductionChoice = false;
        this.increaseStat(stat, this.statReductionValue);
        this.characterService.log(`**Choice Selected**: Reduced ${stat} by ${Math.abs(this.statReductionValue)}.`);
    }

    resolveGambling(count: number) {
        this.isGamblingPrompt = false;
        if (count > 0) {
            this.characterService.spendBenefitRoll(this.selectedCareer?.name, count);
            this.characterService.setGambler(true);
            this.characterService.log(`**Gambling Choice**: Bet ${count} benefit rolls.`);
        } else {
            this.characterService.log(`**Gambling Choice**: Declined.`);
        }
    }

    // --- HELPER METHODS ---

    confirmSkillChoice(skill: string) {
        this.handleSkillReward(skill, 1);
        this.isSkillChoicePrompt = false;
        this.skillChoices = [];
    }

    async confirmNpcGeneration(overrideName?: string) {
        const { createNpc } = await import('../../../../data/npc-tables');
        const name = overrideName || this.npcNameInput;
        const npc = createNpc(this.pendingNpcType, this.pendingNpcOrigin, '', name);
        this.characterService.addNpc(npc);

        this.isNpcPrompt = false;
        this.npcNameInput = '';

        /* 
           NOTE: 'Connections Rule' (skill per NPC) is replaced by 
           'Step 10: Skill Packages' in 2300AD Solo Play.
           Disabling this prompt here to avoid redundant skill gains.
        */
        /*
        if (this.characterService.character().connectionsUsed < 2) {
            this.isConnectionsRuleEligible = true;
            this.connectionsSkillChoices = this.characterService.character().skills
                .map(s => s.name);
        }
        */
    }

    async convertNpc(npcId: string) {
        this.characterService.convertNpc(npcId, this.pendingNpcType);
        this.isNpcConversionPrompt = false;
        this.characterService.log(`**Betrayal**: An NPC has been converted to ${this.pendingNpcType}.`);
    }

    async resolveNeuralJack(accepted: boolean) {
        this.isNeuralJackPrompt = false;
        if (!accepted) {
            this.log('Neural Jack opportunity declined.');
            return;
        }

        const char = this.characterService.character();
        
        // Prevent duplicate installation
        if (char.equipment.includes('Neural Jack')) {
            this.log('Neural Jack is already installed.');
            this.characterService.log('**Neural Jack**: Attempted to install duplicate hardware. Operation aborted.');
            return;
        }

        // Apply costs
        if (this.neuralJackCostType === 'cash') {
            if (char.finances.cash < 10000) {
                // Not enough cash? Force benefit roll or debt?
                // Documentation says 10,000 Lv. We'll apply it as debt if they don't have enough.
                this.characterService.updateFinances({ debt: (char.finances.debt || 0) + 10000 });
                this.characterService.log('**Neural Jack**: Procedure accepted. Incurred 10,000 Lv debt.');
            } else {
                this.characterService.updateFinances({ cash: char.finances.cash - 10000 });
                this.characterService.log('**Neural Jack**: Procedure accepted. Paid 10,000 Lv.');
            }
        } else {
            const career = this.selectedCareer?.name || 'Unknown';
            this.characterService.spendBenefitRoll(career, 1);
            this.characterService.log(`**Neural Jack**: Procedure accepted. Sacrificed 1 Benefit Roll from ${career}.`);
        }

        // Apply Stat Penalties
        this.increaseStat('SOC', -2);
        this.increaseStat('EDU', -2);
        this.characterService.updateDm('advancement', 1);

        // Apply Bonus for Next Term
        this.characterService.updateCharacter({
            equipment: [...char.equipment, 'Neural Jack']
        });

        this.log('Neural Jack installed. +1 DM to Advancement rolls. SOC/EDU reduced by 2.');
    }

    applyConnectionsRule(skillName: string) {
        this.characterService.addSkill(skillName, 1);
        this.characterService.updateCharacter({
            connectionsUsed: this.characterService.character().connectionsUsed + 1
        });
        this.characterService.log(`**Connections Rule**: Applied to ${skillName}. (Used ${this.characterService.character().connectionsUsed}/2)`);
        this.isConnectionsRuleEligible = false;
    }

    skipConnectionsRule() {
        this.isConnectionsRuleEligible = false;
    }

    log(msg: string) {
        this.characterService.log(msg);
    }

    increaseStat(stat: string, val: number) {
        const char = this.characterService.character();
        const statKey = stat.toLowerCase() as keyof typeof char.characteristics;
        const currentValue = char.characteristics[statKey].value;
        
        const updatedChars = { ...char.characteristics };
        updatedChars[statKey] = {
            ...updatedChars[statKey],
            value: currentValue + val
        };
        
        this.characterService.updateCharacteristics(updatedChars);
    }

    async generateInjury() {
        const { INJURY_TABLE } = await import('../../../../data/life-events');
        const roll = await this.diceDisplay.roll('Injury Severity', 1, 0, 0, '', (res) => {
            const result = INJURY_TABLE.find(i => i.roll === res);
            return result ? `${result.name}: ${result.description}` : 'Injured';
        }, [], INJURY_TABLE);

        switch (roll) {
            case 1:
                this.injurySeverity = 'Critical (Nearly Killed)';
                const roll1 = await this.diceService.roll(1, 6);
                this.injuryMajorLoss = roll1.total;
                this.pendingInjuryStats = ['STR', 'DEX', 'END'];
                break;
            case 2:
                this.injurySeverity = 'Severe (Severely Injured)';
                const roll2 = await this.diceService.roll(1, 6);
                this.injuryMajorLoss = roll2.total;
                this.pendingInjuryStats = ['STR', 'DEX', 'END'];
                break;
            case 3:
                this.injurySeverity = 'Severe (Missing Eye or Limb)';
                this.injuryMajorLoss = 2;
                this.pendingInjuryStats = ['STR', 'DEX']; // Choice handled in UI or by rule (STR for limb, DEX for eye)
                break;
            case 4:
                this.injurySeverity = 'Moderate (Scarred)';
                this.injuryMajorLoss = 2;
                this.pendingInjuryStats = ['STR', 'DEX', 'END'];
                break;
            case 5:
                this.injurySeverity = 'Minor (Injured)';
                this.injuryMajorLoss = 1;
                this.pendingInjuryStats = ['STR', 'DEX', 'END'];
                break;
            case 6:
                this.injurySeverity = 'Lightly Injured';
                this.isInjuryPrompt = false;
                this.characterService.log('**Injury**: Lightly Injured. No mechanical effect.');
                this.log('Lightly Injured. No permanent effect.');
                break;
        }
    }

    async selectInjuryStat(stat: string) {
        this.selectedInjuryStat = stat;
        this.calculateMedicalCosts();
        this.isInjuryPrompt = false;
        this.isInjuryDecisionActive = true;
    }

    async calculateMedicalCosts() {
        const char = this.characterService.character();
        const career = this.selectedCareer?.name || '';
        const rank = this.getRank();

        // 1. Coverage - 2300AD Rules
        const roll = await this.diceDisplay.roll('Medical Coverage Check', 2, rank, 0);
        const total = roll + rank;

        let coveragePercent = 0;
        if (['Army', 'Navy', 'Marines', 'Marine', 'Agent'].includes(career)) {
            if (total >= 8) coveragePercent = 1.0;
            else if (total >= 4) coveragePercent = 0.75;
            else coveragePercent = 0;
        } else if (['Scout', 'Rogue', 'Drifter'].includes(career)) {
            if (total >= 12) coveragePercent = 0.75;
            else if (total >= 8) coveragePercent = 0.50;
            else coveragePercent = 0;
        } else {
            // Others (Citizen, Merchant, etc.)
            if (total >= 12) coveragePercent = 1.0;
            else if (total >= 8) coveragePercent = 0.75;
            else if (total >= 4) coveragePercent = 0.50;
            else coveragePercent = 0;
        }

        this.medicalCoverage = coveragePercent;
        this.characterService.log(`**Medical Coverage**: Organization covered ${coveragePercent * 100}% of treatment costs.`);
        this.log(`Medical Coverage: ${coveragePercent * 100}%`);

        // 2. Cost (Lv 5,000 per point)
        let totalPoints = this.injuryMajorLoss;
        if (this.injuryRoll === 1) totalPoints += 4; // Nearly killed has +2 to other two stats (2+2=4)

        // Special Rule: Missing Eye/Limb (Result 3) costs Lv 10,000 to restore
        if (this.injuryRoll === 3) {
            this.medicalRestorationCost = 10000;
        } else {
            this.medicalRestorationCost = totalPoints * 5000;
        }

        this.medicalDebtCalculated = this.medicalRestorationCost * (1 - this.medicalCoverage);
    }

    async resolveInjury(acceptAugment: boolean) {
        this.isInjuryDecisionActive = false;
        const char = this.characterService.character();

        if (acceptAugment) {
            // Option B: Augment (Sacrifice Benefit Roll)
            const career = this.selectedCareer?.name || 'Unknown';
            this.characterService.spendBenefitRoll(career, 1);
            this.characterService.updateCharacter({
                equipment: [...char.equipment, `Cyber-Augment (${this.injurySeverity})`]
            });
            this.characterService.log(`**Augmentation Rule**: Sacrificed one Benefit Roll from ${career} to nullify ${this.injurySeverity}.`);
            this.log('Accepted cybernetic augmentation. No stat loss applied. No medical debt incurred.');

            // Allow staying in career if mishap
            this.forcedOut = false;
        } else {
            // Option B: Standard Care
            this.characterService.updateFinances({ medicalDebt: (char.finances.medicalDebt || 0) + this.medicalDebtCalculated });

            // Apply Stat Loss
            const updatedStats = { ...char.characteristics };
            const mainStat = this.selectedInjuryStat.toLowerCase() as keyof typeof char.characteristics;
            updatedStats[mainStat].value -= this.injuryMajorLoss;

            if (this.injuryRoll === 1) {
                // Nearly killed: other stats -2
                ['str', 'dex', 'end'].filter(s => s !== mainStat).forEach(s => {
                    (updatedStats as any)[s].value -= 2;
                });
            }

            this.characterService.updateCharacteristics(updatedStats);
            this.characterService.addInjury(this.injurySeverity, this.selectedInjuryStat, this.injuryMajorLoss, this.medicalRestorationCost);
            this.characterService.log(`**Medical Treatment**: Incurred Lv ${this.medicalDebtCalculated} in debt. ${this.injurySeverity} stats applied.`);
            this.log(`Applied medical debt of Lv ${this.medicalDebtCalculated}. Stat losses recorded.`);

            // If mishap caused this, person is usually ejected
            if (this.currentState() === 'MISHAP') {
                this.forcedOut = true;
            }
        }
    }

    async generateMishap() {
        if (!this.selectedCareer) return;
        const table = this.selectedCareer.mishapTable;
        const roll = await this.diceDisplay.roll('Mishap Roll', 1, 0, 0, '', (result) => {
            const m = table.find(mi => mi.roll === result);
            return m ? m.description : 'Discharged (Mishap).';
        }, [], table);

        const mishap = table.find(m => m.roll === roll);
        this.currentEventText = mishap ? mishap.description : 'DISCHARGED: Operational failure result in mandatory service termination.';
        this.addToEventLog(`MISHAP: ${this.currentEventText}`);
        this.characterService.log(`**Mishap** (Roll ${roll}): ${this.currentEventText}`);
        this.log(`Mishap Roll ${roll}: ${this.currentEventText}`);

        if (mishap?.effects) {
            for (const effect of mishap.effects) {
                await this.applyEventEffect(effect);
            }
        }
    }

    // --- 4. ADVANCEMENT & POST-TERM ---

    proceedToAdvancement() {
        if (this.isCommissionAttempt) {
            this.log('Commission attempted this term. Skipping Advancement Roll.');
            this.transitionToEndOfTerm();
        } else {
            this.currentState.set('ADVANCEMENT');
            setTimeout(() => {
                const content = document.querySelector('.wizard-content');
                if (content) content.scrollTop = content.scrollHeight;
            }, 100);
        }
    }

    async rollAdvancement() {
        if (!this.selectedAssignment || !this.selectedCareer) return;

        const char = this.characterService.character();
        const stat = this.selectedAssignment.advancementStat.toLowerCase();
        let target = this.selectedAssignment.advancementTarget;
        const charStat = (char.characteristics as any)[stat];
        const statMod = this.diceService.getModifier(charStat.value + charStat.modifier);

        const modifiers: { label: string, value: number }[] = [];
        if (statMod !== 0) modifiers.push({ label: `Stat (${stat.toUpperCase()})`, value: statMod });

        // Prisoner Logic: Parole Modifiers
        let paroleDm = 0;
        if (this.selectedCareer.name === 'Prisoner') {
            paroleDm = 7 - this.paroleThreshold(); // ParoleThreshold starts at 7, lower is better (DM+)
            if (paroleDm !== 0) modifiers.push({ label: 'Parole Modifiers', value: paroleDm });
        }

        // Global Advancement DM
        const nextAdvDm = char.nextAdvancementDm || 0;
        if (nextAdvDm !== 0) modifiers.push({ label: 'Bonus DMs', value: nextAdvDm });

        const rollResult = await this.diceDisplay.roll(
            this.selectedCareer.name === 'Prisoner' ? 'Release Check' : 'Advancement Check',
            2, statMod + paroleDm + nextAdvDm, target, stat.toUpperCase(), undefined, modifiers
        );

        const total = rollResult + statMod + paroleDm + nextAdvDm;

        // Clear used bonuses
        this.characterService.updateCharacter({ nextAdvancementDm: 0 });

        const isPrisoner = this.selectedCareer.name === 'Prisoner';

        if (total >= target || (isPrisoner && rollResult >= 12)) {
            this.success = true;
            this.addToEventLog(`ADVANCEMENT: Successful (${total} vs ${target})`);
            const newRank = this.getRank() + 1;
            this.currentRank.set(newRank);
            const rankTitle = this.isCommissioned() ? this.getOfficerRankTitle(newRank) : this.getRankTitleFor(newRank);

            if (isPrisoner) {
                this.characterService.log(`**Released from Prison** (Rank ${newRank}: ${rankTitle})`);
                this.log(`Released! You are now a ${rankTitle}.`);
                this.forcedOut = true; // Release ends the "career"
            } else {
                this.characterService.log(`**Promoted** to ${rankTitle} (Rank ${newRank}) in ${this.selectedCareer.name}`);
                this.log(`Promoted to ${rankTitle} (Rank ${newRank})!`);
                this.applyRankBonus(newRank);
            }

            if (rollResult === 12 && !isPrisoner) {
                this.mandatoryContinue = true;
                this.characterService.log(`**Natural 12**: Mandatory career extension`);
                this.log('Natural 12! You are indispensable and MUST continue this career.');
            }

            if (!isPrisoner) {
                this.bonusSkillRolls.update(v => v + 1);
                this.characterService.log(`Advancement grants **1 Extra Skill Roll**`);
                this.log('Gain 1 Bonus Skill Roll. You must take this now.');
                this.currentState.set('SKILL_TRAINING');
            }
        } else {
            this.success = false;
            this.characterService.log(`**Advancement Failed** in ${this.selectedCareer.name}`);
            this.log('No motion this term.');

            const terms = this.currentTerm();
            if (total <= terms) {
                this.forcedOut = true;
                this.characterService.log(`**Forced Out** (Result ${total} <= Terms ${terms})`);
                this.log(`Forced Out! (Result ${total} <= Terms ${terms}). Must Muster Out.`);
            }

            this.transitionToEndOfTerm();
        }
    }

    protected async transitionToEndOfTerm() {
        this.currentState.set('LEAVING_HOME');
        await this.checkPostTermFlow();
    }

    // Centralized Post-Term Checks
    async checkPostTermFlow() {
        const age = this.currentAge();
        await this.checkAging(age);
    }

    // --- 5. AGING & LEAVING HOME ---

    async checkAging(age: number) {
        const terms = this.currentTerm();
        // 2300AD: Aging begins at Age 50 AND after fulfilling at least 8 terms (or equivalent years)
        // Book 1, pg. 10: "Aging does not begin until age 50".
        if (age < 50 || terms < 8) {
            await this.rollLeavingHome();
            return;
        }

        this.log(`Critical Aging Threshold Reached (Age ${age}, Term ${terms}).`);
        const rollResult = await this.diceDisplay.roll('Aging Check', 2, -1 * terms, 0, '', undefined, [{ label: 'Terms Served', value: -1 * terms }]);
        const total = rollResult - terms;
        this.log(`Aging Check Result: ${total}`);
        this.addToEventLog(`AGING_CHECK: Roll ${rollResult} - ${terms} Terms = ${total}`);

        let effectDesc = '';

        if (total <= 0) {
            effectDesc = 'AGING_CRISIS: Significant physical and mental decline detected.';
            this.log('Aging Crisis! Significant physical and mental decline.');
            this.increaseStat('STR', -2); this.increaseStat('DEX', -2); this.increaseStat('END', -2);
            this.increaseStat('INT', -1);
            this.characterService.log('**Aging Crisis**: STR -2, DEX -2, END -2, INT -1.');
            this.currentState.set('MISHAP'); // Crisis usually ends career
        } else if (total === 1) {
            effectDesc = 'AGING_EFFECT: Critical degradation in STR, DEX, and END (-2 each).';
            this.increaseStat('STR', -2); this.increaseStat('DEX', -2); this.increaseStat('END', -2);
            this.characterService.log('**Aging Effect**: STR -2, DEX -2, END -2.');
            this.currentState.set('EVENT');
        } else if (total === 2) {
            effectDesc = 'AGING_EFFECT: Significant degradation in STR and DEX (-2 each).';
            this.increaseStat('STR', -2); this.increaseStat('DEX', -2);
            this.characterService.log('**Aging Effect**: STR -2, DEX -2.');
            this.currentState.set('EVENT');
        } else if (total === 3) {
            effectDesc = 'AGING_EFFECT: Moderate degradation in STR (-2).';
            this.increaseStat('STR', -2);
            this.characterService.log('**Aging Effect**: STR -2.');
            this.currentState.set('EVENT');
        } else if (total === 4) {
            effectDesc = 'AGING_EFFECT: Minor degradation in STR and DEX (-1 each).';
            this.increaseStat('STR', -1); this.increaseStat('DEX', -1);
            this.characterService.log('**Aging Effect**: STR -1, DEX -1.');
            this.currentState.set('EVENT');
        } else if (total === 5) {
            effectDesc = 'AGING_EFFECT: Slight degradation in STR (-1).';
            this.increaseStat('STR', -1);
            this.characterService.log('**Aging Effect**: STR -1.');
            this.currentState.set('EVENT');
        } else {
            this.log('No aging effects detected.');
            await this.rollLeavingHome();
            return;
        }

        this.currentEventText = effectDesc;
        
        // Ensure reporting view is visible
        setTimeout(() => {
            const content = document.querySelector('.wizard-content');
            if (content) content.scrollTop = content.scrollHeight;
        }, 100);
    }

    async rollLeavingHome() {
        const char = this.characterService.character();
        if (char.hasLeftHome) {
            this.leavingHomeSuccess = true;
            // Only set to TERM_END if we aren't already in a mandatory state (like MISHAP)
            if (this.currentState() === 'LEAVING_HOME') {
                this.currentState.set('TERM_END');
            }
            return;
        }

        const terms = this.currentTerm();
        const modifiers: { label: string, value: number }[] = [];
        let bonuses = terms;
        modifiers.push({ label: 'Terms Served', value: terms });

        if (char.originType === 'Spacer') { bonuses += 2; modifiers.push({ label: 'Spacer Origin', value: 2 }); }
        if (this.selectedCareer?.name.includes('Scout')) { bonuses += 2; modifiers.push({ label: 'Scout Career', value: 2 }); }

        const rollResult = await this.diceDisplay.roll('Leaving Home Check', 2, bonuses, 8, '', undefined, modifiers);
        const total = rollResult + bonuses;
        this.log(`Leaving Home Check: ${total} vs 8`);

        if (total >= 8) {
            this.leavingHomeSuccess = true;
            this.characterService.updateCharacter({ hasLeftHome: true });
            this.log('You successfully left home!');
        } else {
            this.leavingHomeSuccess = false;
            this.log('Still tied to homeworld.');
        }

        if (this.currentState() === 'LEAVING_HOME' || this.currentState() === 'ADVANCEMENT' || this.currentState() === 'SKILL_TRAINING') {
            this.currentState.set('TERM_END');
            setTimeout(() => {
                const content = document.querySelector('.wizard-content');
                if (content) content.scrollTop = content.scrollHeight;
            }, 100);
        }
    }

    // --- 6. CHANGE ASSIGNMENT ---

    startChangeAssignment() {
        this.currentState.set('CHANGE_ASSIGNMENT');
    }

    async verifyAssignmentChange(newAssign: Assignment) {
        this.log(`Attempting to change assignment to ${newAssign.name}...`);
        // Roll Qualification for new assignment
        const char = this.characterService.character();
        const stat = this.selectedCareer?.qualificationStat.toLowerCase() || 'int';
        const target = this.selectedCareer?.qualificationTarget || 7;
        const charStat = (char.characteristics as any)[stat];
        const statMod = this.diceService.getModifier(charStat.value + charStat.modifier);

        const roll = await this.diceDisplay.roll(
            `Qualify: ${newAssign.name}`, 2, statMod, target, stat.toUpperCase()
        );
        const total = roll + statMod;

        if (total >= target) {
            this.log('Assignment change successful!');
            this.nextAssignment = newAssign;
            this.finishTerm('CONTINUE');
        } else {
            this.log('Assignment change failed. Must remain in current assignment.');
            // Go back to Option? or just finish term with same assignment?
            // "Se falhar, mantém a designação anterior."
            this.nextAssignment = null;
            this.finishTerm('CONTINUE');
        }
    }

    // --- 7. FINISH TERM ---

    async finishTerm(destination: 'CONTINUE' | 'MUSTER' = 'CONTINUE') {
        const char = this.characterService.character();
        const careerName = this.selectedCareer?.name || 'Unknown';

        // Calculate rank — bonuses already applied at point of promotion/commission
        let currentRank = this.getRank();

        const isMishap = this.currentState() === 'MISHAP';

        if (this.success && !isMishap) {
            if (this.isCommissionAttempt) {
                if (currentRank < 1) currentRank = 1;
            } else {
                currentRank++;
            }
        }

        // 2300AD: French Foreign Legion Bonus
        // Citizenship and Language (French) 0 after 1 term
        if (this.isForeignLegionActive) {
            this.characterService.ensureSkillLevel('Language (French)', 0);
            this.characterService.updateCharacter({ nationality: 'French Empire' }); // Granted French Citizenship
            this.characterService.log('**Foreign Legion Completion**: Granted French Citizenship and Language (French) 0.');
            this.log('Term in FFL completed. You are now a citizen of the French Empire.');
        }

        // 2300AD: Social Standing Rule - +1 kLv per term if SOC 10+
        if (char.characteristics.soc.value >= 10) {
            this.increaseStat('SOC', 1);
            this.characterService.log('**Elite Status**: SOC increased by 1 (SOC 10+ bonus).');
        }

        const newAge = char.age + 4;
        const currentCareerName = careerName;

        this.characterService.log(`### Term ${this.currentTerm()} Complete (${currentCareerName})\n- Rank: ${currentRank}\n- Age: ${char.age} → ${newAge}\n- Survived: ${!isMishap}`);

        // Track benefit roll for the term
        this.characterService.addBenefitRoll(currentCareerName, 1);

        this.characterService.updateCharacter({
            age: newAge,
            careerHistory: [
                ...char.careerHistory,
                {
                    termNumber: this.currentTerm(),
                    careerName: currentCareerName,
                    rank: currentRank,
                    events: [...this.termEventLog()],
                    benefits: [],
                    ageStart: char.age,
                    ageEnd: newAge,
                    survived: !isMishap,
                    commissioned: this.isCommissionedCurrent(),
                    advanced: this.success && !isMishap && !this.isCommissionAttempt,
                    leavingHome: this.leavingHomeSuccess,
                    benefitRollsGained: 1
                }
            ]
        });

        // Note: checkPostTermFlow is now called BEFORE setting TERM_END
        // to ensure it happens once per term before the user decision.

        // Reset per-term state
        this.success = false;
        this.leavingHomeSuccess = false;
        this.currentEventText = '';
        this.bonusSkillRolls.set(0);
        this.isCommissionAttempt = false;
        this.basicTrainingGrantedThisTerm = false;
        this.isForeignLegionActive = false; // Ensure FFL is reset

        if (destination === 'MUSTER' || isMishap || this.forcedOut) {
            // Apply Rank Bonus Rolls at MUSTER
            let bonusRolls = 0;
            if (currentRank >= 5) bonusRolls = 3;
            else if (currentRank >= 3) bonusRolls = 2;
            else if (currentRank >= 1) bonusRolls = 1;

            if (bonusRolls > 0) {
                this.characterService.addBenefitRoll(currentCareerName, bonusRolls);
                this.characterService.log(`**Rank Bonus Benefits**: Gained +${bonusRolls} rolls for Rank ${currentRank}.`);
            }

            this.selectedCareer = null;
            this.selectedAssignment = null;
            this.currentState.set('CHOOSE_CAREER');
            this.forcedOut = false;
            this.characterService.log(`**Mustered Out** of ${currentCareerName}`);
            this.log('Mustered out of career. You may choose a new career or Finalize.');
        } else {
            // Continue Logic: Clear ejected bans after serving a full term
            this.characterService.clearEjectedCareers();

            if (this.nextAssignment) {
                this.characterService.log(`**Assignment Changed** to ${this.nextAssignment.name}`);
                this.selectedAssignment = this.nextAssignment;
                this.nextAssignment = null;
            }
            this.currentState.set('SKILL_TRAINING');
            this.termEventLog.set([]); // Reset log for next term
        }
        this.mandatoryContinue = false;
    }

    /**
     * Determine medical coverage for injuries based on organization and rank.
     */
    async calculateMedicalCoverage() {
        const char = this.characterService.character();
        const rank = this.getRank();
        const roll = await this.diceDisplay.roll('Medical Coverage Check', 2, rank, 0);
        const total = roll + rank;

        let percentage = 0;
        const cName = this.selectedCareer?.name || '';

        if (MEDICAL_MILITARY_BUCKET.includes(cName)) {
            if (total >= 12) percentage = 100;
            else if (total >= 8) percentage = 100;
            else if (total >= 4) percentage = 75;
            else percentage = 0;
        } else if (['Scout', 'Rogue', 'Drifter', 'Spaceborne'].includes(cName)) {
            if (total >= 12) percentage = 75;
            else if (total >= 8) percentage = 50;
            else percentage = 0;
        } else {
            // Others (Citizen, Merchant, etc.)
            if (total >= 12) percentage = 100;
            else if (total >= 8) percentage = 75;
            else if (total >= 4) percentage = 50;
            else percentage = 0;
        }

        this.medicalCoverage = percentage;
        this.characterService.log(`**Medical Coverage**: Organization covered ${percentage}% of treatment costs.`);
        this.log(`Medical Coverage: ${percentage}%`);
        
        return percentage;
    }

    continueCareer() {
        const char = this.characterService.character();
        const history = [...char.careerHistory].reverse();
        const lastTerm = history.find(t => t.careerName === this.selectedCareer?.name);
        
        if (lastTerm) {
            this.currentRank.set(lastTerm.rank);
            this.isCommissionedCurrent.set(lastTerm.commissioned || false);
        }

        this.finishTerm('CONTINUE');
    }

    // --- MUSTERING OUT ---
    canProceedToNext(): boolean {
        return this.currentState() === 'CHOOSE_CAREER' && this.characterService.character().careerHistory.length > 0;
    }

    startMusteringOut() {
        this.log('Finalizing Career Phase...');
        // Emit complete to Wizard to move to Step 5 (Mustering Out Component)
        this.complete.emit();
    }

    // --- HELPER METHODS ---

    getRankTitle(): string {
        if (!this.selectedAssignment) return 'Rank 0';
        const r = this.currentRank();
        if (this.isCommissioned()) return this.getOfficerRankTitle(r);
        return this.getRankTitleFor(r);
    }

    getRankTitleFor(rank: number): string {
        if (!this.selectedAssignment) return `Rank ${rank}`;
        const r = this.selectedAssignment.ranks.find(data => data.level === rank);
        return r ? r.title : `Rank ${rank}`;
    }





    @Output() complete = new EventEmitter<void>();
}
