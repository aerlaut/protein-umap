import { useState } from 'react';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/Accordion"

interface CategoryItemProps {
    text: string,
    checked: boolean
    onChecked: () => any
}

function CategoryItem(props : CategoryItemProps) {

    const {
        text,
        checked,
        onChecked
    } = props

    const checkBoxId = `checkbox-${text}`

    return (
        <div className='my-1'>
            <label htmlFor={checkBoxId} className="align-middle">
                <input id={checkBoxId} type="checkbox" checked={checked} onChange={() => onChecked()}/>
                <span className="ml-2 cursor-pointer">{text}</span>
            </label>
        </div>
    )
}

interface CategoriesProps {
    categories: { [key: string] : { [key: string] : number[] } },
    filters: { [key: string] : { [key: string] : boolean } },
    onUpdateFilter: (level: string, value: string) => any
}


export default function Categories( props : CategoriesProps) {


    const [ filterText, setFilterText ] = useState('')


    const {
        categories,
        filters,
        onUpdateFilter,
    } = props

    const filteredCategories = Object.entries(categories)
        .reduce(( acc, [categoryName, keywords] ) => {

            const matchingKeyword = Object.entries(keywords).filter(([keyword, _]) => keyword.match(new RegExp(filterText, 'ig')))
            if(matchingKeyword.length) {
                acc[categoryName] = {}

                matchingKeyword.forEach(([keyword, accessionIds]) => {
                    acc[categoryName][keyword] = accessionIds
                })
            }

            return acc
        }, {} as { [key: string]: { [key: string] : number[] }})

    const activeCategories = Object.entries(filters)
        .reduce(( acc, [categoryName, keywords] ) => {

            const activeKeywords = Object.entries(keywords).filter(([_, checked]) => checked).map(([keyword, _]) => [categoryName, keyword])
            return activeKeywords.length ? acc.concat(activeKeywords) : acc

        }, [] as string[][])

    return (
        <div className="fixed top-8 left-8 h-5/6 w-80 border-solid border-black border-2 px-4 py-2 bg-gray-100 overflow-scroll rounded-lg">
            <div className="w-100 pb-4">
                <input className="w-full px-2 py-1 rounded" placeholder='Search' type="text" onChange={(e) => setFilterText(e.target.value)}></input>
            </div>
            <div className="w-100 pb-4">
                { activeCategories.map(([categoryName, keyword]) => (
                    <div key={keyword}
                        className='px-3 inline-block rounded-full bg-yellow-100 border border-orange-200 text-orange-800 cursor-pointer mb-1 mr-1'
                        onClick={() => onUpdateFilter(categoryName, keyword)}
                    >
                        <span className='mr-2 text-lg'>&times;</span>{ keyword }
                    </div>
                    )
                )}
            </div>
            <hr />
                <Accordion type="multiple" className="w-full">
                    {Object.entries(filteredCategories).map(([categoryName, keywords]) => (
                        <AccordionItem value={categoryName} key={categoryName}>
                            <AccordionTrigger>
                                {categoryName}
                            </AccordionTrigger>
                                <AccordionContent>

                                    {Object.entries(keywords).map(([keyword, accessionIds]) => (
                                                <CategoryItem
                                                    key={keyword}
                                                    checked={ filters[categoryName][keyword] }
                                                    text={`${keyword} (${accessionIds.length})`}
                                                    onChecked={() => onUpdateFilter(categoryName, keyword)}
                                                />
                                            )
                                    )}

                                </AccordionContent>
                        </AccordionItem>
                    ))}

            </Accordion>
        </div>
    )
}