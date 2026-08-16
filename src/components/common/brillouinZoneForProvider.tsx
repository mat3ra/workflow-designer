import { ReciprocalLattice } from "@mat3ra/made";
import React from "react";

import { BrillouinZone, type BrillouinZoneProps } from "./BrillouinZone";
import type { Vector3 } from "./brillouinZoneGeometry";

/** Points-path providers carry the material the path is defined for (see wove's `context/utils`). */
interface ProviderWithMaterial {
    material?: { lattice?: unknown };
}

function reciprocalVectorsFromProvider(
    provider: ProviderWithMaterial,
): [Vector3, Vector3, Vector3] | undefined {
    const lattice = provider?.material?.lattice;
    if (!lattice) {
        return undefined;
    }
    try {
        const vectors = new ReciprocalLattice(lattice as never).reciprocalVectors;
        return vectors?.length === 3 ? (vectors as [Vector3, Vector3, Vector3]) : undefined;
    } catch {
        // Malformed lattice: fall back to the lattice-type approximation inside the component.
        return undefined;
    }
}

/**
 * Component identity must be stable across renders or React remounts the SVG on every keystroke
 * in the k-path form; the provider instance is the natural cache key.
 */
const componentByProvider = new WeakMap<object, React.ComponentType<BrillouinZoneProps>>();

/**
 * Binds {@link BrillouinZone} to a context provider's own material, so the zone is computed from
 * that material's reciprocal lattice rather than from representative ratios for its lattice type.
 *
 * wove passes only `latticeType`/`imgSrc` to the injected component, but the call site has the
 * provider — and therefore the material — in hand.
 */
export function brillouinZoneComponentForProvider(
    provider: unknown,
): React.ComponentType<BrillouinZoneProps> {
    if (!provider || typeof provider !== "object") {
        return BrillouinZone;
    }
    const cached = componentByProvider.get(provider);
    if (cached) {
        return cached;
    }
    const reciprocalVectors = reciprocalVectorsFromProvider(provider as ProviderWithMaterial);
    const component: React.ComponentType<BrillouinZoneProps> = reciprocalVectors
        ? // eslint-disable-next-line react/jsx-props-no-spreading
          (props) => <BrillouinZone {...props} reciprocalVectors={reciprocalVectors} />
        : BrillouinZone;
    component.displayName = "BrillouinZoneForProvider";
    componentByProvider.set(provider, component);
    return component;
}
