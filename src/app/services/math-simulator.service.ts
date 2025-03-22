// src/app/services/match-simulator.service.ts

import { Injectable } from '@angular/core';
import { Team, Match } from '../state/league/league.model';

@Injectable({
  providedIn: 'root',
})
export class MatchSimulatorService {
  private totalWeeks: number;

  constructor() {
    this.totalWeeks = 6; // 4 takımlı ligde her takım diğerleriyle 2 kez karşılaşır
  }

  // Tüm maçları oluştur
  generateAllMatches(teams: Team[]): Match[] {
    const matches: Match[] = [];
    const totalRounds = teams.length - 1;
    const matchesPerRound = teams.length / 2;

    const teamIndexes = teams.map((_, index) => index);
    const fixedTeamIndex = teamIndexes.pop()!;

    for (let round = 0; round < totalRounds * 2; round++) {
      for (let matchIndex = 0; matchIndex < matchesPerRound; matchIndex++) {
        const homeIndex = matchIndex;
        const awayIndex = (totalRounds - matchIndex + round) % totalRounds;

        let homeTeam = teams[homeIndex];
        let awayTeam = teams[awayIndex];

        if (round >= totalRounds) {
          [homeTeam, awayTeam] = [awayTeam, homeTeam];
        }

        const match: Match = {
          homeTeam,
          awayTeam,
          homeGoals: 0,
          awayGoals: 0,
          week: round + 1,
        };

        matches.push(match);
      }

      if (round < totalRounds - 1) {
        teamIndexes.splice(1, 0, teamIndexes.pop()!);
      }
    }

    return matches;
  }

  // Belirli bir haftanın maçlarını oynat
  simulateWeek(teams: Team[], week: number): Match[] {
    const matches = this.generateAllMatches(teams).filter(
      (match) => match.week === week
    );

    matches.forEach((match) => {
      const homeGoals = this.generateRandomGoals();
      const awayGoals = this.generateRandomGoals();

      match.homeGoals = homeGoals;
      match.awayGoals = awayGoals;

      this.updateTeamStats(match.homeTeam, homeGoals, awayGoals);
      this.updateTeamStats(match.awayTeam, awayGoals, homeGoals);
    });

    return matches;
  }

  // Rastgele gol sayısı üret
  private generateRandomGoals(): number {
    return Math.floor(Math.random() * 5); // 0 ile 4 arasında rastgele gol sayısı
  }

  // Takım istatistiklerini güncelle
  private updateTeamStats(team: Team, goalsFor: number, goalsAgainst: number) {
    team.matchesPlayed++;
    team.goalDifference += goalsFor - goalsAgainst;

    if (goalsFor > goalsAgainst) {
      team.points += 3; // Galibiyet
    } else if (goalsFor === goalsAgainst) {
      team.points += 1; // Beraberlik
    }
  }
}
