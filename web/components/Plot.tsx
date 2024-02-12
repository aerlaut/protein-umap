import UMAP from "@/components/Umap"
import { difference } from 'lodash'

interface PlotProps {
    data : {
        accession_ids: string[],
        keyword_mapping: { string : { string : number[] }}
        UMAP_1: number[],
        UMAP_2: number[]
    },
    filters: { [key:string] : { [key:string] : boolean }}
}

function generatePlotData(data: any, filters: any) {

    const {
        accession_ids,
        keyword_mapping,
        UMAP_1,
        UMAP_2
    } = data


    function getActiveFilters(filters: any) {
        const activeFilters: [string, string][] = []

        Object.keys(filters).forEach((category) => {

            Object.keys(filters[category]).forEach((tag) => {
                if (filters[category][tag]) activeFilters.push([ category, tag ])
            })

        })

        return activeFilters
    }

    function getTagEntryIds(activeFilters: any, tagKeywordMapping: any): { [key: string] : number[] } {

        return activeFilters.reduce((acc, [category, tag]) => {
            acc[tag] = tagKeywordMapping[category][tag]
            return acc
        }, {} as { [key: string] : number[] } )

    }

    function getEntryIdxWithNoTags(allEntries: any, filterEntryMap: { [key: string] : number[]}) {
        const entriesWitHTags = new Set<number>(Object.values(filterEntryMap).flat())
        return difference(allEntries, Array.from(entriesWitHTags))
    }


    // filters
    const activeFilters = getActiveFilters(filters)
    const filterEntryIds = getTagEntryIds(activeFilters, keyword_mapping)
    const idxWithNoTags = getEntryIdxWithNoTags( Array.from(accession_ids.keys()), filterEntryIds)

    const plotData = idxWithNoTags.map((idx) => ({
        accession_id: accession_ids[idx],
        UMAP_1: data.UMAP_1[idx],
        UMAP_2: data.UMAP_2[idx],
        annotation: "None"
    }))

    const mappedIds = Object.entries(filterEntryIds)
        .map(([ tagName , tagIdx ]) => {

        const value = tagIdx.map((idx: number) => ({
            accession_id: accession_ids[idx],
            UMAP_1: data.UMAP_1[idx],
            UMAP_2: data.UMAP_2[idx],
            annotation: tagName
        }))

        return value
    })


    return mappedIds.reduce(( acc, map ) => [...acc, ...map], plotData)

}

export default function Plot(props : PlotProps) {

    const {
        data,
        filters
    } = props

    // const plotData = data.accession_ids.map(( accession_id, idx ) => ({
    //     "accession_id": accession_id,
    //     "UMAP_1": data.UMAP_1[idx],
    //     "UMAP_2": data.UMAP_2[idx]
    // }))

    const plotData = generatePlotData(data, filters)

    console.log("*** plotData", plotData)

    return (
        <UMAP data={plotData} />
    )
}