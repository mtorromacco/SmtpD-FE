import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EmailDto } from 'src/app/dtos/EmailDto';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HubService {

  private message$: Subject<EmailDto>;
  private connection: HubConnection | null = null;

  constructor() {
    this.message$ = new Subject<EmailDto>();
  }


  /**
   * Connessione all'HUB SignalR del BE e preparazione funzione ricezione della nuova email
   */
  public connect() {

    this.connection = new HubConnectionBuilder()
      .withUrl(`${environment.baseEndpoint}/hub/email`)
      .build();

    this.connection.start();

    this.connection.on('newEmail', (message) => {
      this.message$.next(message);
    });
  }


  /**
   * Ritorna l'osservabile sul quale mettersi in ascolto
   * @returns Osservabile che emetterà le nuove emails ricevute
   */
  public handleNextEmail(): Observable<EmailDto> {
    return this.message$.asObservable();
  }


  /**
   * Disconnessione dal server
   */
  public disconnect() {
    this.connection?.stop();
  }
}
