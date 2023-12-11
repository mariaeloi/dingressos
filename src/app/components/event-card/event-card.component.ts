import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventDapp } from 'src/app/models/event';
import { TicketService } from 'src/app/services/ticket.service';
import { Web3Service } from 'src/app/services/web3.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})

export class EventCardComponent implements OnInit{
  @Input() eventDapp: EventDapp = {} as EventDapp;
  isConnected: BehaviorSubject<boolean>;
  balance: number;
  
  wallet = Web3Service.walletAddress.getValue();
  
  constructor(web3Service: Web3Service, private ticketService: TicketService) {
    this.isConnected = web3Service.isConnected;
    this.balance = 0;

  }
  
  ngOnInit(): void {
    if (this.wallet == this.eventDapp.creator.toLocaleLowerCase())
    this.getOwnerAmount();
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
    this.ticketService.buyTicket(this.eventDapp);
  }

  withdraw () {
    this.ticketService.withDraw(this.eventDapp);
  }

  async getOwnerAmount(){
    this.balance = await this.ticketService.getOwnerAmount(this.eventDapp.tokenContract.toLowerCase());
    console.log(this.balance);
    return this.balance;
  }

  openTicketContract() {
    const url = `${environment.scanBaseUrl}/address/${this.eventDapp.tokenContract}`;
    window.open(url, '_blank');
  }
}
