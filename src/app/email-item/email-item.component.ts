import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'email-item',
  templateUrl: './email-item.component.html',
  styleUrls: ['./email-item.component.css']
})
export class EmailItemComponent {

  @Input("id") public id: number = -1;
  @Input("to") public to: string = "";
  @Input("date") public date: string = "";
  @Input("subject") public subject: string = "";
  @Input("readed") public readed: boolean = true;
  @Input("selected") public selected: boolean = false;

  @Output("delete") public deleteEvent: EventEmitter<number> = new EventEmitter<number>();


  constructor() { }


  /**
   * Emissione dell'evento di eliminazione al componente padre
   */
  public deleteById() {
    this.deleteEvent.emit(this.id);
  }

}
