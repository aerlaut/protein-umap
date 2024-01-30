import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"


const categories = {
    cat1: ['cat2', 'cat3', 'cat4'],
    cat2: ['cat2', 'cat3', 'cat4'],
    cat3: ['cat2', 'cat3', 'cat4']
}


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

export default function Categories() {
    return (
        <div className="h-screen min-w-40 border-solid border-black border-r-2">
            <Accordion type="multiple" className="w-full">
                {Object.entries(categories).map(([catName, el]) => (
                    <AccordionItem value={catName} key={`item-${catName}`}>
                        <AccordionTrigger>{catName}</AccordionTrigger>
                            <AccordionContent>
                                {el.map((e) => <CategoryItem key={e} text={e} />)}
                            </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}