import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, map, of } from 'rxjs';
import { Team, Match } from '../state/league/league.model';
import { LeagueState } from '../state/league/league.state';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InitializeLeague, PlayAllMatches, PlayNextWeek } from '../state/league/league.action';

@Component({
  selector: 'app-league-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  templateUrl: './league-table.component.html',
})
export class LeagueTableComponent implements OnInit {
  teams$: Observable<Team[]>;
  currentMatches$: Observable<Match[]> | undefined;
  currentWeek: number = 1;

  constructor(private store: Store) {
    this.teams$ = this.store.select(LeagueState.getTeams);
  }

  ngOnInit() {
    this.store.dispatch(new InitializeLeague()).subscribe(() => {
      this.store.selectOnce(LeagueState.getCurrentWeek).subscribe(currentWeek => {
        this.currentWeek = currentWeek;
        this.loadMatches();
      });
    });
  }
  
  playNextWeek() {
    this.store.dispatch(new PlayNextWeek()).subscribe(() => {
      this.store.selectOnce(LeagueState.getCurrentWeek).subscribe(currentWeek => {
        this.currentWeek = currentWeek - 1;
        this.loadMatches();
      });
    });
    
    this.currentMatches$?.subscribe((val)=> console.log(val))
  }
  playAll() {
    this.store.dispatch(new PlayAllMatches()).subscribe(() => {
      this.store.selectOnce(LeagueState.getCurrentWeek).subscribe(currentWeek => {
        this.currentWeek = currentWeek - 1;
        this.loadMatches();
      });
    });
  }
  loadMatches() {
    const selectorFn = this.store.selectSnapshot(LeagueState.getPlayedMatchesByWeek);
    this.currentMatches$ = of(selectorFn(this.currentWeek));
  }
}
