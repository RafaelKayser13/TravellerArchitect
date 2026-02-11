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
        'Animals (Training)',
        'Animals (Veterinary)',
        'Art (Holography)', 'Art (Instrument)', 'Art (Performance)', 'Art (Visual Media)', 'Art (Writing)',
        'Astrogation',
        'Electronics (Comms)', 'Electronics (Computers)', 'Electronics (Remote Ops)', 'Electronics (Sensors)',
        'Engineer (Life Support)', 'Engineer (Power)', 'Engineer (Stutterwarp)',
        'Language (Anglic)', 'Language (French)', 'Language (German)', 'Language (Spanish)', 'Language (Mandarin)', 'Language (Japanese)', 'Language (Russian)',
        'Medic',
        'Navigation',
        'Profession (Belter)', 'Profession (Biologicals)', 'Profession (Civil Engineering)', 'Profession (Construction)', 'Profession (Hydroponics)', 'Profession (Polymers)',
        'Science (Astronomy)', 'Science (Biology)', 'Science (Chemistry)', 'Science (Cosmography)', 'Science (Cybernetics)', 'Science (Economics)', 'Science (Genetics)', 'Science (History)', 'Science (Linguistics)', 'Science (Philosophy)', 'Science (Physics)', 'Science (Planetology)', 'Science (Psionicology)', 'Science (Psychology)', 'Science (Robotics)', 'Science (Sophontology)', 'Science (Xenology)'
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
        { roll: 2, desc: 'Psionic Contact. Flag: PsionQualification = True.', effect: 'Psion' },
        { roll: 3, desc: 'Tragedy. Automatic Failure to graduate. Proceed to Draft/Drifter.', effect: 'Fail' },
        { roll: 4, desc: 'Prank Gone Wrong. Roll SOC 8+. Success: Rival. Fail: Enemy + Expulsion (Prisoner).', effect: 'Prank' },
        { roll: 5, desc: 'Parties. Gain Carouse 1.', effect: 'Carouse' },
        { roll: 6, desc: 'Friends. Gain 1D3 Allies.', effect: 'Allies' },
        { roll: 7, desc: 'Life Event.', lifeEvent: true },
        { roll: 8, desc: 'Political Movement. Roll SOC 8+. Success: 1 Ally, 1 Enemy.', effect: 'Politics' },
        { roll: 9, desc: 'Hobby. Choose any skill at Level 0 (except JoT).', effect: 'Hobby' },
        { roll: 10, desc: 'Conflict with Tutor. Roll 9+ (Any Skill). Success: Skill +1, Tutor passes as Rival.', effect: 'Tutor' },
        { roll: 11, desc: 'War/Draft. Flee (Drifter) or Draft (1D6). No Graduation unless SOC 9+.', effect: 'War' },
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
            if (this.educationType === 'University') this.enterUniversity();
            else this.enterAcademy();
        } else {
            this.admissionStatus = 'Rejected';
        }
    }

    enterUniversity() {
        const isOffWorld = this.admissionMethod === 'OffWorld';
        if (isOffWorld) {
            this.characterService.updateCharacter({ education: { ...this.characterService.character().education, offworld: true } });
        }

        this.characterService.updateCharacteristics(this.modifyStat('EDU', 1));

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
                this.log('Graduated with Honors!');
                this.applyGraduationBenefits(true);
            } else {
                this.graduationStatus = 'Graduated';
                this.log('Graduated successfully.');
                this.applyGraduationBenefits(false);
            }
            this.saveResult(true, this.graduationStatus === 'Honors');
        } else {
            this.graduationStatus = 'Failed';
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
        // Pass the lookup function so the popup shows the text!
        const roll = await this.diceDisplay.roll('Term Event', 2, 0, 0, '', (result) => {
            const evt = this.eventsTable.find(e => e.roll === result);
            return evt ? evt.desc : 'Nothing significant.';
        });

        const evt = this.eventsTable.find(e => e.roll === roll);
        this.eventResult = evt ? evt.desc : 'Nothing significant.';
        this.log(`Event [${roll}]: ${this.eventResult}`);

        // Effects
        if (evt?.effect === 'Psion') {
            // Flag Psion
            this.log('Psionic Qualification enabled.');
        }
        if (evt?.effect === 'Fail') {
            this.graduationStatus = 'Failed';
            this.log('Tragedy: Automatic failure.');
        }
        if (evt?.effect === 'Carouse') this.characterService.addSkill('Carouse', 1);
        if (evt?.effect === 'Allies') this.log('Gained 1D3 Allies.');
        if (evt?.effect === 'Hobby') this.log('Gained Hobby Skill (Level 0).');
        if (evt?.effect === 'Recognition') this.characterService.updateCharacteristics(this.modifyStat('SOC', 1));

        if (evt?.effect === 'War') {
            // Logic for war... for now just log
            this.log('War: Draft or Flee. (Handle manually).');
        }
        if (evt?.effect === 'Prank') {
            // Logic
        }
    }

    confirmUniversitySkills() {
        if (!this.selectedMajorSkill || !this.selectedMinorSkill) return;

        this.characterService.addSkill(this.selectedMajorSkill, 1);
        this.characterService.addSkill(this.selectedMinorSkill, 0);

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

        this.log(`Academy Training Complete. Improved: ${skills.join(', ')}.`);

        // Check HonorsCommission
        if (this.graduationStatus === 'Honors') {
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
