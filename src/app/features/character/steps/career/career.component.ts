import { Component, inject, computed, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceService } from '../../../../core/services/dice.service';
import { CareerService } from '../../../../core/services/career.service';
import { CareerDefinition, Assignment } from '../../../../core/models/career.model';
import { DiceDisplayService } from '../../../../core/services/dice-display.service';
import { NATIONALITIES } from '../../../../data/nationalities';
import { EventEngineService } from '../../../../core/services/event-engine.service';
import { WizardFlowService } from '../../../../core/services/wizard-flow.service';
import { CareerTermService } from '../../../../core/services/career-term.service';
import { createSurvivalCheckEvent, createMishapRollEvent, createEventRollEvent } from '../../../../data/events/shared/career-events';
import { createLifeEventRollEvent, createInjuryEvent, createInjuryRollEvent } from '../../../../data/events/shared/life-events';
import { NEURAL_JACK_INSTALL_EVENT } from '../../../../data/events/shared/neural-jack-install.event';
import { effect } from '@angular/core';

/** Careers that count as "military" for medical and other rule checks. */
const MILITARY_CAREERS = ['Army', 'Navy', 'Marine'];
/** @deprecated Use CareerTermService.calculateMedicalCoverage instead */
const MEDICAL_MILITARY_BUCKET = ['Army', 'Navy', 'Marine'];

type CareerState = 'CHOOSE_CAREER' | 'QUALIFICATION' | 'QUALIFICATION_FAILURE' | 'BASIC_TRAINING' | 'SKILL_TRAINING' | 'POST_TERM_SKILL_TRAINING' | 'SURVIVAL' | 'EVENT' | 'MISHAP' | 'ADVANCEMENT' | 'CHANGE_ASSIGNMENT' | 'LEAVING_HOME' | 'TERM_END' | 'MUSTER_OUT' | 'NEURAL_JACK_EVENT';

import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';
import { HudWindowComponent } from '../../../shared/hud-window/hud-window.component';

@Component({
    selector: 'app-career',
    standalone: true,
    imports: [CommonModule, FormsModule, StepHeaderComponent, HudWindowComponent],
    templateUrl: './career.component.html',
    styleUrls: ['./career.component.scss']
})
export class CareerComponent implements OnInit, OnDestroy {
    public characterService = inject(CharacterService);
    public diceService = inject(DiceService);
    public diceDisplay = inject(DiceDisplayService);
    public eventEngine = inject(EventEngineService);
    private careerService = inject(CareerService);
    private wizardFlow = inject(WizardFlowService);
    /** Handles per-term game mechanics (aging, leaving home, medical, etc.) */
    public careerTermService = inject(CareerTermService);

    careers = computed(() => this.careerService.getAllCareers());

    // State Signals
    currentState = signal<CareerState>('CHOOSE_CAREER');
    // activeEvent already defined later
    currentTerm = computed(() => this.characterService.character().careerHistory.length + 1);
    currentAge = computed(() => this.characterService.character().age);

    // Selection
    selectedCareer: CareerDefinition | null = null;
    selectedAssignment: Assignment | null = null;

    // Turn Data
    selectedTable: 'personal' | 'service' | 'advanced' | 'assignment' = 'service';
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

    // Event Flow Tracking
    private eventFlowActive = false;

    constructor() {
        effect(() => {
            const current = this.eventEngine.currentEvent();
            if (current) {
                this.eventFlowActive = true;
            } else if (this.eventFlowActive) {
                // Event flow just finished
                this.eventFlowActive = false;
                this.onEventFlowComplete();
            }
        });
    }

    ngOnDestroy(): void {
        this.wizardFlow.unregisterStep(5);
    }

    async onEventFlowComplete() {
        // If we were in SURVIVAL mode and the event chain (Survival -> Event) completed
        if (this.currentState() === 'SURVIVAL') {
            // Check if we are still in the career (not ejected during event)
            if (!this.forcedOut && !this.characterService.character().ejectedCareers?.includes(this.selectedCareer?.name || '')) {
                 this.currentState.set('ADVANCEMENT');
                 this.log('Moved to Advancement Phase.');
            } else {
                 // 2300AD Rule 322: Term always lasts 4 years even on mishap/ejection
                 this.log('Ejected/Forced Out. Finalizing term records before Mustering Out.');
                 await this.finishTerm('MUSTER');
            }
        }
        
        // Resume from Neural Jack Event
        if (this.currentState() === 'NEURAL_JACK_EVENT') {
            this.log('Neural Jack protocol complete. Resuming post-term checks.');
            const age = this.currentAge();
            await this.checkAging(age);
        }
    }

