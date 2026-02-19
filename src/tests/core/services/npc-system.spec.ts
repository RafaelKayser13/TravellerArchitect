/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CharacterService } from '../../../app/core/services/character.service';
import { StorageService } from '../../../app/core/services/storage.service';
import { SkillService } from '../../../app/core/services/skill.service';
import { NPC } from '../../../app/core/models/career.model';

describe('NPC Relationship System', () => {
    let service: CharacterService;
    let storage: StorageService;

    beforeEach(() => {
        storage = new StorageService();
        const skillService = new SkillService();
        vi.spyOn(storage, 'save');
        service = new CharacterService(storage, skillService);
        service.reset();
    });

    const mockNpc: NPC = {
        id: 'npc-1',
        name: 'Test NPC',
        type: 'contact',
        origin: 'Navy Term 1',
        notes: 'Useful ally'
    };

    it('should add an NPC and log it to history', () => {
        service.addNpc(mockNpc);
        const char = service.character();

        expect(char.npcs).toHaveLength(1);
        expect(char.npcs[0]).toEqual(mockNpc);
        expect(char.history).toContain('**NPC Gained**: Test NPC (contact) - Navy Term 1');
    });

    it('should convert an NPC type', () => {
        service.addNpc(mockNpc);
        service.convertNpc('npc-1', 'rival');

        const char = service.character();
        expect(char.npcs[0].type).toBe('rival');
        expect(char.history).toContain('**NPC Changed**: Test NPC is now a rival');
    });

    it('should not break if converting non-existent NPC type', () => {
        service.convertNpc('ally', 'enemy');
        const char = service.character();
        expect(char.npcs).toHaveLength(0);
    });

    it('should remove an NPC by ID', () => {
        service.addNpc(mockNpc);
        service.removeNpc('npc-1');

        const char = service.character();
        expect(char.npcs).toHaveLength(0);
        expect(char.history).toContain('**NPC Removed**: Test NPC (contact)');
    });

    it('should track DM bonuses', () => {
        service.updateDm('qualification', 2);
        const char = service.character();

        expect(char.nextQualificationDm).toBe(2);
        expect(char.history).toContain('**DM Bonus**: +2 to next qualification roll');
    });
});
