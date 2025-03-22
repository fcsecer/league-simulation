// src/app/state/league/league.state.ts

import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Team, Match } from './league.model';
import { Injectable } from '@angular/core';
import { MatchSimulatorService } from '../../services/math-simulator.service';
import { InitializeLeague, PlayAllMatches, PlayMatch } from './league.action';

export interface LeagueStateModel {
  teams: Team[];
  matches: Match[];
  currentWeek: number;
}

@State<LeagueStateModel>({
  name: 'league',
  defaults: {
    teams: [],
    matches: [],
    currentWeek: 1
  }
})
@Injectable()
export class LeagueState {
  constructor(private matchSimulator: MatchSimulatorService) {}

  @Selector()
  static getTeams(state: LeagueStateModel): Team[] {
    return state.teams;
  }

  @Selector()
  static getMatches(state: LeagueStateModel): Match[] {
    return state.matches;
  }

  @Selector()
  static getCurrentWeek(state: LeagueStateModel): number {
    return state.currentWeek;
  }

  @Action(InitializeLeague)
  initializeLeague(ctx: StateContext<LeagueStateModel>) {
    const initialState = {
      teams: [
        { id: 1, name: 'Beşiktaş', points: 0, goalDifference: 0, matchesPlayed: 0 },
        { id: 2, name: 'Fenerbahçe', points: 0, goalDifference: 0, matchesPlayed: 0 },
        { id: 3, name: 'Trabzonspor', points: 0, goalDifference: 0, matchesPlayed: 0 },
        { id: 4, name: 'Galatasaray', points: 0, goalDifference: 0, matchesPlayed: 0 }
      ],
      matches: [],
      currentWeek: 1
    };
    ctx.setState(initialState);
  }

  @Action(PlayMatch)
  playMatch(ctx: StateContext<LeagueStateModel>, action: PlayMatch) {
    const state = ctx.getState();
    const match = action.payload;

    const homeTeam = state.teams.find(team => team.id === match.homeTeam.id);
    const awayTeam = state.teams.find(team => team.id === match.awayTeam.id);

    if (homeTeam && awayTeam) {
      homeTeam.matchesPlayed++;
      awayTeam.matchesPlayed++;

      if (match.homeGoals > match.awayGoals) {
        homeTeam.points += 3;
      } else if (match.homeGoals < match.awayGoals) {
        awayTeam.points += 3;
      } else {
        homeTeam.points += 1;
        awayTeam.points += 1;
      }

      homeTeam.goalDifference += (match.homeGoals - match.awayGoals);
      awayTeam.goalDifference += (match.awayGoals - match.homeGoals);
    }

    ctx.patchState({
      teams: [...state.teams],
      matches: [...state.matches, match]
    });
  }

  @Action(PlayAllMatches)
  playAllMatches(ctx: StateContext<LeagueStateModel>) {
    const state = ctx.getState();
    const allMatches = this.matchSimulator.generateAllMatches(state.teams);
    allMatches.forEach(match => {
      this.playMatch(ctx, new PlayMatch(match));
    });
  }
}
