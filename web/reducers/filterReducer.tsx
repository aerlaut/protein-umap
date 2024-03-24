export const INIT_ACTION = 'init'
export const TOGGLE_ACTION = 'toggle'

export default function filterReducer(state: any, action: any) {

    if (action.type == INIT_ACTION) {

        const categories: { categories : { [key:string]: { [key:string]: number[] }}} = action.payload
        const initObject: { [key:string]: { [key:string]: boolean } } = {}

        Object.entries(categories)
            .forEach(([ category, keywords ]) => {

                if(!initObject.hasOwnProperty(category)) {
                    initObject[category] = {}
                }

                Object.keys(keywords)
                    .forEach(( keyword ) => {
                        initObject[category][keyword] = false
                    })

            })

        return initObject

    }

    if (action.type == TOGGLE_ACTION) {
        const [ category, keyword ] = action.payload;

        return {
            ...state,
            [category] : {
                ...state[category],
                [keyword]: !state[category][keyword]
            }
        }
    }

}