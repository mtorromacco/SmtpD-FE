import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigDto } from 'src/app/dtos/ConfigDto';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private http: HttpClient) { }


  /**
   * Ottenimento configurazione applicazione da BE
   * @returns Configurazione
   */
  public getConfig(): Observable<ConfigDto> {
    return this.http.get<ConfigDto>(environment.baseEndpoint + "/api/configs");
  }


  /**
   * Aggiornamento credenziali di autenticazione
   * @param username Nuovo username
   * @param password Nuova password
   * @returns La nuova configurazione
   */
  public updateCredentials(username: string, password: string): Observable<ConfigDto> {
    return this.http.put<ConfigDto>(environment.baseEndpoint + "/api/configs/credentials", { username, password });
  }


  /**
   * Aggiornamento della porta d'ascolto del server SMTP
   * @param port Porta del server SMTP
   * @returns La nuova configurazione
   */
  public updatePort(port: number): Observable<ConfigDto> {
    return this.http.put<ConfigDto>(environment.baseEndpoint + "/api/configs/port", { port });
  }
}
