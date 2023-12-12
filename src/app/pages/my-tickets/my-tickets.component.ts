import { Component, OnInit } from '@angular/core';
import { EventDapp } from 'src/app/models/event';
import { EventTickets } from 'src/app/models/event-tickets';
import { TicketManagerService } from 'src/app/services/ticket-manager.service';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-my-tickets',
  templateUrl: './my-tickets.component.html',
  styleUrls: ['./my-tickets.component.css']
})
export class MyTicketsComponent implements OnInit {
  ticketsPerEvent: Record<string, EventTickets> = {};
  eventsAddress: string[] = [];

  constructor(
    private ticketManagerService: TicketManagerService,
    private ticketService: TicketService,
  ) { }

  ngOnInit(): void {
    this.ticketManagerService.allEvents$.subscribe(async events => {
      for (let eventDapp of events) {
        this.updateEventTickets(eventDapp);
      }
    });
  }

  private async updateEventTickets(eventDapp: EventDapp) {
    const tickets = await this.ticketService.getEventTickets(eventDapp.tokenContract);
    if (tickets.length > 0) {
      let eventTickets: EventTickets = {
        event: eventDapp,
        tickets,
      }
      this.ticketsPerEvent[eventDapp.tokenContract] = eventTickets;
    } else {
      delete this.ticketsPerEvent[eventDapp.tokenContract];
    }
    this.eventsAddress = Object.keys(this.ticketsPerEvent);
  }
}
