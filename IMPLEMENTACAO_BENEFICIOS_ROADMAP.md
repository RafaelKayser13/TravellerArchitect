# IMPLEMENTAÇÃO - CORREÇÕES DO SISTEMA DE BENEFÍCIOS

**Prioridade**: CRÍTICO → ALTO → MÉDIO

---

## PARTE 1: CRÍTICO - EXIBIÇÃO DE CASH/MATERIAL BENEFITS

### 🔴 PROBLEMA
Screenshot mostra lista de benefícios VAZIA. Need to debug e fixar renderização.

### 📂 Arquivo Principal
`src/app/features/character/steps/career/career.component.ts` (linhas ~2330-2370)

### PASSO 1: Verificar Structure de Datos

```typescript
// Career.component.ts - Verificar sinais:

// Current state:
musterOutBenefitsLog: WritableSignal<string[]> = signal([]);
musterOutCashLog: WritableSignal<string[]> = signal([]); // Existe?
musterOutMaterialLog: WritableSignal<string[]> = signal([]); // Existe?

// RECOMENDAÇÃO: Consolidar em um objeto
benefitRollsLog: WritableSignal<{
  cash: string[];
  material: string[];
  details: Array<{
    type: 'cash' | 'material';
    value: number;
    career: string;
    timestamp: number;
  }>;
}> = signal({ cash: [], material: [], details: [] });
```

### PASSO 2: Template - Renderizar Corretamente

```html
<!-- career.component.html -->
@if (currentState() === 'MUSTER_OUT_ROLLING') {
  <div class="mustering-out-section">
    
    <!-- CASH ROLLS -->
    <div class="cash-section">
      <h3>Cash Rolls</h3>
      <p class="info">{{ cashRollSpent() }}/3 Lifetime</p>
      
      @if (benefitRollsLog().cash.length > 0) {
        <ul class="benefit-list">
          @for (cashEntry of benefitRollsLog().cash; track $index) {
            <li>{{ cashEntry }}</li>
          }
        </ul>
      } @else {
        <p class="no-data">No cash rolls yet</p>
      }
      
      <button (click)="rollBenefit('Cash')" 
              [disabled]="cashRollSpent() >= 3 || !hasAllocatedRolls('Cash')">
        Roll Cash
      </button>
    </div>

    <!-- MATERIAL ROLLS -->
    <div class="material-section">
      <h3>Material/Equipment Rolls</h3>
      
      @if (benefitRollsLog().material.length > 0) {
        <ul class="benefit-list">
          @for (materialEntry of benefitRollsLog().material; track $index) {
            <li>{{ materialEntry }}</li>
          }
        </ul>
      } @else {
        <p class="no-data">No material rolls yet</p>
      }
      
      <button (click)="rollBenefit('Material')"
              [disabled]="!hasAllocatedRolls('Material')">
        Roll Material
      </button>
    </div>

  </div>
}
```

### PASSO 3: Implementar Logging Correto

```typescript
// Career.component.ts - rollBenefit() method

rollBenefit(type: 'Cash' | 'Material'): void {
  const char = this.characterService.character();
  const careerName = this.musterOutCareerName();
  
  // ===== DEBUGGING =====
  console.log(`🎲 Rolling ${type} for ${careerName}`)
  console.log(`   Allocated: ${this.benefitRollsAllocated[careerName]?.[type]}`)
  
  // Roll dice
  const roll = this.diceService.roll(1, 6);
  
  // Get benefit from table
  const benefit = this.getBenefitFromTable(careerName, roll, type);
  console.log(`   Result: ${roll} = ${benefit.name}`)
  
  // Apply benefit
  this.applyBenefit(benefit);
  
  // LOG TO SIGNAL (IMPROVED)
  const logEntry = `${benefit.name} (${type})`;
  
  this.benefitRollsLog.update(log => ({
    ...log,
    [type.toLowerCase()]: [...log[type.toLowerCase()], logEntry],
    details: [
      ...log.details,
      {
        type: type === 'Cash' ? 'cash' : 'material',
        value: benefit.value || 0,
        career: careerName,
        timestamp: Date.now()
      }
    ]
  }));
  
  console.log(`✅ Updated log:`, this.benefitRollsLog()); // CRITICAL DEBUG
  
  // Decrement allocated
  this.spendBenefitRoll(careerName, 1, type === 'Cash');
}
```

