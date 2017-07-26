import { ChangeDetectorRef } from '@angular/core';
import { ConnectRequestParams, ConnectService } from '../services/connect.service';
import { EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { NqConnectedComponent } from './connected.component';
export declare class ConnectRequestDirective implements OnInit, OnDestroy {
    private connectService;
    changeDetector: ChangeDetectorRef;
    host: NqConnectedComponent;
    config: any;
    response: EventEmitter<any>;
    subscription: Subscription;
    constructor(connectService: ConnectService, changeDetector: ChangeDetectorRef, host: NqConnectedComponent);
    ngOnInit(): void;
    ngOnDestroy(): void;
    subscribe(config: ConnectRequestParams): void;
    unsubscribe(): void;
    forceRequest(): void;
}
