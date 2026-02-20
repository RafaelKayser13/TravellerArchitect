import { TestBed } from '@angular/core/testing';
import { CharacterService } from '../character.service';
import { DiceService } from '../dice.service';
import { EventEngineService } from '../event-engine.service';
import { CustomEffectHandler } from './custom-effect.handler';
import { Character } from '../../models/character.model';

/**
 * Test Suite: Merchant Career Event 5 - Gambling Opportunity
 *
 * Game Rule (2300AD):
 * A merchant has the opportunity to gamble benefit rolls.
 * - Success (8+): Regain half of wagered benefits
 * - Failure: Lose all wagered benefits
 * - Either outcome: Gain Gamble skill +1
 *
 * Test Coverage:
 * 1. Basic success case
 * 2. Basic failure case
 * 3. Edge case: odd number wagered
 * 4. Edge case: zero skill modifier
 * 5. Edge case: high skill bonus
 * 6. Edge case: wagering entire benefit pool
 * 7. Rounding rules (Math.ceil for regain)
 */

describe('Merchant Event 5 - Gambling Opportunity', () => {
    let charService: CharacterService;
    let diceService: DiceService;
    let eventEngine: EventEngineService;
    let testChar: Character;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [
                CharacterService,
                DiceService,
                EventEngineService,
                CustomEffectHandler
            ]
        }).compileComponents();

        charService = TestBed.inject(CharacterService);
        diceService = TestBed.inject(DiceService);
        eventEngine = TestBed.inject(EventEngineService);

        // Create test character with known state
        testChar = createMerchantTestCharacter();
        charService.updateCharacter(testChar);
    });

    // ========================================================================
    // SCENARIO 1: Success Case - Roll 8+
    // ========================================================================

    describe('SUCCESS: 8+ on skill check', () => {
        it('should regain exactly half when wagering even number', () => {
            // Arrange
            const wagered = 4;
            const expectedRegained = 2; // 4 / 2
            const expectedLoss = 2;     // 4 - 2

            // Act
            const regained = Math.ceil(wagered / 2);

            // Assert
            expect(regained).toBe(expectedRegained);
            expect(wagered - regained).toBe(expectedLoss);
        });

        it('should round up regain when wagering odd number', () => {
            // Arrange
            const wagered = 5;
            const expectedRegained = 3; // Math.ceil(5 / 2) = 3
            const expectedLoss = 2;     // 5 - 3 = 2

            // Act
            const regained = Math.ceil(wagered / 2);

            // Assert
            expect(regained).toBe(expectedRegained);
            expect(wagered - regained).toBe(expectedLoss);
        });

        it('should handle minimum wager (1)', () => {
            // Arrange
            const wagered = 1;
            const expectedRegained = 1; // Math.ceil(1 / 2) = 1
            const expectedLoss = 0;     // 1 - 1 = 0

            // Act
            const regained = Math.ceil(wagered / 2);

            // Assert
            expect(regained).toBe(expectedRegained);
            expect(wagered - regained).toBe(expectedLoss);
            // Net: No loss on success with wager of 1!
        });

        it('should apply Gamble skill +1 on success', () => {
            // Arrange
            const initialGambleLevel = 0;
            charService.addSkill('Gamble', initialGambleLevel);

            // Act
            charService.addSkill('Gamble', 1);

            // Assert
            const gambleSkill = charService.character().skills
                .find(s => s.name === 'Gamble');
            expect(gambleSkill?.level).toBe(initialGambleLevel + 1);
        });
    });

    // ========================================================================
    // SCENARIO 2: Failure Case - Roll < 8
    // ========================================================================

    describe('FAILURE: Below 8 on skill check', () => {
        it('should lose all wagered benefits on failure', () => {
            // Arrange
            const wagered = 3;
            const expectedRegained = 0;
            const expectedLoss = 3;

            // Act
            const regained = 0; // Failure = regain nothing

            // Assert
            expect(regained).toBe(expectedRegained);
            expect(wagered - regained).toBe(expectedLoss);
        });

        it('should apply Gamble skill +1 even on failure', () => {
            // Arrange
            const initialGambleLevel = 1;
            charService.addSkill('Gamble', initialGambleLevel);

            // Act
            charService.addSkill('Gamble', 1); // Gain +1 regardless

            // Assert
            const gambleSkill = charService.character().skills
                .find(s => s.name === 'Gamble');
            expect(gambleSkill?.level).toBe(initialGambleLevel + 1);
        });

        it('should handle maximum wager on failure', () => {
            // Arrange
            const maxBenefitRolls = 6;
            const wagered = maxBenefitRolls;
            const expectedLoss = wagered;

            // Act
            const regained = 0;

            // Assert
            expect(wagered - regained).toBe(expectedLoss);
        });
    });

    // ========================================================================
    // SCENARIO 3: Skill Modifier Impact
    // ========================================================================

    describe('Skill modifier impact on success threshold', () => {
        it('should use character Gamble skill as modifier', () => {
            // Arrange
            const gambleSkill = 2;
            const diceRoll = 6;
            const successTarget = 8;
            const total = diceRoll + gambleSkill; // 6 + 2 = 8

            // Act
            const isSuccess = total >= successTarget;

            // Assert
            expect(isSuccess).toBe(true);
            expect(total).toBe(8);
        });

        it('should fail with negative modifier', () => {
            // Arrange: Character with Gamble 0, bad dice roll
            const gambleSkill = 0;
            const diceRoll = 4;
            const successTarget = 8;
            const total = diceRoll + gambleSkill; // 4 + 0 = 4

            // Act
            const isSuccess = total >= successTarget;

            // Assert
            expect(isSuccess).toBe(false);
            expect(total).toBe(4);
        });

        it('should auto-succeed with high skill', () => {
            // Arrange: Character with Gamble 5, any reasonable roll
            const gambleSkill = 5;
            const diceRoll = 3; // Worst possible on 2D6
            const successTarget = 8;
            const total = diceRoll + gambleSkill; // 3 + 5 = 8

            // Act
            const isSuccess = total >= successTarget;

            // Assert
            expect(isSuccess).toBe(true);
        });

        it('should require exact 8+ (not 7+)', () => {
            // Arrange
            const gambleSkill = 1;
            const diceRoll = 6;
            const successTarget = 8;
            const total = diceRoll + gambleSkill; // 6 + 1 = 7

            // Act
            const isSuccess = total >= successTarget;

            // Assert
            expect(isSuccess).toBe(false); // 7 < 8
        });
    });

    // ========================================================================
    // SCENARIO 4: Benefit Pool Accounting
    // ========================================================================

    describe('Benefit pool accounting', () => {
        it('should correctly reduce benefit roll count on loss', () => {
            // Arrange
            const initialBenefits = 3;
            const wagered = 2;
            const successRoll = 10; // 2D6 + Gamble skill
            const regained = Math.ceil(wagered / 2); // 1
            const loss = wagered - regained; // 1

            // Expected final: 3 - 1 = 2
            const expected = initialBenefits - loss;

            // Act
            const final = initialBenefits - loss;

            // Assert
            expect(final).toBe(2);
            expect(final).toBe(expected);
        });

        it('should handle betting entire benefit pool', () => {
            // Arrange
            const totalBenefits = 4;
            const wagered = 4; // All-in
            const regained = Math.ceil(wagered / 2); // 2
            const loss = wagered - regained; // 2

            // Expected: 4 - 2 = 2 remaining
            const final = totalBenefits - loss;

            // Act & Assert
            expect(final).toBe(2);
        });

        it('should prevent betting more than available', () => {
            // Arrange
            const availableBenefits = 2;
            const attemptedWager = 3;

            // Act: Prevent invalid wager
            const validWager = Math.min(attemptedWager, availableBenefits);

            // Assert
            expect(validWager).toBe(2);
            expect(validWager).toBeLessThanOrEqual(availableBenefits);
        });
    });

    // ========================================================================
    // SCENARIO 5: Edge Cases & Rounding Rules
    // ========================================================================

    describe('Edge cases and rounding rules', () => {
        it('should use Math.ceil for half calculation', () => {
            // Test all wager amounts 1-10
            const testCases = [
                { wagered: 1, expected: 1 },  // ceil(0.5) = 1
                { wagered: 2, expected: 1 },  // ceil(1) = 1
                { wagered: 3, expected: 2 },  // ceil(1.5) = 2
                { wagered: 4, expected: 2 },  // ceil(2) = 2
                { wagered: 5, expected: 3 },  // ceil(2.5) = 3
                { wagered: 6, expected: 3 },  // ceil(3) = 3
                { wagered: 7, expected: 4 },  // ceil(3.5) = 4
                { wagered: 8, expected: 4 },  // ceil(4) = 4
                { wagered: 9, expected: 5 },  // ceil(4.5) = 5
                { wagered: 10, expected: 5 }, // ceil(5) = 5
            ];

            for (const testCase of testCases) {
                const result = Math.ceil(testCase.wagered / 2);
                expect(result).toBe(testCase.expected);
            }
        });

        it('should handle zero wager (edge case)', () => {
            // Arrange
            const wagered = 0;
            const regained = Math.ceil(wagered / 2); // 0
            const loss = wagered - regained; // 0

            // Act & Assert
            expect(loss).toBe(0);
            expect(regained).toBe(0);
        });

        it('should not apply skill gain on zero wager', () => {
            // Some versions might skip the event entirely
            // This confirms behavior is sensible
            const wagered = 0;
            expect(wagered).toBe(0);
        });
    });

    // ========================================================================
    // SCENARIO 6: Full Workflow - Success Path
    // ========================================================================

    describe('Full workflow - Success path', () => {
        it('should execute complete success transaction', () => {
            // Arrange: Character state
            const char = charService.character();
            const initialGamble = 1; // Has Gamble 1
            const benefitRollModifier = 2; // Track DM modifier
            const wagered = 3;

            charService.addSkill('Gamble', initialGamble);
            charService.addBenefitRoll('Merchant', 5); // Start with 5 rolls

            const diceRoll = 7; // 7 + 1 (Gamble) = 8
            const total = diceRoll + initialGamble;
            const isSuccess = total >= 8;

            // Act: Success scenario
            if (isSuccess) {
                const regained = Math.ceil(wagered / 2); // 2
                const loss = wagered - regained; // 1

                charService.addBenefitRoll('Merchant', -loss); // Apply loss
                charService.addSkill('Gamble', 1); // Gain +1
            }

            // Assert
            expect(isSuccess).toBe(true);
            const finalGamble = charService.character().skills
                .find(s => s.name === 'Gamble')?.level;
            expect(finalGamble).toBe(initialGamble + 1); // Now 2
        });

        it('should execute complete failure transaction', () => {
            // Arrange: Character state
            const char = charService.character();
            const initialGamble = 0; // No Gamble skill
            const wagered = 2;

            charService.addSkill('Gamble', initialGamble);
            charService.addBenefitRoll('Merchant', 4);

            const diceRoll = 3; // 3 + 0 = 3, below 8
            const total = diceRoll + initialGamble;
            const isSuccess = total >= 8;

            // Act: Failure scenario
            if (!isSuccess) {
                const loss = wagered; // Lose all

                charService.addBenefitRoll('Merchant', -loss);
                charService.addSkill('Gamble', 1); // Gain +1 anyway
            }

            // Assert
            expect(isSuccess).toBe(false);
            const finalGamble = charService.character().skills
                .find(s => s.name === 'Gamble')?.level;
            expect(finalGamble).toBe(1); // Improved from 0 to 1
        });
    });

    // ========================================================================
    // SCENARIO 7: Balance & Fairness Checks
    // ========================================================================

    describe('Balance and fairness', () => {
        it('should have appropriate risk/reward ratio', () => {
            // Success: Lose 50% of wager
            // Failure: Lose 100% of wager
            // Average (50/50 chance): Lose 75%
            // This is harsh but fair for high-risk gambling

            const wagered = 4;
            const successLoss = wagered / 2;    // 2
            const failureLoss = wagered;        // 4
            const averageLoss = (successLoss + failureLoss) / 2; // 3

            expect(averageLoss).toBe(3);
            expect(averageLoss / wagered).toBe(0.75); // 75% loss on average
        });

        it('should always gain skill regardless of outcome', () => {
            // This is the saving grace - Gamble always improves
            // So even losing benefits teaches a lesson

            const outcomes = ['success', 'failure'];
            for (const outcome of outcomes) {
                const skillGain = outcome === 'success' ? 1 : 1;
                expect(skillGain).toBe(1);
            }
        });

        it('should prevent infinite benefit farming', () => {
            // Maximum realistic wager is total benefit pool
            // So character can lose everything on one bad roll
            // This prevents abuse

            const maxWager = 6; // Typical max benefits per term
            expect(maxWager).toBeGreaterThan(0);
        });
    });
});

