import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceService } from '../../../../core/services/dice.service';
import { DiceDisplayService } from '../../../../core/services/dice-display.service';
import { NATIONALITIES } from '../../../../data/nationalities';
import { EventEngineService } from '../../../../core/services/event-engine.service';
import { WizardFlowService } from '../../../../core/services/wizard-flow.service';
import { createEducationEvent, EDUCATION_EVENT_TABLE } from '../../../../data/events/shared/education-events';

// Event Interface
interface EduEvent {
    roll: number;
    desc: string;
    lifeEvent?: boolean;
}

import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';

@Component({
    selector: 'app-education',
    standalone: true,
    imports: [CommonModule, FormsModule, StepHeaderComponent],
    templateUrl: './education.component.html',
    styleUrls: ['./education.component.scss']
})
export class EducationComponent implements OnInit, OnDestroy {
    @ViewChild('resultsSection') resultsSection!: ElementRef;
    @ViewChild('skillsSection') skillsSection!: ElementRef;
    protected characterService = inject(CharacterService);
    protected diceService = inject(DiceService);
    private wizardFlow = inject(WizardFlowService);

    ngOnInit(): void {
        this.wizardFlow.registerValidator(5, () => this.canProceedToNext() || this.admissionStatus === 'Rejected');
        this.wizardFlow.registerFinishAction(5, () => this.finishStep());
        // Ensure DMs are calculated when component loads and data is ready
        setTimeout(() => this.calculateAdmissionDMs(), 100);
    }

    ngOnDestroy(): void {
        this.wizardFlow.unregisterStep(5);
    }

    educationType: 'University' | 'Academy' | 'None' = 'None';
    academyType: 'Army' | 'Navy' | 'Marines' | 'Scouts' | 'Spaceborne' = 'Army';


    // New: Admission Choice
    admissionMethod: 'Local' | 'OffWorld' = 'Local';
    admissionDMs = { local: 0, offWorld: 0 };
    canChooseOffWorld = true;

    // Data Lists
    // 2300AD University Curriculum List - Academic specializations only
    // Covers advanced academic and scientific disciplines suitable for higher education
    universitySkillList = [
        'Admin',
        'Advocate',
        'Art (Holography)',
        'Art (Write)',
        'Astrogation',
        'Broker',
        'Diplomat',
        'Electronics (Computers)',
        'Electronics (Remote Ops)',
        'Electronics (Sensors)',
        'Engineer (Life Support)',
        'Engineer (Power)',
        'Engineer (Stutterwarp)',
        'Language (Any)',
        'Leadership',
        'Medic',
        'Navigation',
        'Persuade',
        'Science (Archaeology)',
        'Science (Astronomy)',
        'Science (Biology)',
        'Science (Chemistry)',
        'Science (Cosmology)',
        'Science (Cybernetics)',
        'Science (Economics)',
        'Science (Genetics)',
        'Science (History)',
        'Science (Linguistics)',
        'Science (Philosophy)',
        'Science (Physics)',
        'Science (Planetology)',
        'Science (Psychology)',
        'Science (Sophontology)',
        'Science (Xenology)'
    ];

    // Legacy/Default major just for selection initialization if needed.


    // Updated Lists based on user request (2300AD specific)
    // Army: Drive, Athletics, Gun Combat, Recon, Melee, Heavy Weapons
    // Marines: Athletics, Vacc Suit, Tactics, Heavy Weapons, Gun Combat, Stealth
    // Navy: Pilot, Vacc Suit, Athletics, Gunner, Mechanic, Gun Combat
    // Scouts: Pilot, Astrogation, Sensors, Survival, Mechanic, Vacc Suit 
    academySkills: { [key: string]: string[] } = {
        'Army': ['Drive 0', 'Athletics 0', 'Gun Combat 0', 'Recon 0', 'Melee 0', 'Heavy Weapons 0'],
        'Marines': ['Athletics 0', 'Vacc Suit 0', 'Tactics 0', 'Heavy Weapons 0', 'Gun Combat 0', 'Stealth 0'],
        'Navy': ['Pilot 0', 'Vacc Suit 0', 'Athletics 0', 'Gunner 0', 'Mechanic 0', 'Gun Combat 0'],
        'Scouts': ['Pilot 0', 'Astrogation 0', 'Sensors 0', 'Survival 0', 'Mechanic 0', 'Vacc Suit 0'],
        'Spaceborne': ['Vacc Suit 0', 'Zero-G 0', 'Mechanic 0', 'Pilot 0', 'Astrogation 0', 'Sensors 0']
    };




    // State
    admissionStatus: string = 'NotApplied'; // NotApplied | Applying | Admitted | Rejected
    graduationStatus: string = 'Pending';
    eventResult: string = '';
    rollLog: string[] = [];

    // NPC Naming Prompt State
    isNpcPrompt = false;
    pendingNpcs: any[] = [];

    // Refactor State
    educationStep:
        | 'Selection'
        | 'AdmissionRoll'
        | 'AdmissionResult'
        | 'UniversitySkillSelect'
        | 'EventRoll'
        | 'EventResult'
        | 'GraduationRoll'
        | 'AcademySkillSelect'
        | 'Finished'
        = 'Selection';

    // Admission Phase State
    admissionRollTotal: number = 0;
    admissionTarget: number = 0;
    admissionModifiers: { label: string; value: number }[] = [];
    admissionStatName: string = '';
    admissionAnnouncement: string = '';

    // Event Phase State
    currentEvent: { roll: number; desc: string; effect?: string } | null = null;
    educationEvents: EduEvent[] = EDUCATION_EVENT_TABLE;

