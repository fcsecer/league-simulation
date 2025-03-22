export interface Team {
    id: number;
    name: string;
    points: number;
    goalDifference: number;
    matchesPlayed: number;
  }
  
  export interface Match {
    homeTeam: Team;
    awayTeam: Team;
    homeGoals: number;
    awayGoals: number;
    week: number;
  }
  