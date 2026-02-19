import { describe, it, expect } from 'vitest';
import { CAREERS } from '../../app/data/careers';

const MILITARY_CAREERS = ['Army', 'Navy', 'Marine', 'Agent'];

describe('Military Career Rules', () => {

    describe('MILITARY_CAREERS identification', () => {
        it('should have exactly 4 military careers', () => {
            expect(MILITARY_CAREERS).toHaveLength(4);
        });

        it('should include Army, Navy, Marine, and Agent', () => {
            expect(MILITARY_CAREERS).toContain('Army');
            expect(MILITARY_CAREERS).toContain('Navy');
            expect(MILITARY_CAREERS).toContain('Marine');
            expect(MILITARY_CAREERS).toContain('Agent');
        });

        it('should NOT include non-military careers', () => {
            const nonMilitary = ['Citizen', 'Drifter', 'Entertainer', 'Merchant', 'Noble', 'Rogue', 'Scholar', 'Scout', 'Spaceborne'];
            nonMilitary.forEach(career => {
                expect(MILITARY_CAREERS).not.toContain(career);
            });
        });

        it('all military careers should exist in CAREERS data', () => {
            MILITARY_CAREERS.forEach(name => {
                const career = CAREERS.find(c => c.name === name);
                expect(career, `Career '${name}' should exist in CAREERS`).toBeDefined();
            });
        });
    });

    describe('Officer Skills availability', () => {
        it('Army, Navy, Marine should have officerSkills defined (6 each)', () => {
            ['Army', 'Navy', 'Marine'].forEach(name => {
                const career = CAREERS.find(c => c.name === name);
                expect(career?.officerSkills, `${name} should have officerSkills`).toBeDefined();
                expect(career?.officerSkills?.length, `${name} should have 6 officer skills`).toBe(6);
            });
        });

        it('Army, Navy, Marine should have officerRanks defined', () => {
            ['Army', 'Navy', 'Marine'].forEach(name => {
                const career = CAREERS.find(c => c.name === name);
                expect(career?.officerRanks, `${name} should have officerRanks`).toBeDefined();
                expect(career?.officerRanks?.length).toBeGreaterThan(0);
            });
        });

        it('non-military careers (except Agent) should NOT have officerSkills', () => {
            const nonMilitaryNonAgent = CAREERS.filter(c => !MILITARY_CAREERS.includes(c.name));
            nonMilitaryNonAgent.forEach(career => {
                expect(career.officerSkills, `${career.name} should NOT have officerSkills`).toBeUndefined();
            });
        });
    });

    describe('Rank 0 bonuses for immediate application', () => {
        it('Army assignments should have Rank 0 bonus', () => {
            const army = CAREERS.find(c => c.name === 'Army')!;
            army.assignments.forEach(assign => {
                const rank0 = assign.ranks.find(r => r.level === 0);
                expect(rank0, `${assign.name} should have rank 0`).toBeDefined();
                expect(rank0?.bonusSkill, `Army ${assign.name} rank 0 should have bonusSkill`).toBeDefined();
                expect(rank0?.bonusValue, `Army ${assign.name} rank 0 should have bonusValue`).toBeDefined();
            });
        });

        it('Army Support Rank 0 should give Gun Combat (slug) 1', () => {
            const army = CAREERS.find(c => c.name === 'Army')!;
            const support = army.assignments.find(a => a.name === 'Support')!;
            const rank0 = support.ranks.find(r => r.level === 0)!;
            expect(rank0.bonusSkill).toBe('Gun Combat (slug)');
            expect(rank0.bonusValue).toBe(1);
        });

        it('rank bonuses should use bonusSkill/bonusValue structure', () => {
            CAREERS.forEach(career => {
                career.assignments.forEach(assign => {
                    assign.ranks.forEach(rank => {
                        if (rank.bonus) {
                            // If a rank has a bonus string, it should also have bonusSkill
                            expect(rank.bonusSkill,
                                `${career.name} ${assign.name} rank ${rank.level} has bonus '${rank.bonus}' but missing bonusSkill`
                            ).toBeDefined();
                        }
                    });
                });
            });
        });
    });

    describe('Officer Rank bonuses', () => {
        it('Army officer rank 1 (Lieutenant) should give Leadership 1', () => {
            const army = CAREERS.find(c => c.name === 'Army')!;
            const officerRank1 = army.officerRanks?.find(r => r.level === 1);
            expect(officerRank1?.title).toBe('Lieutenant');
            expect(officerRank1?.bonusSkill).toBe('Leadership');
            expect(officerRank1?.bonusValue).toBe(1);
        });

        it('Navy officer rank 1 should have a bonus defined', () => {
            const navy = CAREERS.find(c => c.name === 'Navy')!;
            const officerRank1 = navy.officerRanks?.find(r => r.level === 1);
            expect(officerRank1).toBeDefined();
            expect(officerRank1?.bonusSkill).toBeDefined();
        });
    });

    describe('Commission rules', () => {
        it('Agent is military but does not have officerSkills (no commission UI)', () => {
            expect(MILITARY_CAREERS.includes('Agent')).toBe(true);
            const agent = CAREERS.find(c => c.name === 'Agent')!;
            // Agent uses rank advancement through its own assignment ranks, not officer commission
            expect(agent.officerSkills).toBeUndefined();
        });

        it('Merchant should NOT be eligible for commission', () => {
            expect(MILITARY_CAREERS.includes('Merchant')).toBe(false);
            const merchant = CAREERS.find(c => c.name === 'Merchant')!;
            expect(merchant.officerSkills).toBeUndefined();
        });

        it('Scholar should NOT be eligible for commission', () => {
            expect(MILITARY_CAREERS.includes('Scholar')).toBe(false);
        });
    });
});

describe('Career Benefits Timing', () => {
    describe('All careers should have ranks defined for benefit application', () => {
        it('every assignment should have at least a rank 0 entry', () => {
            CAREERS.forEach(career => {
                career.assignments.forEach(assign => {
                    const rank0 = assign.ranks.find(r => r.level === 0);
                    expect(rank0, `${career.name} > ${assign.name} should have rank 0`).toBeDefined();
                });
            });
        });

        it('ranks should be ordered by level', () => {
            CAREERS.forEach(career => {
                career.assignments.forEach(assign => {
                    for (let i = 1; i < assign.ranks.length; i++) {
                        expect(assign.ranks[i].level,
                            `${career.name} > ${assign.name}: rank at index ${i} should have level >= previous`
                        ).toBeGreaterThanOrEqual(assign.ranks[i - 1].level);
                    }
                });
            });
        });
    });
});

describe('Reset State - INITIAL_CHARACTER', () => {
    it('should have empty species on initial character', async () => {
        const { INITIAL_CHARACTER } = await import('../core/models/character.model');
        expect(INITIAL_CHARACTER.species).toBe('');
    });

    it('should have empty originType on initial character', async () => {
        const { INITIAL_CHARACTER } = await import('../core/models/character.model');
        expect(INITIAL_CHARACTER.originType).toBe('');
    });

    it('should have empty nationality on initial character', async () => {
        const { INITIAL_CHARACTER } = await import('../core/models/character.model');
        expect(INITIAL_CHARACTER.nationality).toBe('');
    });

    it('should have empty careerHistory on initial character', async () => {
        const { INITIAL_CHARACTER } = await import('../core/models/character.model');
        expect(INITIAL_CHARACTER.careerHistory).toEqual([]);
    });

    it('should have empty skills on initial character', async () => {
        const { INITIAL_CHARACTER } = await import('../core/models/character.model');
        expect(INITIAL_CHARACTER.skills).toEqual([]);
    });
});
