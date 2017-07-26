import { ChangeDetectorRef } from '@angular/core';
import { Optional } from '@angular/core';
import { ConnectService } from '../services/connect.service';
import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { NqConnectedComponent } from './connected.component';
var ConnectRequestDirective = (function () {
    function ConnectRequestDirective(connectService, changeDetector, host) {
        this.connectService = connectService;
        this.changeDetector = changeDetector;
        this.host = host;
        // tslint:disable-next-line:no-input-rename
        this.config = undefined;
        this.response = new EventEmitter();
    }
    ConnectRequestDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.subscribe(this.config);
        if (this.host) {
            this.host.nqRefresh.subscribe(function () { return _this.forceRequest(); });
        }
    };
    ConnectRequestDirective.prototype.ngOnDestroy = function () {
        this.unsubscribe();
    };
    ConnectRequestDirective.prototype.subscribe = function (config) {
        var _this = this;
        this.unsubscribe();
        this.subscription = this.connectService.requestAsync(config).subscribe(function (response) {
            if (_this.response) {
                if (_this.host) {
                    setTimeout(function () {
                        _this.host.nqData = response;
                        if (_this.host.changeDetector) {
                            _this.host.changeDetector.detectChanges();
                        }
                    });
                }
                _this.response.emit(response);
            }
        });
    };
    ConnectRequestDirective.prototype.unsubscribe = function () {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    };
    ConnectRequestDirective.prototype.forceRequest = function () {
        this.subscribe(Object.assign({}, this.config, { force: true }));
    };
    ConnectRequestDirective.decorators = [
        { type: Directive, args: [{
                    exportAs: 'nqConnect',
                    selector: '[nqConnect]',
                },] },
    ];
    /** @nocollapse */
    ConnectRequestDirective.ctorParameters = function () { return [
        { type: ConnectService, },
        { type: ChangeDetectorRef, },
        { type: NqConnectedComponent, decorators: [{ type: Optional },] },
    ]; };
    ConnectRequestDirective.propDecorators = {
        'config': [{ type: Input, args: ['nqConnect',] },],
        'response': [{ type: Output },],
    };
    return ConnectRequestDirective;
}());
export { ConnectRequestDirective };
//# sourceMappingURL=connect.directive.js.map