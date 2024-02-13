import { useState } from 'react';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

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
    categories: { str : { str: number[] } },
    filters: any,
    onUpdateFilter: (level: string, value: string) => any
}


export default function Categories( props : CategoriesProps) {


    const {
        categories,
        filters,
        onUpdateFilter
    } = props


    return (
        <div className="fixed top-8 right-8 h-5/6 w-80 border-solid border-black border-2 px-4 py-2 bg-gray-100 overflow-scroll rounded-lg">
            <Accordion type="multiple" className="w-full">

                {Object.entries(categories).map(([categoryName, keywords], categoryIdx) => (
                    <AccordionItem value={categoryName} key={categoryName}>
                        <AccordionTrigger>
                            {categoryName}
                        </AccordionTrigger>
                            <AccordionContent>

                                {Object.entries(keywords)
                                    .map(([keyword, accessionIds], keywordIdx) => (
                                            <CategoryItem
                                                key={keyword}
                                                checked={ filters[categoryName][keyword] }
                                                text={`${keyword} (${accessionIds.length} entries)`}
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