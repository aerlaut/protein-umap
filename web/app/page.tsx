'use client'

import { useState, useEffect, useReducer } from 'react';
import Categories from "@/components/Categories";
import Plot from "@/components/Plot";
import Legend from '@/components/Legend';
import filterReducer from '@/reducers/filterReducer';

const PLOTDATA_URL = "https://raw.githubusercontent.com/cragnolini-lab/uniprot-umap/main/plotdata"

export type plotData = {
    accession_ids: string,
    keyword_mapping: {
        [key: string]: {
            [key: string]: number[]
        }
    },
    UMAP_1: number[],
    UMAP_2: number[]
}

export default function App() {

    const [plotData, setPlotData] = useState<plotData>()
    const [filters, dispatch] = useReducer(filterReducer, {})

    useEffect(() => {
        fetch(`${PLOTDATA_URL}/latest.json`)
            .then((res) => res.json())
            .then((data) => {
                setPlotData(data)
                dispatch({ type: 'init', payload: data.keyword_mapping })
            });
    }, [])

    if (!plotData) return <></>

    return (
        <main className="flex flex-row">
            <Plot
                data={plotData}
                filters={filters}
            />
            <Categories
                categories={plotData.keyword_mapping}
                filters={filters}
                onUpdateFilter={(category, keyword) => {
                    dispatch({
                        type: 'toggle',
                        payload: [category, keyword]
                    })
                }}
            />
            <Legend items={filters}/>
        </main>
    );
}
