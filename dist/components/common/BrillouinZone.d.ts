import React from "react";
import { type Vector3 } from "./brillouinZoneGeometry";
export interface BrillouinZoneProps {
    /**
     * Reciprocal vectors of the material's own lattice
     * (`new ReciprocalLattice(material.lattice).reciprocalVectors`). Preferred: exact for this
     * material. wove's component contract does not carry them, so the call site supplies them.
     */
    reciprocalVectors?: [Vector3, Vector3, Vector3];
    /** Bravais lattice type, e.g. `FCC` — used only when {@link reciprocalVectors} is absent. */
    latticeType?: string;
    /** Web-app asset path wove derives from the lattice; used only as a last fallback. */
    imgSrc?: string;
    description?: string;
}
/**
 * Draws the first Brillouin zone for a lattice type instead of fetching a per-lattice PNG.
 *
 * Hosts that ship their own artwork keep passing `BrillouinZoneImageComponent`; this is the
 * default for everyone else, where `imgSrc` points at an asset that does not exist (see
 * {@link computeBrillouinZoneFaces}). Falls back to the image for lattice types it cannot model.
 */
export declare function BrillouinZone({ reciprocalVectors, latticeType, imgSrc, description, }: BrillouinZoneProps): React.JSX.Element;
export default BrillouinZone;
//# sourceMappingURL=BrillouinZone.d.ts.map