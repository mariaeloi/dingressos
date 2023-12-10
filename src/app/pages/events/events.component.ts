import { Component, OnInit } from '@angular/core';
import { MatChipListboxChange } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { EventFormComponent } from 'src/app/components/event-form/event-form.component';
import { EventDapp } from 'src/app/models/event';
import { TicketManagerService } from 'src/app/services/ticket-manager.service';
import { TicketService } from 'src/app/services/ticket.service';
import { Web3Service } from 'src/app/services/web3.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  isConnected: BehaviorSubject<boolean>;
  eventsAll: EventDapp[] = [];
  eventsDapp = new BehaviorSubject<EventDapp[]>([]);

  filter = 'Todos';

  constructor(
    private web3Service: Web3Service,
    private ticketManagerService: TicketManagerService,
    private ticketService: TicketService,
    public dialog: MatDialog,  
  ) {
    this.isConnected = web3Service.isConnected;
  }

  ngOnInit(): void {
    this.initEvents();
  }

  async onChangeChip(chip: MatChipListboxChange) {
    if (!chip.value) {
      chip.source.value = this.filter;
      return;
    }

    if (this.filter == chip.value) {
      return;
    }

    this.filter = chip.value;
    this.onChangeFilter();
  }

  private onChangeFilter() {
    const events = this.eventsAll;
    if (this.filter === 'Disponíveis') {
      this.eventsDapp.next(events.filter(e => e.datetime > new Date() && e.ticketsAvailable > 0));
    } else if (this.filter === 'Meus Eventos') {
      this.eventsDapp.next(events.filter(e => e.creator.toLowerCase() === this.web3Service.wallet.getValue()));
    } else {
      this.eventsDapp.next(events);
    }
  }

  createEvent() {
    // TODO
    const dialogRef = this.dialog.open(EventFormComponent, {disableClose: true});

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  private async initEvents() {
    let addresses = await this.ticketManagerService.getEventsAddress();
    addresses = addresses.reverse();
    // buscar dados dos eventos
    for(let address of addresses) {
      this.ticketService.getEventContent(address).then(result => {
        this.eventsAll.push(result);
        this.eventsDapp.next([
          ...this.eventsDapp.getValue(),
          result
        ]);
      });
    }
  }
}
