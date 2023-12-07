import { Component, Input } from '@angular/core';
import { EventDapp } from 'src/app/models/event';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent {
  @Input() eventDapp: EventDapp = {} as EventDapp;

  getEventStatus() {
    if (this.eventDapp.datetime <= new Date()) {
      return 'Encerrado';
    } else if (this.eventDapp.ticketsAvailable < 1) {
      return 'Esgotado';
    } else {
      return 'Disponível';
    }
  }

  openEventDetail() {
    console.log('event dapp:', this.eventDapp);
  }
}
