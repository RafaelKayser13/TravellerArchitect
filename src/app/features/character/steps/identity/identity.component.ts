import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../../../core/services/character.service';
import { WizardFlowService } from '../../../../core/services/wizard-flow.service';
import { StepHeaderComponent } from '../../../shared/step-header/step-header.component';

@Component({
  selector: 'app-identity',
  standalone: true,
  imports: [FormsModule, StepHeaderComponent],
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss']
})
export class IdentityComponent implements OnInit, OnDestroy {
  protected characterService = inject(CharacterService);
  private wizardFlow = inject(WizardFlowService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.wizardFlow.registerValidator(1, () => this.isValid());
    this.wizardFlow.registerFinishAction(1, () => this.finish());
  }

  ngOnDestroy(): void {
    this.wizardFlow.unregisterStep(1);
  }

  charName = '';
  playerName = '';
  nickname = '';
  age = 18;
  description = '';
  gender = '';
  portraitUrl = '';

  constructor() {
    const char = this.characterService.character();
    this.charName = char.name;
    this.playerName = char.playerName || '';
    this.nickname = char.nickname || '';
    this.age = char.age || 18;
    this.description = char.description || '';
    this.gender = char.gender || 'Male';
    this.portraitUrl = char.portraitUrl || '';
  }

  generateRandomName() {
    const maleNames = [
      'Kaelen', 'Jaxon', 'Dax', 'Soren', 'Zane', 'Riker', 'Cyrus', 'Malick', 'Vance', 'Kael',
      'Torin', 'Gideon', 'Cassian', 'Dorian', 'Silas', 'Xavier', 'Lucian', 'Balthazar', 'Corvus', 'Fenris',
      'Valen', 'Ronan', 'Kasper', 'Ivor', 'Theron', 'Alaric', 'Elias', 'Stellan', 'Vesper', 'Arlo',
      'Callum', 'Felix', 'Hugo', 'Jasper', 'Milo', 'Oscar', 'Quinn', 'Roscoe', 'Saffron', 'Theodore',
      'Atticus', 'Beckett', 'Caleb', 'Dante', 'Ezra', 'Finn', 'Gage', 'Holden', 'Isaac', 'Jude'
    ];
    const femaleNames = [
      'Lyra', 'Kira', 'Nyx', 'Vora', 'Elora', 'Sela', 'Kaelie', 'Zara', 'Mira', 'Nova',
      'Astra', 'Luna', 'Selene', 'Isolde', 'Freya', 'Hestia', 'Eris', 'Callista', 'Thalia', 'Iris',
      'Juniper', 'Saffron', 'Willow', 'Hazel', 'Rowan', 'Artemis', 'Athena', 'Diana', 'Vesta', 'Juno',
      'Beatrix', 'Cleo', 'Daphne', 'Esme', 'Flora', 'Gaia', 'Hebe', 'Ione', 'Kora', 'Leda',
      'Maya', 'Nora', 'Olive', 'Phoebe', 'Rhea', 'Sage', 'Tessa', 'Una', 'Vera', 'Willa'
    ];
    const lastNames = [
      'Sterling', 'Krax', 'Holloway', 'Thorne', 'Ryder', 'Nox', 'Frost', 'Echo', 'Blade', 'Vance',
      'Blackwood', 'Ironfoot', 'Stormborn', 'Nightshade', 'Silverlight', 'Ashford', 'Davenport', 'Kingsley', 'Pendragon', 'Riverside',
      'Shadowstep', 'Thundercut', 'Whitethorn', 'Windwalker', 'Wolfheart', 'Crest', 'Drake', 'Falcon', 'Griffin', 'Hawk'
    ];
    
    let firstNames: string[] = [];
    if (this.gender === 'Male') {
      firstNames = maleNames;
    } else if (this.gender === 'Female') {
      firstNames = femaleNames;
    } else {
      // Non-Binary uses both male and female pools
      firstNames = [...maleNames, ...femaleNames];
    }

    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    this.charName = `${first} ${last}`;
    this.save();
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image too large. Please select a file under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.portraitUrl = e.target.result;
        this.save();
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.portraitUrl = '';
    this.save();
  }

  isValid(): boolean {
    return this.charName.trim().length > 0 && 
           this.gender.trim().length > 0 && 
           this.age >= 18;
  }

  save() {
    this.characterService.updateCharacter({
      name: this.charName,
      playerName: this.playerName,
      gender: this.gender,
      nickname: this.nickname,
      age: this.age,
      description: this.description,
      portraitUrl: this.portraitUrl
    });
    this.wizardFlow.notifyValidation();
  }

  finish() {
    if (this.isValid()) {
      this.save();
      this.wizardFlow.advance();
    }
  }
}
