import { createGetRangerListQuery, rangerListSelector } from './ranger/queries';
import { ConnectService } from './../lib/services/connect.service';
import { MockServerService, Ranger, SERVER_STATE } from './mockServer';
import { arrayToObjectsById, objectsByIdToArray } from '../lib/services/connectEntity.service';
import { ConnectRequestParams } from '../lib';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'nq-demo',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent {
  serverState = SERVER_STATE;

  constructor(private connectService: ConnectService, private mockServer: MockServerService) {}

  log(message: any): void {
    console.log(message);
  }
}