    // Graduation Phase State
    graduationRollTotal: number = 0;
    graduationTarget: number = 0;
    graduationModifiers: { label: string; value: number }[] = [];
    graduationHonorsTarget: number = 10;
    graduationAnnouncement: string = '';
    isGraduationHonors: boolean = false;

    // University Selection Vars
    selectedMajorSkill: string = '';
    selectedMinorSkill: string = '';

    // Academy Selection
    availableAcademySkills: string[] = [];
    selectedAcademySkills: { [key: number]: string } = {}; // 0, 1, 2

    // Inject DiceDisplayService
    protected diceDisplay = inject(DiceDisplayService);
    protected eventEngine = inject(EventEngineService);

    // Interactive Event State
    showHobbySelection = false;
    hobbySkillOptions: string[] = [];

    showTutorSelection = false;
    tutorSkillOptions: string[] = [];

    showWarOptions = false;
    canAvoidWar = false;

    expelledToPrison = false;
    warNextCareer: 'Drifter' | 'Army' | 'Marine' | 'Navy' | 'Merchant' | 'Scout' | 'Agent' | '' = '';

    psionicPotential = false;
    graduated = true; // Default, can be flipped by Tragedy/War/Prank

    constructor() {
        this.calculateAdmissionDMs();

        // Check if already done
        const char = this.characterService.character();
        if (char.education?.university !== null || char.education?.academy !== null) {
            if (char.education?.university) {
                this.educationType = 'University';
                this.admissionStatus = 'Admitted';
                this.graduationStatus = char.education.honors ? 'Honors' : 'Graduated';
            } else if (char.education?.academy) {
                this.educationType = 'Academy';
                this.admissionStatus = 'Admitted';
                this.graduationStatus = char.education.honors ? 'Honors' : 'Graduated';
            }

            // If already admitted, set the step and scroll
            if (this.educationType === 'University' && this.admissionStatus === 'Admitted') {
                this.educationStep = 'UniversitySkillSelect';
            } else if (this.admissionStatus === 'Admitted') {
                // Academy - admitted, proceed to event roll
                this.educationStep = 'EventRoll';
            }
            this.scrollToTop();
        }
    }

    resetAdmission() {
        this.admissionStatus = 'NotApplied';
        this.educationStep = 'Selection';
        this.educationType = 'None';
        this.calculateAdmissionDMs();
    }

    // Parse UWP for Tech Level (last digit usually, or after dash)
    getHexValue(char: string): number {
        if (!char) return 0;
        if (/[0-9]/.test(char)) return parseInt(char);
        if (/[A-H]/.test(char)) return char.charCodeAt(0) - 'A'.charCodeAt(0) + 10; // A=10
        return 0;
    }

    calculateAdmissionDMs() {
        const char = this.characterService.character();
        const world = char.homeworld;
        const nation = NATIONALITIES.find(n => n.name === char.nationality);

        console.log('Calculating DMs for:', { world, nation, origin: char.originType });

        // 1. Local DM (Based on Homeworld TL)
        let localDm = 0;
        if (world && world.uwp) {
            // UWP format: XXXXXXX-T. Extract T.
            // Handle various formats or missing dash
            let tlChar = '0';
            if (world.uwp.includes('-')) {
                const parts = world.uwp.split('-');
                if (parts.length > 1 && parts[1].length > 0) tlChar = parts[1][0];
            } else if (world.uwp.length >= 8) {
                tlChar = world.uwp[world.uwp.length - 1]; // Assume last char if no dash
            }

            const tl = this.getHexValue(tlChar);
            console.log('Detected TL:', tl);

            if (tl <= 7) localDm = -6;
            else if (tl <= 9) localDm = -4;
            else if (tl <= 11) localDm = -2;
            else localDm = 0; // 12+
        }

        // 2. Off-World DM (Based on Nation Tier)
        let offWorldDm = 0;
        if (nation) {
            const t = nation.tier;
            if (t === 1) offWorldDm = 2;
            else if (t === 2) offWorldDm = 0;
            else if (t === 3) offWorldDm = -2;
            else if (t === 4) offWorldDm = -4;
            else if (t === 5) offWorldDm = -6;
            else offWorldDm = -8;
        }

        // 3. Spacer Penalty
        if (char.originType === 'Spacer') {
            localDm -= 2;
            offWorldDm -= 2;
        }

        this.admissionDMs = { local: localDm, offWorld: offWorldDm };
    }

    getAcademyValidation(type: string): { available: boolean, reason?: string } {
        const char = this.characterService.character();
        const nation = NATIONALITIES.find(n => n.name === char.nationality);
        const tier = nation?.tier || 3;
        const stats = char.characteristics;

        // 1. Origin Restrictions
        if (type === 'Army' && char.originType === 'Spacer') {
            return { available: false, reason: 'REJECTED: Spacers cannot join the Army in Term 1.' };
        }

        // 2. Nationality Tier Restrictions (2300AD Rule 248)
        if (tier >= 5 && (type === 'Navy' || type === 'Scouts')) {
            return { available: false, reason: `REJECTED: ${char.nationality} (Tier ${tier}) does not support ${type} careers.` };
        }

        // 3. Attribute Requirements (as per CAREERS definitions)
        if (type === 'Army' || type === 'Marines' || type === 'Navy') {
            if (stats.str.value < 5 || stats.dex.value < 5 || stats.end.value < 5) {
                return { available: false, reason: 'REJECTED: Requires STR 5+, DEX 5+, and END 5+.' };
            }
        }

        if (type === 'Scouts') {
            if (stats.int.value < 6 || stats.end.value < 6) {
                return { available: false, reason: 'REJECTED: Requires INT 6+ and END 6+.' };
            }
        }

        return { available: true };
    }

