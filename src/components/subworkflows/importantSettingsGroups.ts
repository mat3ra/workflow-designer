import type { AnySubworkflowUnit, ExecutionUnit, Subworkflow } from "@mat3ra/wode";

/**
 * Use schema `type`, not `instanceof`. Job/workflow units are built via Meteor-compiled
 * `@mat3ra/wode` (see `rspack.config.js` `compileWithMeteor`); wove UI may resolve another
 * copy of the same class → `instanceof` is false for every unit.
 */
export function isExecutionUnit(unit: AnySubworkflowUnit): unit is ExecutionUnit {
    return unit.type === "execution";
}

export type ImportantSettingsProvider = ExecutionUnit["contextProvidersInstances"][number];

export interface ProviderEntry {
    unit: ExecutionUnit;
    provider: ImportantSettingsProvider;
}

/**
 * One editable panel: a provider (or several instances of the same provider that must stay in
 * lockstep) plus the scope it applies to.
 */
export interface SettingsGroup {
    key: string;
    title: string;
    /** Which units this setting reaches — a subworkflow-wide provider, or a single unit. */
    scopeLabel: string;
    /** Groups the left-hand index: the subworkflow itself, or one unit. */
    scopeKey: string;
    scopeName: string;
    /** Position in the subworkflow, for the unit-scoped groups. */
    unitIndex?: number;
    entries: ProviderEntry[];
    isEdited: boolean;
    /** Lowercased haystack for the filter box: title, scope, field names and descriptions. */
    searchText: string;
}

const PROVIDER_TITLES: Record<string, string> = {
    boundaryConditions: "Boundary Conditions",
    cutoffs: "Planewave Cutoffs",
    kgrid: "K-point Grid",
    kpath: "K-point Path",
    qgrid: "Q-point Grid",
    qpath: "Q-point Path",
    explicitKPath: "Explicit K-point Path",
    explicitKPath2PIBA: "Explicit K-point Path (2π/a)",
    ionicDynamicsData: "Ionic Dynamics",
    hubbardJ: "Hubbard J",
    hubbardU: "Hubbard U",
    hubbardV: "Hubbard V",
    nEigenvalues: "Number of Eigenvalues",
    collinearMagnetization: "Collinear Magnetization",
    nonCollinearMagnetization: "Non-collinear Magnetization",
};

