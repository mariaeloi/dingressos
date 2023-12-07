import { Component, OnInit } from '@angular/core';
import { MatChipListboxChange } from '@angular/material/chips';
import { BehaviorSubject } from 'rxjs';
import { EventDapp } from 'src/app/models/event';
import { Web3Service } from 'src/app/services/web3.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  isEventCreator: BehaviorSubject<boolean>;
  eventsDapp = new BehaviorSubject<EventDapp[]>([]);

  constructor(private web3Service: Web3Service) {
    this.isEventCreator = web3Service.isEventCreator;
  }

  ngOnInit(): void {
    this.eventsDapp.next(this.web3Service.getEvents());
  }

  onChangeChip(chip: MatChipListboxChange) {
    if (!chip.value) {
      chip.source.value = 'Todos';
    }

    const events = this.web3Service.getEvents();
    if (chip.value === 'Disponíveis') {
      this.eventsDapp.next(events.filter(e => e.datetime > new Date() && e.ticketsAvailable > 0));
    } else if (chip.value === 'Meus Eventos') {
      this.eventsDapp.next(events.filter(e => e.creator === this.web3Service.wallet.getValue()));
    } else {
      this.eventsDapp.next(this.web3Service.getEvents());
    }
  }

  createEvent() {
    // TODO
  }
}