    isAcademySkillSelected(skill: string): boolean {
        return Object.values(this.selectedAcademySkills).includes(skill);
    }

    // Phase 1: Initialize Admission (calculate DMs, show roll screen)
    initAdmission() {
        this.rollLog = [];
        this.admissionStatus = 'Applying'; // Mark that application has started
        const char = this.characterService.character();

        // Core Rulebook Rule 591: University admission only available in Terms 1-3
        if (this.educationType === 'University') {
            const currentTerm = char.careerHistory.length + 1;
            if (currentTerm > 3) {
                this.admissionStatus = 'Rejected';
                this.characterService.log(`**University Admission Denied**: Universities are only available in Terms 1-3 (you are in Term ${currentTerm})`);
                this.educationStep = 'AdmissionResult';
                this.scrollToTop();
                return;
            }
        }

        // Select DM based on method
        const admissionDm = this.admissionMethod === 'Local' ? this.admissionDMs.local : this.admissionDMs.offWorld;

        const edu = char.characteristics.edu.value + char.characteristics.edu.modifier;
        const int = char.characteristics.int.value + char.characteristics.int.modifier;
        const end = char.characteristics.end.value + char.characteristics.end.modifier;

        let target = 0;
        let statMod = 0;
        let statName = '';
        let totalDm = 0;
        const modifiers: { label: string, value: number }[] = [];

        // Base Admission DM
        modifiers.push({ label: `Method (${this.admissionMethod})`, value: admissionDm });
        totalDm += admissionDm;

        if (this.educationType === 'University') {
            target = 6;
            statName = 'EDU';
            statMod = this.diceService.getModifier(edu);
            modifiers.push({ label: 'EDU', value: statMod });
            totalDm += statMod;

            if (char.characteristics.soc.value >= 9) {
                modifiers.push({ label: 'SOC 9+', value: 1 });
                totalDm += 1;
            }

        } else if (this.educationType === 'Academy') {
            if (this.academyType === 'Army') {
                target = 7;
                statMod = this.diceService.getModifier(end);
                statName = 'END';
            } else if (this.academyType === 'Marines') {
                target = 8;
                statMod = this.diceService.getModifier(end);
                statName = 'END';
            } else {
                target = 9;
                statMod = this.diceService.getModifier(int);
                statName = 'INT';
            }
            modifiers.push({ label: statName, value: statMod });
            totalDm += statMod;

            // Rule 614: Academy admission bonuses (2300AD Book 02)
            if (char.characteristics.end.value >= 8) {
                modifiers.push({ label: 'END 8+', value: 1 });
                totalDm += 1;
            }
            if (char.characteristics.soc.value >= 8) {
                modifiers.push({ label: 'SOC 8+', value: 1 });
                totalDm += 1;
            }
        }

        // 3. Term Penalties (Core Rulebook Rules 592, 614)
        const term = char.careerHistory.length + 1; // Current term number
        if (this.educationType === 'University') {
            if (term === 2) {
                totalDm -= 1;
                modifiers.push({ label: 'Term 2 Penalty', value: -1 });
            } else if (term === 3) {
                totalDm -= 2;
                modifiers.push({ label: 'Term 3 Penalty', value: -2 });
            }
        } else if (this.educationType === 'Academy') {
            if (term === 2) {
                totalDm -= 2;
                modifiers.push({ label: 'Term 2 Penalty', value: -2 });
            } else if (term === 3) {
                totalDm -= 4;
                modifiers.push({ label: 'Term 3 Penalty', value: -4 });
            }
        }

        // Save state and move to AdmissionRoll screen
        this.admissionTarget = target;
        this.admissionModifiers = modifiers;
        this.admissionStatName = statName;
        const offWorldNote = this.admissionMethod === 'OffWorld' ? ' (Off-World: grants EDU +1 if admitted)' : '';
        this.admissionAnnouncement = `Roll 2D6 + ${statName} modifier and meet or exceed ${target}+.${offWorldNote}`;
        this.educationStep = 'AdmissionRoll';
        this.scrollToTop();
    }

    // Phase 2: Execute Admission Roll
    async executeAdmissionRoll() {
        const modifiers = this.admissionModifiers;
        const target = this.admissionTarget;
        let totalDm = 0;
        modifiers.forEach(m => totalDm += m.value);

        let statName = 'EDU';
        modifiers.forEach(m => {
            if (m.label === 'EDU' || m.label === 'END' || m.label === 'INT') {
                statName = m.label;
            }
        });

        // Modal Roll
        const rollTitle = this.educationType === 'Academy' ? `Admission check - Military Academy (${this.academyType})` : `Admission Check - University`;
        const eduLabel = this.educationType === 'University' ? 'University' : `${this.academyType} Academy`;
        const offWorldNote = this.admissionMethod === 'OffWorld' ? ' (Off-World application: harder but grants EDU +1 if admitted)' : '';

        const roll = await this.diceDisplay.roll(
            rollTitle,
            2,
            totalDm,
            target,
            statName,
            undefined,
            modifiers,
            undefined,
            {
                phase: `EDUCATION · ADMISSION · ${eduLabel.toUpperCase()}`,
                successContext: `Admission granted. You begin your studies immediately.`,
                failureContext: `Application rejected. You may proceed directly to your career.`
            }
        );

        const total = roll + totalDm;
        this.admissionRollTotal = total;
        this.log(`Roll: ${roll} + DM ${totalDm} = ${total} vs ${target}`);

        if (total >= target) {
            this.admissionStatus = 'Admitted';
            this.characterService.log(`**Admitted** to ${this.educationType === 'University' ? 'University' : `${this.academyType} Academy`} (${this.admissionMethod}) — Roll ${total} vs ${target}`);
            if (this.educationType === 'University') this.enterUniversity();
            else this.enterAcademy();
        } else {
            this.admissionStatus = 'Rejected';
            this.characterService.log(`**Admission Rejected** (${this.educationType === 'University' ? 'University' : `${this.academyType} Academy`}) — Roll ${total} vs ${target}`);
        }

        // Move to AdmissionResult screen
        this.educationStep = 'AdmissionResult';
        this.scrollToTop();
    }