### PASSO 4: Adicionar Testes de Debug

```bash
# Terminal - Adicionar este teste temporário
npm run test -- career.component.spec.ts --watch
```

```typescript
// career.component.spec.ts

describe('Career Component - Mustering Out Benefits Display', () => {
  it('should log cash benefits when rolling', fakeAsync(() => {
    // Setup
    component.currentState.set('MUSTER_OUT_ROLLING');
    component.benefitRollsAllocated = { 'Noble': { cash: 1, material: 2 } };
    
    // Act
    component.rollBenefit('Cash');
    tick();
    
    // Assert
    const log = component.benefitRollsLog();
    expect(log.cash.length).toBe(1);
    expect(log.cash[0]).toContain('Cr');
    
    // VERIFY TEMPLATE CAN ACCESS IT
    fixture.detectChanges();
    const listItems = fixture.debugElement.querySelectorAll('.benefit-list li');
    expect(listItems.length).toBe(1);
  }));
});
```

---

## PARTE 2: CRÍTICO - SISTEMA DE RE-ROLLS (DUPLICATAS)

### 🔴 PROBLEMA
Se rolar o mesmo valor DUAS VEZES na tabela de benefícios, sistema aplica 2x normal, NÃO oferece choice.

### EXEMPLO DO RULEBOOK
```
Benefit: "Gun"
1st time: Gain 1x Common Gun
2nd time: Gain 2x Common Guns OR +1 Gun Combat Skill

Benefit: "Ship Share"  
1st time: Gain 1 Ship Share
2nd time: Gain 2 Ship Shares (or total +1 to Merchant Skill)
```

### SOLUÇÃO

#### PASSO 1: Estender Character Model

```typescript
// src/app/core/models/character.model.ts

export interface Character {
  // ... existing fields ...
  
  // TRACKING PARA RE-ROLLS
  benefitRollsHistory: Array<{
    careerName: string;
    benefitId: string;
    benefitName: string;
    rollResult: number;
    term: number;
    doubleCount: number; // How many times this rolled again
  }>;
}
```

#### PASSO 2: ExtenderCareer Service

```typescript
// src/app/core/services/career.service.ts

// Nova função para verificar se é duplicate
getPreviousBenefitRolls(careerName: string, benefits: string[] = []) {
  return this.character().benefitRollsHistory
    .filter(h => h.careerName === careerName && benefits.includes(h.benefitName));
}

// Checker: foi rolled antes?
wasBenefitRolledBefore(careerName: string, benefitName: string): boolean {
  return this.getPreviousBenefitRolls(careerName, [benefitName]).length > 0;
}
```

#### PASSO 3: Implementar em rollBenefit()

```typescript
// career.component.ts - rollBenefit() UPDATED

async rollBenefit(type: 'Cash' | 'Material'): Promise<void> {
  const char = this.characterService.character();
  const careerName = this.musterOutCareerName();
  
  // Standard roll
  const roll = this.diceService.roll(1, 6);
  const benefit = this.getBenefitFromTable(careerName, roll, type);
  
  // ===== NEW: CHECK FOR DUPLICATES =====
  const wasPreviouslyRolled = this.wasBenefitRolledBefore(careerName, benefit.name);
  
  if (wasPreviouslyRolled && benefit.canBeDuplicated) {
    // SHOW CHOICE DIALOG
    const choice = await this.showBenefitDuplicateDialog(benefit);
    
    switch (choice) {
      case 'double':
        this.applyDuplicatedBenefit(benefit);
        break;
      case 'alternative':
        const altBenefit = benefit.alternativeBenefit;
        this.applyBenefit(altBenefit);
        break;
    }
  } else {
    // Normal application
    this.applyBenefit(benefit);
  }
  
  // Log to history
  this.characterService.logBenefitRoll({
    careerName,
    benefitName: benefit.name,
    rollResult: roll,
    term: char.careerHistory.length,
    doubleCount: wasPreviouslyRolled ? 1 : 0
  });
  
  // Update UI log
  this.benefitRollsLog.update(log => ({
    ...log,
    [type.toLowerCase()]: [...log[type.toLowerCase()], benefit.name]
  }));
}

// Nova: Dialog para duplicata
private async showBenefitDuplicateDialog(benefit: any): Promise<'double' | 'alternative'> {
  return new Promise((resolve) => {
    const dialogRef = this.dialog.open(BenefitDuplicateDialogComponent, {
      data: { benefit },
      disableClose: true
    });
    
    dialogRef.afterClosed().subscribe(result => {
      resolve(result);
    });
  });
}

// Nova: Aplicar benefício duplicado
private applyDuplicatedBenefit(benefit: any): void {
  if (benefit.type === 'skill') {
    // +1 to existing skill instead of adding another
    this.characterService.addSkillBonus(benefit.skillName, 1);
  } else if (benefit.type === 'resource') {
    // Double the count
    this.characterService.addResource(benefit.resourceName, benefit.count * 2);
  } else if (benefit.type === 'stat') {
    // +2 instead of +1
    this.characterService.increaseStat(benefit.statName, 2);
  }
}
```

