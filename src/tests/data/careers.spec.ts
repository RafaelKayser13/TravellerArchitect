import { describe, it, expect } from 'vitest';
import { CAREERS } from '../../app/data/careers';

const EXPECTED_CAREER_NAMES = [
    'Agent', 'Army', 'Citizen', 'Drifter', 'Entertainer',
    'Marine', 'Merchant', 'Navy', 'Noble', 'Rogue',
    'Scholar', 'Scout', 'Spaceborne', 'Prisoner'
];

const EXPECTED_ASSIGNMENTS: Record<string, string[]> = {
    'Agent': ['Law Enforcement', 'Intelligence', 'Corporate'],
    'Army': ['Support', 'Infantry', 'Cavalry'],
    'Citizen': ['Corporate', 'Worker', 'Colonist'],
    'Drifter': ['Freelancer', 'Wanderer', 'Scavenger'],
    'Entertainer': ['Artist', 'Journalist', 'Performer'],
    'Marine': ['Support', 'Star Marine', 'Ground Assault'],
    'Merchant': ['Merchant Marine', 'Free Trader', 'Broker'],
    'Navy': ['Line/Crew', 'Engineer/Gunner', 'Flight'],
    'Noble': ['Administrator', 'Diplomat', 'Dilettante'],
    'Rogue': ['Thief', 'Enforcer', 'Pirate'],
    'Scholar': ['Field Researcher', 'Scientist', 'Physician'],
    'Scout': ['Courier', 'Surveyor', 'Explorer'],
    'Spaceborne': ['Libertine', 'Tinker', 'Belter'],
    'Prisoner': ['Inmate']
};

const MILITARY_CAREERS = ['Army', 'Navy', 'Marine'];

