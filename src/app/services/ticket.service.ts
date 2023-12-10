import { Injectable } from '@angular/core';
import { TicketAbi } from 'src/abis/ticket';
import Web3 from 'web3';
import { RegisteredSubscription } from 'web3/lib/commonjs/eth.exports';
import { EventDapp } from '../models/event';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private web3: Web3<RegisteredSubscription> | null = null;

  constructor() {
    if (typeof window.ethereum === 'undefined') {
      return;
    }
    this.web3 = new Web3(window.ethereum);
  }

  async getEventContent(contractAddress: string): Promise<EventDapp> {
    if (this.web3 == null) {
      return {} as EventDapp;
    }
    // instanciar contrato do ticket
    const ticketContract: any = new this.web3.eth.Contract(TicketAbi, contractAddress);
    // buscar dados do evento
    const result = await ticketContract.methods.getTicketEvent().call();
    const eventDapp: EventDapp = {
      creator: result.creator,
      tokenContract: result.tokenContract,
      datetime: new Date(result.datetime),
      location: result.location,
      title: result.title,
      symbol: result.symbol,
      price: Number(result.price),
      ticketsAvailable: Number(result.ticketsAvailable),
    };
    return eventDapp;
  }
}
