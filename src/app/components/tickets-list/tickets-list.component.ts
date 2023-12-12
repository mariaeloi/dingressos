import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tickets-list',
  templateUrl: './tickets-list.component.html',
  styleUrls: ['./tickets-list.component.css']
})
export class TicketsListComponent {
  symbol: string = '';
  tickets: number[] = [];
  tokenAddress: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: {symbol: string, tickets: number[], tokenAddress: string}) {
    this.symbol = data.symbol;
    this.tickets = data.tickets;
    this.tokenAddress = data.tokenAddress;
  }

  openTicketNft(id: number) {
    const url = `${environment.scanBaseUrl}/nft/${this.tokenAddress}/${id}`;
    window.open(url, '_blank');
  }
}
