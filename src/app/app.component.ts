import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ConfigurationDialogComponent } from './configuration-dialog/configuration-dialog.component';
import { ConfigDto } from './dtos/ConfigDto';
import { EmailDto } from './dtos/EmailDto';
import { ConfigService } from './services/http/config/config.service';
import { EmailService } from './services/http/email/email.service';
import { HubService } from './services/hub/hub.service';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public configsChanged: boolean = false;
  public selectedEmail: EmailDto | null = null;
  public emails: EmailDto[] | null = null;
  public emailsBackupForFilter: EmailDto[] | null = null;
  public configs: ConfigDto | null = null;
  private signalRSubscription: Subscription | null = null;

  public filterValue: string = "";


  constructor(private hub: HubService, private configService: ConfigService, private emailService: EmailService, private dialog: MatDialog) { }


  /**
   * Caricamento della configurazione e delle email.
   * Inizializzazione della connessione con l'Hub BE.
   */
  async ngOnInit() {

    try {
      this.configs = await firstValueFrom(this.configService.getConfig());
      this.emails = await firstValueFrom(this.emailService.getAll());
      this.emailsBackupForFilter = this.emails;
      this.hub.connect();
    } catch (ex) {
      console.error(ex);
    }

    this.signalRSubscription = this.hub.handleNextEmail().subscribe({
      next: (newEmail) => {

        this.emailsBackupForFilter = [newEmail].concat(this.emailsBackupForFilter ?? []);

        if ((this.filterValue && (newEmail.subject.includes(this.filterValue) || newEmail.from.includes(this.filterValue) || newEmail.to.includes(this.filterValue) || newEmail.createdAt.includes(this.filterValue))) || !this.filterValue)
          this.emails = [newEmail].concat(this.emails ?? []);

        if (this.emails?.length == 1)
          this.selectEmailByIndex(0);
      },
      error: (err) => { },
      complete: () => { }
    })
  }


  /**
   * Selezione di un'email tramite il suo indice
   * @param index Indice dell'email da selezionare
   */
  private selectEmailByIndex(index: number) {

    if (this.emails == null || this.emails.length == 0)
      return;

    if (this.emails.length - 1 < index)
      index = this.emails.length - 1;

    this.emails[index].readed = true;

    this.emailService.flagAsReaded(this.emails[index].id).subscribe();
    this.selectedEmail = this.emails[index];
  }


  /**
   * Seleazione di un'email tramite il suo ID
   * @param id ID dell'email da selezionare
   */
  public selectEmailById(id: number) {

    let emailIndex = this.emails?.findIndex(email => email.id == id);

    if (!emailIndex || emailIndex == -1)
      emailIndex = 0;

    this.selectEmailByIndex(emailIndex);
  }


  /**
   * Rimozione di un'email tramite ID
   * @param id ID dell'email da rimuovere
   */
  public async removeById(id: number) {

    let response = await Swal.fire({
      title: "Eliminare l'email?",
      text: "Vuoi eliminare questa email?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Elimina"
    });

    if (!response.isConfirmed)
      return;

    this.emailService.deleteById(id).subscribe();
    this.emails = this.emails?.filter(email => email.id != id) ?? [];
    this.emailsBackupForFilter = this.emailsBackupForFilter?.filter(email => email.id != id) ?? [];

    if (this.selectedEmail != null && this.selectedEmail.id == id)
      this.selectedEmail = null;

    if (this.emails?.findIndex(email => email.id == (this.selectedEmail?.id ?? -1)) == - 1)
      this.selectEmailByIndex(0);
  }


  /**
   * Aggiornamento delle emails dal BE
   */
  public async refreshEmails() {

    try {
      this.emails = null;
      this.emails = await firstValueFrom(this.emailService.getAll());
      this.emailsBackupForFilter = this.emails;
    } catch (ex) {
      console.error(ex);
    }
  }


  /**
   * Eliminazione di tutte le emails presenti nell'applicazione
   * @returns 
   */
  public async deleteAll() {

    try {

      let response = await Swal.fire({
        title: "Eliminare tutte le email?",
        text: "Vuoi eliminare tutte le applicazioni?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Elimina"
      });

      if (!response.isConfirmed)
        return;

      this.emailService.deleteAll().subscribe();
      this.emails = [];
      this.emailsBackupForFilter = [];
      this.selectedEmail = null;
    } catch (ex) {
      console.error(ex);
    }
  }


  /**
   * Apertura dialog della configurazione e gestite eventuali modifiche
   */
  public async openConfig() {

    const dialogRef = this.dialog.open(ConfigurationDialogComponent, {
      width: '500px',
      data: this.configs
    });

    let data = await firstValueFrom(dialogRef.afterClosed());

    if (data && data.changeData && this.configs) {
      this.configs.username = data.username;
      this.configs.password = data.password;
      this.configs.port = data.port;
      this.configsChanged = true;
      await Swal.fire("Configurazione aggiornata!", "Riavvia l'applicazione per applicare le modifiche!", "success");
    }
  }


  /**
   * Filtraggio delle emails tramite l'input di ricerca
   */
  public filter() {

    if (!this.filterValue) {
      this.emails = this.emailsBackupForFilter;
      return;
    }

    this.emails = this.emailsBackupForFilter?.filter(email => email.subject.includes(this.filterValue) || email.from.includes(this.filterValue) || email.to.includes(this.filterValue) || email.createdAt.includes(this.filterValue)) ?? [];

    let selectedEmailInFiltered = this.emails.filter(email => email.id == (this.selectedEmail?.id ?? -1)).length;

    if (selectedEmailInFiltered == 0)
      this.selectedEmail = null;
  }


  /**
   * Pulizia del filtro di ricerca
   */
  public cleanFilter() {
    this.filterValue = "";
    this.filter();
  }
}