/** Falls back to spacing out the camelCase provider name, e.g. `someSetting` → `Some setting`. */
export function getProviderTitle(provider: { name: string }): string {
    const known = PROVIDER_TITLES[provider.name];
    if (known) return known;
    const spaced = provider.name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Simulation-engine keywords per provider, so filtering for the name a scientist actually
 * types into an input file (`ecutwfc`) finds the field that sets it.
 */
const ENGINE_KEYWORDS: Record<string, string> = {
    cutoffs: "ecutwfc ecutrho encut planewave cutoff",
    kgrid: "kgrid kpoints k-points kppra monkhorst pack mesh",
    kpath: "kpath k-path band path high symmetry",
    qgrid: "qgrid qpoints q-points phonon mesh",
    qpath: "qpath q-path phonon dispersion path",
    explicitKPath: "kpath explicit k-points",
    ionicDynamicsData: "ion_dynamics nstep relaxation dynamics",
    hubbardU: "hubbard_u dft+u",
    hubbardV: "hubbard_v dft+u intersite",
    hubbardJ: "hubbard_j dft+u",
    boundaryConditions: "esm boundary conditions",
    nEigenvalues: "nbnd number of bands eigenvalues",
    collinearMagnetization: "starting_magnetization spin",
    nonCollinearMagnetization: "starting_magnetization noncolin spin",
};

/** Field names, descriptions and engine keywords, all lowercased for the filter box. */
function collectSearchText(provider: ImportantSettingsProvider): string {
    const schema = (provider as unknown as { jsonSchema?: Record<string, unknown> }).jsonSchema;
    const properties = (schema?.properties ?? {}) as Record<string, { description?: string }>;
    const fieldText = Object.entries(properties)
        .map(([name, field]) => `${name} ${field?.description ?? ""}`)
        .join(" ");
    const keywords = ENGINE_KEYWORDS[provider.name] ?? "";
    return `${provider.name} ${keywords} ${String(schema?.description ?? "")} ${fieldText}`;
}

function toGroup(
    entries: ProviderEntry[],
    scope: { scopeKey: string; scopeName: string; scopeLabel: string; unitIndex?: number },
): SettingsGroup {
    const [{ provider }] = entries;
    const title = getProviderTitle(provider);
    return {
        key: `${scope.scopeKey}:${provider.name}`,
        title,
        entries,
        isEdited: entries.some((entry) => Boolean(entry.provider.isEdited)),
        searchText: `${title} ${scope.scopeName} ${collectSearchText(provider)}`.toLowerCase(),
        ...scope,
    };
}

/**
 * Subworkflow-scoped providers, grouped by name.
 *
 * Several units can each carry their own instance of the same subworkflow-scoped provider
 * (`pw_scf` and `pw_bands` both have "cutoffs" — they must share one wavefunction/density
 * cutoff, since QE's `bands` step reuses the prior `scf` step's charge density). One panel per
 * name edits them together, instead of one panel per unit that happens to carry it.
 */
export function getSubworkflowSettingsGroups(subworkflow: Subworkflow): SettingsGroup[] {
    const byName = new Map<string, ProviderEntry[]>();
    subworkflow.unitsInstances.filter(isExecutionUnit).forEach((unit) => {
        unit.contextProvidersInstances
            .filter((provider) => provider.entityName === "subworkflow")
            .filter((provider) => provider.domain === "important")
            .forEach((provider) => {
                const existing = byName.get(provider.name);
                if (existing) {
                    existing.push({ unit, provider });
                } else {
                    byName.set(provider.name, [{ unit, provider }]);
                }
            });
    });

    return [...byName.values()].map((entries) =>
        toGroup(entries, {
            scopeKey: "subworkflow",
            scopeName: "Subworkflow",
            scopeLabel: "applies to the whole subworkflow",
        }),
    );
}

/** Unit-scoped providers, one group per provider per unit. */
export function getUnitSettingsGroups(subworkflow: Subworkflow): SettingsGroup[] {
    return subworkflow.unitsInstances.filter(isExecutionUnit).flatMap((unit, unitIndex) =>
        unit.contextProvidersInstances
            .filter((provider) => provider.entityName === "unit")
            .filter((provider) => provider.domain === "important")
            .map((provider) =>
                toGroup([{ unit, provider }], {
                    scopeKey: unit.flowchartId,
                    scopeName: unit.name,
                    scopeLabel: `unit ${unit.name}`,
                    unitIndex,
                }),
            ),
    );
}

export function getSettingsGroups(subworkflow: Subworkflow): SettingsGroup[] {
    return [...getSubworkflowSettingsGroups(subworkflow), ...getUnitSettingsGroups(subworkflow)];
}

/** Scope rows for the left-hand index, in subworkflow order, with counts of edited groups. */
export function getScopeIndex(groups: SettingsGroup[]) {
    const scopes = new Map<string, { key: string; name: string; total: number; edited: number }>();
    groups.forEach((group) => {
        const entry = scopes.get(group.scopeKey) ?? {
            key: group.scopeKey,
            name: group.scopeName,
            total: 0,
            edited: 0,
        };
        entry.total += 1;
        if (group.isEdited) entry.edited += 1;
        scopes.set(group.scopeKey, entry);
    });
    return [...scopes.values()];
}

/** Pristine values declared on the provider's JSON schema, if it declares any. */
function getDefaultDataFromSchema(
    provider: ImportantSettingsProvider,
): Record<string, unknown> | null {
    const schema = (provider as unknown as { jsonSchema?: Record<string, unknown> }).jsonSchema;
    const properties = (schema?.properties ?? {}) as Record<string, { default?: unknown }>;
    const defaults = Object.entries(properties).reduce<Record<string, unknown>>(
        (accumulator, [name, field]) => {
            if (field && Object.prototype.hasOwnProperty.call(field, "default")) {
                accumulator[name] = field.default;
            }
            return accumulator;
        },
        {},
    );
    return Object.keys(defaults).length > 0 ? defaults : null;
}

/**
 * Pristine values for a group, so a setting can be put back the way it was found.
 *
 * `getDefaultData()` is `protected` on wode's `ContextProvider` — a compile-time marker only —
 * and it is the sole reliable source. Providers do try to publish their defaults onto the JSON
 * schema (`PlanewaveCutoffDataManager` patches `{ wavefunction: { default } }` through
 * `getPatchedSchemaById`), but that patch addresses `wavefunction.default` while the schema
 * keeps fields under `properties.wavefunction`; esse's patcher skips paths it cannot resolve,
 * so those defaults never land. Schema defaults are still read first for providers that do
 * declare them properly.
 *
 * Returns null when neither source yields anything, and callers then hide the reset control
 * rather than write an empty object over the user's data.
 */
export function getDefaultData(
    provider: ImportantSettingsProvider,
): Record<string, unknown> | null {
    const fromSchema = getDefaultDataFromSchema(provider);
    if (fromSchema) return fromSchema;

    const readDefaults = (provider as unknown as { getDefaultData?: () => unknown }).getDefaultData;
    if (typeof readDefaults !== "function") return null;
    try {
        const defaults = readDefaults.call(provider);
        return defaults && typeof defaults === "object" && Object.keys(defaults).length > 0
            ? (defaults as Record<string, unknown>)
            : null;
    } catch {
        return null;
    }
}
