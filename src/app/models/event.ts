export interface EventDapp {
    creator: string;        // endereço do criador do evento
    tokenContract: string;  // endereço do contrato do token do evento
    datetime: Date;         // data e hora do evento
    location: string;
    title: string;
    category: string;
    ticketsAvailable: number;
}