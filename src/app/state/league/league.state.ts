import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Team, Match } from './league.model';
import { InitializeLeague, PlayAllMatches, PlayNextWeek } from './league.action';
import { Injectable } from '@angular/core';
import { MatchSimulatorService } from '../../services/math-simulator.service';

export interface LeagueStateModel {
  teams: Team[];
  matches: Match[];
  currentWeek: number;
}

@State<LeagueStateModel>({
  name: 'league',
  defaults: { teams: [], matches: [], currentWeek: 1 },
})
@Injectable()
export class LeagueState {
  constructor(private simulator: MatchSimulatorService) {}

  @Selector()
  static getTeams(state: LeagueStateModel): Team[] {
    return [...state.teams].sort(
      (a, b) => b.points - a.points || b.goalDifference - a.goalDifference
    );
  }

  @Selector()
  static getCurrentWeekMatches(state: LeagueStateModel): Match[] {
    return state.matches.filter(
      (m) => m.week === state.currentWeek && m.played
    );
  }

  @Action(InitializeLeague)
  initializeLeague(ctx: StateContext<LeagueStateModel>) {
    const teams: Team[] = [
      {
        id: 1,
        name: 'Beşiktaş',
        points: 0,
        goalDifference: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
      {
        id: 2,
        name: 'Fenerbahçe',
        points: 0,
        goalDifference: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
      {
        id: 3,
        name: 'Galatasaray',
        points: 0,
        goalDifference: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
      {
        id: 4,
        name: 'Trabzonspor',
        points: 0,
        goalDifference: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
      {
        id: 5,
        name: 'Çaykur Rizespor',
        points: 0,
        goalDifference: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
      {
        id: 6,
        name: 'Samsunspor',
        points: 0,
        goalDifference: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
      {
        id: 7,
        name: 'Kayserispor',
        points: 0,
        goalDifference: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
      {
        id: 8,
        name: 'Adana Demirspor',
        points: 0,
        goalDifference: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      },
    ];

    const fixture = this.simulator.generateFixture([...teams]);

    ctx.setState({ teams, matches: fixture, currentWeek: 1 });
  }

  @Action(PlayNextWeek)
  playNextWeek(ctx: StateContext<LeagueStateModel>) {
    const state = ctx.getState();
    const matchesThisWeek = this.simulator.simulateWeek(
      state.matches,
      state.currentWeek
    );

    const updatedTeams = state.teams.map((team) => ({ ...team }));

    matchesThisWeek.forEach((match) => {
      this.updateStats(updatedTeams, match);
    });

    ctx.patchState({
      teams: updatedTeams,
      matches: state.matches.map(
        (match) =>
          matchesThisWeek.find(
            (m) => m.homeTeam.id === match.homeTeam.id && m.week === match.week
          ) || match
      ),
      currentWeek: state.currentWeek + 1,
    });
  }
  @Action(PlayAllMatches)
  playAllMatches(ctx: StateContext<LeagueStateModel>) {
    const state = ctx.getState();
    const totalWeeks = Math.max(...state.matches.map(m => m.week)); // max hafta sayısı
    const updatedTeams = state.teams.map(team => ({ ...team }));
    let updatedMatches = [...state.matches];
  
    for (let week = state.currentWeek; week <= totalWeeks; week++) {
      const matchesThisWeek = this.simulator.simulateWeek(updatedMatches, week);
      matchesThisWeek.forEach(match => this.updateStats(updatedTeams, match));
  
      // her haftanın maç sonuçlarını replace et
      updatedMatches = updatedMatches.map(match =>
        matchesThisWeek.find(
          m =>
            m.week === match.week &&
            m.homeTeam.id === match.homeTeam.id &&
            m.awayTeam.id === match.awayTeam.id
        ) || match
      );
    }
  
    ctx.patchState({
      teams: updatedTeams,
      matches: updatedMatches,
      currentWeek: totalWeeks + 1, // bittiğinde bir fazlası olur
    });
  }
  
  private updateStats(teams: Team[], match: Match) {
    const home = teams.find((t) => t.id === match.homeTeam.id);
    const away = teams.find((t) => t.id === match.awayTeam.id);

    if (home && away) {
      home.matchesPlayed++;
      away.matchesPlayed++;

      home.goalDifference += match.homeGoals - match.awayGoals;
      away.goalDifference += match.awayGoals - match.homeGoals;

      if (match.homeGoals > match.awayGoals) {
        home.points += 3;
        home.wins++;
        away.losses++;
      } else if (match.homeGoals < match.awayGoals) {
        away.points += 3;
        away.wins++;
        home.losses++;
      } else {
        home.points += 1;
        away.points += 1;
        home.draws++;
        away.draws++;
      }
    }
  }
  @Selector()
  static getPlayedMatchesByWeek(state: LeagueStateModel) {
    return (week: number): Match[] =>
      state.matches.filter((m) => m.week === week && m.played);
  }

  @Selector()
  static getCurrentWeek(state: LeagueStateModel): number {
    return state.currentWeek;
  }

  @Selector()
static getChampionPredictions(state: LeagueStateModel): { team: Team; chance: number }[] {
  const teams = [...state.teams];
  const totalWeeks = Math.max(...state.matches.map(m => m.week));
  const remainingWeeks = totalWeeks - state.currentWeek + 1;
  const maxPointsLeft = remainingWeeks * 3;

  const potentials = teams.map(team => ({
    team,
    maxReachablePoints: team.points + maxPointsLeft
  }));

  const currentLeaderPoints = Math.max(...teams.map(t => t.points));

  // 1. Aşama: Matematiksel olarak elenenleri %0 yap
  const possibleWinners = potentials.filter(p => p.maxReachablePoints >= currentLeaderPoints);

  // Şampiyon netleşmişse (tek kişi en yüksek puanda ve kimse geçemiyor)
  const topTeam = teams.find(t => t.points === currentLeaderPoints);
  const onlyTopTeamCanWin = possibleWinners.length === 1 && possibleWinners[0].team.id === topTeam?.id;

  if (onlyTopTeamCanWin && remainingWeeks === 0) {
    return teams.map(team => ({
      team,
      chance: team.id === topTeam?.id ? 100 : 0
    }));
  }

  // 2. Aşama: Normalize edilmiş olasılıkları hesapla
  const totalReachable = possibleWinners.reduce((sum, t) => sum + t.maxReachablePoints, 0);

  const predictions = teams.map(team => {
    const matching = possibleWinners.find(p => p.team.id === team.id);
    const chance = matching
      ? Math.round((matching.maxReachablePoints / totalReachable) * 100)
      : 0;

    return {
      team,
      chance,
    };
  });

  return predictions.sort((a, b) => b.chance - a.chance);
}


}
