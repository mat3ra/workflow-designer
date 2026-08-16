import React from "react";
import { type BrillouinZoneProps } from "./BrillouinZone";
/**
 * Binds {@link BrillouinZone} to a context provider's own material, so the zone is computed from
 * that material's reciprocal lattice rather than from representative ratios for its lattice type.
 *
 * wove passes only `latticeType`/`imgSrc` to the injected component, but the call site has the
 * provider — and therefore the material — in hand.
 */
export declare function brillouinZoneComponentForProvider(provider: unknown): React.ComponentType<BrillouinZoneProps>;
//# sourceMappingURL=brillouinZoneForProvider.d.ts.map