#### PASSO 4: Criar Dialog Component

```bash
# Generate dialog component
ng generate component shared/benefit-duplicate-dialog --standalone
```

```typescript
// benefit-duplicate-dialog.component.ts

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-benefit-duplicate-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-content">
      <h2>{{ data.benefit.name }} - Rolled Again!</h2>
      
      <p class="description">
        You have rolled <strong>{{ data.benefit.name }}</strong> before. What would you like to do?
      </p>
      
      <div class="options">
        <!-- Option 1: Double -->
        <button class="option-button" (click)="choose('double')">
          <div class="option-title">Take Twice</div>
          <div class="option-desc">{{ data.benefit.doubleDescription }}</div>
        </button>
        
        <!-- Option 2: Alternative -->
        @if (data.benefit.alternativeBenefit) {
          <button class="option-button" (click)="choose('alternative')">
            <div class="option-title">Alternative Benefit</div>
            <div class="option-desc">{{ data.benefit.alternativeBenefit.description }}</div>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .dialog-content { padding: 20px; }
    .options { display: flex; gap: 10px; margin-top: 20px; }
    .option-button {
      flex: 1;
      padding: 15px;
      border: 2px solid #ccc;
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .option-button:hover { border-color: #007bff; }
    .option-title { font-weight: bold; margin-bottom: 5px; }
    .option-desc { font-size: 0.9em; color: #666; }
  `]
})
export class BenefitDuplicateDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BenefitDuplicateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  
  choose(option: 'double' | 'alternative'): void {
    this.dialogRef.close(option);
  }
}
```

---

## PARTE 3: CRÍTICO - VEHICLE & EQUIPMENT SELECTION

### 🔴 PROBLEMA
Benefícios como "Free Trader" (navio), "Lab Ship", "Cybernetic Implant" não têm seleção modal.

### SOLUÇÃO

#### PASSO 1: Criar Modal de Seleção

```bash
ng generate component shared/vehicle-selection-modal --standalone
```

```typescript
// vehicle-selection-modal.component.ts

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

export interface VehicleOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  mortgage: number; // 25% of cost
  specs?: string;
}