    // Legacy method for backward compatibility (calls initAdmission instead)
    apply() {
        this.initAdmission();
    }

    // Proceed from AdmissionResult to next phase
    proceedFromAdmissionResult() {
        if (this.admissionStatus === 'Rejected') {
            this.resetAdmission();
            return;
        }

        // Admitted
        if (this.educationType === 'University') {
            this.educationStep = 'UniversitySkillSelect';
        } else if (this.educationType === 'Academy') {
            // Academy goes directly to event roll
            this.initEventRoll();
        }
        this.scrollToTop();
    }

    // Proceed from EventResult to next phase (or finish if expelled)
    proceedFromEventResult() {
        // Close any open event modals
        this.showHobbySelection = false;
        this.showTutorSelection = false;
        this.showWarOptions = false;

        // Clear event engine state to prevent lingering events
        this.eventEngine.currentEvent.set(null);
        this.eventEngine.eventStack.set([]); // clear orphaned stack entries (prevents leak to Career screen)

        // Check if expelled/tragedy
        if (this.graduationStatus === 'Failed') {
            this.educationStep = 'Finished';
        } else {
            // Initialize graduation roll
            this.initGraduationRoll();
        }
        this.scrollToTop();
    }

    // Proceed from confirmAcademyGraduation to finish
    proceedFromAcademySkillSelect() {
        this.confirmAcademyGraduation();
        this.educationStep = 'Finished';
        this.scrollToTop();
    }

    enterUniversity() {
        const isOffWorld = this.admissionMethod === 'OffWorld';
        if (isOffWorld) {
            this.characterService.updateCharacter({ education: { ...this.characterService.character().education, offworld: true } });
        }

        this.characterService.updateCharacteristics(this.modifyStat('EDU', 1));

        this.characterService.log(`**Entered University**: EDU +1. Select Major (Level 1) and Minor (Level 0).`);
        this.log(`Entered University. EDU +1. Please select your Major (Level 1) and Minor (Level 0) skills.`);
        // Note: educationStep is controlled by AdmissionResult screen, not here
    }

    enterAcademy() {
        const char = this.characterService.character();
        const isOffWorld = this.admissionMethod === 'OffWorld';

        this.characterService.updateCharacter({
            education: {
                ...char.education,
                academy: true,
                offworld: isOffWorld
            }
        });

        const skills = this.academySkills[this.academyType] || [];
        skills.forEach(s => {
            const parts = s.split(' ');
            const name = parts.slice(0, parts.length - 1).join(' ');
            this.characterService.addSkill(name, 0);
        });
        this.characterService.log(`**Entered ${this.academyType} Academy**: Basic Training granted (Service Skills at Level 0)`);
        this.log(`Entered ${this.academyType} Academy. Gained Basic Training (Service Skills 0).`);
        // Note: educationStep is controlled by AdmissionResult screen, not here
    }

    // Phase 1: Initialize Graduation Roll (calculate DMs, show roll screen)
    initGraduationRoll() {
        const char = this.characterService.character();
        const int = char.characteristics.int.value + char.characteristics.int.modifier;
        const edu = char.characteristics.edu.value + char.characteristics.edu.modifier;

        let target = 0;
        let statMod = 0;
        let statName = '';
        let totalDm = 0;
        const modifiers: { label: string, value: number }[] = [];

        if (this.educationType === 'University') {
            target = 6;
            statName = 'INT';
            statMod = this.diceService.getModifier(int);
            modifiers.push({ label: 'INT', value: statMod });
            totalDm += statMod;
        } else {
            target = 7;
            statName = 'INT';
            statMod = this.diceService.getModifier(int);
            modifiers.push({ label: 'INT', value: statMod });
            totalDm += statMod;
        }

        // Save state and move to GraduationRoll screen
        this.graduationTarget = target;
        this.graduationModifiers = modifiers;
        this.graduationHonorsTarget = this.educationType === 'University' ? 10 : 11;
        this.graduationAnnouncement = `Roll 2D6 + INT modifier and meet or exceed ${target}+ to graduate. Roll ${this.graduationHonorsTarget}+ for Honors.`;
        this.educationStep = 'GraduationRoll';
        this.scrollToTop();
    }