    async ngOnInit() {
        // Self-register with WizardFlowService
        this.wizardFlow.registerValidator(5, () => this.canProceedToNext());
        this.wizardFlow.registerFinishAction(5, () => this.startMusteringOut());

        // Register Custom Handlers
        this.eventEngine.registerCustomHandler('ADVANCE_STATE', (state) => {
            this.currentState.set(state);
            this.log(`State Advanced to ${state}`);
        });

        this.eventEngine.registerCustomHandler('INJURY_PROCESS', (payload) => {
            this.handleInjuryProcess(payload);
        });

        // Register Global Events
        this.eventEngine.registerEvent(createLifeEventRollEvent());
        this.eventEngine.registerEvent(createInjuryRollEvent());

        /* 
           Legacy Custom Handlers for migration compatibility.
           Some legacy effects mapped in EventEngine -> TRIGGER -> CUSTOM handlers here?
        */

        this.eventEngine.registerCustomHandler('SET_PSIONIC_POTENTIAL', (payload) => {
            this.characterService.setPsionicPotential(payload.value);
        });

        this.eventEngine.registerCustomHandler('BETRAYAL_LOGIC', (payload) => {
            // Logic: Existing Ally/Contact -> Rival/Enemy
            this.characterService.addNpc({ 
                id: `npc_${Date.now()}`,
                name: 'Betrayer',
                type: 'rival',
                origin: 'Betrayal Event',
                notes: 'A former friend who betrayed you.'
            });
            this.characterService.log('**Betrayal**: A trusted contact has become a Rival.');
        });

        this.eventEngine.registerCustomHandler('INJURY_PROCESS', (payload) => {
            const severity = payload.severity;
            const event = createInjuryEvent(severity, this.selectedCareer?.name || 'Unknown');
            this.eventEngine.registerEvent(event);
            this.eventEngine.triggerEvent(event.id);
        });

        this.eventEngine.registerCustomHandler('SET_NEURAL_JACK', (payload) => {
            this.characterService.setNeuralJackInstalled(true);
        });

        this.eventEngine.registerCustomHandler('ANY_SKILL_UP', () => {
             const char = this.characterService.character();
             this.skillChoices = char.skills.map(s => s.name);
             if (this.skillChoices.length === 0) {
                 // Fallback if no skills known yet
                 this.skillChoices = ['Athletics', 'Gun Combat (any)', 'Recon'];
             }
             this.isSkillChoicePrompt = true;
             this.characterService.log('**Advanced Training**: Choose any known skill to increase.');
        });

        this.eventEngine.registerCustomHandler('APPLY_INJURY_DAMAGE', (payload) => {
            this.handleInjuryDamage(payload.severity, payload.method);
        });

        const char = this.characterService.character();
        if (char.forcedCareer) {
            const forced = this.careers().find((c: CareerDefinition) => c.name.toLowerCase() === char.forcedCareer?.toLowerCase());
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
    
    // Getter for the template to access the signal
    get activeEvent() {
        return this.eventEngine.currentEvent();
    }
    private addToEventLog(message: string) {
        this.termEventLog.update(log => [...log, message]);
    }

    async selectCareer(career: CareerDefinition) {
        if (this.isCareerDisabled(career)) {
            this.log(`REJECTED: ${this.getDisabledReason(career)}`);
            return;
        }

        this.termEventLog.set([]); // Reset log for new career
        this.selectedCareer = career;
        this.selectedAssignment = null;
        this.characterService.currentCareer.set(career.name);

        // Register Career-Specific Events in Engine
        const termEvent = createEventRollEvent(career.name, career.eventTable);
        this.eventEngine.registerEvent(termEvent);

        const mishapEvent = createMishapRollEvent(career.name, career.mishapTable);
        this.eventEngine.registerEvent(mishapEvent);

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
        const minAttributes = career.minAttributes;
        if (minAttributes) {
            for (const [stat, min] of Object.entries(minAttributes)) {
                // Handle complex keys like "dex or int"
                if (stat.includes(' or ')) {
                    const stats = stat.split(' or ').map(s => s.trim().toLowerCase());
                    const values = stats.map(s => (char.characteristics as any)[s]?.value || 0);
                    if (values.every(v => v < min)) return true;
                    continue;
                }

                const charStat = (char.characteristics as any)[stat.toLowerCase()];
                if (charStat && charStat.value < min) return true;
                
                // Legacy special case (normalized now but keeping for safety)
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

        const minAttributes = career.minAttributes;
        if (minAttributes) {
            for (const [stat, min] of Object.entries(minAttributes)) {
                if (stat.includes(' or ')) {
                    const stats = stat.split(' or ').map(s => s.trim().toLowerCase());
                    const values = stats.map(s => (char.characteristics as any)[s]?.value || 0);
                    if (values.every(v => v < min)) return `Requires ${stat.toUpperCase()} ${min}`;
                    continue;
                }

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

        this.log(`Qualification Attempt: ${career.name}`);

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
            this.log('Qualified!');
            
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

        const fallbackText = this.currentTerm() === 1
            ? 'Failed Qualification. You are subject to the Draft — a random military career will be assigned.'
            : 'Failed Qualification. You have no choice but to become a Drifter this term.';

        const rollResult = await this.diceDisplay.roll(
            `Qualification: ${career.name}`, 2,
            statMod + dm + universityMod + nextQualDm + (this.isForeignLegionActive ? 1 : 0),
            target, charStatKey.toUpperCase(), undefined, modifiers, undefined,
            {
                phase: `QUALIFICATION · ${career.name.toUpperCase()}`,
                announcement: `You are applying to join the ${career.name} (${this.selectedAssignment?.name}). Roll ${charStatKey.toUpperCase()} ${target}+ on 2D6 to be accepted into service.`,
                successContext: `Qualified! You are accepted into the ${career.name} and will begin Basic Training.`,
                failureContext: fallbackText
            }
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

            if (this.currentTerm() === 1) {
                this.log('Qualification Failed. You must submit to the Draft (Term 1).');
                await this.chooseDraft(); // Automatically go to Draft if Term 1 fail
            } else {
                this.log('Qualification Failed. You must become a Drifter.');
                await this.chooseDrifter(); // Automatically go to Drifter if Term > 1 fail
            }
        }
    }

    async chooseDraft() {
        this.characterService.log('Choosing the Draft...');
        await this.runDraft();
    }

    async chooseDrifter() {
        this.characterService.log('Choosing Drifter path...');
        const drifter = this.careers().find(c => c.name === 'Drifter');
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
            rollLabels, 2, statMod + academyBonus, target, stat.toUpperCase(), undefined, modifiers, undefined,
            {
                phase: `COMMISSION · ${this.selectedCareer?.name.toUpperCase()}`,
                announcement: `You are applying for an Officer's Commission in the ${this.selectedCareer?.name}. Roll ${stat.toUpperCase()} ${target}+ to be promoted to Officer Rank 1.`,
                successContext: `Commission granted! You are now an Officer Rank 1 and gain 1 extra Skill Roll this term.`,
                failureContext: `Commission denied. You continue as Enlisted personnel and proceed to Skill Training.`
            }
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

        const rollSource = await this.diceDisplay.roll(
            'Draft Table', 1, 0, 0, '', undefined, [], draftTable,
            {
                phase: 'MILITARY DRAFT · TERM 1',
                announcement: `You failed to qualify for your chosen career. The Draft assigns you to a random military branch based on a 1D6 roll: 1–3 = Army, 4–5 = Marine, 6 = Navy.`,
                successContext: `Welcome to the ranks. Your assigned branch begins Basic Training immediately.`,
                failureContext: ``
            }
        );
        const roll = rollSource;

        let draftedCareerName = '';
        if (roll <= 3) draftedCareerName = 'Army';
        else if (roll <= 5) draftedCareerName = 'Marine';
        else draftedCareerName = 'Navy';

        let draftTarget = this.careers().find((c: CareerDefinition) => c.name.includes(draftedCareerName));
        // Fallback for Marine vs Marines naming discrepancy
        if (!draftTarget && draftedCareerName === 'Marine') {
            draftTarget = this.careers().find((c: CareerDefinition) => c.name === 'Marines');
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
            const drifter = this.careers().find((c: CareerDefinition) => c.name === 'Drifter');
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
            (res) => { const idx = res - 1; return table[idx] || 'Unknown'; }, [], table,
            {
                phase: `SKILL TRAINING · ${tableType.toUpperCase()} TABLE`,
                announcement: `Roll 1D6 on the ${tableType} Skill Table to see which skill or characteristic bonus you develop this term.`,
                successContext: `You gain the listed skill or characteristic improvement. Apply it to your character sheet.`,
                failureContext: ``
            }
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

        // Flow Control
        const state = this.currentState();
        const bonus = this.bonusSkillRolls();

        if (bonus > 0) {
             this.bonusSkillRolls.update(v => v - 1);
             const remaining = this.bonusSkillRolls();
             this.log(`Bonus Roll Used. Remaining: ${remaining}`);
             
             // Advancement Bonus Sequence Check
             if (state === 'POST_TERM_SKILL_TRAINING' && remaining === 0) {
                 await this.transitionToEndOfTerm();
                 return;
             }
             
             // Commission/Other Bonus Check: Stay in current state logic
             // (If SKILL_TRAINING, we stay for standard roll)
             // (If POST_TERM but remaining > 0, we stay for next bonus)
             return;
        }

        // Standard Flow (No Bonus Remaining)
        if (state === 'POST_TERM_SKILL_TRAINING') {
             // Fallback: If we have 0 bonuses (e.g. somehow skipped), we end term
             await this.transitionToEndOfTerm();
        } else if (state === 'SKILL_TRAINING' || (state === 'BASIC_TRAINING' && this.currentTerm() === 1)) {
             // Standard pre-survival skill roll completes the training phase
             this.currentState.set('SURVIVAL');
        } else {
             this.log(`Warning: rollSkill flow triggered in state: ${state}`);
        }
    }

    getRank(): number {
        return this.currentRank();
    }

    // --- 3. SURVIVAL & EVENT ---

    async rollSurvival() {
        if (!this.selectedAssignment || !this.selectedCareer) return;

        const stat = this.selectedAssignment.survivalStat;
        const target = this.selectedAssignment.survivalTarget;

        this.log(`Initiating Survival Check: ${stat} ${target}+`);

        // 1. Create Base Events
        const survivalEvent = createSurvivalCheckEvent(this.selectedCareer.name, stat, target);
        
        // 2300AD: Path Modifiers & Homeworld Survival
        const character = this.characterService.character();
        let pathDm = 0;
        if (character.isSoftPath) pathDm = -1;
        else if (character.homeworld?.path === 'Hard') pathDm = 1;

        // Apply Homeworld Survival DM if they haven't left home yet (Rule 221)
        if (!character.hasLeftHome && character.homeworld?.survivalDm) {
            pathDm += character.homeworld.survivalDm;
            this.log(`Homeworld Survival DM Applied: ${character.homeworld.survivalDm}`);
        }
        
        if (pathDm !== 0) {
            const effect = survivalEvent.ui.options[0].effects?.find((e: any) => e.type === 'ROLL_CHECK');
            if (effect) effect.dm = pathDm;
        }

        // Note: Map legacy tables to dynamic events
        const isEjection = !['Drifter', 'Spaceborne'].includes(this.selectedCareer.name);
        const mishapEvent = createMishapRollEvent(this.selectedCareer.name, this.selectedCareer.mishapTable, isEjection);
        const termEvent = createEventRollEvent(this.selectedCareer.name, this.selectedCareer.eventTable);

        // 2. Register Events
        this.eventEngine.registerEvent(survivalEvent);
        this.eventEngine.registerEvent(mishapEvent);
        this.eventEngine.registerEvent(termEvent);

        // 3. Configure Chaining
        // Survival Pass -> Term Event (Default)
        // Survival Fail -> Mishap (Default)
        
        let successNext = termEvent.id;

        // 2300AD: Check for Neural Jack Opportunity (Term 1-3, Military, Tier 3+ Nation)
        const tier3Nations = ['France', 'United States', 'Germany', 'United Kingdom', 'Manchuria', 'Australia', 'Canada', 'Japan', 'Russia', 'Argentina', 'Brazil', 'Azania', 'Mexico', 'Texas', 'Ukraine', 'Inca Republic', 'Trilon Corp', 'Life Foundation'];
        
        if (this.currentTerm() <= 3 && this.isMilitaryCareer() && tier3Nations.includes(character.nationality) && !character.hasNeuralJack) {
            // Inject Neural Jack Event
            console.log('Injecting Neural Jack Event into chain.');
            const njEvent = { ...NEURAL_JACK_INSTALL_EVENT };
            
            // Ensure all paths in Neural Jack lead to Term Event
            njEvent.ui.options = njEvent.ui.options.map((opt: any) => ({
                ...opt,
                nextEventId: termEvent.id,
                replaceNext: true
            }));
            
            this.eventEngine.registerEvent(njEvent);
            successNext = njEvent.id;
        }

        // Link Survival Pass to Next Event
        const rollEffect = survivalEvent.ui.options[0].effects?.find((e: any) => e.type === 'ROLL_CHECK');
        if (rollEffect) {
            rollEffect.onPass = successNext;
        }

        // 4. Trigger Start
        this.eventEngine.triggerEvent(survivalEvent.id);
    }

    handleInjuryDamage(severity: number, method: 'debt' | 'augment') {
        if (method === 'augment') {
            // Apply Augmentation Rules
            this.characterService.spendBenefitRoll(undefined, 1);
            this.characterService.updateCharacter({
                augments: [...(this.characterService.character().augments || []), {
                    name: 'Cybernetic Replacement (Injury)',
                    type: 'Cybernetic',
                    location: 'TBD',
                    techLevel: 10,
                    effects: 'Restores function of lost limb/organ.',
                    cost: 0,
                    isNatural: false
                }],
                history: [...(this.characterService.character().history || []), '**Augmentation**: Accepted cybernetics to treat injury. Cost: 1 Benefit Roll.']
            });
            this.log('Injury treated with cybernetics.');
        } else {
            // Apply Medical Rules (Debt + Stat Loss)
            // Determine Stat based on severity
            const char = this.characterService.character();
            const stats = ['str', 'dex', 'end'];
            // Simplify random stat selection for MVP instead of sub-menu
            const targetStat = stats[Math.floor(Math.random() * stats.length)];
            const targetStatVal = (char.characteristics as any)[targetStat].value;
            
            let loss = 0;
            let cost = 0;

            if (severity === 1) { // Nearly Killed: 1d6 to one, 2 to others
               const roll = Math.floor(Math.random() * 6) + 1;
               loss = roll; 
               // Apply to others broadly? Simplification: Just big hit to one for now or detailed logic?
               // Detailed:
               const others = stats.filter(s => s !== targetStat);
               // We need extended logic. For now, strict mapping:
               // This requires multiple updates. 
               this.characterService.updateCharacteristics({
                   ...char.characteristics,
                   [targetStat]: { ...char.characteristics[targetStat as keyof typeof char.characteristics], value: Math.max(1, targetStatVal - roll) },
                   [others[0]]: { ...char.characteristics[others[0] as keyof typeof char.characteristics], value: Math.max(1, (char.characteristics as any)[others[0]].value - 2) },
                   [others[1]]: { ...char.characteristics[others[1] as keyof typeof char.characteristics], value: Math.max(1, (char.characteristics as any)[others[1]].value - 2) }
               });
               cost = (roll + 4) * 5000;
               this.characterService.log(`**Nearly Killed**: STR/DEX/END reduced. Medical Bill: Lv ${cost}`);
            } else if (severity === 2) { // Severely Injured: 1d6
               const roll = Math.floor(Math.random() * 6) + 1;
               loss = roll;
               this.characterService.updateCharacteristics({
                   ...char.characteristics,
                   [targetStat]: { ...char.characteristics[targetStat as keyof typeof char.characteristics], value: Math.max(1, targetStatVal - roll) }
               });
               cost = roll * 5000;
               this.characterService.log(`**Severely Injured**: ${targetStat.toUpperCase()} -${roll}. Medical Bill: Lv ${cost}`);
            } else if (severity === 3) { // Missing Eye/Limb: -2
               loss = 2;
               this.characterService.updateCharacteristics({
                   ...char.characteristics,
                   [targetStat]: { ...char.characteristics[targetStat as keyof typeof char.characteristics], value: Math.max(1, targetStatVal - loss) }
               });
               cost = 10000; // 2300AD major organ/limb
               this.characterService.log(`**Missing Limb/Eye**: ${targetStat.toUpperCase()} -2. Medical Bill: Lv ${cost}`);
            } else if (severity === 4) { // Scarred: -2
               loss = 2;
               this.characterService.updateCharacteristics({
                   ...char.characteristics,
                   [targetStat]: { ...char.characteristics[targetStat as keyof typeof char.characteristics], value: Math.max(1, targetStatVal - loss) }
               });
               cost = 2 * 5000;
               this.characterService.log(`**Scarred**: ${targetStat.toUpperCase()} -2. Medical Bill: Lv ${cost}`);
            } else if (severity === 5) { // Injured: -1
               loss = 1;
               this.characterService.updateCharacteristics({
                   ...char.characteristics,
                   [targetStat]: { ...char.characteristics[targetStat as keyof typeof char.characteristics], value: Math.max(1, targetStatVal - loss) }
               });
               cost = 5000;
               this.characterService.log(`**Injured**: ${targetStat.toUpperCase()} -1. Medical Bill: Lv ${cost}`);
            }

            // Apply Medical Debt
            if (cost > 0) {
                // Determine who pays (2d6 + rank)
                const rank = this.currentRank();
                const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1 + rank;
                let coverage = 0; // 0 to 1 (100%)
                
                // Simplified Table Logic (Using "Other" as baseline or Military if applicable)
                if (this.isMilitaryCareer()) {
                    if (roll >= 12) coverage = 1;
                    else if (roll >= 8) coverage = 1;
                    else if (roll >= 4) coverage = 0.75;
                    else coverage = 0;
                } else {
                     if (roll >= 12) coverage = 1;
                     else if (roll >= 8) coverage = 0.75;
                     else if (roll >= 4) coverage = 0.5;
                     else coverage = 0;
                }

                const covered = Math.floor(cost * coverage);
                const debt = cost - covered;
                
                this.characterService.updateFinances({ 
                    debt: (this.characterService.character().finances.debt || 0) + debt 
                });
                this.characterService.log(`**Medical Costs**: Total Lv ${cost}. Covered: Lv ${covered}. Debt: Lv ${debt}.`);
            }
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
                this.characterService.ejectCareer(careerName);
            }

            this.currentState.set('MISHAP');
            this.generateMishap();
        }
    }

    async generateEvent() {
        if (!this.selectedCareer) return;
        
        // 1. Determine Event Source by Career
        // For now, only AGENT has gameEvents defined, so we check if legacy or new.
        // Actually, triggerEvent('term_event_roll') rolls on the table in EventEngine.
        // But EventEngine ROLL_TABLE logic creates dynamic events.
        // If we want to use the PRE-DEFINED GameEvents in the table, we need to update EventEngine's ROLL_TABLE handler.
        
        // Strategy: 
        // CareerComponent triggers 'term_event_roll'.
        // EventEngine sees ROLL_TABLE.
        // EventEngine rolls the dice, finds the entry.
        // IF entry has `gameEvent`, it should register and trigger THAT instead of creating a dynamic one.
        
        this.currentEventText = "Resolving Term Event via Event Protocol...";
        this.eventEngine.triggerEvent('term_event_roll');
    }


    private checkSpecial2300ADConstraints() {
        if (!this.selectedCareer) return;
        const char = this.characterService.character();

        // Neural Jack Check (Term 1-3, Tier 3+ nation)
        if (this.currentTerm() <= 3 && this.isMilitaryCareer() && ['French Empire', 'America', 'Generic Tier 3'].includes(char.nationality)) {
            // This is usually handled by term events, but could be a global prompt
        }
    }

    /* Legacy applyEventEffect removed. Use EventEngine mapping. */


    async generateLifeEvent() {
         this.eventEngine.triggerEvent('life_event_roll');
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
        this.addToEventLog(msg);
        // Only log critical/narrative messages to CharacterService to avoid spam
        // We'll let explicit calls to characterService.log handle history
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
        this.eventEngine.triggerEvent('injury_roll');
    }


    async selectInjuryStat(stat: string) {
        this.selectedInjuryStat = stat;

        if (this.injuryMajorLoss === 100) {
             const loss = await this.diceDisplay.roll('Injury Severity', 1, 0, 0, '', undefined, [], undefined, {
                 phase: `INJURY SEVERITY \u00b7 ${stat.toUpperCase()}`,
                 announcement: `You suffered a serious injury to your ${stat}. Roll 1D6 to determine the permanent characteristic loss from this wound.`,
                 successContext: `Wound assessment complete. Characteristic reduced accordingly.`,
                 failureContext: ``
             });
             this.injuryMajorLoss = loss;
             this.characterService.log(`**Injury Severity Roll**: Rolled ${loss} for stat reduction.`);
        }

        this.calculateMedicalCosts();
        this.isInjuryPrompt = false;
        this.isInjuryDecisionActive = true;
    }

    /**
     * Delegates medical cost (coverage + debt) calculation to CareerTermService.
     * Sets medicalCoverage (as fraction 0–1), medicalRestorationCost, and medicalDebtCalculated.
     */
    async calculateMedicalCosts() {
        const careerName = this.selectedCareer?.name || '';
        const rank = this.getRank();

        // Coverage fraction (0–1) via service
        const coverageFraction = await this.careerTermService.calculateMedicalCoverage(careerName, rank);
        this.medicalCoverage = coverageFraction;

        // Restoration cost and net debt via service (pure calculation, no dice)
        const result = this.careerTermService.calculateMedicalDebt(
            this.injuryRoll,
            this.injuryMajorLoss,
            coverageFraction
        );

        this.medicalRestorationCost = result.restorationCost;
        this.medicalDebtCalculated = result.debtAmount;
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
        this.currentEventText = "CRITICAL FAILURE: Mishap Protocol Initiated.";
        this.eventEngine.triggerEvent('mishap_roll');
    }

    async applyEventEffect(effect: any) {
        if (effect.type === 'injury') {
             this.eventEngine.triggerEvent('injury_roll');
        } else {
             console.warn('Unhandled manual effect:', effect);
             this.log(`Manual effect triggered: ${effect.type}`);
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

        // Neural Jack Bonus (+1)
        if (char.equipment.some(e => e.includes('Neural Jack'))) {
            modifiers.push({ label: 'Neural Jack', value: 1 });
        }

        const isPrisoner = this.selectedCareer.name === 'Prisoner';
        const advLabel = isPrisoner ? 'Release Check' : 'Advancement Check';
        const advAnnouncement = isPrisoner
            ? `Your parole board reviews your record. Roll ${stat.toUpperCase()} ${target}+ on 2D6 to be released from prison this term.`
            : `Your service record this term is being evaluated for promotion. Roll ${stat.toUpperCase()} ${target}+ on 2D6 to advance in rank.`;
        const advSuccess = isPrisoner
            ? `Released! You are free and will Muster Out immediately.`
            : `Promoted! Your rank increases and you gain 1 bonus Skill Roll. A Natural 12 obligates you to continue one more term.`;
        const advFailure = isPrisoner
            ? `Parole denied. You remain in prison. If the result is ≤ terms served, you lose a stat point.`
            : `No promotion this term. If the result is ≤ terms served, you will be forced out of service.`;

        const rollResult = await this.diceDisplay.roll(
            advLabel,
            2, statMod + paroleDm + nextAdvDm, target, stat.toUpperCase(), undefined, modifiers, undefined,
            {
                phase: isPrisoner
                    ? 'PAROLE REVIEW · TERM ' + this.currentTerm()
                    : `ADVANCEMENT EVALUATION · TERM ${this.currentTerm()}`,
                announcement: advAnnouncement,
                successContext: advSuccess,
                failureContext: advFailure
            }
        );

        const total = rollResult + statMod + paroleDm + nextAdvDm;

        // Clear used bonuses
        this.characterService.updateCharacter({ nextAdvancementDm: 0 });

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
                this.addToEventLog('Gain 1 Bonus Skill Roll. You must take this now.');
                this.currentState.set('POST_TERM_SKILL_TRAINING');
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



    public async transitionToEndOfTerm() {
        this.currentState.set('LEAVING_HOME');
        await this.checkPostTermFlow();
    }

    // Centralized Post-Term Checks
    async checkPostTermFlow() {
        const char = this.characterService.character();
        const nation = NATIONALITIES.find(n => n.name === char.nationality);
        const tier = nation?.tier || 3;
        
        // 2300AD: Neural Jack Opportunity — delegates eligibility check to CareerTermService
        const careerName = this.selectedCareer?.name || '';
        const isEligibleForJack = this.careerTermService.isNeuralJackEligible(careerName, this.currentTerm());

        if (isEligibleForJack && !char.equipment.some(e => e.includes('Neural Jack'))) {
             this.log('Neural Jack installation opportunity available.');
             this.currentState.set('NEURAL_JACK_EVENT');
             
             // Register and Trigger
             this.eventEngine.registerEvent(NEURAL_JACK_INSTALL_EVENT);
             this.eventEngine.triggerEvent(NEURAL_JACK_INSTALL_EVENT.id);
             return; // Stop flow, resume in onEventFlowComplete
        }

        const age = this.currentAge();
        await this.checkAging(age);
    }

    // --- 5. AGING & LEAVING HOME ---

    /**
     * Delegates aging check to CareerTermService.
     * If no aging event applies, falls through to rollLeavingHome.
     */
    async checkAging(age: number) {
        const terms = this.currentTerm();
        const result = await this.careerTermService.checkAging(age, terms);

        if (!result) {
            // No aging check required — proceed to leaving home
            await this.rollLeavingHome();
            return;
        }

        this.log(`Aging Check Result: ${result.total} (${result.description})`);
        this.addToEventLog(`AGING_CHECK: Roll ${result.roll} - ${terms} Terms = ${result.total}`);
        this.currentEventText = result.description;

        if (result.endCareer) {
            this.currentState.set('MISHAP');
        } else if (result.total === 1) {
            this.currentState.set('EVENT');
        } else {
            await this.rollLeavingHome();
        }

        setTimeout(() => {
            const content = document.querySelector('.wizard-content');
            if (content) content.scrollTop = content.scrollHeight;
        }, 100);
    }

    /**
     * Delegates leaving-home roll to CareerTermService.
     */
    async rollLeavingHome() {
        const char = this.characterService.character();
        if (char.hasLeftHome) {
            this.leavingHomeSuccess = true;
            if (this.currentState() === 'LEAVING_HOME') {
                this.currentState.set('TERM_END');
            }
            return;
        }

        const careerName = this.selectedCareer?.name || '';
        const terms = this.currentTerm();
        const result = await this.careerTermService.rollLeavingHome(careerName, terms);

        if (result) {
            this.leavingHomeSuccess = result.success;
            this.addToEventLog(`LEAVING_HOME: ${result.success ? 'Success' : 'No Motion'} (Roll ${result.roll} + Mod ${result.bonus} = ${result.total} vs 8)`);
            if (result.success) {
                this.log('You successfully left home!');
            } else {
                this.log('Still tied to homeworld.');
            }
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
        const dm = 0; // No DM for assignment change qualification by default
        const modifiers: { label: string, value: number }[] = []; // No modifiers for assignment change qualification by default

        const rollValue = await this.diceDisplay.roll(`Qualify: ${newAssign.name}`, 2, statMod, dm, stat.toUpperCase(), (res) => res + statMod + dm >= target ? 'PASS' : 'FAIL', modifiers, undefined, {
            phase: `ASSIGNMENT CHANGE · ${newAssign.name.toUpperCase()}`,
            announcement: `You are requesting a transfer to the ${newAssign.name} assignment. Roll ${stat.toUpperCase()} ${target}+ on 2D6 to gain approval.`,
            successContext: `Transfer approved! You will serve in the ${newAssign.name} specialization starting next term.`,
            failureContext: `Transfer denied. You continue in your current assignment.`
        });
        const total = rollValue + statMod + dm;
        const passed = total >= target;

        this.addToEventLog(`ASSIGNMENT_CHANGE: ${passed ? 'Success' : 'Failure'} (Roll ${rollValue} + Mod ${statMod + dm} = ${total} vs ${target})`);

        if (passed) {
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
            this.careerTermService.applyForeignLegionBenefits();
        }

        // 2300AD: Social Standing Rule - +1 SOC per term if SOC 10+
        if (char.characteristics.soc.value >= 10) {
            this.careerTermService.applyEliteSocBonus();
        }

        const newAge = char.age + 4;
        const currentCareerName = careerName;

        this.characterService.log(`### Term ${this.currentTerm()} Complete (${currentCareerName})\n- Rank: ${currentRank}\n- Age: ${char.age} → ${newAge}\n- Survived: ${!isMishap}`);

        // Track benefit roll for the term
        this.characterService.addBenefitRoll(currentCareerName, 1);

        const careerId = this.selectedCareer?.id || currentCareerName.toLowerCase();

        this.characterService.updateCharacter({
            age: newAge,
            careerHistory: [
                ...char.careerHistory,
                {
                    termNumber: this.currentTerm(),
                    careerName: careerId,
                    careerLabel: currentCareerName,
                    rank: currentRank,
                    rankTitle: this.getRankTitle(),
                    assignment: this.selectedAssignment?.name,
                    assignmentLabel: this.selectedAssignment?.name,
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
            // Apply Rank Bonus Rolls at MUSTER via CareerTermService
            this.careerTermService.applyRankBonusRolls(currentCareerName, currentRank);

            this.selectedCareer = null;
            this.selectedAssignment = null;
            this.characterService.currentCareer.set(null);
            this.currentState.set('CHOOSE_CAREER');
            // Ensure any lingering events are cleared so overlays don't block the selection screen
            this.eventEngine.currentEvent.set(null); 
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
            this.characterService.currentCareer.set(this.selectedCareer?.name || null);
            this.termEventLog.set([]); // Reset log for next term
        }
        this.mandatoryContinue = false;
    }
    // --- INJURY HANDLING (Triggered via Event Engine) ---

    handleInjuryProcess(payload: any) {
        const severity = payload.severity;
        this.injurySeverity = `Level ${severity}`;
        this.injuryRoll = severity;
        this.pendingInjuryStats = ['STR', 'DEX', 'END'];

        // Define reduction based on severity logic
        // 1=Nearly Killed, 2=Severely Injured, 3=Missing Eye/Limb, 4=Scarred, 5=Injured, 6=Light
        switch (severity) {
            case 1:
                this.injuryMajorLoss = 100; // Special flag for 1d6
                this.characterService.log('**Injury**: Nearly Killed. Major reduction + others -2.');
                break;
            case 2:
                this.injuryMajorLoss = 100; // Special flag for 1d6
                this.characterService.log('**Injury**: Severely Injured. Major reduction (1d6).');
                break;
            case 3:
                this.injuryMajorLoss = 2;
                this.pendingInjuryStats = ['STR', 'DEX'];
                this.characterService.log('**Injury**: Missing Eye/Limb. STR or DEX -2.');
                break;
            case 4:
                this.injuryMajorLoss = 2;
                this.characterService.log('**Injury**: Scarred. Physical Char -2.');
                break;
            case 5:
                this.injuryMajorLoss = 1;
                this.characterService.log('**Injury**: Injured. Physical Char -1.');
                break;
            default:
                // Lightly Injured handled by Log Entry usually
                this.injuryMajorLoss = 0;
                break;
        }

        if (this.injuryMajorLoss > 0) {
            this.isInjuryPrompt = true;
        } else {
            // Light injury, just log
            this.characterService.log('**Injury**: Light. No permanent loss.');
        }
    }



    /**
     * Delegates medical coverage calculation to CareerTermService.
     * Returns coverage as a fraction 0–1 (e.g. 0.75 = 75%).
     */
    async calculateMedicalCoverage() {
        const rank = this.getRank();
        const careerName = this.selectedCareer?.name || '';
        const coverageFraction = await this.careerTermService.calculateMedicalCoverage(careerName, rank);
        // Store as percentage for backward compatibility with template
        this.medicalCoverage = coverageFraction * 100;
        this.log(`Medical Coverage: ${this.medicalCoverage}%`);
        return this.medicalCoverage;
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
        this.wizardFlow.advance();
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





    get hasAdvancedEducation(): boolean {
        return !!this.selectedCareer?.advancedEducation && this.selectedCareer.advancedEducation.length > 0;
    }
}