@Component({
  selector: 'app-vehicle-selection-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h2>Select Your {{ data.vehicleType }}</h2>
    </div>
    
    <div class="modal-body">
      @for (vehicle of data.vehicles; track vehicle.id) {
        <div class="vehicle-card" (click)="select(vehicle)">
          <h3>{{ vehicle.name }}</h3>
          <p class="description">{{ vehicle.description }}</p>
          
          <div class="specs">
            <span class="cost">Cr{{ vehicle.cost | number:'1.0-0' }}</span>
            <span class="mortgage">Mortgage: Cr{{ vehicle.mortgage | number:'1.0-0' }}</span>
          </div>
          
          @if (vehicle.specs) {
            <p class="specs-text">{{ vehicle.specs }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .modal-header { padding: 20px; border-bottom: 1px solid #ccc; }
    .modal-body { max-height: 500px; overflow-y: auto; padding: 20px; }
    
    .vehicle-card {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .vehicle-card:hover {
      border-color: #007bff;
      box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
    }
    
    .vehicle-card h3 { margin: 0 0 10px 0; }
    .description { color: #666;font-size: 0.9em; margin: 10px 0; }
    
    .specs { display: flex; gap: 20px; margin: 10px 0; }
    .cost { font-weight: bold; color: #28a745; }
    .mortgage { color: #dc3545; }
    .specs-text { font-size: 0.85em; color: #999; margin-top: 10px; }
  `]
})
export class VehicleSelectionModalComponent {
  constructor(
    public dialogRef: MatDialogRef<VehicleSelectionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { vehicleType: string; vehicles: VehicleOption[] }
  ) {}
  
  select(vehicle: VehicleOption): void {
    this.dialogRef.close(vehicle);
  }
}
```

#### PASSO 2: Adicionar Dados de Veículos

```typescript
// src/app/data/benefit-vehicles.ts

export const BENEFIT_VEHICLES = {
  MERCHANT: {
    freeTrader: {
      id: 'free-trader',
      name: 'Free Trader',
      description: 'A small trading vessel rated at 100 tons',
      cost: 10000000, // 10 MCr
      mortgage: 2500000, // 25%
      specs: 'J-1, M-1, Basic Bridge, 4 Staterooms + Cargo'
    }
  },
  SCOUT: {
    scoutShip: {
      id: 'scout-ship',
      name: 'Scout/Courier',
      description: 'Fast exploration vessel',
      cost: 10000000,
      mortgage: 2500000,
      specs: 'J-2, M-2, Advanced Bridge, 5 Staterooms'
    }
  },
  SCHOLAR: {
    labShip: {
      id: 'lab-ship',
      name: 'Scientific Research Ship',
      description: 'Vessel designed for research missions',
      cost: 10000000,
      mortgage: 2500000,
      specs: 'J-1, M-1, Science Lab, 2 Staterooms + Cargo'
    }
  },
  NAVY: {
    shipsBoa: {
      id: 'boats-boat',
      name: "Ship's Boat",
      description: 'Small vessel tender',
      cost: 200000,
      mortgage: 50000,
      specs: 'N/A (carried by larger ships)'
    }
  }
};

export const AUGMENTATION_OPTIONS = {
  CYBERNETIC: [
    {
      id: 'cyberarm',
      name: 'Cybernetic Arm',
      costCr: 250000,
      endDamage: 1
    },
    {
      id: 'cyberleg',
      name: 'Cybernetic Leg',
      costCr: 250000,
      endDamage: 1
    },
    {
      id: 'cyberoptic',
      name: 'Cybernetic Eye',
      costCr: 100000,
      endDamage: 0
    },
    {
      id: 'neural-jack',
      name: 'Neural Jack',
      costCr: 50000,
      endDamage: 0
    }
  ]
};
```

#### PASSO 3: Chamar Modal em rollBenefit()

```typescript
// career.component.ts - Adicionar ao rollBenefit():

if (benefit.id === 'free-trader' || benefit.id === 'scout-ship' || benefit.id === 'lab-ship') {
  const dialogRef = this.dialog.open(VehicleSelectionModalComponent, {
    data: {
      vehicleType: benefit.name,
      vehicles: [BENEFIT_VEHICLES[careerType][benefit.id]]
    }
  });
  
  dialogRef.afterClosed().subscribe((selectedVehicle) => {
    if (selectedVehicle) {
      this.characterService.addVehicle(selectedVehicle);
      const logEntry = `${selectedVehicle.name} (Cr${selectedVehicle.cost})`;
      this.addToBenefitLog(logEntry, 'Material');
    }
  });
}
```

---

## PARTE 4: ALTO - INHERITANCE BONUS (+1 DM)

### 📋 PROBLEMA
Noble career event não está sendo armazenado/aplicado como +1 DM reutilizável.

### SOLUÇÃO

#### PASSO 1: Estender Character Model

```typescript
// src/app/core/models/character.model.ts

export interface Character {
  // ... existing ...
  
  inheritanceBonuses: Array<{
    careerName: string;    // "Noble" only
    termReceived: number;
    used: boolean;
    appliedToRollId?: string;
  }>;
}
```

#### PASSO 2: Atualizar Character Service

```typescript
// src/app/core/services/character.service.ts

addInheritanceBonus(careerName: string): void {
  const char = this.character();
  const updated = {
    ...char,
    inheritanceBonuses: [
      ...(char.inheritanceBonuses || []),
      {
        careerName,
        termReceived: char.careerHistory.length,
        used: false
      }
    ]
  };
  this.character.set(updated);
}

getAvailableInheritanceBonuses(): number {
  const char = this.character();
  return (char.inheritanceBonuses || []).filter(b => !b.used).length;
}

useInheritanceBonus(): boolean {
  const char = this.character();
  const bonus = (char.inheritanceBonuses || []).find(b => !b.used);
  
  if (bonus) {
    bonus.used = true;
    this.character.set({...char});
    return true;
  }
  return false;
}
```

#### PASSO 3: Implementar no rollBenefit()

```typescript
// career.component.ts - Em rollBenefit():

// NOVO: Build list of available DM modifiers
const dmModifiers = [];
let totalDM = 0;

// Hard Path / Soft Path
if (char.isSoftPath) {
  totalDM -= 1;
  dmModifiers.push({label: 'Soft Path', value: -1});
} else {
  totalDM += 1;
  dmModifiers.push({label: 'Hard Path', value: 1});
}

// Rank 5+ bonus
if (char.careerHistory[currentCareerIndex]?.rank >= 5) {
  totalDM += 1;
  dmModifiers.push({label: 'Rank 5+', value: 1});
}

// NOVO: Inheritance Bonus
const inheritBonusCount = this.characterService.getAvailableInheritanceBonuses();
if (inheritBonusCount > 0 && careerName === 'Noble') {
  dmModifiers.push({
    label: 'Inheritance Bonus',
    value: 1,
    optional: true
  });
}

// Show dialog letting player CHOOSE to apply inheritance bonus
if (inheritBonusCount > 0) {
  const useBonus = await this.showInheritanceBonusChoice();
  if (useBonus) {
    totalDM += 1;
    this.characterService.useInheritanceBonus();
  }
}
```

#### PASSO 4: Template com Checkbox

```html
<!-- career.component.html -->
@if (showInheritanceBonusChoice && currentState() === 'MUSTER_OUT_ROLLING') {
  <div class="inheritance-bonus-section">
    <label class="checkbox-wrapper">
      <input type="checkbox" [(ngModel)]="applyInheritanceBonus" />
      <span>Apply Inheritance Bonus (+1 DM)</span>
      <span class="remaining">({{ inheritanceBonusesRemaining }} remaining)</span>
    </label>
    <p class="hint">This can only be used once per benefit roll</p>
  </div>
}
```

---

## PARTE 5: ALTO - HOMEWORLD LEAVING ROLL DM

### 📋 PROBLEMA
Homeworld leaving roll não recebe Hard/Soft Path bonus.

### SOLUÇÃO

```typescript
// src/app/core/services/career-term.service.ts

rollLeavingHome(character: Character): number {
  let dm = 0;
  const modifiers = [];
  
  // Hard Path / Soft Path
  if (character.isSoftPath) {
    dm -= 1;
    modifiers.push({label: 'Soft Path', value: -1});
  } else {
    dm += 1;
    modifiers.push({label: 'Hard Path', value: 1});
  }
  
  // Homeworld-specific bonus (if defined in world data)
  if (character.homeworld) {
    const homeworldBonus = this.getHomeworldDM(character.homeworld);
    if (homeworldBonus) {
      dm += homeworldBonus;
      modifiers.push({label: `${character.homeworld} DM`, value: homeworldBonus});
    }
  }
  
  // Roll
  const roll = this.diceService.roll(2, 6) + dm;
  const success = roll >= 8;
  
  console.log(`✅ Leaving Home Roll: ${roll} (DM: ${dm}) = ${success ? 'SUCCESS' : 'FAIL'}`);
  console.log(`   Modifiers:`, modifiers);
  
  return success ? 1 : 0;
}

private getHomeworldDM(homeworld: string): number {
  // Lookup from world database
  const worldData = this.worldService.getWorld(homeworld);
  return worldData?.leavingHomeDM || 0;
}
```

---

## PARTE 6: TESTES E VALIDAÇÃO

```bash
# Executar testes de mustering out
npm run test -- --include="**/*mustering*"

# Verificar cobertura específica
npm run test -- --coverage --include="**/career*"

# Debug no console do navegador
ng serve --open
# Abrir Chrome DevTools → Console
# Verificar logs de rollBenefit()
```

---

## PRÓXIMAS PRIORIDADES

1. ✅ Implementar exibição de cash/material (HOJE)
2. ✅ Adicionar dialog de re-rolls (HOJE)
3. ✅ Vehicle selection modal (AMANHÃ)
4. ⏳ Inheritance bonus system (AMANHÃ)
5. ⏳ Homeworld DM fix (Quinta)
6. ⏳ Characteristic maximums (Quinta)

