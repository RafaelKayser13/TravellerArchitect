import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CareerDefinition } from '../models/career.model';

@Injectable({
  providedIn: 'root'
})
export class CareerService {
  private _careers = signal<Map<string, CareerDefinition>>(new Map());
  public careers = this._careers.asReadonly();

  private careerIds = [
    'agent', 
    'army',
    'citizen',
    'drifter', 
    'entertainer',
    'marine',
    'merchant',
    'navy',
    'noble',
    'rogue',
    'scholar',
    'scout',
    'prisoner',
    'spaceborne'
  ];

  constructor(private http: HttpClient) {}

  async loadAllCareers(): Promise<void> {
    const map = new Map<string, CareerDefinition>();
    
    const promises = this.careerIds.map(id => 
      firstValueFrom(this.http.get<any>(`assets/data/careers/${id}.json`))
        .then(data => {
            const mapRank = (r: any) => {
                const rank: any = { level: r.level, title: r.title };
                if (r.bonus) {
                    if (typeof r.bonus === 'string') {
                        rank.bonus = r.bonus;
                    } else if (typeof r.bonus === 'object') {
                        const label = r.bonus.skill || r.bonus.stat;
                        const validValue = r.bonus.value;
                        rank.bonusSkill = label;
                        rank.bonusValue = validValue;
                        rank.bonus = `${label} ${validValue}`;
                    }
                }
                return rank;
            };

            const career: CareerDefinition = {
                id: data.id,
                name: data.name,
                description: data.description,
                qualificationStat: data.qualification.stat,
                qualificationTarget: data.qualification.target,
                minAttributes: data.qualification.minAttributes,
                personalSkills: data.skills.personal,
                serviceSkills: data.skills.service,
                advancedEducation: data.skills.advanced,
                advancedEducationMinEdu: data.advancedEducationMinEdu || 8,
                officerSkills: data.skills.officer,
                officerRanks: data.officerRanks ? data.officerRanks.map(mapRank) : undefined,
                eventTable: data.eventTable,
                mishapTable: data.mishapTable,
                assignments: data.assignments.map((a: any) => ({
                    name: a.name,
                    survivalStat: a.survival.stat,
                    survivalTarget: a.survival.target,
                    advancementStat: a.advancement.stat,
                    advancementTarget: a.advancement.target,
                    skillTable: a.skills,
                    ranks: a.ranks.map(mapRank)
                })),
                musteringOutCash: data.musteringOut.cash,
                musteringOutBenefits: data.musteringOut.benefits,
                medical: data.medical
            };
            map.set(career.name, career);
            map.set(career.id, career);
        })
        .catch(err => console.warn(`Failed to load career ${id}:`, err))
    );

    await Promise.all(promises);
    this._careers.set(map);
  }

  getCareer(name: string): CareerDefinition | undefined {
    return this._careers().get(name);
  }

  getAllCareers(): CareerDefinition[] {
    // Return unique careers (map has it by name and id)
    const values = Array.from(this._careers().values());
    const unique: CareerDefinition[] = [];
    const seenIds = new Set<string>();
    
    for (const c of values) {
        if (!seenIds.has(c.id)) {
            unique.push(c);
            seenIds.add(c.id);
        }
    }
    return unique;
  }
}