describe('Career Data Integrity', () => {

    it('should have exactly 14 careers', () => {
        expect(CAREERS.length).toBe(14);
    });

    it('should contain all expected career names', () => {
        const names = CAREERS.map(c => c.name);
        for (const expected of EXPECTED_CAREER_NAMES) {
            expect(names).toContain(expected);
        }
    });

    it('should have no duplicate career names', () => {
        const names = CAREERS.map(c => c.name);
        expect(new Set(names).size).toBe(names.length);
    });

    describe('Skill Tables Structure', () => {
        for (const career of CAREERS) {
            describe(`${career.name}`, () => {
                it('should have exactly 6 personal skills', () => {
                    expect(career.personalSkills.length).toBe(6);
                });

                it('should have exactly 6 service skills', () => {
                    expect(career.serviceSkills.length).toBe(6);
                });

                if (career.name !== 'Drifter' && career.name !== 'Prisoner') {
                    it('should have exactly 6 advanced education skills', () => {
                        expect(career.advancedEducation.length).toBe(6);
                    });
                }

                if (career.officerSkills && career.officerSkills.length > 0) {
                    it('should have exactly 6 officer skills', () => {
                        expect(career.officerSkills!.length).toBe(6);
                    });
                }

                for (const assignment of career.assignments) {
                    it(`assignment "${assignment.name}" should have exactly 6 skills`, () => {
                        expect(assignment.skillTable.length).toBe(6);
                    });
                }
            });
        }
    });

    describe('Assignment Names', () => {
        for (const [careerName, expectedAssignments] of Object.entries(EXPECTED_ASSIGNMENTS)) {
            it(`${careerName} should have correct assignments`, () => {
                const career = CAREERS.find(c => c.name === careerName);
                expect(career).toBeDefined();
                const assignmentNames = career!.assignments.map(a => a.name);
                expect(assignmentNames).toEqual(expectedAssignments);
            });
        }
    });

    describe('Advanced Education EDU Requirements', () => {
        const edu10Careers = ['Citizen', 'Entertainer'];
        for (const careerName of edu10Careers) {
            it(`${careerName} should require EDU 10+ for advanced education`, () => {
                const career = CAREERS.find(c => c.name === careerName);
                expect(career).toBeDefined();
                expect(career!.advancedEducationMinEdu).toBe(10);
            });
        }

        const edu8Careers = ['Agent', 'Army', 'Marine', 'Merchant', 'Navy', 'Noble', 'Scout', 'Spaceborne', 'Rogue', 'Scholar'];
        for (const careerName of edu8Careers) {
            it(`${careerName} should use default EDU 8+ (no advancedEducationMinEdu or undefined)`, () => {
                const career = CAREERS.find(c => c.name === careerName);
                expect(career).toBeDefined();
                expect(career!.advancedEducationMinEdu).toBeUndefined();
            });
        }
    });

    describe('Drifter (2300AD) has no Advanced Education table', () => {
        it('Drifter should have empty advancedEducation array', () => {
            const drifter = CAREERS.find(c => c.name === 'Drifter');
            expect(drifter).toBeDefined();
            expect(drifter!.advancedEducation.length).toBe(0);
        });
    });

    describe('Military Careers Have Officer Skills', () => {
        for (const careerName of MILITARY_CAREERS) {
            it(`${careerName} should have officerSkills defined with 6 entries`, () => {
                const career = CAREERS.find(c => c.name === careerName);
                expect(career).toBeDefined();
                expect(career!.officerSkills).toBeDefined();
                expect(career!.officerSkills!.length).toBe(6);
            });

            it(`${careerName} should have officerRanks defined`, () => {
                const career = CAREERS.find(c => c.name === careerName);
                expect(career).toBeDefined();
                expect(career!.officerRanks).toBeDefined();
                expect(career!.officerRanks!.length).toBeGreaterThan(0);
            });
        }
    });

    describe('Mustering Out Tables', () => {
        for (const career of CAREERS) {
            it(`${career.name} should have 7 cash entries`, () => {
                expect(career.musteringOutCash.length).toBe(7);
            });

            it(`${career.name} should have 7 benefit entries`, () => {
                expect(career.musteringOutBenefits.length).toBe(7);
            });
        }
    });

    describe('Event and Mishap Tables', () => {
        for (const career of CAREERS) {
            it(`${career.name} should have event table entries`, () => {
                expect(career.eventTable.length).toBeGreaterThan(0);
            });

            it(`${career.name} event table should include roll 7 (Life Event)`, () => {
                const roll7 = career.eventTable.find(e => e.roll === 7);
                expect(roll7).toBeDefined();
            });

            it(`${career.name} should have mishap table entries`, () => {
                expect(career.mishapTable.length).toBeGreaterThan(0);
            });
        }
    });

    describe('Specific Rank Bonuses Validation', () => {
        // Army: Rank 0 Private should have Gun Combat (slug) 1
        it('Army enlisted Rank 0 should grant Gun Combat (slug) 1', () => {
            const army = CAREERS.find(c => c.name === 'Army')!;
            for (const a of army.assignments) {
                const rank0 = a.ranks.find(r => r.level === 0);
                expect(rank0).toBeDefined();
                expect(rank0!.bonusSkill).toBe('Gun Combat (slug)');
                expect(rank0!.bonusValue).toBe(1);
            }
        });

        // Army: Rank 1 Lance Corporal should have Recon 1
        it('Army enlisted Rank 1 should grant Recon 1', () => {
            const army = CAREERS.find(c => c.name === 'Army')!;
            for (const a of army.assignments) {
                const rank1 = a.ranks.find(r => r.level === 1);
                expect(rank1).toBeDefined();
                expect(rank1!.bonusSkill).toBe('Recon');
            }
        });

        // Marine: Rank 0 should have Gun Combat (any) 1
        it('Marine enlisted Rank 0 should grant Gun Combat (any) 1', () => {
            const marine = CAREERS.find(c => c.name === 'Marine')!;
            for (const a of marine.assignments) {
                const rank0 = a.ranks.find(r => r.level === 0);
                expect(rank0).toBeDefined();
                expect(rank0!.bonusSkill).toBe('Gun Combat (any)');
            }
        });

        // Marine: Rank 1 should have Melee (blade) 1
        it('Marine enlisted Rank 1 should grant Melee (blade) 1', () => {
            const marine = CAREERS.find(c => c.name === 'Marine')!;
            for (const a of marine.assignments) {
                const rank1 = a.ranks.find(r => r.level === 1);
                expect(rank1!.bonusSkill).toBe('Melee (blade)');
            }
        });

        // Navy Officer: Rank 1 Ensign = Melee (blade) 1
        it('Navy officer Rank 1 should grant Melee (blade) 1', () => {
            const navy = CAREERS.find(c => c.name === 'Navy')!;
            const rank1 = navy.officerRanks!.find(r => r.level === 1);
            expect(rank1).toBeDefined();
            expect(rank1!.bonusSkill).toBe('Melee (blade)');
        });

        // Navy enlisted Rank 1 Able Spacehand = Mechanic 1
        it('Navy enlisted Rank 1 should grant Mechanic 1', () => {
            const navy = CAREERS.find(c => c.name === 'Navy')!;
            for (const a of navy.assignments) {
                const rank1 = a.ranks.find(r => r.level === 1);
                expect(rank1!.bonusSkill).toBe('Mechanic');
            }
        });

        // Scout: Rank 1 = Vacc Suit 1; Rank 3 = Pilot 1
        it('Scout Rank 1 should grant Vacc Suit 1', () => {
            const scout = CAREERS.find(c => c.name === 'Scout')!;
            for (const a of scout.assignments) {
                const rank1 = a.ranks.find(r => r.level === 1);
                expect(rank1!.bonusSkill).toBe('Vacc Suit');
            }
        });

        it('Scout Rank 3 should grant Pilot 1', () => {
            const scout = CAREERS.find(c => c.name === 'Scout')!;
            for (const a of scout.assignments) {
                const rank3 = a.ranks.find(r => r.level === 3);
                expect(rank3!.bonusSkill).toBe('Pilot');
            }
        });

        // Agent Law Enforcement: Rank 1 = Streetwise 1
        it('Agent Law Enforcement Rank 1 should grant Streetwise 1', () => {
            const agent = CAREERS.find(c => c.name === 'Agent')!;
            const lawEnf = agent.assignments.find(a => a.name === 'Law Enforcement')!;
            const rank1 = lawEnf.ranks.find(r => r.level === 1);
            expect(rank1!.bonusSkill).toBe('Streetwise');
        });

        // Agent Intelligence: Rank 1 = Deception 1
        it('Agent Intelligence Rank 1 should grant Deception 1', () => {
            const agent = CAREERS.find(c => c.name === 'Agent')!;
            const intel = agent.assignments.find(a => a.name === 'Intelligence')!;
            const rank1 = intel.ranks.find(r => r.level === 1);
            expect(rank1!.bonusSkill).toBe('Deception');
        });

        // Rogue Pirate: Rank 3 = Profession (Belter) 1
        it('Rogue Pirate Rank 3 should grant Profession (Belter) 1', () => {
            const rogue = CAREERS.find(c => c.name === 'Rogue')!;
            const pirate = rogue.assignments.find(a => a.name === 'Pirate')!;
            const rank3 = pirate.ranks.find(r => r.level === 3);
            expect(rank3!.bonusSkill).toBe('Profession (Belter)');
        });

        // Spaceborne Belter Rank 1 should grant Vacc Suit 1
        it('Spaceborne Belter Rank 1 should grant Vacc Suit 1', () => {
            const spaceborne = CAREERS.find(c => c.name === 'Spaceborne')!;
            const belter = spaceborne.assignments.find(a => a.name === 'Belter')!;
            const rank1 = belter.ranks.find(r => r.level === 1);
            expect(rank1!.bonusSkill).toBe('Vacc Suit');
        });

        // Drifter Wanderer
        it('Drifter Wanderer has no rank bonuses in 2300AD', () => {
            const drifter = CAREERS.find(c => c.name === 'Drifter')!;
            const wanderer = drifter.assignments.find(a => a.name === 'Wanderer')!;
            const rank1 = wanderer.ranks.find(r => r.level === 1);
            expect(rank1!.bonusSkill).toBeUndefined();
        });
    });

    describe('Specific Skill Table Spot Checks', () => {
        // Agent personalSkills first = Gun Combat (any)
        it('Agent personalSkills[0] should be "Gun Combat (any)"', () => {
            const agent = CAREERS.find(c => c.name === 'Agent')!;
            expect(agent.personalSkills[0]).toBe('Gun Combat (any)');
        });

        // Army serviceSkills[0] = Drive (any)
        it('Army serviceSkills[0] should be "Drive (any)"', () => {
            const army = CAREERS.find(c => c.name === 'Army')!;
            expect(army.serviceSkills[0]).toBe('Drive (any)');
        });

        // Navy personalSkills should be all stat bonuses
        it('Navy personalSkills should be all stat bonuses', () => {
            const navy = CAREERS.find(c => c.name === 'Navy')!;
            expect(navy.personalSkills).toEqual(['STR +1', 'DEX +1', 'END +1', 'INT +1', 'EDU +1', 'SOC +1']);
        });

        // Drifter serviceSkills[1] = Melee (unarmed)
        it('Drifter serviceSkills[1] should be "Melee (unarmed)"', () => {
            const drifter = CAREERS.find(c => c.name === 'Drifter')!;
            expect(drifter.serviceSkills[1]).toBe('Melee (unarmed)');
        });

        // Spaceborne serviceSkills[0] = Vacc Suit
        it('Spaceborne serviceSkills[0] should be "Vacc Suit"', () => {
            const spaceborne = CAREERS.find(c => c.name === 'Spaceborne')!;
            expect(spaceborne.serviceSkills[0]).toBe('Vacc Suit');
        });

        // Marine advancedEducation should include Explosives
        it('Marine advancedEducation should include "Explosives"', () => {
            const marine = CAREERS.find(c => c.name === 'Marine')!;
            expect(marine.advancedEducation).toContain('Explosives');
        });
    });
});
