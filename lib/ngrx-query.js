import { ConnectEntityService } from './services/connectEntity.service';
import { ConnectRequestDirective } from './directives/connect.directive';
import { NGRX_QUERY_CONFIG } from './helpers/config';
import { ConnectService } from './services/connect.service';
import { NgrxQueryEffects } from './services/effects.service';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
var NgrxQueryModule = (function () {
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
    return NgrxQueryModule;
}());
export { NgrxQueryModule };
//# sourceMappingURL=ngrx-query.js.map