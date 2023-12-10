import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TicketManagerService } from 'src/app/services/ticket-manager.service';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent {
  eventForm: FormGroup = this.formBuilder.group({
    title: [null, Validators.required],
    symbol: [null, Validators.required],
    datetime: [null, Validators.required],
    location: [null, Validators.required],
    price: [null, [Validators.required, Validators.min(10)]],
    amount: [null, [Validators.required, Validators.min(1)]],
  });

  constructor(
    private formBuilder: FormBuilder,
    private ticketManagerService: TicketManagerService,
  ) { }

  async onSubmit() {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const form = this.eventForm.value;
    const dataString = form.datetime.toString();
    this.ticketManagerService.createEvent(form.title, form.symbol, form.amount, form.price, dataString, form.location);
  }
}
