import { Component, Injectable, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ShipOption {
    id: string;
    name: string;
    category: 'Merchant' | 'Scout' | 'Scholar' | 'Navy' | 'Noble';
    description: string;
    tonnage: number;
    jumpDrive: number;
    manDrive: number;
    cost: number;
    mortgage: number; // 25% of cost
    crew: number;
    specs: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ShipSelectionService {
    private showDialog = signal(false);
    private selectedCareer = signal<string>('');
    private ships = signal<ShipOption[]>([]);
    private resolvePromise: ((ship: ShipOption | null) => void) | null = null;

    isDialogOpen = this.showDialog;
    getSelectedCareer = this.selectedCareer;
    getShips = this.ships;

    async selectShip(careerName: string, availableShips: ShipOption[]): Promise<ShipOption | null> {
        return new Promise((resolve) => {
            this.selectedCareer.set(careerName);
            this.ships.set(availableShips);
            this.showDialog.set(true);
            this.resolvePromise = resolve;
        });
    }

    selectShip_confirm(ship: ShipOption) {
        this.showDialog.set(false);
        if (this.resolvePromise) {
            this.resolvePromise(ship);
            this.resolvePromise = null;
        }
    }

    selectShip_cancel() {
        this.showDialog.set(false);
        if (this.resolvePromise) {
            this.resolvePromise(null);
            this.resolvePromise = null;
        }
    }
}

@Component({
    selector: 'app-ship-selection-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './ship-selection-dialog.component.html',
    styleUrls: ['./ship-selection-dialog.component.scss']
})
export class ShipSelectionDialogComponent {
    constructor(private shipService: ShipSelectionService) { }

    get isOpen() {
        return this.shipService.isDialogOpen;
    }

    get selectedCareer() {
        return this.shipService.getSelectedCareer;
    }

    get ships() {
        return this.shipService.getShips;
    }

    onSelectShip(ship: ShipOption) {
        this.shipService.selectShip_confirm(ship);
    }

    onCancel() {
        this.shipService.selectShip_cancel();
    }

    formatCredits(amount: number): string {
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(1)} MCr`;
        } else if (amount >= 1000) {
            return `${(amount / 1000).toFixed(1)} kCr`;
        }
        return `Cr${amount}`;
    }
}

// Available Ship Options for Muster-Out Benefits
export const MUSTER_OUT_SHIPS: Record<string, ShipOption> = {
    FREE_TRADER: {
        id: 'free-trader',
        name: 'Free Trader',
        category: 'Merchant',
        description: 'TL10 trading vessel. The workhorse of merchant servicemembers.',
        tonnage: 100,
        jumpDrive: 1,
        manDrive: 1,
        cost: 10000000, // 10 MCr
        mortgage: 2500000, // 25%
        crew: 4,
        specs: ['4 Staterooms', 'Cargo Hold ~16t', 'Fuel Scoop', 'Basic Bridge']
    },
    SCOUT_SHIP: {
        id: 'scout-ship',
        name: 'Scout/Courier',
        category: 'Scout',
        description: 'TL10 exploration vessel. Made famous by the Scout Service.',
        tonnage: 100,
        jumpDrive: 2,
        manDrive: 2,
        cost: 10000000,
        mortgage: 2500000,
        crew: 2,
        specs: ['5 Staterooms', 'Advanced Bridge', 'Fuel Scoop', 'Improved Sensors']
    },
    LAB_SHIP: {
        id: 'lab-ship',
        name: 'Scientific Research Ship',
        category: 'Scholar',
        description: 'TL10 research vessel. Designed for long exploration missions.',
        tonnage: 100,
        jumpDrive: 1,
        manDrive: 1,
        cost: 10000000,
        mortgage: 2500000,
        crew: 6,
        specs: ['2 Staterooms', 'Lab Module', 'Cargo 20t', 'Basic Bridge', 'Fuel Scoop']
    },
    YACHT: {
        id: 'yacht',
        name: 'Yacht (Large)',
        category: 'Noble',
        description: 'TL10 luxury vessel. Status symbol for the rich and powerful.',
        tonnage: 100,
        jumpDrive: 1,
        manDrive: 1,
        cost: 11000000, // 11 MCr
        mortgage: 2750000,
        crew: 2,
        specs: ['8 Staterooms (luxury)', 'Entertainment Suite', 'Bar/Lounge', 'Small Cargo']
    },
    SHIPS_BOAT: {
        id: 'ships-boat',
        name: "Ship's Boat",
        category: 'Navy',
        description: 'TL10 small vessel. Typically carried by larger ships.',
        tonnage: 4,
        jumpDrive: 0,
        manDrive: 1,
        cost: 200000,
        mortgage: 50000,
        crew: 1,
        specs: ['Tender Vessel', 'Carried by 100t+ ships', 'Atmospheric Landing']
    }
};
