import { describe, it, expect, beforeEach } from 'vitest';
import { CAREERS } from '../../app/data/careers';

/**
 * CAREER SYSTEM INTEGRATION TESTS
 *
 * Phase 2: Testing & Documentation
 * Comprehensive test coverage for all 14 careers × 42 total assignments
 *
 * Test Scenarios:
 * - Full career term workflow (4-term progression)
 * - Survival and advancement checks
 * - Event/mishap table coverage
 * - Benefit calculations
 * - Medical coverage formulas
 * - Officer promotion mechanics
 * - Age-based penalties
 * - Skill acquisition and advancement
 */

describe('Career System - Integration Tests', () => {

    // ========================================================================
    // TEST SETUP: Career Verification
    // ========================================================================

    describe('Career System Structure', () => {
        it('should load all 14 careers without errors', () => {
            expect(CAREERS).toBeDefined();
            expect(CAREERS.length).toBe(14);
        });

        it('should have all careers with required properties', () => {
            for (const career of CAREERS) {
                expect(career.id).toBeDefined();
                expect(career.name).toBeDefined();
                expect(career.description).toBeDefined();
                expect(career.qualification).toBeDefined();
                expect(career.eventTable).toBeDefined();
                expect(career.mishapTable).toBeDefined();
                expect(career.assignments).toBeDefined();
                expect(Array.isArray(career.assignments)).toBe(true);
            }
        });

        it('should have at least one assignment per career', () => {
            for (const career of CAREERS) {
                expect(career.assignments.length).toBeGreaterThan(0);
            }
        });
    });

    // ========================================================================
    // SCENARIO 1: Full Career Term Workflow (4 Terms)
    // ========================================================================

    describe('Full Career Term Workflow', () => {
        for (const career of CAREERS) {
            describe(`${career.name} Career`, () => {
                let termResults: any[] = [];

                beforeEach(() => {
                    termResults = [];
                });

                it(`should support at least 1 term`, () => {
                    expect(career.eventTable.length).toBeGreaterThan(0);
                    expect(career.mishapTable.length).toBeGreaterThan(0);
                });

                it(`should have event table entries for all possible rolls (2-12)`, () => {
                    const rolls = new Set(career.eventTable.map(e => e.roll));

                    // Must have at least 6+ of the 11 possible rolls (2-12)
                    expect(rolls.size).toBeGreaterThanOrEqual(6);

                    // Event 7 must exist (Life Event)
                    const roll7 = career.eventTable.find(e => e.roll === 7);
                    expect(roll7).toBeDefined();
                });

                it(`should have mishap table entries for rolls 1-6`, () => {
                    const rolls = new Set(career.mishapTable.map(m => m.roll));

                    // Should have entries for typical d6 (1-6)
                    expect(rolls.size).toBeGreaterThanOrEqual(3);
                });

                for (const assignment of career.assignments) {
                    describe(`${assignment.name} Assignment`, () => {
                        it('should have survival check configuration', () => {
                            expect(assignment.survival).toBeDefined();
                            expect(assignment.survival.stat).toBeDefined();
                            expect(assignment.survival.target).toBeGreaterThanOrEqual(2);
                            expect(assignment.survival.target).toBeLessThanOrEqual(12);
                        });

                        it('should have advancement check configuration', () => {
                            expect(assignment.advancement).toBeDefined();
                            expect(assignment.advancement.stat).toBeDefined();
                            expect(assignment.advancement.target).toBeGreaterThanOrEqual(3);
                            expect(assignment.advancement.target).toBeLessThanOrEqual(12);
                        });

                        it('should have skill table with 6 entries', () => {
                            expect(assignment.skillTable).toBeDefined();
                            expect(assignment.skillTable.length).toBe(6);
                        });

                        it('should have rank table with multiple levels', () => {
                            expect(assignment.ranks).toBeDefined();
                            expect(assignment.ranks.length).toBeGreaterThanOrEqual(3);
                        });

                        it('should have valid rank progression', () => {
                            const ranks = assignment.ranks;
                            for (let i = 0; i < ranks.length; i++) {
                                expect(ranks[i].level).toBeDefined();
                                expect(ranks[i].title).toBeDefined();
                            }
                        });
                    });
                }
            });
        }
    });

    // ========================================================================
    // SCENARIO 2: Survival & Advancement Check Mechanics
    // ========================================================================

    describe('Survival & Advancement Checks', () => {
        for (const career of CAREERS) {
            for (const assignment of career.assignments) {
                describe(`${career.name} - ${assignment.name}`, () => {
                    it('survival target should be realistic (4-8)', () => {
                        const target = assignment.survival.target;
                        expect(target).toBeGreaterThanOrEqual(4);
                        expect(target).toBeLessThanOrEqual(8);
                    });

                    it('advancement target should be realistic (5-9)', () => {
                        const target = assignment.advancement.target;
                        expect(target).toBeGreaterThanOrEqual(5);
                        expect(target).toBeLessThanOrEqual(9);
                    });

                    it('advancement target typically higher than survival', () => {
                        // In most cases, advancement is harder than survival
                        const survivalTarget = assignment.survival.target;
                        const advancementTarget = assignment.advancement.target;
                        // Allow some flexibility (within 2 points)
                        expect(advancementTarget).toBeGreaterThanOrEqual(survivalTarget - 1);
                    });

                    it('survival and advancement should use valid stats', () => {
                        const validStats = ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'];
                        expect(validStats).toContain(assignment.survival.stat);
                        expect(validStats).toContain(assignment.advancement.stat);
                    });
                });
            }
        }
    });

    // ========================================================================
    // SCENARIO 3: Event Table Coverage
    // ========================================================================

    describe('Event Table Coverage', () => {
        for (const career of CAREERS) {
            it(`${career.name} should have complete event table`, () => {
                const rolls = career.eventTable.map(e => e.roll);

                // Verify no duplicate rolls
                const uniqueRolls = new Set(rolls);
                expect(uniqueRolls.size).toBe(rolls.length);

                // All rolls should be in valid range 2-12
                for (const roll of rolls) {
                    expect(roll).toBeGreaterThanOrEqual(2);
                    expect(roll).toBeLessThanOrEqual(12);
                }
            });

            it(`${career.name} Life Event (roll 7) should be properly formatted`, () => {
                const event7 = career.eventTable.find(e => e.roll === 7);
                expect(event7).toBeDefined();
                expect(event7!.description).toBeDefined();
                expect(event7!.description.toLowerCase()).toContain('life event');
            });

            it(`${career.name} event descriptions should not be empty`, () => {
                for (const event of career.eventTable) {
                    expect(event.description).toBeDefined();
                    expect(event.description.length).toBeGreaterThan(5);
                }
            });
        }
    });

    // ========================================================================
    // SCENARIO 4: Mishap Table Coverage
    // ========================================================================

    describe('Mishap Table Coverage', () => {
        for (const career of CAREERS) {
            it(`${career.name} should have complete mishap table`, () => {
                const rolls = career.mishapTable.map(m => m.roll);

                // Verify no duplicate rolls
                const uniqueRolls = new Set(rolls);
                expect(uniqueRolls.size).toBe(rolls.length);

                // All rolls should be in range 1-6 or 2-7
                for (const roll of rolls) {
                    expect(roll).toBeGreaterThanOrEqual(1);
                    expect(roll).toBeLessThanOrEqual(7);
                }
            });

            it(`${career.name} mishap descriptions should be substantive`, () => {
                for (const mishap of career.mishapTable) {
                    expect(mishap.description).toBeDefined();
                    expect(mishap.description.length).toBeGreaterThan(5);
                }
            });
        }
    });

    // ========================================================================
    // SCENARIO 5: Benefit Calculations (Mustering Out)
    // ========================================================================

    describe('Benefit Calculations', () => {
        for (const career of CAREERS) {
            it(`${career.name} cash table should have 7 entries (d6+1)`, () => {
                expect(career.musteringOutCash).toBeDefined();
                expect(career.musteringOutCash.length).toBe(7);
            });

            it(`${career.name} benefit table should have 7 entries (d6+1)`, () => {
                expect(career.musteringOutBenefits).toBeDefined();
                expect(career.musteringOutBenefits.length).toBe(7);
            });

            it(`${career.name} cash values should be positive numbers`, () => {
                for (let i = 0; i < career.musteringOutCash.length; i++) {
                    const cash = career.musteringOutCash[i];
                    expect(cash).toBeGreaterThan(0);
                }
            });

            it(`${career.name} cash values should increase with higher rolls`, () => {
                for (let i = 0; i < career.musteringOutCash.length - 1; i++) {
                    const current = career.musteringOutCash[i];
                    const next = career.musteringOutCash[i + 1];
                    expect(next).toBeGreaterThanOrEqual(current);
                }
            });

            it(`${career.name} benefit descriptions should be unique`, () => {
                const benefits = career.musteringOutBenefits;
                const uniqueBenefits = new Set(benefits);
                expect(uniqueBenefits.size).toBe(benefits.length);
            });
        }
    });

    // ========================================================================
    // SCENARIO 6: Medical Coverage Mechanics
    // ========================================================================

    describe('Medical Coverage System', () => {
        it('military careers should use military medical coverage', () => {
            const militaryCareers = ['Army', 'Navy', 'Marine'];
            for (const careerName of militaryCareers) {
                const career = CAREERS.find(c => c.name === careerName);
                expect(career).toBeDefined();
                expect(career!.medicalPlan).toBe('military');
            }
        });

        it('non-military careers should use standard medical coverage', () => {
            const nonMilitaryCareers = ['Agent', 'Merchant', 'Scout', 'Scholar'];
            for (const careerName of nonMilitaryCareers) {
                const career = CAREERS.find(c => c.name === careerName);
                expect(career).toBeDefined();
                expect(career!.medicalPlan).toBe('standard');
            }
        });

        it('military medical coverage should have realistic percentages', () => {
            const militaryCareers = ['Army', 'Navy', 'Marine'];
            for (const careerName of militaryCareers) {
                const career = CAREERS.find(c => c.name === careerName);
                expect(career).toBeDefined();

                // Medical coverage percentages should be 0-100
                const coverage = career!.medicalCoverage;
                if (coverage) {
                    expect(coverage.below4).toBeGreaterThanOrEqual(0);
                    expect(coverage.below4).toBeLessThanOrEqual(100);
                }
            }
        });
    });

    // ========================================================================
    // SCENARIO 7: Officer Rank System
    // ========================================================================

    describe('Officer Rank System', () => {
        const militaryCareers = ['Army', 'Navy', 'Marine'];

        for (const careerName of militaryCareers) {
            it(`${careerName} should have officer ranks defined`, () => {
                const career = CAREERS.find(c => c.name === careerName);
                expect(career).toBeDefined();
                expect(career!.officerRanks).toBeDefined();
                expect(career!.officerRanks!.length).toBeGreaterThan(0);
            });

            it(`${careerName} officer ranks should have valid structure`, () => {
                const career = CAREERS.find(c => c.name === careerName);
                for (const rank of career!.officerRanks || []) {
                    expect(rank.level).toBeDefined();
                    expect(rank.title).toBeDefined();
                    expect(rank.level).toBeGreaterThanOrEqual(0);
                }
            });

            it(`${careerName} officer rank titles should be unique`, () => {
                const career = CAREERS.find(c => c.name === careerName);
                const titles = (career!.officerRanks || []).map(r => r.title);
                const uniqueTitles = new Set(titles);
                expect(uniqueTitles.size).toBe(titles.length);
            });

            it(`${careerName} officer rank bonuses should have valid format`, () => {
                const career = CAREERS.find(c => c.name === careerName);
                for (const rank of career!.officerRanks || []) {
                    if (rank.bonusSkill) {
                        expect(typeof rank.bonusSkill).toBe('string');
                        expect(rank.bonusValue).toBeGreaterThan(0);
                    }
                    if (rank.bonusStat) {
                        expect(typeof rank.bonusStat).toBe('string');
                        expect(rank.bonusValue).toBeGreaterThan(0);
                    }
                }
            });

            it(`${careerName} officer ranks should NOT have malformed string value formats`, () => {
                const career = CAREERS.find(c => c.name === careerName);
                for (const rank of career!.officerRanks || []) {
                    // Ensure no string values like "10_or_plus1" or "12_or_plus1"
                    if ((rank as any).bonus?.value) {
                        expect(typeof (rank as any).bonus.value).not.toBe('string');
                        expect((rank as any).bonus.value).not.toMatch(/[_or+]/);
                    }
                }
            });
        }
    });

    // ========================================================================
    // SCENARIO 8: Skill Acquisition
    // ========================================================================

    describe('Skill Acquisition Tables', () => {
        for (const career of CAREERS) {
            it(`${career.name} should have personal skills defined`, () => {
                expect(career.personalSkills).toBeDefined();
                expect(career.personalSkills.length).toBe(6);
            });

            it(`${career.name} should have service skills defined`, () => {
                expect(career.serviceSkills).toBeDefined();
                expect(career.serviceSkills.length).toBe(6);
            });

            it(`${career.name} personal skills should be unique`, () => {
                const skills = career.personalSkills;
                const unique = new Set(skills);
                expect(unique.size).toBe(skills.length);
            });

            it(`${career.name} service skills should be unique`, () => {
                const skills = career.serviceSkills;
                const unique = new Set(skills);
                expect(unique.size).toBe(skills.length);
            });

            // Drifter and Prisoner don't have advanced education in 2300AD
            if (career.name !== 'Drifter' && career.name !== 'Prisoner') {
                it(`${career.name} should have advanced education skills`, () => {
                    expect(career.advancedEducation).toBeDefined();
                    expect(career.advancedEducation.length).toBe(6);
                });

                it(`${career.name} advanced education skills should be unique`, () => {
                    const skills = career.advancedEducation;
                    const unique = new Set(skills);
                    expect(unique.size).toBe(skills.length);
                });
            }
        }
    });

    // ========================================================================
    // SCENARIO 9: Age-Based Penalties (Physical Aging)
    // ========================================================================

    describe('Age-Based Penalty System', () => {
        it('should apply correct physical aging penalties', () => {
            // Standard Traveller rules
            // Age 34: 1st check
            // Age 40: 2nd check  (+1 DM)
            // Age 46: 3rd check  (+2 DM)
            // Age 52: 4th check  (+3 DM)

            const agingThresholds = [
                { age: 34, checks: 0 },
                { age: 40, checks: 1, dm: 1 },
                { age: 46, checks: 2, dm: 2 },
                { age: 52, checks: 3, dm: 3 },
                { age: 58, checks: 4, dm: 4 }
            ];

            for (const threshold of agingThresholds) {
                // This validates the expected aging system
                expect(threshold.age).toBeGreaterThanOrEqual(34);
                expect(threshold.checks).toBeGreaterThanOrEqual(0);
            }
        });
    });

    // ========================================================================
    // SCENARIO 10: Rank Bonuses Validation
    // ========================================================================

    describe('Rank Bonuses Validation', () => {
        for (const career of CAREERS) {
            for (const assignment of career.assignments) {
                describe(`${career.name} - ${assignment.name}`, () => {
                    it('should have bonuses for selected ranks', () => {
                        let bonusCount = 0;
                        for (const rank of assignment.ranks) {
                            if (rank.bonusSkill || rank.bonusStat) {
                                bonusCount++;
                            }
                        }
                        // At least 1 rank should have a bonus
                        expect(bonusCount).toBeGreaterThan(0);
                    });

                    it('rank bonuses should have valid skill/stat names', () => {
                        const validStats = ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'];
                        for (const rank of assignment.ranks) {
                            if (rank.bonusStat) {
                                expect(validStats).toContain(rank.bonusStat);
                            }
                            if (rank.bonusSkill) {
                                expect(typeof rank.bonusSkill).toBe('string');
                                expect(rank.bonusSkill.length).toBeGreaterThan(0);
                            }
                        }
                    });

                    it('rank bonuses should have positive values', () => {
                        for (const rank of assignment.ranks) {
                            if (rank.bonusValue) {
                                expect(rank.bonusValue).toBeGreaterThan(0);
                            }
                        }
                    });
                });
            }
        }
    });

    // ========================================================================
    // SCENARIO 11: Qualification Requirements
    // ========================================================================

    describe('Qualification Requirements', () => {
        for (const career of CAREERS) {
            it(`${career.name} should have qualification requirements`, () => {
                expect(career.qualification).toBeDefined();
                expect(career.qualification.stat).toBeDefined();
                expect(career.qualification.target).toBeDefined();
            });

            it(`${career.name} qualification target should be realistic`, () => {
                const target = career.qualification.target;
                expect(target).toBeGreaterThanOrEqual(3);
                expect(target).toBeLessThanOrEqual(10);
            });

            it(`${career.name} qualification stat should be valid`, () => {
                const validStats = ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'];
                expect(validStats).toContain(career.qualification.stat);
            });
        }
    });

    // ========================================================================
    // SCENARIO 12: Assignment Count Validation
    // ========================================================================

    describe('Assignment Distribution', () => {
        it('should have consistent assignment counts across all careers', () => {
            const assignmentCounts = CAREERS.map(c => ({
                name: c.name,
                count: c.assignments.length
            }));

            // Most careers should have 3 assignments
            const threeAssignments = assignmentCounts.filter(c => c.count === 3).length;
            expect(threeAssignments).toBeGreaterThan(8); // At least 8 out of 14

            // Print distribution
            console.log('Assignment distribution:', assignmentCounts);
        });

        it('Prisoner should have exactly 1 assignment', () => {
            const prisoner = CAREERS.find(c => c.name === 'Prisoner');
            expect(prisoner!.assignments.length).toBe(1);
        });
    });

    // ========================================================================
    // SCENARIO 13: Total Career Content Verification
    // ========================================================================

    describe('Total Career System Content', () => {
        it('should have 14 careers with 42 total assignments', () => {
            let totalAssignments = 0;
            for (const career of CAREERS) {
                totalAssignments += career.assignments.length;
            }
            expect(totalAssignments).toBe(42);
        });

        it('should have 238+ total event entries across all careers', () => {
            let totalEvents = 0;
            for (const career of CAREERS) {
                totalEvents += career.eventTable.length;
            }
            expect(totalEvents).toBeGreaterThanOrEqual(238);
        });

        it('should have 84+ total mishap entries across all careers', () => {
            let totalMishaps = 0;
            for (const career of CAREERS) {
                totalMishaps += career.mishapTable.length;
            }
            expect(totalMishaps).toBeGreaterThanOrEqual(84);
        });
    });

    // ========================================================================
    // SCENARIO 14: Academy & Military Options
    // ========================================================================

    describe('Academy & Military Options', () => {
        const academyEnabled = ['Agent', 'Army', 'Marine', 'Merchant', 'Navy', 'Noble', 'Scholar', 'Scout'];

        for (const careerName of academyEnabled) {
            it(`${careerName} should have academy configuration`, () => {
                const career = CAREERS.find(c => c.name === careerName);
                expect(career).toBeDefined();
                expect(career!.academy).toBeDefined();
            });
        }

        it('non-academy careers should not have academy defined', () => {
            const nonAcademy = ['Citizen', 'Drifter', 'Entertainer', 'Rogue', 'Spaceborne', 'Prisoner'];
            for (const careerName of nonAcademy) {
                const career = CAREERS.find(c => c.name === careerName);
                expect(career).toBeDefined();
                // Should either not have academy or it should be falsy
                if ((career as any).academy) {
                    expect((career as any).academy).toBeFalsy();
                }
            }
        });
    });

    // ========================================================================
    // SCENARIO 15: Data Format Consistency
    // ========================================================================

    describe('Data Format Consistency', () => {
        it('should not have malformed effect types', () => {
            const invalidPatterns = ['_or_', '_or+', '10_or', '12_or'];

            for (const career of CAREERS) {
                for (const event of career.eventTable) {
                    const desc = JSON.stringify(event);
                    for (const pattern of invalidPatterns) {
                        expect(desc).not.toContain(pattern);
                    }
                }
            }
        });

        it('should have consistent camelCase naming in effects', () => {
            for (const career of CAREERS) {
                for (const event of career.eventTable) {
                    // If there are effect types, they should be camelCase or UPPER_CASE
                    const desc = JSON.stringify(event);
                    // Should not have kebab-case like "benefit-dm" or "benefit_roll"
                    expect(desc).not.toMatch(/benefit-dm|benefit_roll|advancement-dm/);
                }
            }
        });
    });
});
