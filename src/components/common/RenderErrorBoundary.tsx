import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import React from "react";

interface RenderErrorBoundaryProps {
    children: React.ReactNode;
    /** What the reader was looking at, e.g. "the unit properties form". */
    label: string;
}

interface RenderErrorBoundaryState {
    error: Error | null;
}

/**
 * Keeps one panel's render failure from taking the designer with it.
 *
 * React unmounts the entire tree when a render throws and nothing catches it, so a bad schema in
 * a single form blanks the whole page — which is what an unresolvable `$ref` in the unit
 * properties form used to do. Data reaching these panels comes from application registries and
 * user JSON, neither of which this repo controls, so the panel that fails should be the only
 * thing lost.
 */
export class RenderErrorBoundary extends React.Component<
    RenderErrorBoundaryProps,
    RenderErrorBoundaryState
> {
    constructor(props: RenderErrorBoundaryProps) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error): RenderErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error) {
        const { label } = this.props;
        // eslint-disable-next-line no-console
        console.error(`workflow-designer: ${label} failed to render`, error);
    }

    render() {
        const { error } = this.state;
        const { children, label } = this.props;
        if (!error) {
            return children;
        }
        return (
            <Alert severity="error" data-tid="render-error-boundary" sx={{ my: 1 }}>
                <AlertTitle>Could not show {label}</AlertTitle>
                {error.message}
            </Alert>
        );
    }
}

export default RenderErrorBoundary;
