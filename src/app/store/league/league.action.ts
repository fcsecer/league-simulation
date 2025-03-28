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

export class EditMatchResult {
  static readonly type = '[League] Edit Match Result';
  constructor(public payload: Match) {}
}

export class ResetLeague {
  static readonly type = '[League] Reset League';
}