    // Phase 2: Execute Graduation Roll
    async executeGraduationRoll() {
        // Close any open event modals when entering graduation phase
        this.showHobbySelection = false;
        this.showTutorSelection = false;
        this.showWarOptions = false;

        // Clear event engine state to prevent lingering events
        this.eventEngine.currentEvent.set(null);
        this.eventEngine.eventStack.set([]); // clear orphaned stack entries

        const modifiers = this.graduationModifiers;
        const target = this.graduationTarget;
        let totalDm = 0;
        modifiers.forEach(m => totalDm += m.value);

        let statName = 'INT';

        const roll = await this.diceDisplay.roll(
            'Graduation Check',
            2,
            totalDm,
            target,
            statName,
            undefined,
            modifiers,
            undefined,
            {
                phase: `EDUCATION · GRADUATION · ${this.educationType.toUpperCase()}`,
                successContext: `You graduate successfully. Benefits are applied to your character sheet.`,
                failureContext: `You fail to graduate. ${this.educationType === 'Academy' ? 'A roll above 2 still grants automatic career entry (Rule 632).' : 'No education benefits are gained.'}`
            }
        );

        const total = roll + totalDm;
        this.graduationRollTotal = total;

        if (total >= target) {
            const honorsTarget = this.educationType === 'University' ? 10 : 11;
            if (total >= honorsTarget) {
                this.isGraduationHonors = true;
                this.graduationStatus = 'Honors';
                this.characterService.log(`**Graduated with Honors!** (${this.educationType}) — Roll ${total} vs ${honorsTarget}`);
                this.log('Graduated with Honors!');
                this.applyGraduationBenefits(true);
            } else {
                this.isGraduationHonors = false;
                this.graduationStatus = 'Graduated';
                this.characterService.log(`**Graduated** (${this.educationType}) — Roll ${total} vs ${target}`);
                this.log('Graduated successfully.');
                this.applyGraduationBenefits(false);
            }
            this.saveResult(true, this.isGraduationHonors);

            // University goes directly to Finished, Academy goes to AcademySkillSelect
            if (this.educationType === 'University') {
                this.educationStep = 'Finished';
                this.wizardFlow.notifyValidation();
            } else {
                this.educationStep = 'AcademySkillSelect';
            }
        } else {
            this.graduationStatus = 'Failed';
            this.characterService.log(`**Failed to Graduate** (${this.educationType})`);
            this.log('Failed to graduate.');

            // Rule 632: Academy failures that still allow automatic career entry (Roll > 2)
            if (this.educationType === 'Academy' && roll > 2) {
                // Don't force a specific career - let the player choose any career
                // They've earned the right to enter any career due to their academy training
                this.log(`Rule 632: Despite failure, your time in the academy grants you automatic entry to any career of your choice.`);
                this.characterService.log(`**Academy Discharge**: Granted automatic career entry (Rule 632) - choose any career next term.`);
                // No forcedCareer set - player chooses freely
            }

            this.saveResult(false, false);
            this.educationStep = 'Finished';
            this.wizardFlow.notifyValidation();
        }

        this.scrollToTop();
    }

    // Legacy method for backward compatibility
    async graduate() {
        await this.runEvent();

        // Check failure from event (Tragedy/Expelled)
        if (this.graduationStatus === 'Failed') {
            this.educationStep = 'Finished';
            this.scrollToTop();
            return;
        }

        // New flow: initialize the graduation roll
        this.initGraduationRoll();
    }

    private registerEducationHandlers() {
        this.eventEngine.registerCustomHandler('PSIONIC_CONTACT', () => {
            this.characterService.setPsionicPotential(true);
            this.characterService.log('**Psionic Potential**: Latent abilities discovered during studies.');
        });

        this.eventEngine.registerCustomHandler('TRAGEDY', () => {
            this.graduated = false;
            this.graduationStatus = 'Failed';
            this.characterService.setEducationStatus(false, false);
            this.characterService.log('**Tragedy**: Education terminated abruptly.');
        });

        this.eventEngine.registerCustomHandler('PRANK', async () => {
            await this.handlePrank();
        });

        this.eventEngine.registerCustomHandler('FRIENDS', async () => {
            const rollResult = await this.diceDisplay.roll('Allies Gained (1D3)', 1, 0, 0, '', (res) => `Roll ${res} :: Gain ${Math.ceil(res / 2)} Allies during studies.`);
            const alliesCount = Math.ceil(rollResult / 2);
            for (let i = 0; i < alliesCount; i++) {
                this.characterService.addNpc({
                    id: crypto.randomUUID(),
                    name: `University Friend ${i + 1}`,
                    type: 'ally',
                    origin: 'Education (Roll 6)',
                    notes: 'A close friend from academic years.'
                });
            }
            this.characterService.log(`**Friends**: Gained ${alliesCount} ally/allies from academic network.`);
        });

        this.eventEngine.registerCustomHandler('POLITICS', async () => {
            const char = this.characterService.character();
            const statMod = this.diceService.getModifier(char.characteristics.soc.value + char.characteristics.soc.modifier);
            const polMods = statMod !== 0 ? [{ label: 'SOC', value: statMod }] : [];
            const polRoll = await this.diceDisplay.roll('Politics Check (SOC)', 2, statMod, 8, 'SOC', undefined, polMods);
            
            if (polRoll + statMod >= 8) {
                this.characterService.addNpc({
                    id: crypto.randomUUID(),
                    name: 'Political Ally',
                    type: 'ally',
                    origin: 'Political Movement (Roll 8)',
                    notes: 'A powerful political supporter. Met during political activism.'
                });
                this.characterService.addNpc({
                    id: crypto.randomUUID(),
                    name: 'Political Enemy',
                    type: 'enemy',
                    origin: 'Political Movement (Roll 8)',
                    notes: 'An ideological rival. Opponent during the campus political movement.'
                });
            }
        });

        this.eventEngine.registerCustomHandler('HOBBY', () => {
            this.openHobbySelection();
        });

        this.eventEngine.registerCustomHandler('TUTOR', () => {
            this.openTutorSelection();
        });

        this.eventEngine.registerCustomHandler('WAR', async () => {
            await this.handleWar();
        });
    }

