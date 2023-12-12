import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventsComponent } from './pages/events/events.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { MyTicketsComponent } from './pages/my-tickets/my-tickets.component';

const routes: Routes = [
  { path: '', redirectTo: '/eventos', pathMatch: 'full' },
  { path: 'eventos', component: EventsComponent },
  { path: 'meus-ingressos', component: MyTicketsComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
