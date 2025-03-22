import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeagueTableComponent } from './league-table/league-table.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,LeagueTableComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'league-simulator';
  
}
