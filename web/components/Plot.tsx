import UMAP from "@/components/Umap"

interface PlotProps {
    data : {
        accession_ids: string[],
        keyword_mapping: { string : { string : number[] }}
        UMAP_1: number[],
        UMAP_2: number[]
    },
    filters: any
}

export default function Plot(props : PlotProps) {

    const {
        data: {
            accession_ids,
            keyword_mapping,
            UMAP_1,
            UMAP_2
        }
    } = props


    const data = accession_ids.map(( accession_id, idx ) => ({
        "accession_id": accession_id,
        "UMAP_1": UMAP_1[idx],
        "UMAP_2": UMAP_2[idx]
    }))


    return (
        <UMAP data={data} />
    )
}