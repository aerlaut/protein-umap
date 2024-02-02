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
        <div>
            <label htmlFor={checkBoxId} className="align-middle">
                <input id={checkBoxId} type="checkbox" checked={checked} onChange={() => onChecked()}/>
                <span className="ml-1">{text}</span>
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
        <div className="h-screen min-w-40 border-solid border-black border-r-2">
            <Accordion type="multiple" className="w-full">

                {Object.entries(categories).map(([categoryName, keywords], categoryIdx) => (
                    <AccordionItem value={categoryName} key={categoryName}>
                        <AccordionTrigger>
                            {`${categoryName} (${Object.keys(keywords).length} categories)`}
                        </AccordionTrigger>
                            <AccordionContent>

                                {Object.entries(keywords)
                                    .map(([keyword, accessionIds], keywordIdx) => (
                                            <CategoryItem
                                                key={keyword}
                                                checked={ filters[categoryName][keyword] }
                                                text={`${keyword} (${accessionIds.length} cells)`}
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