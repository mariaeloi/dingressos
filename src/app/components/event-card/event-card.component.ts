import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventDapp } from 'src/app/models/event';
import { Web3Service } from 'src/app/services/web3.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent {
  @Input() eventDapp: EventDapp = {} as EventDapp;
  isConnected: BehaviorSubject<boolean>;

  constructor(private web3Service: Web3Service) {
    this.isConnected = web3Service.isConnected;
  }

  getEventStatus() {
    if (this.eventDapp.datetime <= new Date()) {
      return 'Encerrado';
    } else if (this.eventDapp.ticketsAvailable < 1) {
      return 'Esgotado';
    } else {
      return 'Disponível';
    }
  }

  buyTicket() {
    console.log('event dapp:', this.eventDapp);
  }

  openTicketContract() {
    const url = `${environment.scanBaseUrl}/address/${this.eventDapp.tokenContract}`;
    window.open(url, '_blank');
  }
}
