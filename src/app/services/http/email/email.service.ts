import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmailDto } from 'src/app/dtos/EmailDto';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor(private http: HttpClient) { }


  /**
   * Ottenimento di tutte le emails disponibili nell'applicazione
   * @returns Lista di tutte le emails
   */
  public getAll(): Observable<EmailDto[]> {
    return this.http.get<EmailDto[]>(environment.baseEndpoint + "/api/emails");
  }


  /**
   * Flag un email come letta
   * @param id ID dell'email da flaggare
   */
  public flagAsReaded(id: number): Observable<any> {
    return this.http.put(environment.baseEndpoint + `/api/emails/${id}`, {});
  }


  /**
   * Eliminazione di un'email tramite ID
   * @param id ID dell'email da eliminare
   */
  public deleteById(id: number): Observable<any> {
    return this.http.delete(environment.baseEndpoint + `/api/emails/${id}`);
  }


  /**
   * Eliminazione di tutte le emails presentii
   */
  public deleteAll(): Observable<any> {
    return this.http.delete(environment.baseEndpoint + "/api/emails");
  }
}
