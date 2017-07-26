import { forwardRef } from '@angular/core';
var NqConnectedComponent = (function () {
    function NqConnectedComponent() {
    }
    return NqConnectedComponent;
}());
export { NqConnectedComponent };
export function provideNqConnectedComponent(component, parentType) {
    return { provide: parentType || NqConnectedComponent, useExisting: forwardRef(function () { return component; }) };
}
;
//# sourceMappingURL=connected.component.js.map