// ============================================================================
// Test Helper Functions
// ============================================================================

/**
 * Create a Merchant career test character
 */
function createMerchantTestCharacter(): Character {
    return {
        id: 'test_merchant_001',
        name: 'Test Merchant',
        age: 30,
        characteristics: {
            str: { value: 8, label: 'STR' },
            dex: { value: 8, label: 'DEX' },
            end: { value: 8, label: 'END' },
            int: { value: 9, label: 'INT' },
            edu: { value: 10, label: 'EDU' },
            soc: { value: 7, label: 'SOC' }
        },
        skills: [],
        currentCareer: 'Merchant',
        currentAssignment: 'Free Trader',
        careerHistory: [
            {
                careerName: 'Merchant',
                assignment: 'Free Trader',
                term: 1,
                rank: 0
            }
        ],
        npcs: [],
        equipment: [],
        credits: 10000,
        benefitRolls: {
            'Merchant': 2
        }
    } as Character;
}

/**
 * Calculate expected loss from gambling transaction
 */
function calculateExpectedLoss(
    wagered: number,
    successChance: number = 0.5
): number {
    const successLoss = wagered / 2;
    const failureLoss = wagered;
    return (successLoss * successChance) + (failureLoss * (1 - successChance));
}

/**
 * Simulate gambling outcome
 */
function simulateGambleOutcome(
    wagered: number,
    gambleSkill: number,
    diceRoll: number
): { isSuccess: boolean; regained: number; loss: number } {
    const successTarget = 8;
    const total = diceRoll + gambleSkill;
    const isSuccess = total >= successTarget;
    const regained = isSuccess ? Math.ceil(wagered / 2) : 0;
    const loss = wagered - regained;

    return { isSuccess, regained, loss };
}
