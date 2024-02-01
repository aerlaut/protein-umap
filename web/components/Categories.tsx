import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"


interface CategoryItemProps {
    text: string
}

function CategoryItem({text} : CategoryItemProps) {

    const checkBoxId = `checkbox-${text}`

    return (
        <div>
            <label htmlFor={checkBoxId} className="align-middle">
                <input id={checkBoxId} type="checkbox" />
                <span className="ml-1">{text}</span>
            </label>
        </div>
    )
}

interface CategoriesProps {
    categories: { str : { str: number[] } }
}

export default function Categories({ categories }: CategoriesProps) {


    categories

    return (
        <div className="h-screen min-w-40 border-solid border-black border-r-2">
            <Accordion type="multiple" className="w-full">
                {Object.entries(categories).map(([categoryName, keywords]) => (
                    <AccordionItem value={categoryName} key={`item-${categoryName}`}>
                        <AccordionTrigger>{categoryName}</AccordionTrigger>
                            <AccordionContent>
                                {Object.entries(keywords)
                                    .map(
                                        ([keyword, accessionIds]) => (
                                            <CategoryItem
                                                key={keyword}
                                                text={`${keyword} (${accessionIds.length})`}
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