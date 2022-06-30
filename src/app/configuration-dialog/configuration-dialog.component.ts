import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfigDto } from '../dtos/ConfigDto';
import { ConfigService } from '../services/http/config/config.service';

@Component({
  selector: 'app-configuration-dialog',
  templateUrl: './configuration-dialog.component.html',
  styleUrls: ['./configuration-dialog.component.css']
})
export class ConfigurationDialogComponent {

  public auth: boolean = false;

  public username: FormControl;
  public password: FormControl;
  public port: FormControl;

  constructor(public dialog: MatDialogRef<ConfigurationDialogComponent>, @Inject(MAT_DIALOG_DATA) public config: ConfigDto, private configService: ConfigService) {

    if (config.username && config.password)
      this.auth = true;

    this.username = new FormControl({ value: config.username, disabled: !this.auth });
    this.password = new FormControl({ value: config.password, disabled: !this.auth });
    this.port = new FormControl(config.port);
  }


  /**
   * Chiusura del model di configurazione
   * @param info Informazioni opzionali da restituire al chiamante
   */
  public close(info?: any) {
    this.dialog.close(info);
  }


  /**
   * Validazione campi ed aggiornamento informazioni su DB
   */
  public async save() {

    if (this.auth) {
      this.username.markAsTouched();
      this.password.markAsTouched();
    }

    this.port.markAsTouched();

    if (!this.username.value)
      this.username.setErrors({ 'empty': this.auth });

    if (!this.password.value)
      this.password.setErrors({ 'empty': this.auth });

    if (!this.port.value)
      this.port.setErrors({ 'empty': true });

    if (this.port.value == "55555")
      this.port.setErrors({ 'port': true });

    if (this.password.invalid || this.username.invalid || this.port.invalid)
      return;

    let changeData: boolean = false;

    if (this.username.value != this.config.username || this.password.value != this.config.password) {
      this.configService.updateCredentials(this.username.value, this.password.value).subscribe();
      changeData = true;
    }

    if (this.port.value != this.config.port) {
      this.configService.updatePort(this.port.value).subscribe();
      changeData = true;
    }

    let info = { changeData, username: this.username.value, password: this.password.value, port: this.port.value };

    this.close(info);
  }


  /**
   * Abilita o disabilita le input di username e password
   */
  public changeAuth() {

    if (!this.auth) {
      this.username.setValue("");
      this.username.disable();
      this.password.setValue("");
      this.password.disable();
    } else {
      this.username.enable();
      this.password.enable();
    }

  }

}
