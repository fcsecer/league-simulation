import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, map, of } from 'rxjs';
import { Team, Match } from '../state/league/league.model';
import { LeagueState } from '../state/league/league.state';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { EditMatchResult, InitializeLeague, PlayAllMatches, PlayNextWeek } from '../state/league/league.action';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-league-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule,FormsModule,InputNumberModule],
  templateUrl: './league-table.component.html',
})
export class LeagueTableComponent implements OnInit {
  teams$: Observable<Team[]>;
  currentMatches$: Observable<Match[]> | undefined;
  currentWeek: number = 1;
  championPredictions$: Observable<{ team: Team; chance: number; }[]> | undefined;
  championChances: Map<number, number> = new Map();
  editableMatches$: Observable<Match[]> | undefined;
  constructor(private store: Store) {
    this.teams$ = this.store.select(LeagueState.getTeams);
  }

  ngOnInit() {
    this.store.dispatch(new InitializeLeague()).subscribe(() => {
      this.reloadAll();
    });
  }
  
  reloadAll() {
    this.store.selectOnce(LeagueState.getCurrentWeek).subscribe(week => {
      this.currentWeek = week;
      this.loadMatches();
      this.loadEditableMatches();
      this.loadChampionPredictions();
      this.teams$ = this.store.select(LeagueState.getTeams);
    });
  }
  playAll() {
    this.store.dispatch(new PlayAllMatches()).subscribe(() => {
      this.store.selectOnce(LeagueState.getCurrentWeek).subscribe(currentWeek => {
        this.currentWeek = currentWeek - 1;
        this.loadMatches();
        this.loadChampionPredictions();
      });
    });
  }

  playNextWeek() {
    this.store.dispatch(new PlayNextWeek()).subscribe(() => this.reloadAll());
  }

  

  loadChampionPredictions() {
    if (this.currentWeek >= 4) {
      this.championPredictions$ = this.store.select(LeagueState.getChampionPredictions);
      this.store.selectOnce(LeagueState.getChampionPredictions).subscribe(predictions => {
        this.championChances = new Map(predictions.map(p => [p.team.id, p.chance]));
      });
    } else {
      this.championPredictions$ = undefined!;
      this.championChances.clear();
    }
  }
  loadMatches() {
    const selectorFn = this.store.selectSnapshot(
      LeagueState.getPlayedMatchesByWeek
    );
    this.currentMatches$ = new Observable((observer) => {
      observer.next(selectorFn(this.currentWeek));
      observer.complete();
    });
  }
  loadEditableMatches() {
    this.editableMatches$ = this.store.select(
      LeagueState.getAllPlayedMatches
    );
  }

  getTeamName(id: number): string {
    const teams = this.store.selectSnapshot(LeagueState.getTeams);
    return teams.find(t => t.id === id)?.name || '???';
  }
  
  editMatch(match: Match) {
    const updatedMatch: Match = {
      ...match,
      played: true
    };
    this.store.dispatch(new EditMatchResult(updatedMatch)).subscribe(() => {
      this.loadMatches();
      this.loadEditableMatches();
      this.loadChampionPredictions();
    });
  }
  
}