    // Phase 1: Initialize Event Roll
    initEventRoll() {
        this.educationStep = 'EventRoll';
        this.scrollToTop();
    }

    // Phase 2: Execute Event Roll
    async executeEventRoll() {
        this.registerEducationHandlers();

        const roll = await this.diceDisplay.roll('Education Event', 2, 0, 0, '', (result) => {
            const entry = createEducationEvent(result);
            return entry.ui.description;
        }, [], undefined, {
            phase: `EDUCATION · TERM EVENT · ${this.educationType.toUpperCase()}`,
            successContext: `The event unfolds. Review the outcome below.`,
            failureContext: ``,
            debugTableData: EDUCATION_EVENT_TABLE
        });

        this.characterService.log(`**Education Event** (Roll ${roll})`);

        const event = createEducationEvent(roll);
        this.currentEvent = { roll: roll, desc: event.ui.description };
        this.eventEngine.registerEvent(event);
        this.eventEngine.triggerEvent(event.id);

        // Execute effects from the event's default option
        // This ensures stats, skills, and custom handlers are processed
        if (event.ui.options && event.ui.options.length > 0) {
            const firstOption = event.ui.options[0];
            if (firstOption.effects) {
                await this.eventEngine.applyEffects(firstOption.effects);
            }
        }

        // Move to EventResult screen
        this.educationStep = 'EventResult';
        this.scrollToTop();
    }

    // Legacy method for backward compatibility
    async runEvent() {
        await this.executeEventRoll();
    }

    async handlePrank() {
        const rawRoll = await this.diceDisplay.roll('Prank Check (SOC)', 2, 0, 8, 'SOC');
        if (rawRoll === 2) { // Critical failure on natural 2
            this.graduated = false;
            this.graduationStatus = 'Failed';
            this.expelledToPrison = true;
            this.characterService.setEducationStatus(false, false);
            this.characterService.setNextCareer('Prisoner');
            this.characterService.log('**EXPELLED**: Prank went catastrophically wrong. Mandatory transition to Prisoner.');
            this.educationStep = 'Finished';
            this.wizardFlow.notifyValidation();
            return;
        }

        if (rawRoll >= 8) {
            this.characterService.addNpc({
                id: crypto.randomUUID(),
                name: 'Prank Victim',
                type: 'rival',
                origin: 'Prank Gone Wrong (Roll 4)',
                notes: 'A fellow student targeted by your prank. They didn\'t find it funny.'
            });
        } else {
            this.characterService.addNpc({
                id: crypto.randomUUID(),
                name: 'Vengeful Student',
                type: 'enemy',
                origin: 'Prank Gone Wrong (Roll 4)',
                notes: 'They took your prank personally. Swore revenge after the incident.'
            });
        }
    }

    async handleWar() {
        const char = this.characterService.character();
        if (char.characteristics.soc.value >= 9) {
            this.canAvoidWar = true;
        } else {
            this.canAvoidWar = false;
        }
        this.showWarOptions = true;
    }

    avoidWar() {
        this.showWarOptions = false;
        this.graduated = true;
        this.graduationStatus = 'Passed';
        this.characterService.log('Used social standing to avoid the draft.');
        this.characterService.log('**Education Completed**: Successfully graduated with honors (avoided draft).');
        // Continue normally to graduation
        this.educationStep = 'Finished';
        this.wizardFlow.notifyValidation();
        this.scrollToTop();
    }

    async joinWar(method: 'Flee' | 'Draft') {
        this.showWarOptions = false;
        this.graduated = false;
        this.graduationStatus = 'Failed';
        this.characterService.setEducationStatus(false, false);

        if (method === 'Flee') {
            this.warNextCareer = 'Drifter';
            this.characterService.setNextCareer('Drifter');
            this.characterService.updateDm('qualification', 100); // Auto-qualify
            this.characterService.log('**Fleeing**: Resigned from education to avoid draft. Next Career: Drifter.');
            // Terminate education immediately
            this.educationStep = 'Finished';
            this.wizardFlow.notifyValidation();
            this.scrollToTop();
        } else {
            // Draft: Roll for career assignment — Core Rulebook table: 1=Navy,2=Army,3=Marine,4=Merchant,5=Scout,6=Agent
            // Note: Event-driven drafts may occur more than once per lifetime (Core Rulebook p.17: "This can cause a Traveller to be drafted more than once")
            const roll = await this.diceDisplay.roll(
                'Military Draft Assignment',
                1,
                0,
                0,
                '',
                (result) => {
                    if (result === 1) return 'NAVY (1)';
                    else if (result === 2) return 'ARMY (2)';
                    else if (result === 3) return 'MARINE (3)';
                    else if (result === 4) return 'MERCHANT (4)';
                    else if (result === 5) return 'SCOUT (5)';
                    else return 'AGENT (6)';
                }
            );

            if (roll === 1) this.warNextCareer = 'Navy';
            else if (roll === 2) this.warNextCareer = 'Army';
            else if (roll === 3) this.warNextCareer = 'Marine';
            else if (roll === 4) this.warNextCareer = 'Merchant';
            else if (roll === 5) this.warNextCareer = 'Scout';
            else this.warNextCareer = 'Agent';

            this.characterService.setNextCareer(this.warNextCareer);
            this.characterService.updateDm('qualification', 100); // Auto-qualify
            this.characterService.log(`**Drafted**: Education terminated by national service. Drafted into ${this.warNextCareer}.`);

            // Terminate education after roll
            this.educationStep = 'Finished';
            this.wizardFlow.notifyValidation();
            this.scrollToTop();
        }
    }

