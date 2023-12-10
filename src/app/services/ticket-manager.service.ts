import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { RegisteredSubscription } from 'web3/lib/commonjs/eth.exports';
import { TicketManagerAbi } from '../../abis/ticket-manager';
import { environment } from 'src/environments/environment.development';
import { Web3Service } from './web3.service';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class TicketManagerService {
  private web3: Web3<RegisteredSubscription> | null = null;
  private ticketManagerContract: any;

  constructor() {
    if (typeof window.ethereum === 'undefined') {
      return;
    }

    this.web3 = new Web3(window.ethereum);
    this.ticketManagerContract = new this.web3.eth.Contract(TicketManagerAbi, environment.ticketManagerAddress);
  }

  async getEventsAddress(): Promise<string[]> {
    if (this.web3 == null) {
      return new Promise(resolve => resolve([]));
    }
    return this.ticketManagerContract.methods.getTicketContracts().call();
  }

  createEvent(title: string, symbol: string, amount: number, price: number, datetime: string, local: string) {
    if (this.web3 == null || !Web3Service.walletConnected.getValue()) {
      return;
    }

    this.ticketManagerContract.methods
      .createTicketContract(title, symbol, amount, price, datetime, local)
      .send({ from: Web3Service.walletAddress.getValue() })
      .then((result: any) => {
        console.log('createTicketContract result', result);
      });
  }
}
