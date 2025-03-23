import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Team, Match } from './league.model';
import { EditMatchResult, InitializeLeague, PlayAllMatches, PlayNextWeek } from './league.action';
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

  // 🔍 Takımları sıralı döndür
  @Selector()
  static getTeams(state: LeagueStateModel): Team[] {
    return state.teams.map(t => ({ ...t })) // REFS broken ✅
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
  }

  // 🔍 Şu haftanın oynanmış maçlarını döndür
  @Selector()
  static getCurrentWeekMatches(state: LeagueStateModel): Match[] {
    return state.matches.filter(m => m.week === state.currentWeek && m.played);
  }

  // 🔍 Tüm oynanmış maçlar
  @Selector()
  static getAllPlayedMatches(state: LeagueStateModel): Match[] {
    return state.matches.filter(m => m.played);
  }

  // 🔍 Şu anki hafta
  @Selector()
  static getCurrentWeek(state: LeagueStateModel): number {
    return state.currentWeek;
  }

  @Action(InitializeLeague)
  initializeLeague(ctx: StateContext<LeagueStateModel>) {
    const teams: Team[] = [
      { id: 1, name: 'Beşiktaş', points: 0, goalDifference: 0, matchesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      { id: 2, name: 'Fenerbahçe', points: 0, goalDifference: 0, matchesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      { id: 3, name: 'Galatasaray', points: 0, goalDifference: 0, matchesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      { id: 4, name: 'Trabzonspor', points: 0, goalDifference: 0, matchesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      { id: 5, name: 'Çaykur Rizespor', points: 0, goalDifference: 0, matchesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      { id: 6, name: 'Samsunspor', points: 0, goalDifference: 0, matchesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      { id: 7, name: 'Kayserispor', points: 0, goalDifference: 0, matchesPlayed: 0, wins: 0, losses: 0, draws: 0 },
      { id: 8, name: 'Adana Demirspor', points: 0, goalDifference: 0, matchesPlayed: 0, wins: 0, losses: 0, draws: 0 },
    ];

    const fixture = this.simulator.generateFixture([...teams]);

    ctx.setState({ teams, matches: fixture, currentWeek: 1 });
  }

  @Action(PlayNextWeek)
  playNextWeek(ctx: StateContext<LeagueStateModel>) {
    const state = ctx.getState();
    const updatedTeams = state.teams.map(t => ({ ...t }));
    const updatedMatches = [...state.matches];

    const matchesThisWeek = this.simulator.simulateWeek(updatedMatches, state.currentWeek);
    matchesThisWeek.forEach(m => this.updateStats(updatedTeams, m));

    // Güncellenen maçları patch et
    const finalMatches = updatedMatches.map(m =>
      matchesThisWeek.find(mm => mm.week === m.week && mm.homeTeamId === m.homeTeamId && mm.awayTeamId === m.awayTeamId) || m
    );

    ctx.patchState({
      teams: updatedTeams,
      matches: finalMatches,
      currentWeek: state.currentWeek + 1,
    });
  }

  @Action(PlayAllMatches)
  playAllMatches(ctx: StateContext<LeagueStateModel>) {
    const state = ctx.getState();
    const totalWeeks = Math.max(...state.matches.map(m => m.week));
    const updatedTeams = state.teams.map(t => ({ ...t }));
    let updatedMatches = [...state.matches];

    for (let week = state.currentWeek; week <= totalWeeks; week++) {
      const matchesThisWeek = this.simulator.simulateWeek(updatedMatches, week);
      matchesThisWeek.forEach(m => this.updateStats(updatedTeams, m));

      updatedMatches = updatedMatches.map(m =>
        matchesThisWeek.find(mm => mm.week === m.week && mm.homeTeamId === m.homeTeamId && mm.awayTeamId === m.awayTeamId) || m
      );
    }

    ctx.patchState({
      teams: updatedTeams,
      matches: updatedMatches,
      currentWeek: totalWeeks + 1,
    });
  }
  private updateStats(teams: Team[], match: Match) {
    const home = teams.find(t => t.id === match.homeTeamId);
    const away = teams.find(t => t.id === match.awayTeamId);
    if (!home || !away) return;
  
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
  @Action(EditMatchResult)
  editMatchResult(ctx: StateContext<LeagueStateModel>, { payload }: EditMatchResult) {
    const state = ctx.getState();
    const matches = [...state.matches];
    const teams = state.teams.map(t => ({ ...t }));
  
    const matchIndex = matches.findIndex(m =>
      m.week === payload.week &&
      m.homeTeamId === payload.homeTeamId &&
      m.awayTeamId === payload.awayTeamId
    );
  
    if (matchIndex === -1) return;
  
    const oldMatch = matches[matchIndex];
    const home = teams.find(t => t.id === oldMatch.homeTeamId);
    const away = teams.find(t => t.id === oldMatch.awayTeamId);
    if (!home || !away) return;
  
    // 🔁 Önce eski skorun etkisini sil
    this.recalculateMatchStats(home, away, oldMatch, payload);
  
    // ✅ Yeni skoru işle
    matches[matchIndex] = {
      ...payload,
      played: true,
    };
  
    ctx.patchState({ teams, matches });
  }
  
  

  @Selector()
  static getChampionPredictions(state: LeagueStateModel): { team: Team; chance: number }[] {
    const teams = [...state.teams];
    const totalWeeks = Math.max(...state.matches.map(m => m.week));
    const remainingWeeks = totalWeeks - state.currentWeek + 1;
    const maxPointsLeft = remainingWeeks * 3;

    const potentials = teams.map(team => ({
      team,
      maxReachablePoints: team.points + maxPointsLeft,
    }));

    const currentLeaderPoints = Math.max(...teams.map(t => t.points));
    const possibleWinners = potentials.filter(p => p.maxReachablePoints >= currentLeaderPoints);

    const topTeam = teams.find(t => t.points === currentLeaderPoints);
    const onlyTopTeamCanWin = possibleWinners.length === 1 && possibleWinners[0].team.id === topTeam?.id;

    if (onlyTopTeamCanWin && remainingWeeks === 0) {
      return teams.map(team => ({
        team,
        chance: team.id === topTeam?.id ? 100 : 0,
      }));
    }

    const totalReachable = possibleWinners.reduce((sum, t) => sum + t.maxReachablePoints, 0);
    return teams.map(team => {
      const match = possibleWinners.find(p => p.team.id === team.id);
      return {
        team,
        chance: match ? Math.round((match.maxReachablePoints / totalReachable) * 100) : 0,
      };
    }).sort((a, b) => b.chance - a.chance);
  }
  @Selector()
static getPlayedMatchesByWeek(state: LeagueStateModel) {
  return (week: number): Match[] =>
    state.matches.filter(m => m.week === week && m.played);
}
private recalculateMatchStats(home: Team, away: Team, oldMatch: Match, newMatch: Match): void {
  // 🧼 Eski skoru sil
  home.matchesPlayed--;
  away.matchesPlayed--;

  const oldDiff = oldMatch.homeGoals - oldMatch.awayGoals;
  home.goalDifference -= oldDiff;
  away.goalDifference += oldDiff;

  if (oldDiff > 0) {
    home.points -= 3;
    home.wins--;
    away.losses--;
  } else if (oldDiff < 0) {
    away.points -= 3;
    away.wins--;
    home.losses--;
  } else {
    home.points -= 1;
    away.points -= 1;
    home.draws--;
    away.draws--;
  }

  // ➕ Yeni skoru uygula
  home.matchesPlayed++;
  away.matchesPlayed++;

  const newDiff = newMatch.homeGoals - newMatch.awayGoals;
  home.goalDifference += newDiff;
  away.goalDifference -= newDiff;

  if (newDiff > 0) {
    home.points += 3;
    home.wins++;
    away.losses++;
  } else if (newDiff < 0) {
    away.points += 3;
    away.wins++;
    home.losses++;
  } else {
    home.points += 1;
    away.points += 1;
    home.draws++;
    away.draws++;
  }
  console.log("home",home)
}


}
