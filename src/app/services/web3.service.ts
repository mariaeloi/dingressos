import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import Web3 from 'web3';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private web3: any = null;
  get web3Intance() { return this.web3; }

  static walletAddress = new BehaviorSubject<string>('');
  static walletConnected = new BehaviorSubject<boolean>(false);

  get isConnected() { return Web3Service.walletConnected }
  get wallet() { return Web3Service.walletAddress }

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
    if (environment.chainId !== chainId) {
      Swal.fire({
        title: `Use a ${environment.network}!`,
        text: `Está aplicação só oferece suporte para ${environment.network}.`,
        icon: "error"
      });
      Web3Service.walletConnected.next(false);
    } else {
      if (Web3Service.walletAddress.getValue() === '') {
        Web3Service.getAccount();
      } else {
        console.log('carteira', Web3Service.walletAddress.getValue());
        Web3Service.walletConnected.next(true);
      }
    }
  }

  private static async getAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' }).catch((err: any) => {
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
  }

  private static handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts.
      Web3Service.walletConnected.next(false);
      Web3Service.walletAddress.next('');
    } else if (accounts[0] !== Web3Service.walletAddress.getValue()) {
      Web3Service.walletAddress.next(accounts[0]);
      Web3Service.walletConnected.next(true);
    }
  }
}
