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
    filters: any,
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

    return (
        <div className="fixed top-8 left-8 h-4/6 w-80 border-solid border-black border-2 px-4 py-2 bg-gray-100 overflow-scroll rounded-lg">
            <div className="w-100 pb-4">
                <input className="w-full px-2 py-1 rounded" placeholder='Search' type="text" onChange={(e) => setFilterText(e.target.value)}></input>
            </div>
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