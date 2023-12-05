import { Component, OnInit } from '@angular/core';
import { Web3Service } from './services/web3.service';
import { ClipboardService } from 'ngx-clipboard';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private web3Service: Web3Service, private clipboardApi: ClipboardService) {
    this.isConnected = web3Service.isConnected;
    web3Service.verifyAccountConnected();
  }

  isConnected: BehaviorSubject<boolean>;
  walletAddress = '0x000...000';

  ngOnInit(): void {
    this.web3Service.wallet.subscribe(value => {
      if (!value.length) {
        this.walletAddress = '0x000...000';
      }
      this.walletAddress = `${value.substring(0, 5)}...${value.substring(value.length-3, value.length)}`;
    });
  }

  connectWallet() {
    this.web3Service.connect();
  }

  copyAddress() {
    this.clipboardApi.copyFromContent(this.web3Service.wallet.getValue());
  }
}
