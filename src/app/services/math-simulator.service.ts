import { Injectable } from '@angular/core';
import { Team, Match } from '../state/league/league.model';

@Injectable({ providedIn: 'root' })
export class MatchSimulatorService {

  generateFixture(teams: Team[]): Match[] {
    const fixture: Match[] = [];
    const teamCount = teams.length;
    const totalWeeks = teamCount - 1;
    const matchesPerWeek = teamCount / 2;

    const teamList = [...teams]; // teams dizisini koru, mutasyona uğratma!

    for (let week = 0; week < totalWeeks; week++) {
      for (let i = 0; i < matchesPerWeek; i++) {
        const home = teamList[i];
        const away = teamList[teamCount - 1 - i];

        fixture.push({
          homeTeamId: home.id,
          awayTeamId: away.id,
          homeGoals: 0,
          awayGoals: 0,
          week: week + 1,
          played: false,
        });
        
      }

      // Takımları doğru şekilde rotasyona sokalım
      teamList.splice(1, 0, teamList.pop()!);
    }

    return fixture;
  }

  simulateWeek(matches: Match[], week: number): Match[] {
    return matches
      .filter(m => m.week === week && !m.played)
      .map(match => ({
        ...match,
        homeGoals: this.randomGoal(),
        awayGoals: this.randomGoal(),
        played: true,
      }));
  }
  

  simulateMatch(match: Match): Match {
    return {
      ...match,
      homeGoals: this.randomGoal(),
      awayGoals: this.randomGoal(),
      played: true,
    };
  }

  private randomGoal(): number {
    return Math.floor(Math.random() * 10); // Düzeltildi (0-4 arası)
  }
}
