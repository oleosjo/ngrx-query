import { EventEmitter, Provider, ChangeDetectorRef } from '@angular/core';
export declare abstract class NqConnectedComponent {
    changeDetector?: ChangeDetectorRef;
    nqData: any;
    nqRefresh: EventEmitter<any>;
}
export declare function provideNqConnectedComponent(component: any, parentType?: any): Provider;
