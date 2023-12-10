import { Injectable } from '@angular/core';
import { TicketAbi } from 'src/abis/ticket';
import Web3 from 'web3';
import { RegisteredSubscription } from 'web3/lib/commonjs/eth.exports';
import { EventDapp } from '../models/event';
import { Web3Service } from './web3.service';
import { MatSnackBar } from '@angular/material/snack-bar';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private web3: Web3<RegisteredSubscription> | null = null;

  constructor(private snackBar: MatSnackBar) {
    if (typeof window.ethereum === 'undefined') {
      return;
    }
    this.web3 = new Web3(window.ethereum);
  }

  async buyTicket(eventDapp: EventDapp) {
    if (this.web3 == null) {
      return;
    }
    // instanciar contrato do ticket
    const ticketContract: any = new this.web3.eth.Contract(TicketAbi, eventDapp.tokenContract);
    // comprar 1 ingresso do evento
    ticketContract.methods.buyTicket()
      .send({ from: Web3Service.walletAddress.getValue(), value: eventDapp.price })
      .on('transactionHash', (_: any) => {
        this.snackBar.open('Transação criada! Aguardando confirmação da compra', 'Ok', {
          duration: 5000,
          verticalPosition: 'bottom'
        });
      })
      .on('receipt', (_: any) => {
        this.snackBar.open(`Ingresso ${eventDapp.symbol} comprado com sucesso!`, 'Ok', {
          duration: 5000,
          verticalPosition: 'bottom'
        });
        eventDapp.ticketsAvailable--;
      })
      .on('error', (error: any, receipt: any) => {
        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        this.snackBar.open('Ocorreu um erro na compra do ingresso!', 'Ok', {
          duration: 5000,
          verticalPosition: 'bottom'
        });
      });
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
