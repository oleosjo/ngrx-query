import { ConnectEntityService } from './services/connectEntity.service';
import { ConnectRequestDirective } from './directives/connect.directive';
import { NGRX_QUERY_CONFIG } from './helpers/config';
import { ConnectService } from './services/connect.service';
import { NgrxQueryEffects } from './services/effects.service';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
export const NgrxQueryModule = (function () {
    function NgrxQueryModule() {
    }
    /* optional: in case you need users to override your providers */
    NgrxQueryModule.forRoot = function (config) {
        return {
            ngModule: NgrxQueryModule,
            providers: [
                { provide: NGRX_QUERY_CONFIG, useValue: config },
                ConnectService,
                ConnectEntityService,
            ],
        };
    };
    return NgrxQueryModule;
}());
NgrxQueryModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    ConnectRequestDirective,
                ],
                exports: [
                    ConnectRequestDirective,
                ],
                imports: [
                    EffectsModule.forFeature([NgrxQueryEffects]),
                ],
            },] },
];
/** @nocollapse */
NgrxQueryModule.ctorParameters = function () { return []; };
//# sourceMappingURL=ngrx-query.js.map