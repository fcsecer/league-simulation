// src/app/state/league/league.actions.ts

import { Match } from "./league.model";

export class InitializeLeague {
  static readonly type = '[League] Initialize';
}

export class PlayMatch {
  static readonly type = '[League] Play Match';
  constructor(public payload: Match) {}
}

export class PlayAllMatches {
  static readonly type = '[League] Play All Matches';
}

export class PlayNextWeek {
  static readonly type = '[League] Play Next Week';
}
