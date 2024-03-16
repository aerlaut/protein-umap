type LegendItem = {
    label: string,
    color: string,
}

interface LegendItemProps {
    items: { [category: string] : {
        [label: string] : boolean }
    }
}

const TABLEAU10_COLORS = [
    '#5778a4',
    '#e49444',
    '#d1615d',
    '#85b6b2',
    '#6a9f58',
    '#e7ca60',
    '#a87c9f',
    '#f1a2a9',
    '#967662',
    '#b8b0ac',
]

export default function Legend(props: LegendItemProps) {

    const { items } = props

    const selected = Object.entries(items).reduce((acc, [_, labels]) => {
        const active = Object.entries(labels).filter(([_, value]) => value).map(([label, _]) => label)
        return [...acc, ...active]
    }, [] as string[])

    const getColor = (idx: number) => TABLEAU10_COLORS[idx % TABLEAU10_COLORS.length]

    return (
        selected.length && (
            <div className="fixed top-8 right-16 px-4 py-2 w-50 bg-white border-solid border-2 border-slate-100">
                <div className="mb-2"><strong>LEGEND</strong></div>
                {
                    selected.map((item, idx) => (
                        <div key={idx}>
                            <div className="inline-block w-4 h-4 mr-2 align-middle" title={getColor(idx)} style={{background: getColor(idx)}} />
                            <div className="inline-block align-middle">{item}</div>
                        </div>
                    ))
                }
            </div>
        )
    )

}