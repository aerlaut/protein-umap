import { difference } from 'lodash'
import UMAP from "@/components/Umap"
import type { UMAPData } from "@/components/Umap"
import type { plotData } from '@/app/page'



interface PlotProps {
    data : plotData,
    filters: { [key:string] : { [key:string] : boolean }}
}

function generatePlotData(data: any, filters: any): UMAPData[] {

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

    function getTagEntryIds(activeFilters: [string, string][], tagKeywordMapping: any): { [key: string] : number[] } {

        return activeFilters.reduce((acc, [category, tag]) => {
            acc[tag] = tagKeywordMapping[category][tag]
            return acc
        }, {} as { [key: string] : number[] } )

    }

    function getEntryIdxWithNoTags(allEntries: any, filterEntryMap: { [key: string] : number[]}) {
        const entriesWithTags = Object.values(filterEntryMap).flat()
        return difference(allEntries, Array.from(entriesWithTags))
    }


    // filters
    const activeFilters = getActiveFilters(filters)
    const filterEntryIds = getTagEntryIds(activeFilters, keyword_mapping)
    const idxWithNoTags = getEntryIdxWithNoTags( Array.from(accession_ids.keys()), filterEntryIds)

    const plotData: UMAPData[] = idxWithNoTags.map((idx) => ({
        accession_id: accession_ids[idx],
        UMAP_1: UMAP_1[idx],
        UMAP_2: UMAP_2[idx],
        annotation: null
    }))

    const mappedIds = Object.entries(filterEntryIds)
        .map(([ tagName , tagIdx ]) => {

        const value: UMAPData[] = tagIdx.map((idx: number) => ({
            accession_id: accession_ids[idx],
            UMAP_1: UMAP_1[idx],
            UMAP_2: UMAP_2[idx],
            annotation: tagName
        }))

        return value
    })


    return mappedIds.reduce(( acc, map ) => [...acc, ...map], plotData)

}

export default function Plot(props : PlotProps) {

    const { data, filters } = props

    const plotData = generatePlotData(data, filters)

    return (
        <UMAP data={plotData} />
    )
}