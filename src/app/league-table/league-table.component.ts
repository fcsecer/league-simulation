import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Team } from '../state/league/league.model';
import { LeagueState } from '../state/league/league.state';
import { InitializeLeague } from '../state/league/league.action';

@Component({
  selector: 'app-league-table',
  standalone: true,
  imports: [CommonModule, TableModule],
  templateUrl: './league-table.component.html',
  styleUrls: ['./league-table.component.scss']
})
export class LeagueTableComponent {
  teams$: Observable<Team[]>;

  constructor(private store: Store) {
    this.teams$ = this.store.select(LeagueState.getTeams)
  }

  ngOnInit() {
    this.store.dispatch(new InitializeLeague());
  }
}
