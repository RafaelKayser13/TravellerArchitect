import { Component, inject, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { DiceService } from '../../../../core/services/dice.service';
import { DiceDisplayService } from '../../../../core/services/dice-display.service';
import { NATIONALITIES } from '../../../../data/nationalities';

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
                this.scrollTo('skillsSection');
            } else if (this.admissionStatus === 'Admitted') {
                // Academy - admitted but skill selection happens on graduation
                this.educationStep = 'Studying';
                this.scrollTo('resultsSection');
            } else {
                this.scrollTo('resultsSection');
            }
        }
    }

    ngOnInit() {
        // Ensure DMs are calculated when component loads and data is ready
        setTimeout(() => this.calculateAdmissionDMs(), 100);
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
        this.scrollTo('skillsSection');
    }

    enterAcademy() {
        const isOffWorld = this.admissionMethod === 'OffWorld';
        if (isOffWorld) {
            this.characterService.updateCharacter({ education: { ...this.characterService.character().education, offworld: true } });
        }

        const skills = this.academySkills[this.academyType] || [];
        skills.forEach(s => {
            const parts = s.split(' ');
            const name = parts.slice(0, parts.length - 1).join(' ');
            this.characterService.addSkill(name, 0);
        });
        this.characterService.log(`**Entered ${this.academyType} Academy**: Basic Training granted (Service Skills at Level 0)`);
        this.log(`Entered ${this.academyType} Academy. Gained Basic Training (Service Skills 0).`);
        this.educationStep = 'Studying';
        this.scrollTo('resultsSection');
    }

    async graduate() {
        await this.runEvent();

        // Check failure from event (Tragedy/Expelled)
        if (this.graduationStatus === 'Failed') {
            this.educationStep = 'Finished';
            this.scrollTo('resultsSection');
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
        } else {
            this.graduationStatus = 'Failed';
            this.characterService.log(`**Failed to Graduate** (${this.educationType})`);
            this.log('Failed to graduate.');
            this.saveResult(false, false);
            if (this.graduationStatus !== 'Failed') {
                if (this.educationType === 'Academy') {
                    this.educationStep = 'AcademySkillSelect';
                    this.scrollTo('skillsSection');
                } else {
                    this.educationStep = 'Finished';
                    this.scrollTo('resultsSection');
                }
            } else {
                this.educationStep = 'Finished';
                this.scrollTo('resultsSection');
            }
        }
    }

    async runEvent() {
        const roll = await this.diceDisplay.roll('Term Event', 2, 0, 0, '', (result) => {
            const evt = this.eventsTable.find(e => e.roll === result);
            return evt ? evt.desc : 'Nothing significant.';
        });

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
                const alliesCount = Math.ceil(Math.random() * 3); // 1D3
                for (let i = 0; i < alliesCount; i++) {
                    this.characterService.addNpc({
                        id: crypto.randomUUID(),
                        name: 'University Friend',
                        type: 'ally',
                        origin: 'Education (Roll 6)',
                        notes: 'A close friend from academic years. Met during university/academy terms.'
                    });
                }
                break;
            case 'Politics':
                const polRoll = await this.diceDisplay.roll('Politics Check (SOC)', 2, 0, 8, 'SOC');
                if (polRoll >= 8) {
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
                break;
        }

        if (evt.lifeEvent) {
            this.log('Triggering Life Event...');
            // In a real scenario, we'd emit signal to parent or trigger life event step
            this.characterService.log('**Event**: Triggering Life Event table.');
        }
    }

    async handlePrank() {
        const roll = await this.diceDisplay.roll('Prank Check (SOC)', 2, 0, 8, 'SOC');
        if (roll === 2) { // Critical failure on natural 2
            this.graduated = false;
            this.graduationStatus = 'Failed';
            this.expelledToPrison = true;
            this.characterService.setEducationStatus(false, false);
            this.characterService.log('**EXPELLED**: Prank went catastrophically wrong. Mandatory transition to Prisoner.');
            return;
        }

        if (roll >= 8) {
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
            this.characterService.log('**Fleeing**: Resigned from education to avoid draft. Next Career: Drifter.');
        } else {
            const roll = Math.floor(Math.random() * 6) + 1;
            if (roll <= 3) this.warNextCareer = 'Army';
            else if (roll <= 5) this.warNextCareer = 'Marine';
            else this.warNextCareer = 'Navy';
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
        this.characterService.addSkill(skill, 0); // Gain at 0 or increase +1
        this.showHobbySelection = false;
        this.characterService.log(`**Hobby**: Acquired interest in ${skill}.`);
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
        const roll = await this.diceDisplay.roll(`Tutor Check (${skill})`, 2, 0, 9, skill);
        if (roll >= 9) {
            this.characterService.addSkill(skill, 1);
            this.characterService.addNpc({
                id: crypto.randomUUID(),
                name: 'Exacting Tutor',
                type: 'rival',
                origin: 'Tutor Interest (Roll 10)',
                notes: 'A brilliant but demanding academic mentor. Demanded perfection from their students.'
            });
            this.characterService.log(`**Tutor Mastery**: Improved ${skill} through rigorous study.`);
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

        // Check HonorsCommission
        if (this.graduationStatus === 'Honors') {
            this.characterService.log(`**Honors Commission**: Commissioned as Rank 1 Officer in ${this.academyType}`);
            this.log('Honors: Commissioned as Rank 1 Officer.');
            // Logic to set rank would go here
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

    log(msg: string) {
        console.log(`[EducationComponent] ${msg}`);
        // this.rollLog.push(msg); // Removed for UI cleanliness
    }

    private scrollTo(section: 'resultsSection' | 'skillsSection') {
        setTimeout(() => {
            const element = section === 'resultsSection' ? this.resultsSection : this.skillsSection;
            if (element) {
                element.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }
}

function fromSigned(n: number): string {
    return n >= 0 ? `+${n}` : `${n}`;
}