    openHobbySelection() {
        // Full skill list excluding Jack-of-all-Trades
        this.hobbySkillOptions = [
            'Admin', 'Advocate', 'Animals (Handling)', 'Animals (Training)', 'Animals (Veterinary)',
            'Art (Holography)', 'Art (Instrument)', 'Art (Performer)', 'Art (Visual Media)', 'Art (Write)',
            'Astrogation', 'Athletics (Dexterity)', 'Athletics (Endurance)', 'Athletics (Strength)',
            'Broker', 'Carouse', 'Deception', 'Diplomat', 'Drive (Hover)', 'Drive (Mole)', 'Drive (Track)', 'Drive (Walker)', 'Drive (Wheel)',
            'Electronics (Comms)', 'Electronics (Computers)', 'Electronics (Remote Ops)', 'Electronics (Sensors)',
            'Engineer (Life Support)', 'Engineer (Power)', 'Engineer (Stutterwarp)',
            'Explosives', 'Flyer (Airship)', 'Flyer (Ornithopter)', 'Flyer (Rotor)', 'Flyer (Vectored Thrust)', 'Flyer (Wing)',
            'Gambler', 'Gun Combat (Archaic)', 'Gun Combat (Energy)', 'Gun Combat (Slug)',
            'Gunner (Capital)', 'Gunner (Ortillery)', 'Gunner (Screen)', 'Gunner (Turret)',
            'Heavy Weapons (Artillery)', 'Heavy Weapons (Man Portable)', 'Heavy Weapons (Vehicle)',
            'Investigate', 'Language (Any)', 'Leadership', 'Mechanic', 'Medic',
            'Melee (Blade)', 'Melee (Bludgeon)', 'Melee (Unarmed)', 'Navigation',
            'Persuade', 'Pilot (Capital Ships)', 'Pilot (Small Craft)', 'Pilot (Spacecraft)',
            'Profession (Belter)', 'Profession (Biologicals)', 'Profession (Civil Engineering)', 'Profession (Construction)', 'Profession (Hydroponics)', 'Profession (Polymers)',
            'Recon', 'Science (Biology)', 'Science (Chemistry)', 'Science (History)', 'Science (Physics)', 'Science (Psychology)', 'Science (Sophontology)', 'Science (Xenology)',
            'Seafarer (Ocean Ship)', 'Seafarer (Personal)', 'Seafarer (Sail)', 'Seafarer (Submarine)',
            'Stealth', 'Steward', 'Streetwise', 'Survival', 'Tactics (Military)', 'Tactics (Naval)', 'Vacc Suit'
        ];
        this.showHobbySelection = true;
    }

    selectHobbySkill(skill: string) {
        // Gain at level 0. If already possessed, increase by 1 level.
        this.characterService.addSkill(skill, 0); 
        this.showHobbySelection = false;
        this.characterService.log(`**Hobby**: Acquired interest in ${skill} (Leve 0).`);
        this.log(`Acquired skill: ${skill} (Level 0).`);
    }

    openTutorSelection() {
        // Skills studied this term
        const available = [];
        if (this.selectedMajorSkill) available.push(this.selectedMajorSkill);
        if (this.selectedMinorSkill) available.push(this.selectedMinorSkill);

        // If Academy, use those?
        if (this.educationType === 'Academy') {
            Object.values(this.selectedAcademySkills).forEach(s => available.push(s));
        }

        this.tutorSkillOptions = available.length > 0 ? available : ['Admin', 'Medic', 'Science (Any)'];
        this.showTutorSelection = true;
    }

    async selectTutorSkill(skill: string) {
        this.showTutorSelection = false;
        const char = this.characterService.character();
        const stat = 'edu';
        const charStat = (char.characteristics as any)[stat];
        const statMod = this.diceService.getModifier(charStat.value + charStat.modifier);
        
        const tutorMods = statMod !== 0 ? [{ label: 'EDU', value: statMod }] : [];
        const roll = await this.diceDisplay.roll(`Tutor Check (${skill})`, 2, statMod, 9, 'EDU', undefined, tutorMods);
        if (roll + statMod >= 9) {
            this.characterService.addSkill(skill, 1);
            this.characterService.addNpc({
                id: crypto.randomUUID(),
                name: 'Exacting Tutor',
                type: 'rival',
                origin: 'Tutor Interest (Roll 10)',
                notes: 'A brilliant but demanding academic mentor. Demanded perfection from their students.'
            });
            this.characterService.log(`**Tutor Mastery**: Improved ${skill} through rigorous study. Gained Tutor as a Rival.`);
        } else {
            this.characterService.log(`**Tutor Failure**: Study sessions with the tutor yielded no measurable gains.`);
        }
    }

    confirmUniversitySkills() {
        if (!this.selectedMajorSkill || !this.selectedMinorSkill) return;

        this.characterService.addSkill(this.selectedMajorSkill, 1);
        this.characterService.addSkill(this.selectedMinorSkill, 0);

        this.characterService.log(`**University Curriculum**: Major: ${this.selectedMajorSkill} (1), Minor: ${this.selectedMinorSkill} (0)`);
        this.log(`Selected Curriculum: ${this.selectedMajorSkill} (1), ${this.selectedMinorSkill} (0).`);

        // Move to event roll phase
        this.initEventRoll();
    }

