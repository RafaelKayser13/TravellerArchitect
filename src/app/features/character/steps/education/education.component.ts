import { Component, inject, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceService } from '../../../../core/services/dice.service';
import { DiceDisplayService } from '../../../../core/services/dice-display.service';
import { NATIONALITIES } from '../../../../data/nationalities';
import { LIFE_EVENTS } from '../../../../data/life-events';

// Event Interface
interface EduEvent {
    roll: number;
    desc: string;
    effect?: string;
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


export class EducationComponent {
    @ViewChild('resultsSection') resultsSection!: ElementRef;
    @ViewChild('skillsSection') skillsSection!: ElementRef;
    @Output() complete = new EventEmitter<void>();
    protected characterService = inject(CharacterService);
    protected diceService = inject(DiceService);

    educationType: 'University' | 'Academy' | 'None' = 'None';
    academyType: 'Army' | 'Navy' | 'Marines' | 'Scouts' | 'Spaceborne' = 'Army';


    // New: Admission Choice
    admissionMethod: 'Local' | 'OffWorld' = 'Local';
    admissionDMs = { local: 0, offWorld: 0 };
    canChooseOffWorld = true;

    // Data Lists
    // 2300AD University Curriculum List (Comprehensive)
    universitySkillList = [
        'Admin',
        'Advocate',
        'Animals (Handling)', 'Animals (Training)', 'Animals (Veterinary)',
        'Art (Holography)', 'Art (Instrument)', 'Art (Performer)', 'Art (Visual Media)', 'Art (Write)',
        'Astrogation',
        'Electronics (Comms)', 'Electronics (Computers)', 'Electronics (Remote Ops)', 'Electronics (Sensors)',
        'Engineer (Life Support)', 'Engineer (Power)', 'Engineer (Stutterwarp)',
        'Language (French)', 'Language (German)', 'Language (Spanish)', 'Language (Pentapod)', 'Language (Zhargon)',
        'Medic',
        'Navigation',
        'Profession (Belter)', 'Profession (Biologicals)', 'Profession (Civil Engineering)', 'Profession (Construction)', 'Profession (Hydroponics)', 'Profession (Polymers)',
        'Science (Archaeology)', 'Science (Astronomy)', 'Science (Biology)', 'Science (Chemistry)', 'Science (Cosmology)', 'Science (Cybernetics)', 'Science (Economics)', 'Science (Genetics)', 'Science (History)', 'Science (Linguistics)', 'Science (Philosophy)', 'Science (Physics)', 'Science (Planetology)', 'Science (Psionicology)', 'Science (Psychology)', 'Science (Robotics)', 'Science (Sophontology)', 'Science (Xenology)'
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



    eventsTable: EduEvent[] = [
        { roll: 2, desc: 'Psionic Contact. Potential for Psion career unlocked.', effect: 'Psion' },
        { roll: 3, desc: 'Tragedy. Graduation failed. Education terminated.', effect: 'Tragedy' },
        { roll: 4, desc: 'Prank Gone Wrong. Success: Rival. Fail: Enemy. Fail Crítica (2): Expelled.', effect: 'Prank' },
        { roll: 5, desc: 'Partying. Gain Carouse (Level 1).', effect: 'Carouse' },
        { roll: 6, desc: 'Friends. Gain 1D3 Allies.', effect: 'Allies' },
        { roll: 7, desc: 'Life Event.', lifeEvent: true },
        { roll: 8, desc: 'Political Movement. Success: 1 Ally, 1 Enemy. Fail: No effect.', effect: 'Politics' },
        { roll: 9, desc: 'Hobby. Gain any skill at Level 0 (except Jack-of-all-Trades).', effect: 'Hobby' },
        { roll: 10, desc: 'Interests from Tutor. Roll Skill 9+ for +1 Level and Rival.', effect: 'Tutor' },
        { roll: 11, desc: 'War/Draft. Participation required unless SOC 9+.', effect: 'War' },
        { roll: 12, desc: 'Recognition. SOC +1.', effect: 'Recognition' }
    ];

    // State
    admissionStatus: string = 'NotApplied';
    graduationStatus: string = 'Pending';
    eventResult: string = '';
    rollLog: string[] = [];

    // NPC Naming Prompt State
    isNpcPrompt = false;
    pendingNpcs: any[] = [];

    // Refactor State
    educationStep: 'Selection' | 'UniversitySkillSelect' | 'Studying' | 'Graduation' | 'AcademySkillSelect' | 'Finished' = 'Selection';

    // University Selection Vars
    selectedMajorSkill: string = '';
    selectedMinorSkill: string = '';

    // Academy Selection
    availableAcademySkills: string[] = [];
    selectedAcademySkills: { [key: number]: string } = {}; // 0, 1, 2

    // Inject DiceDisplayService
    protected diceDisplay = inject(DiceDisplayService);

    // Interactive Event State
    showHobbySelection = false;
    hobbySkillOptions: string[] = [];

    showTutorSelection = false;
    tutorSkillOptions: string[] = [];

    showWarOptions = false;
    canAvoidWar = false;

    expelledToPrison = false;
    warNextCareer: 'Drifter' | 'Army' | 'Marine' | 'Navy' | '' = '';

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
                // Academy - admitted but skill selection happens on graduation
                this.educationStep = 'Studying';
            }
            this.scrollToTop();
        }
    }

    ngOnInit() {
        // Ensure DMs are calculated when component loads and data is ready
        setTimeout(() => this.calculateAdmissionDMs(), 100);
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

    async apply() {
        this.rollLog = [];
        const char = this.characterService.character();

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
                target = 8;
                statMod = this.diceService.getModifier(int);
                statName = 'INT';
            }
            modifiers.push({ label: statName, value: statMod });
            totalDm += statMod;
        }

        // Modal Roll
        const rollTitle = this.educationType === 'Academy' ? `Admission check - Military Academy (${this.academyType})` : `Admission Check - University`;

        const roll = await this.diceDisplay.roll(
            rollTitle,
            2,
            totalDm,
            target,
            statName,
            undefined,
            modifiers
        );

        const total = roll + totalDm;
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
    }

    enterUniversity() {
        const isOffWorld = this.admissionMethod === 'OffWorld';
        if (isOffWorld) {
            this.characterService.updateCharacter({ education: { ...this.characterService.character().education, offworld: true } });
        }

        this.characterService.updateCharacteristics(this.modifyStat('EDU', 1));

        this.characterService.log(`**Entered University**: EDU +1. Select Major (Level 1) and Minor (Level 0).`);
        this.log(`Entered University. EDU +1. Please select your Major (Level 1) and Minor (Level 0) skills.`);
        this.educationStep = 'UniversitySkillSelect';
        this.scrollToTop();
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
        this.educationStep = 'Studying';
        this.scrollToTop();
    }

    async graduate() {
        await this.runEvent();

        // Check failure from event (Tragedy/Expelled)
        if (this.graduationStatus === 'Failed') {
            this.educationStep = 'Finished';
            this.scrollToTop();
            return;
        }

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

            if (char.characteristics.end.value >= 8) {
                modifiers.push({ label: 'END 8+', value: 1 });
                totalDm += 1;
            }
            if (char.characteristics.soc.value >= 8) {
                modifiers.push({ label: 'SOC 8+', value: 1 });
                totalDm += 1;
            }
        }

        const roll = await this.diceDisplay.roll(
            'Graduation Check',
            2,
            totalDm,
            target,
            statName,
            undefined,
            modifiers
        );

        const total = roll + totalDm;

        if (total >= target) {
            const honorsTarget = this.educationType === 'University' ? 10 : 11;
            if (total >= honorsTarget) {
                this.graduationStatus = 'Honors';
                this.characterService.log(`**Graduated with Honors!** (${this.educationType}) — Roll ${total} vs ${honorsTarget}`);
                this.log('Graduated with Honors!');
                this.applyGraduationBenefits(true);
            } else {
                this.graduationStatus = 'Graduated';
                this.characterService.log(`**Graduated** (${this.educationType}) — Roll ${total} vs ${target}`);
                this.log('Graduated successfully.');
                this.applyGraduationBenefits(false);
            }
            this.saveResult(true, this.graduationStatus === 'Honors');
            this.educationStep = 'Finished';
        } else {
            this.graduationStatus = 'Failed';
            this.characterService.log(`**Failed to Graduate** (${this.educationType})`);
            this.log('Failed to graduate.');
            this.saveResult(false, false);
            this.educationStep = 'Finished';
            // Academy failures that still allow career entry are handled in confirmAcademyGraduation or similar,
            // but for 2300AD failure to graduate university just means you start career normally.
        }
    }

    async runEvent() {
        const roll = await this.diceDisplay.roll('Education Event', 2, 0, 0, '', (result) => {
            const evt = this.eventsTable.find(e => e.roll === result);
            return evt ? evt.desc : 'Nothing significant.';
        }, [], this.eventsTable);

        const evt = this.eventsTable.find(e => e.roll === roll);
        this.eventResult = evt ? evt.desc : 'Nothing significant.';

        if (!evt) return;

        this.characterService.log(`**Education Event** (Roll ${roll}): ${this.eventResult}`);
        this.log(`Event [${roll}]: ${this.eventResult}`);

        switch (evt.effect) {
            case 'Psion':
                this.characterService.setPsionicPotential(true);
                break;
            case 'Tragedy':
                this.graduated = false;
                this.graduationStatus = 'Failed';
                this.characterService.setEducationStatus(false, false);
                this.characterService.log('**Tragedy**: Education terminated abruptly.');
                break;
            case 'Prank':
                await this.handlePrank();
                break;
            case 'Carouse':
                this.characterService.addSkill('Carouse', 1);
                break;
            case 'Allies':
                const rollResult = await this.diceDisplay.roll('Allies Gained (1D3)', 1, 0, 0, '', (res) => `Roll ${res} :: Gain ${Math.ceil(res / 2)} Allies during studies.`);
                const alliesCount = Math.ceil(rollResult / 2);
                this.pendingNpcs = [];
                for (let i = 0; i < alliesCount; i++) {
                    this.pendingNpcs.push({
                        id: crypto.randomUUID(),
                        name: `University Friend ${i + 1}`,
                        type: 'ally',
                        origin: 'Education (Roll 6)',
                        notes: 'A close friend from academic years.'
                    });
                }
                this.isNpcPrompt = true;
                break;
            case 'Politics':
                const polRoll = await this.diceDisplay.roll('Politics Check (SOC)', 2, 0, 8, 'SOC');
                if (polRoll + this.diceService.getModifier(this.characterService.character().characteristics.soc.value + this.characterService.character().characteristics.soc.modifier) >= 8) {
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
                break;
            case 'Hobby':
                this.openHobbySelection();
                break;
            case 'Tutor':
                this.openTutorSelection();
                break;
            case 'War':
                await this.handleWar();
                break;
            case 'Recognition':
                this.characterService.updateCharacteristics(this.modifyStat('SOC', 1));
                this.characterService.log('**Recognition**: Academic or social achievement! SOC +1.');
                break;
        }

        if (evt.lifeEvent) {
            this.characterService.log('**Education**: Triggering Life Event.');
            this.log('Triggering Life Event...');
            this.educationStep = 'Studying';
            
            // Generate a real roll for life event table
            const leRoll = await this.diceDisplay.roll('Life Event', 2, 0, 0, '', (res) => {
                const le = LIFE_EVENTS.find(e => e.roll === res);
                return le ? le.name : 'Unknown Event';
            }, [], LIFE_EVENTS);

            const leEffect = LIFE_EVENTS.find(e => e.roll === leRoll);
            
            if (leEffect) {
                this.characterService.log(`**Life Event** (Roll ${leRoll}): ${leEffect.name} - ${leEffect.description}`);
                
                // For education life events, we handle the basic ones. 
                // Complex ones (choice, injury) might need more UI, but for now we follow the existing pattern.
                for (const eff of leEffect.effects || []) {
                    if (eff.type === 'npc') {
                        this.characterService.addNpc({
                            id: crypto.randomUUID(),
                            name: `${leEffect.name} Contact`,
                            type: eff.npcType || 'contact',
                            origin: `Life Event during Education`,
                            notes: leEffect.description
                        });
                    } else if (eff.type === 'qualification-dm') {
                        this.characterService.updateDm('qualification', eff.value || 0);
                    } else if (eff.type === 'benefit-mod') {
                        this.characterService.updateFinances({ benefitRollMod: eff.value });
                    }
                }
            }
        }
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
        this.characterService.log('Used social standing to avoid the draft.');
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
        } else {
            const roll = Math.floor(Math.random() * 6) + 1;
            if (roll <= 3) this.warNextCareer = 'Army';
            else if (roll <= 5) this.warNextCareer = 'Marine';
            else this.warNextCareer = 'Navy';
            
            this.characterService.setNextCareer(this.warNextCareer);
            this.characterService.updateDm('qualification', 100); // Auto-qualify
            this.characterService.log(`**Drafted**: Education terminated by national service. Drafted into ${this.warNextCareer}.`);
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
        
        const roll = await this.diceDisplay.roll(`Tutor Check (${skill})`, 2, statMod, 9, 'EDU');
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
        this.educationStep = 'Studying';
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
        this.complete.emit();
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
