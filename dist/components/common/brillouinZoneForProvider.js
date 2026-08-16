import { jsx as _jsx } from "react/jsx-runtime";
import { ReciprocalLattice } from "@mat3ra/made";
import { BrillouinZone } from "./BrillouinZone";
function reciprocalVectorsFromProvider(provider) {
    var _a;
    const lattice = (_a = provider === null || provider === void 0 ? void 0 : provider.material) === null || _a === void 0 ? void 0 : _a.lattice;
    if (!lattice) {
        return undefined;
    }
    try {
        const vectors = new ReciprocalLattice(lattice).reciprocalVectors;
        return (vectors === null || vectors === void 0 ? void 0 : vectors.length) === 3 ? vectors : undefined;
    }
    catch (_b) {
        // Malformed lattice: fall back to the lattice-type approximation inside the component.
        return undefined;
    }
}
/**
 * Component identity must be stable across renders or React remounts the SVG on every keystroke
 * in the k-path form; the provider instance is the natural cache key.
 */
const componentByProvider = new WeakMap();
/**
 * Binds {@link BrillouinZone} to a context provider's own material, so the zone is computed from
 * that material's reciprocal lattice rather than from representative ratios for its lattice type.
 *
 * wove passes only `latticeType`/`imgSrc` to the injected component, but the call site has the
 * provider — and therefore the material — in hand.
 */
export function brillouinZoneComponentForProvider(provider) {
    if (!provider || typeof provider !== "object") {
        return BrillouinZone;
    }
    const cached = componentByProvider.get(provider);
    if (cached) {
        return cached;
    }
    const reciprocalVectors = reciprocalVectorsFromProvider(provider);
    const component = reciprocalVectors
        ? // eslint-disable-next-line react/jsx-props-no-spreading
            (props) => _jsx(BrillouinZone, { ...props, reciprocalVectors: reciprocalVectors })
        : BrillouinZone;
    component.displayName = "BrillouinZoneForProvider";
    componentByProvider.set(provider, component);
    return component;
}