    toggleAcademySkill(skill: string) {
        // If already selected, remove it
        // We are using an object {0: 'Skill', 1: 'Skill'} for selection to track slots? 
        // Or just a dictionary? The template uses selectedAcademySkills[0] etc.
        // Let's treat selectedAcademySkills as a simple object acting as a set/array.

        const values = Object.values(this.selectedAcademySkills);
        if (values.includes(skill)) {
            // Remove
            const key = Object.keys(this.selectedAcademySkills).find(k => this.selectedAcademySkills[parseInt(k)] === skill);
            if (key) delete this.selectedAcademySkills[parseInt(key)];
        } else {
            // Add if less than 3
            if (values.length < 3) {
                // Find first empty slot 0, 1, 2
                for (let i = 0; i < 3; i++) {
                    if (!this.selectedAcademySkills[i]) {
                        this.selectedAcademySkills[i] = skill;
                        break;
                    }
                }
            }
        }
    }

    confirmAcademyGraduation() {
        const skills = Object.values(this.selectedAcademySkills);
        if (skills.length !== 3) return;

        skills.forEach(s => {
            // Skill name might have " 0" from the list? 
            // The list in academySkills has " 0" suffix. We need to strip it or handle it.
            // In enterAcademy we strip it.
            // Let's make sure availableAcademySkills are clean names.
            // We will handle stripping in applyGraduationBenefits when populating availableAcademySkills.
            this.characterService.addSkill(s, 1);
        });

        this.characterService.log(`**Academy Graduation** (${this.academyType}): Improved ${skills.join(', ')} to Level 1`);
        this.log(`Academy Training Complete. Improved: ${skills.join(', ')}.`);

        // Map Academy Type to Career Name for forced entry
        let careerName = this.academyType as string;
        if (careerName === 'Marines') careerName = 'Marine';
        if (careerName === 'Scouts') careerName = 'Scout';

        // Set forced career to skip qualification roll in the career step
        this.characterService.updateCharacter({ forcedCareer: careerName });

        // Check HonorsCommission
        if (this.graduationStatus === 'Honors') {
            const char = this.characterService.character();
            this.characterService.updateCharacter({
                education: {
                    ...char.education,
                    honors: true
                }
            });
            this.characterService.log(`**Honors Commission**: Commissioned as Rank 1 Officer in ${careerName}`);
            this.log(`Honors: Commissioned as Rank 1 Officer in ${careerName}.`);
        }

        this.educationStep = 'Finished';
        this.wizardFlow.notifyValidation();
    }

    applyGraduationBenefits(honors: boolean) {
        if (this.educationType === 'University') {
            // Pass: +1 EDU. Increase Major +1, Minor +1.
            this.characterService.updateCharacteristics(this.modifyStat('EDU', 1));

            this.characterService.addSkill(this.selectedMajorSkill, 1); // Increases existing level by 1? 
            // CharacterService.addSkill logic usually adds levels? 
            // If it adds, then passing 1 adds +1. Valid.
            this.characterService.addSkill(this.selectedMinorSkill, 1);

            if (honors) {
                this.characterService.updateCharacteristics(this.modifyStat('SOC', 1));
                this.log('Honors Bonus: SOC +1, DM+2 to Qualification.');
            }
            this.educationStep = 'Finished';
        } else {
            // Academy
            // Pass: +1 EDU. Choose 3 Service Skills at Level 1.
            this.characterService.updateCharacteristics(this.modifyStat('EDU', 1));

            const rawSkills = this.academySkills[this.academyType] || [];
            // Strip " 0" suffix for display
            this.availableAcademySkills = rawSkills.map(s => {
                const parts = s.split(' ');
                return parts.slice(0, parts.length - 1).join(' ');
            });

            this.log('Graduated. Select 3 skills to improve to Level 1.');
            this.educationStep = 'AcademySkillSelect';
        }
    }


    modifyStat(statInfo: string, val: number): any {
        const char = this.characterService.character();
        // Deep copy to avoid mutating state directly
        const chars = JSON.parse(JSON.stringify(char.characteristics));
        const key = statInfo.toLowerCase() as keyof typeof chars;

        if (chars[key]) {
            chars[key].value += val;
            chars[key].modifier = this.diceService.getModifier(chars[key].value);
        }
        return chars;
    }

    saveResult(success: boolean, honors: boolean) {
        const char = this.characterService.character();
        const existingEdu = char.education || {};

        const update = {
            ...existingEdu,
            university: this.educationType === 'University' ? success : (existingEdu.university || false),
            academy: this.educationType === 'Academy' ? success : (existingEdu.academy || false),
            honors: honors || (existingEdu.honors || false),
            fail: !success
        };

        // Add 4 years
        const currentAge = char.age;

        this.characterService.updateCharacter({
            education: update,
            age: currentAge + 4
        });
    }

    canProceedToNext(): boolean {
        return this.educationStep === 'Finished' && this.graduationStatus !== 'Pending';
    }

    finishStep() {
        // Close any open event modals before finishing
        this.showHobbySelection = false;
        this.showTutorSelection = false;
        this.showWarOptions = false;

        // Clear event engine state to prevent lingering events
        this.eventEngine.currentEvent.set(null);
        this.eventEngine.eventStack.set([]); // clear orphaned stack entries

        this.wizardFlow.advance();
    }

    // NPC Confirmation
    confirmNpcs() {
        for (const npc of this.pendingNpcs) {
            this.characterService.addNpc(npc);
        }
        this.isNpcPrompt = false;
        this.pendingNpcs = [];
    }

    log(msg: string) {
        console.log(`[EducationComponent] ${msg}`);
        // this.rollLog.push(msg); // Removed for UI cleanliness
    }

    private scrollToTop() {
        setTimeout(() => {
            const content = document.querySelector('.wizard-content');
            if (content) content.scrollTop = 0;
        }, 100);
    }
}

function fromSigned(n: number): string {
    return n >= 0 ? `+${n}` : `${n}`;
}
