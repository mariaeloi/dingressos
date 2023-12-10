import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import Web3 from 'web3';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { EventDapp } from '../models/event';
import { RegisteredSubscription } from 'web3/lib/commonjs/eth.exports';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3: Web3<RegisteredSubscription> | null = null;
  get web3Intance() { return this.web3; }

  static chainId = new BehaviorSubject<string>('');
  static walletAddress = new BehaviorSubject<string>('');
  static walletConnected = new BehaviorSubject<boolean>(false);
  static isOwner = new BehaviorSubject<boolean>(false);

  get isConnected() { return Web3Service.walletConnected }
  get wallet() { return Web3Service.walletAddress }
  get isOwner() { return Web3Service.isOwner }

  constructor(private _snackBar: MatSnackBar) {
    if (typeof window.ethereum === 'undefined') {
      return;
    }

    this.web3 = new Web3(window.ethereum);
    window.ethereum.on('chainChanged', Web3Service.handleChainChanged);
    window.ethereum.on('accountsChanged', Web3Service.handleAccountsChanged);
  }

  async verifyAccountConnected() {
    if (typeof window.ethereum === 'undefined') {
      return;
    }

    const chainId: string = await window.ethereum.request({ method: 'eth_chainId' });
    Web3Service.chainId.next(chainId);

    window.ethereum.request({ method: 'eth_accounts' })
      .then(Web3Service.handleAccountsChanged);
  }

  async connect() {
    if (typeof window.ethereum === 'undefined') {
      this._snackBar.open('É necessário instalar o MetaMask!', 'Entendi', {
        duration: 5000,
        verticalPosition: 'top'
      });
      return;
    }
    const chainId: string = await window.ethereum.request({ method: 'eth_chainId' });
    Web3Service.handleChainChanged(chainId);
  }

  private static handleChainChanged(chainId: string) {
    Web3Service.chainId.next(chainId);
    if (environment.chainId !== chainId) {
      Swal.fire({
        title: `Use a ${environment.network}!`,
        text: `Está aplicação só oferece suporte para ${environment.network}.`,
        icon: "error"
      });
      Web3Service.logout();
    } else {
      if (Web3Service.walletAddress.getValue() === '') {
        Web3Service.getAccount();
      } else {
        Web3Service.walletConnected.next(true);
      }
    }
  }

  private static async getAccount() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }).catch((err: any) => {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        Swal.fire({
          title: "Usuário rejeitou a conexão!",
          text: "É necessário conectar uma carteira para interagir com esta aplicação.",
          icon: "error"
        });
      } else {
        console.error(err);
      }
    });
    Web3Service.handleAccountsChanged(accounts);
  }

  private static handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts.
      Web3Service.logout();
    } else if (accounts[0] !== Web3Service.walletAddress.getValue() && Web3Service.chainId.getValue() === environment.chainId) {
      Web3Service.walletAddress.next(accounts[0]);
      Web3Service.walletConnected.next(true);
      // TODO verificar se é o dono do contrato
      // Web3Service.isOwner.next(true);
    }
  }

  private static logout() {
    Web3Service.walletConnected.next(false);
    Web3Service.walletAddress.next('');
    Web3Service.isOwner.next(false);
  }

  public getEvents(): EventDapp[] {
    // TODO
    return [
      { creator: '0x0', tokenContract: '0x0', title: 'Evento de Teste 3', datetime: new Date(2024, 1, 1), location: 'Brasil', price: 100, ticketsAvailable: 7 },
      { creator: '0x0', tokenContract: '0x0', title: 'Evento de Teste 2', datetime: new Date(2024, 0, 1), location: 'Brasil', price: 1000000, ticketsAvailable: 0 },
      { creator: '0x0', tokenContract: '0x0', title: 'Evento de Teste 1', datetime: new Date(2023, 11, 1), location: 'Brasil', price: 10000, ticketsAvailable: 1 },
    ] as EventDapp[];
  }
}
