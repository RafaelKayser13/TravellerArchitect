import { Component, inject, computed, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceService } from '../../../../core/services/dice.service';
import { CAREERS } from '../../../../data/careers';
import { CareerDefinition, Assignment } from '../../../../core/models/career.model';
import { DiceDisplayService } from '../../../../core/services/dice-display.service';

const MILITARY_CAREERS = ['Army', 'Navy', 'Marine', 'Agent'];

type CareerState = 'CHOOSE_CAREER' | 'QUALIFICATION' | 'BASIC_TRAINING' | 'SKILL_TRAINING' | 'SURVIVAL' | 'EVENT' | 'MISHAP' | 'ADVANCEMENT' | 'CHANGE_ASSIGNMENT' | 'LEAVING_HOME' | 'TERM_END' | 'MUSTER_OUT';

import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';

@Component({
    selector: 'app-career',
    standalone: true,
    imports: [CommonModule, FormsModule, StepHeaderComponent],
    templateUrl: './career.component.html',
    styleUrls: ['./career.component.scss']
})
export class CareerComponent {
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
    neuralJackCostType: 'cash' | 'benefit' = 'cash';

    // Prisoner System
    paroleThreshold = signal(7);
    isStatReductionChoice = false;
    statReductionValue = 0;

    // Merchant System
    benefitRollsToBet = 0;
    isGamblingPrompt = false;

    constructor() { }

