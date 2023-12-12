import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { RegisteredSubscription } from 'web3/lib/commonjs/eth.exports';
import { TicketManagerAbi } from '../../abis/ticket-manager';
import { environment } from 'src/environments/environment';
import { Web3Service } from './web3.service';
import { BehaviorSubject } from 'rxjs';
import { EventDapp } from '../models/event';
import { TicketService } from './ticket.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class TicketManagerService {
  private web3: Web3<RegisteredSubscription> | null = null;
  private ticketManagerContract: any;

  private allEvents = new BehaviorSubject<EventDapp[]>([]);

  get allEvents$() {
    return this.allEvents.asObservable();
  }

  constructor(
    private ticketService: TicketService,
    private dialogRef: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    if (typeof window.ethereum === 'undefined') {
      return;
    }

    this.web3 = new Web3(window.ethereum);
    this.ticketManagerContract = new this.web3.eth.Contract(TicketManagerAbi, environment.ticketManagerAddress);
    this.initEvents();
  }

  private async initEvents() {
    let addresses = await this.getEventsAddress();
    // buscar dados dos eventos
    for (let address of addresses) {
      this.ticketService.getEventContent(address).then(result => {
        this.allEvents.next([
          result,
          ...this.allEvents.getValue()
        ]);
      });
    }
    this.subscribeNewEvents();
  }

  private async getEventsAddress(): Promise<string[]> {
    if (this.web3 == null) {
      return new Promise(resolve => resolve([]));
    }
    return this.ticketManagerContract.methods.getTicketContracts().call();
  }

  private subscribeNewEvents() {
    this.ticketManagerContract.events.TicketContractCreated()
      .on('data', (data: any) => {
        const ticketAddress = data.returnValues.ticketContract;
        this.ticketService.getEventContent(ticketAddress).then(result => {
          this.allEvents.next([
            result,
            ...this.allEvents.getValue()
          ]);
        });
      });
  }

  createEvent(title: string, symbol: string, amount: number, price: number, datetime: string, local: string) {
    if (this.web3 == null || !Web3Service.walletConnected.getValue()) {
      return;
    }

    this.ticketManagerContract.methods
      .createTicketContract(title, symbol, amount, price, datetime, local)
      .send({ from: Web3Service.walletAddress.getValue() })
      .on('transactionHash', (_: any) => {
        this.dialogRef.closeAll();
        this.snackBar.open('Transação criada! Aguardando confirmação', 'Ok', {
          duration: 5000,
          verticalPosition: 'bottom'
        });
      })
      .on('receipt', (_: any) => {
        this.snackBar.open('Evento criado com sucesso!', 'Ok', {
          duration: 5000,
          verticalPosition: 'bottom'
        });
      })
      .on('error', (error: any, receipt: any) => {
        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        this.snackBar.open('Falha na transação!', 'Ok', {
          duration: 5000,
          verticalPosition: 'bottom'
        });
      });
  }
}
