import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EventTickets } from 'src/app/models/event-tickets';
import { TicketsListComponent } from '../tickets-list/tickets-list.component';

@Component({
  selector: 'app-ticket-card',
  templateUrl: './ticket-card.component.html',
  styleUrls: ['./ticket-card.component.css']
})
export class TicketCardComponent {
  @Input() eventTickets: EventTickets = {} as EventTickets;

  constructor(public dialog: MatDialog) { }

  seeTickets() {
    this.dialog.open(TicketsListComponent, {
      data: {
        symbol: this.eventTickets.event.symbol,
        tickets: this.eventTickets.tickets,
        tokenAddress: this.eventTickets.event.tokenContract,
      }
    });
  }
}
