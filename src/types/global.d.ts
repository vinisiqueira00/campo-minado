declare global {
    interface ICasa {
        valor: number | string
        aberto: boolean
        marcado: boolean
        visitado: boolean
    }

    interface ICamposAssociados {
        topLeft: ICasa | null
        topCenter: ICasa | null
        topRight: ICasa | null
        midLeft: ICasa | null
        midRight: ICasa | null
        bottomLeft: ICasa | null
        bottomCenter: ICasa | null
        bottomRight: ICasa | null
    }
}

export {}
