import { ReciprocalLattice } from "@mat3ra/made";
import React from "react";

import {
    type BrillouinZonePathPoint,
    type BrillouinZoneProps,
    BrillouinZone,
} from "./BrillouinZone";
import type { Vector3 } from "./brillouinZoneGeometry";

/** Points-path providers carry the material the path is defined for (see wove's `context/utils`). */
interface ProviderWithMaterial {
    material?: { lattice?: unknown };
    getData?: () => unknown;
}

interface ProviderLattice {
    reciprocalVectors: [Vector3, Vector3, Vector3];
    /** Cartesian coordinates of each high-symmetry point, keyed by the name the form uses. */
    symmetryPoints: Map<string, Vector3>;
}

function readProviderLattice(provider: ProviderWithMaterial): ProviderLattice | undefined {
    const lattice = provider?.material?.lattice;
    if (!lattice) {
        return undefined;
    }
    try {
        const reciprocalLattice = new ReciprocalLattice(lattice as never);
        const vectors = reciprocalLattice.reciprocalVectors;
        if (vectors?.length !== 3) {
            return undefined;
        }
        const symmetryPoints = new Map<string, Vector3>();
        reciprocalLattice.symmetryPoints.forEach(({ point, coordinates }) => {
            // Symmetry points are stored in crystal coordinates; the zone is drawn in cartesian.
            const cartesian = reciprocalLattice.getCartesianCoordinates(coordinates);
            if (cartesian?.length === 3) {
                symmetryPoints.set(point, cartesian as Vector3);
            }
        });
        return { reciprocalVectors: vectors as [Vector3, Vector3, Vector3], symmetryPoints };
    } catch {
        // Malformed lattice: fall back to the lattice-type approximation inside the component.
        return undefined;
    }
}

/** The path as currently edited, resolved to coordinates the zone can draw. */
function readPath(
    provider: ProviderWithMaterial,
    symmetryPoints: Map<string, Vector3>,
): BrillouinZonePathPoint[] | undefined {
    const data = provider.getData?.();
    if (!Array.isArray(data)) {
        return undefined;
    }
    const resolved = data
        .map((item) => {
            const name = (item as { point?: unknown })?.point;
            const coordinates = typeof name === "string" ? symmetryPoints.get(name) : undefined;
            return coordinates ? { point: name as string, coordinates } : null;
        })
        .filter(Boolean) as BrillouinZonePathPoint[];
    return resolved.length > 1 ? resolved : undefined;
}

/**
 * Component identity must be stable across renders or React remounts the SVG on every keystroke
 * in the k-path form; the provider instance is the natural cache key.
 */
const componentByProvider = new WeakMap<object, React.ComponentType<BrillouinZoneProps>>();

/**
 * Binds {@link BrillouinZone} to a context provider's own material, so the zone is computed from
 * that material's reciprocal lattice rather than from representative ratios for its lattice type,
 * and the path being edited is drawn inside it.
 *
 * wove passes only `latticeType`/`imgSrc` to the injected component, but the call site has the
 * provider — and therefore the material and the current path — in hand. The path is read at
 * render time rather than captured, so editing a leg redraws the picture.
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
    const providerLattice = readProviderLattice(provider as ProviderWithMaterial);
    const component: React.ComponentType<BrillouinZoneProps> = providerLattice
        ? (props) => (
              <BrillouinZone
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...props}
                  reciprocalVectors={providerLattice.reciprocalVectors}
                  path={readPath(provider as ProviderWithMaterial, providerLattice.symmetryPoints)}
              />
          )
        : BrillouinZone;
    component.displayName = "BrillouinZoneForProvider";
    componentByProvider.set(provider, component);
    return component;
}