    // --- 1. CHOOSE CAREER ---
    selectCareer(career: CareerDefinition) {
        this.selectedCareer = career;
        this.selectedAssignment = null;
        setTimeout(() => {
            const el = document.getElementById('assignment-list');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
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

        setTimeout(() => {
            const el = document.getElementById('qualify-btn');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
    }

    async qualify() {
        const career = this.selectedCareer;
        if (!career) return;

        this.characterService.log(`## Qualification Attempt: ${career.name}`);

        const char = this.characterService.character();
        let autoQualify = false;

        if (career.qualificationTarget === 0) autoQualify = true;
        if (career.name === 'Noble' && (char.characteristics as any).soc.value >= 10) autoQualify = true;
        if (career.name === 'Spaceborne' && char.nationality === 'Spaceborne') autoQualify = true;

        if (autoQualify) {
            this.characterService.log(`**Automatic Qualification for ${career.name}**`);
            this.success = true;
            this.applyRankBonus(0);
            this.currentState.set('BASIC_TRAINING');
            return;
        }

        this.log(`Attempting to join ${career.name}...`);

        const history = char.careerHistory || [];
        const numPrevCareers = new Set(history.map((c: any) => c.careerName)).size;
        const dm = -1 * numPrevCareers;

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

        const roll = await this.diceDisplay.roll(
            `Qualification: ${career.name}`, 2, statMod + dm + universityMod + (this.isForeignLegionActive ? 1 : 0), target, charStatKey.toUpperCase(), undefined, modifiers
        );

        const total = roll + statMod + dm + universityMod + (this.isForeignLegionActive ? 1 : 0);
        this.log(`Rolled ${total} vs ${target}`);

        if (total >= target) {
            this.success = true;
            this.characterService.log(`**Qualified for ${career.name}** (${this.selectedAssignment?.name})`);
            this.log('Qualified!');
            // Apply Rank 0 bonus immediately after qualification
            this.applyRankBonus(0);
            this.currentState.set('BASIC_TRAINING');
        } else {
            this.success = false;
            this.characterService.log(`**Failed Qualification** for ${career.name}. Entering the Draft...`);
            this.log('Failed Qualification. Entering the Draft...');
            await this.runDraft();
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
            } else if (value.includes('10 or +1')) {
                const char = this.characterService.character();
                const statKey = skill.toLowerCase() as keyof typeof char.characteristics;
                const current = (char.characteristics as any)[statKey]?.value || 0;
                if (current < 10) {
                    this.increaseStat(skill, 10 - current);
                    this.characterService.log(`**Rank ${rankLevel} Bonus** (${this.selectedCareer.name}): ${skill} set to 10`);
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
            if (this.selectedCareer?.name === 'Citizen' && this.selectedAssignment) {
                skillsToGrant = [...skillsToGrant, ...this.selectedAssignment.skillTable];
            }

            this.log(`grantBasicTrainingSkills: Skills found: ${skillsToGrant.length} (${skillsToGrant.join(', ')})`);

            if (skillsToGrant.length > 0) {
                skillsToGrant.forEach(s => {
                    this.log(`Adding Skill: ${s} at Level 0`);
                    this.characterService.addSkill(s, 0, true); // true = isFirstTermBasicTraining
                });
                this.log(`Basic Training: Acquired Service (and Assignment if Citizen) Skills at Level 0.`);
                this.characterService.log(`**Basic Training** (${this.selectedCareer?.name}): Skills acquired at Level 0`);
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

        const roll = await this.diceDisplay.roll(
            'Commission Check', 2, statMod, target, stat.toUpperCase(), undefined, modifiers
        );

        const total = roll + statMod;
        this.log(`Commission Check: ${total} vs ${target}`);

        if (total >= target) {
            this.success = true;
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
        // Commission success in current term
        if (this.isCommissionAttempt && this.success) return true;

        // Check if previously commissioned (has officer rank in career history)
        const char = this.characterService.character();
        const lastTerm = [...char.careerHistory].reverse().find(t => t.careerName === this.selectedCareer?.name);
        if (lastTerm && lastTerm.commissioned) return true;

        // Military Academy Graduation grants Commission
        if (char.education?.academy === true && this.isMilitaryCareer()) return true;

        return false;
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
        const draftTable = [
            { roll: 1, career: 'Army' }, { roll: 2, career: 'Army' },
            { roll: 3, career: 'Marine' }, { roll: 4, career: 'Navy' },
            { roll: 5, career: 'Navy' }, { roll: 6, career: 'Colonist' }
        ];

        const roll = await this.diceDisplay.roll('Draft', 1, 0, 0, '', undefined, [], draftTable);

        let draftedCareerName = '';
        if (roll <= 2) draftedCareerName = 'Army';
        else if (roll === 3) draftedCareerName = 'Marine';
        else if (roll <= 5) draftedCareerName = 'Navy';
        else draftedCareerName = 'Colonist';

        let draftTarget = this.careers.find(c => c.name.includes(draftedCareerName));
        if (!draftTarget && draftedCareerName === 'Colonist') draftTarget = this.careers.find(c => c.name === 'Scout') || this.careers.find(c => c.name === 'Citizen');
        if (!draftTarget && draftedCareerName === 'Marine') draftTarget = this.careers.find(c => c.name === 'Marines');

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
                this.checkPostTermFlow();
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
                this.checkPostTermFlow();
            }
        }
    }

    getRank(): number {
        const char = this.characterService.character();
        const term = [...char.careerHistory].reverse().find(t => t.careerName === this.selectedCareer?.name);
        return term ? term.rank : 0;
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
        const hasLeftHome = char.careerHistory.some(t => t.leavingHome);
        const modifiers: { label: string, value: number }[] = [];

        if (statMod !== 0) modifiers.push({ label: `Stat (${stat.toUpperCase()})`, value: statMod });
        if (fflDm !== 0) modifiers.push({ label: 'French Foreign Legion', value: fflDm });

        if (!hasLeftHome && char.homeworld && char.homeworld.survivalDm < 0) {
            hwDm = char.homeworld.survivalDm;
            modifiers.push({ label: 'Homeworld Gravity', value: hwDm });
        }

        const rollLabels = this.isForeignLegionActive ? 'Survival Check (FFL)' : 'Survival Check';
        const roll = await this.diceDisplay.roll(rollLabels, 2, statMod + hwDm + fflDm, target, stat.toUpperCase(), undefined, modifiers);
        const total = roll + statMod + hwDm + fflDm;
        this.log(`Survival Check: ${total} vs ${target}`);

        if (total >= target) {
            this.success = true;
            this.characterService.log(`**Survival Check** (${this.selectedCareer?.name}): Passed (${total} vs ${target})`);
            this.log('Survived the term.');

            // 2300AD: Neural Jack Installation Prompt (Military Terms 1-3, Tier 3+ nations)
            const tier3Nations = ['French Empire', 'America', 'Generic Tier 3'];
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
                const el = document.getElementById('event-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
            const char = this.characterService.character();
            this.characterService.updateCharacter({ equipment: [...char.equipment, 'Cybernetic Limb (Benefit Debt)'] });
            this.currentState.set('EVENT');
            this.generateEvent();
        } else {
            const isDrifter = this.selectedCareer?.name === 'Drifter';
            const logMsg = isDrifter ? `**Survival Check Failed** but stayed in career (Drifter Rule). Rolling Mishap...` : `**Mishap!** Injured and ejected from ${this.selectedCareer?.name}.`;
            this.characterService.log(logMsg);
            this.log(isDrifter ? 'Survival Check Failed! Rolling Mishap (Stay in Career).' : 'Mishap! You are injured and ejected from the career.');

            if (!isDrifter) {
                this.forcedOut = true;
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
                this.forcedOut = true;
                this.characterService.log(`**Mishap Outcome**: Ejected from career.`);
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
                    // We'll reuse the NPC prompt but with selection logic in template
                    this.isNpcPrompt = true;
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
            if (roll === 2) this.applyEventEffect({ type: 'npc', npcType: 'contact', note: 'Alien Contact' });
            if (roll === 3) this.characterService.updateFinances({ benefitRollMod: 1 });
            if (roll === 4) this.characterService.log('**Amnesia**: History before this term is a mystery.');
            if (roll === 5) this.applyEventEffect({ type: 'npc', npcType: 'ally', note: 'Govt Ally' });
            if (roll === 6) {
                this.handleSkillReward('Science', 1);
                this.characterService.log('**Ancient Tech**: Gained Science skill.');
            }
        }
    }

    async handleLifeEventChoice(choice: string) {
        this.isLifeEventChoice = false;
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
                const roll = await this.diceDisplay.roll('Prison Check', 2, 0, 0);
                if (roll === 2) {
                    this.characterService.setNextCareer('Prisoner');
                    this.forcedOut = true;
                    this.characterService.log('**Betrayal**: Caught and sent to prison.');
                } else {
                    this.applyEventEffect({ type: 'lose-benefit' });
                    this.characterService.log('**Betrayal**: Managed to flee but lost all benefits of this term.');
                }
            } else if (this.selectedCareer?.name === 'Entertainer') {
                if (choice.includes('Existing Contact')) {
                    this.characterService.log('**Betrayal**: One Contact became a Rival.');
                } else {
                    this.applyEventEffect({ type: 'npc', npcType: 'rival', note: 'Betrayal (Peer)' });
                }
            } else {
                this.applyEventEffect({ type: 'npc', npcType: 'rival', note: 'Betrayal' });
            }
        } else if (this.lifeEventChoiceNote.includes('Patron Offer')) {
            if (choice === 'Accept') {
                this.characterService.updateDm('qualification', 4); // For next term
                this.applyEventEffect({ type: 'npc', npcType: 'rival', note: 'Patron (I owe them a favor)' });
                this.characterService.log('**Patron Offer**: Accepted. DM+4 to next Qualification but gained a Rival.');
            }
        } else if (this.lifeEventChoiceNote.includes('Risky Adventure')) {
            if (choice === 'Accept') {
                const roll = await this.diceDisplay.roll('Risk Roll', 1, 0, 0);
                if (roll === 1) {
                    this.characterService.setNextCareer('Prisoner');
                    this.forcedOut = true;
                    this.characterService.log('**Risky Adventure**: Failed! Sent to prison.');
                } else if (roll === 2) {
                    await this.generateInjury();
                    this.characterService.log('**Risky Adventure**: Injured during the attempt.');
                } else if (roll >= 5) {
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
                this.applyRankBonus(this.getRank() + 1);
                this.characterService.log('**Heroism**: Received a promotion.');
            } else {
                this.characterService.log('**Heroism**: Received a commission.');
                // Logic for commission would set the character as an officer if not already
            }
        } else if (this.lifeEventChoiceNote.includes('Black Ops Conflict')) {
            if (choice === 'Recuse') {
                this.forcedOut = true;
                this.applyEventEffect({ type: 'npc', npcType: 'enemy', note: 'Former Commander' });
                this.characterService.log('**Black Ops Conflict**: Recused from mission. Ejected from career and gained an Enemy.');
            } else {
                const roll = await this.diceDisplay.roll('Moral Check', 2, 0, 0);
                if (roll === 2) {
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
                this.characterService.log('**French Foreign Legion**: Personnel has enlisted in the Legion.');
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
        }
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

        // Connections Rule Check
        if (this.characterService.character().connectionsUsed < 2) {
            this.isConnectionsRuleEligible = true;
            // Get all skills with level > 0 to offer as connection bonus
            this.connectionsSkillChoices = this.characterService.character().skills
                .filter(s => s.level > 0)
                .map(s => s.name);
        }
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

    async generateInjury() {
        const roll = await this.diceDisplay.roll('Injury Severity', 1, 0, 0, '');
        this.injuryRoll = roll;
        this.isInjuryPrompt = true;
        this.selectedInjuryStat = '';

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

        // 1. Coverage
        const coverageRes = await this.diceService.roll(2, 6);
        const coverageRoll = coverageRes.total + rank;
        if (['Army', 'Navy', 'Marines', 'Agent'].includes(career)) {
            if (coverageRoll < 4) this.medicalCoverage = 0;
            else if (coverageRoll < 8) this.medicalCoverage = 0.75;
            else this.medicalCoverage = 1.0;
        } else if (['Agent', 'Noble', 'Scholar', 'Entertainer', 'Merchant', 'Citizen'].includes(career)) {
            if (coverageRoll < 4) this.medicalCoverage = 0;
            else if (coverageRoll < 8) this.medicalCoverage = 0.5;
            else if (coverageRoll < 12) this.medicalCoverage = 0.75;
            else this.medicalCoverage = 1.0;
        } else {
            // Scout/Rogue/Drifter/Spaceborne
            if (coverageRoll < 8) this.medicalCoverage = 0;
            else if (coverageRoll < 12) this.medicalCoverage = 0.5;
            else this.medicalCoverage = 0.75;
        }

        // 2. Cost (5000 per point)
        let totalPoints = this.injuryMajorLoss;
        if (this.injuryRoll === 1) totalPoints += 4; // Nearly killed has +2 to other two stats

        this.medicalRestorationCost = totalPoints * 5000;
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
        this.currentEventText = mishap ? mishap.description : 'Discharged.';
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
            this.checkPostTermFlow();
        } else {
            this.currentState.set('ADVANCEMENT');
            this.rollAdvancement();
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

        const rollResult = await this.diceDisplay.roll(
            this.selectedCareer.name === 'Prisoner' ? 'Release Check' : 'Advancement Check',
            2, statMod + paroleDm, target, stat.toUpperCase(), undefined, modifiers
        );

        const total = rollResult + statMod + paroleDm;
        const isPrisoner = this.selectedCareer.name === 'Prisoner';

        if (total >= target || (isPrisoner && rollResult >= 12)) {
            this.success = true;
            const newRank = this.getRank() + 1;
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
            } else {
                this.checkPostTermFlow();
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

            this.checkPostTermFlow();
        }
    }

    // Centralized Post-Term Checks
    async checkPostTermFlow() {
        const age = this.currentAge() + 4;
        this.checkAging(age);
    }

    // --- 5. AGING & LEAVING HOME ---

    async checkAging(age: number) {
        const terms = this.currentTerm();
        if (age < 50) {
            this.rollLeavingHome();
            return;
        }
        this.log(`Aging Check (Age ${age}).`);
        const roll = await this.diceDisplay.roll('Aging Check', 2, -1 * terms, 0, '', undefined, [{ label: 'Terms', value: -1 * terms }]);
        const total = roll - terms;
        this.log(`Aging Check Result: ${total}`);

        if (total <= -6) {
            this.log('Aging Crisis! Reduce 3 stats by 1.');
            this.increaseStat('STR', -1); this.increaseStat('DEX', -1); this.increaseStat('END', -1);
            this.currentState.set('MISHAP'); // Crisis forces out
        } else if (total <= -2) {
            this.log('Aging Effect: Reduce 1 physical stat by 1.');
            this.increaseStat('STR', -1);
        }

        if (this.currentState() !== 'MISHAP') {
            this.rollLeavingHome();
        }
    }

    async rollLeavingHome() {
        const char = this.characterService.character();
        if (char.careerHistory.some(t => t.leavingHome)) {
            this.leavingHomeSuccess = true;
            this.currentState.set('TERM_END');
            return;
        }

        const terms = this.currentTerm();
        const modifiers: { label: string, value: number }[] = [];
        let bonuses = terms;
        modifiers.push({ label: 'Terms Served', value: terms });

        if (char.originType === 'Spacer') { bonuses += 2; modifiers.push({ label: 'Spacer Origin', value: 2 }); }
        if (this.selectedCareer?.name.includes('Scout')) { bonuses += 2; modifiers.push({ label: 'Scout Career', value: 2 }); }

        const roll = await this.diceDisplay.roll('Leaving Home Check', 2, bonuses, 8, '', undefined, modifiers);
        const total = roll + bonuses;
        this.log(`Leaving Home Check: ${total} vs 8`);

        if (total >= 8) {
            this.leavingHomeSuccess = true;
            this.log('You successfully left home!');
        } else {
            this.leavingHomeSuccess = false;
            this.log('Still tied to homeworld.');
        }

        this.currentState.set('TERM_END');
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

    finishTerm(destination: 'CONTINUE' | 'MUSTER' = 'CONTINUE') {
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
                    events: [this.currentEventText],
                    benefits: [],
                    ageStart: char.age,
                    ageEnd: newAge,
                    survived: !isMishap,
                    commissioned: this.isCommissionAttempt && this.success,
                    advanced: this.success && !isMishap && !this.isCommissionAttempt,
                    leavingHome: this.leavingHomeSuccess,
                    benefitRollsGained: 1
                }
            ]
        });

        // Reset per-term state
        this.success = false;
        this.leavingHomeSuccess = false;
        this.currentEventText = '';
        this.bonusSkillRolls.set(0);
        this.isCommissionAttempt = false;
        this.basicTrainingGrantedThisTerm = false;

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
            // Continue Logic
            if (this.nextAssignment) {
                this.characterService.log(`**Assignment Changed** to ${this.nextAssignment.name}`);
                this.selectedAssignment = this.nextAssignment;
                this.nextAssignment = null;
            }
            this.currentState.set('SKILL_TRAINING');
        }
        this.mandatoryContinue = false;
    }

    continueCareer() {
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
        const r = this.getRank();
        if (this.isCommissioned()) return this.getOfficerRankTitle(r);
        return this.getRankTitleFor(r);
    }

    getRankTitleFor(rank: number): string {
        if (!this.selectedAssignment) return `Rank ${rank}`;
        const r = this.selectedAssignment.ranks.find(data => data.level === rank);
        return r ? r.title : `Rank ${rank}`;
    }

    log(msg: string) {
        console.log(`[CareerComponent] ${msg}`);
    }

    increaseStat(stat: string, val: number) {
        const char = this.characterService.character();
        // Deep-clone characteristics to avoid mutating Signal state
        const chars = Object.keys(char.characteristics).reduce((acc, k) => {
            const key = k as keyof typeof char.characteristics;
            acc[key] = { ...char.characteristics[key] };
            return acc;
        }, {} as any) as typeof char.characteristics;

        const key = stat.toLowerCase() as keyof typeof chars;
        if (chars[key]) {
            const oldValue = chars[key].value;
            chars[key].value += val;
            chars[key].modifier = this.diceService.getModifier(chars[key].value);
            this.characterService.updateCharacteristics(chars);
        }
    }

    @Output() complete = new EventEmitter<void>();
}
