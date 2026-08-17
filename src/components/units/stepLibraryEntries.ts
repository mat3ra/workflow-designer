/**
 * Shaping and filtering for the step library, kept out of the dialog so the search behavior can
 * be tested without a DOM: the library is only useful if a physicist typing "band" finds the
 * band-structure steps regardless of which application ships them.
 */
export interface LibraryEntry {
    key: string;
    name: string;
    application: string;
    unitNames: string[];
    config: Record<string, unknown>;
}

export interface LibraryFilter {
    search?: string;
    application?: string;
}

/**
 * Fills in a subworkflow's application from its own units.
 *
 * `SubworkflowStandata` stores the application as a bare `{ name }` stub, while every unit
 * inside carries the full record (version, build, shortName…). wode builds an `Application` from
 * the subworkflow's copy and validates it while rendering, so inserting a library entry as-is
 * throws `IN_MEMORY_ENTITY_DATA_INVALID` and takes the designer down with it. Workflow standata
 * does not have this problem — its subworkflows carry the full record — which is why loading a
 * workflow works and inserting the same step did not.
 */
export function normalizeLibraryConfig(config: Record<string, any>): Record<string, any> {
    const application = config?.application;
    if (!application?.name || application.version) {
        return config;
    }
    const fromUnit = (config.units ?? [])
        .map((unit: any) => unit?.application)
        .find((candidate: any) => candidate?.name === application.name && candidate?.version);
    return fromUnit ? { ...config, application: fromUnit } : config;
}

/** Turns raw standata subworkflow configs into entries the dialog can list and preview. */
export function toLibraryEntries(configs: Array<Record<string, any>>): LibraryEntry[] {
    return configs.map((config, index) => ({
        key: `${config?.name ?? "subworkflow"}-${index}`,
        name: String(config?.name ?? `Subworkflow ${index + 1}`),
        application: String(config?.application?.name ?? ""),
        unitNames: (config?.units ?? []).map((unit: any) => String(unit?.name ?? unit?.type ?? "")),
        config: normalizeLibraryConfig(config),
    }));
}

/** Applications present in the library, for the filter dropdown. */
export function getLibraryApplications(entries: LibraryEntry[]): string[] {
    return [...new Set(entries.map((entry) => entry.application).filter(Boolean))].sort();
}

/**
 * Matches on step name, application and unit names together, so a search finds a step by what
 * it contains and not only by what it is called.
 */
export function filterLibraryEntries(
    entries: LibraryEntry[],
    { search = "", application = "" }: LibraryFilter,
): LibraryEntry[] {
    const needle = search.trim().toLowerCase();
    return entries.filter((entry) => {
        if (application && entry.application !== application) return false;
        if (!needle) return true;
        const haystack = `${entry.name} ${entry.application} ${entry.unitNames.join(
            " ",
        )}`.toLowerCase();
        return haystack.includes(needle);
    });
}
