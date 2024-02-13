'use client'

import { useState, useEffect, useReducer } from 'react';
import Categories from "@/components/Categories";
import Plot from "@/components/Plot";
import filterReducer from '@/reducers/filterReducer';

const PLOTDATA_URL = "https://raw.githubusercontent.com/cragnolini-lab/uniprot-umap/main/plotdata"

export default function Home() {

    const [plotData, setPlotData] = useState<any>()
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
        </main>
    );
}
