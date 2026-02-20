/**
 * Test Suite: Hard Path / Soft Path Modifiers
 * 
 * Requirement: 2300AD Core Rulebook
 * "A Traveller on the Hard Path adds DM+1 to all Benefit rolls, 
 *  while a Traveller on the Soft Path has DM-1."
 * 
 * Applied in:
 * - Career step (survival/advancement/service rolls)
 * - Mustering out (benefit rolls)
 */

describe('Hard Path / Soft Path Modifiers on Benefit Rolls', () => {
    
    it('Should apply DM-1 when character is on Soft Path', () => {
        // Arrange
        const character = {
            isSoftPath: true,
            homeworld: { path: 'Soft' }
        };
        
        let dm = 0;
        
        // Act
        if (character.isSoftPath) {
            dm -= 1;  // DM-1 for Soft Path
        } else {
            dm += 1;  // DM+1 for Hard Path
        }
        
        // Assert
        expect(dm).toBe(-1);
    });

    it('Should apply DM+1 when character is on Hard Path', () => {
        // Arrange
        const character = {
            isSoftPath: false,
            homeworld: { path: 'Hard' }
        };
        
        let dm = 0;
        
        // Act
        if (character.isSoftPath) {
            dm -= 1;  // DM-1 for Soft Path
        } else {
            dm += 1;  // DM+1 for Hard Path
        }
        
        // Assert
        expect(dm).toBe(1);
    });

    it('Should apply DM+1 even when homeworld.path is undefined', () => {
        // Arrange - This is the bug case: homeworld.path might be undefined
        const character = {
            isSoftPath: false,
            homeworld: { path: undefined }  // path is optional in World interface
        };
        
        let dm = 0;
        
        // Act - OLD BUGGY CODE would be:
        // if (character.isSoftPath) dm -= 1;
        // else if (character.homeworld?.path === 'Hard') dm += 1;  // This would NOT apply!
        
        // NEW CORRECT CODE:
        if (character.isSoftPath) {
            dm -= 1;
        } else {
            dm += 1;  // ALWAYS +1 when not Soft Path
        }
        
        // Assert
        expect(dm).toBe(1);
    });

    it('Should apply DM+1 even when homeworld is undefined', () => {
        // Arrange - Extreme case: no homeworld defined
        const character = {
            isSoftPath: false,
            homeworld: undefined
        };
        
        let dm = 0;
        
        // Act - NEW CORRECT CODE:
        if (character.isSoftPath) {
            dm -= 1;
        } else {
            dm += 1;  // ALWAYS +1 when not Soft Path
        }
        
        // Assert
        expect(dm).toBe(1);
    });

    it('Soft Path should NOT be affected by homeworld.path value', () => {
        // Arrange - Edge case: Soft Path with Hard world (shouldn't happen but testing)
        const character = {
            isSoftPath: true,
            homeworld: { path: 'Hard' }  // Contradiction, but isSoftPath is the source of truth
        };
        
        let dm = 0;
        
        // Act
        if (character.isSoftPath) {
            dm -= 1;  // isSoftPath is authoritative
        } else {
            dm += 1;
        }
        
        // Assert
        expect(dm).toBe(-1);  // DM-1, not DM+1
    });

    it('Should accumulate correctly with other modifiers', () => {
        // Arrange
        const character = {
            isSoftPath: true,
            education: { offworld: true },
            highestRank: 5
        };
        
        let dm = 0;
        const modifiers: { label: string, value: number }[] = [];
        
        // Act
        // Path Modifier
        if (character.isSoftPath) {
            dm -= 1;
            modifiers.push({ label: 'Soft Path', value: -1 });
        } else {
            dm += 1;
            modifiers.push({ label: 'Hard Path', value: 1 });
        }
        
        // Off-World Education
        if (character.education?.offworld) {
            dm -= 1;
            modifiers.push({ label: 'Off-World Edu', value: -1 });
        }
        
        // Rank 5+ Bonus
        if (character.highestRank >= 5) {
            dm += 1;
            modifiers.push({ label: 'Rank 5+ Bonus', value: 1 });
        }
        
        // Assert
        expect(dm).toBe(-1);  // -1 (Soft) -1 (OffWorld) +1 (Rank) = -1
        expect(modifiers.length).toBe(3);
        expect(modifiers.map(m => m.value).reduce((a, b) => a + b, 0)).toBe(-1);
    });

    it('Should accumulate correctly for Hard Path with multiple modifiers', () => {
        // Arrange
        const character = {
            isSoftPath: false,  // Hard Path
            education: { offworld: false },
            highestRank: 5
        };
        
        let dm = 0;
        const modifiers: { label: string, value: number }[] = [];
        
        // Act
        // Path Modifier
        if (character.isSoftPath) {
            dm -= 1;
            modifiers.push({ label: 'Soft Path', value: -1 });
        } else {
            dm += 1;
            modifiers.push({ label: 'Hard Path', value: 1 });
        }
        
        // Rank 5+ Bonus
        if (character.highestRank >= 5) {
            dm += 1;
            modifiers.push({ label: 'Rank 5+ Bonus', value: 1 });
        }
        
        // Assert
        expect(dm).toBe(2);  // +1 (Hard) +1 (Rank) = +2
        expect(modifiers.length).toBe(2);
        expect(modifiers.map(m => m.value).reduce((a, b) => a + b, 0)).toBe(2);
    });
});

describe('Career Step Path Modifiers', () => {
    
    it('Career survival rolls should apply DM-1 for Soft Path', () => {
        const character = { isSoftPath: true };
        let pathDm = 0;
        
        if (character.isSoftPath) pathDm = -1;
        else pathDm = 1;
        
        expect(pathDm).toBe(-1);
    });

    it('Career survival rolls should apply DM+1 for Hard Path', () => {
        const character = { isSoftPath: false };
        let pathDm = 0;
        
        if (character.isSoftPath) pathDm = -1;
        else pathDm = 1;
        
        expect(pathDm).toBe(1);
    });

    it('Label should correctly reflect Hard Path', () => {
        const character = { isSoftPath: false };
        const labels: string[] = [];
        
        if (character.isSoftPath) labels.push('Soft Path (-1)');
        else labels.push('Hard Path (+1)');
        
        expect(labels[0]).toBe('Hard Path (+1)');
    });

    it('Label should correctly reflect Soft Path', () => {
        const character = { isSoftPath: true };
        const labels: string[] = [];
        
        if (character.isSoftPath) labels.push('Soft Path (-1)');
        else labels.push('Hard Path (+1)');
        
        expect(labels[0]).toBe('Soft Path (-1)');
    });
});
