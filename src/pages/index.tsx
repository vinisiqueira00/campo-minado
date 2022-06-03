import { useEffect, useState } from 'react';

import '../styles/index.css'

import BombIcon from '../assets/bomb.png';
import FlagIcon from '../assets/flag.png';

function CriarPartida() {
    const [mapa, setMapa] = useState<ICasa[][]>([]);

    const [dificuldade, setDificuldade] = useState<number>(1);
    const [tamanhoMapa, setTamanhoMapa] = useState<number>(1);
    const [quantidadeBombas, setQuantidadeBombas] = useState<number>(1);

    const [fimJogo, setFimJogo] = useState<boolean>(false);
    const [fimJogoStatus, setFimJogoStatus] = useState<number|null>(null);
    const [fimJogoFrase, setFimJogoFrase] = useState<string>('');
    const [jogoEmAndamento, setJogoEmAndamento] = useState<boolean>(false);
    const [numeroFlags, setNumeroFlags] = useState<number>(quantidadeBombas);

    let casasInteresse: {row: number; col: number}[] = []
    let casasInteresseNumerais: {row: number; col: number}[] = []

    // Montagem do mapa (painel com o gabarito, para iniciar a partida)
    const montarMapa = () => {
        const posicoes = gerarPosicoesBombas(quantidadeBombas, tamanhoMapa);
        const novoMapaBombas = inserirBombasNoMapa(posicoes);
        inserirNumerosNoMapa(novoMapaBombas, posicoes);

        setJogoEmAndamento(true);
    }

    const gerarPosicoesBombas = (paramQuantidadeBombas: number, paramTamanhoMapa: number) => {
        const posicoes: number[] = [];

        let idx = 0;
        while (idx < paramQuantidadeBombas) {
            const posicaoBomba = Math.floor(Math.random() * (paramTamanhoMapa * paramTamanhoMapa));

            if (!posicoes.includes(posicaoBomba)) {
                posicoes.push(posicaoBomba);
                idx++;
            }
        }

        // const posicoes: number[] = [6, 7, 15, 30, 34, 41, 54, 58, 76, 98];
        // const posicoes: number[] = [20, 25, 29, 37, 53, 63, 69, 72, 76, 84];

        return posicoes
    }

    const inserirBombasNoMapa = (posicoesBomba: number[]) => {
        let idxCampo: number = 0;
        const novoMapa: ICasa[][] = [];

        for (let linha = 0; linha < tamanhoMapa; linha++) {
            const novaLinha: ICasa[] = [];

            for (let coluna = 0; coluna < tamanhoMapa; coluna++) {
                if (posicoesBomba.includes(idxCampo)) {
                    novaLinha.push({
                        valor: 'B',
                        aberto: false,
                        marcado: false,
                        visitado: false,
                    });
                }
                else {
                    novaLinha.push({
                        valor: 0,
                        aberto: false,
                        marcado: false,
                        visitado: false,
                    });
                }

                idxCampo++;
            }

            novoMapa.push(novaLinha);
        }

        setMapa(novoMapa);

        return novoMapa;
    }

    const inserirNumerosNoMapa = (paramMapa: ICasa[][], paramPosicoesBombas: number[]) => {
        const novoMapa: ICasa[][] = paramMapa;

        paramMapa.forEach((mapRow, idxRow) => {
            mapRow.forEach((mapCol, idxCol) => {
                if (mapCol.valor === 'B') {
                    novoMapa[idxRow][idxCol] = { valor: mapCol.valor, aberto: false, marcado: false, visitado: false };

                    const camposAssociados: ICamposAssociados = {
                        topLeft:        (idxRow-1 >= 0)             && (idxCol-1 >= 0)              ? { valor: (paramMapa[idxRow-1][idxCol-1]).valor, aberto: false, marcado: false, visitado: false }   : null,
                        topCenter:      (idxRow-1 >= 0)                                             ? { valor: (paramMapa[idxRow-1][idxCol]).valor, aberto: false, marcado: false, visitado: false }     : null,
                        topRight:       (idxRow-1 >= 0)             && (idxCol+1 <= tamanhoMapa-1)  ? { valor: (paramMapa[idxRow-1][idxCol+1]).valor, aberto: false, marcado: false, visitado: false }   : null,
                        midLeft:        (idxCol-1 >= 0)                                             ? { valor: (paramMapa[idxRow][idxCol-1]).valor, aberto: false, marcado: false, visitado: false }     : null,
                        midRight:       (idxCol+1 <= tamanhoMapa-1)                                 ? { valor: (paramMapa[idxRow][idxCol+1]).valor, aberto: false, marcado: false, visitado: false }     : null,
                        bottomLeft:     (idxRow+1 <= tamanhoMapa-1) && (idxCol-1 >= 0)              ? { valor: (paramMapa[idxRow+1][idxCol-1]).valor, aberto: false, marcado: false, visitado: false }   : null,
                        bottomCenter:   (idxRow+1 <= tamanhoMapa-1)                                 ? { valor: (paramMapa[idxRow+1][idxCol]).valor, aberto: false, marcado: false, visitado: false }     : null,
                        bottomRight:    (idxRow+1 <= tamanhoMapa-1) && (idxCol+1 <= tamanhoMapa-1)  ? { valor: (paramMapa[idxRow+1][idxCol+1]).valor, aberto: false, marcado: false, visitado: false }   : null,
                    }

                    if (camposAssociados.topLeft !== null && typeof camposAssociados.topLeft.valor === 'number') {
                        camposAssociados.topLeft.valor++;
                        novoMapa[idxRow-1][idxCol-1] = camposAssociados.topLeft;
                    }

                    if (camposAssociados.topCenter !== null && typeof camposAssociados.topCenter.valor === 'number') {
                        camposAssociados.topCenter.valor++;
                        novoMapa[idxRow-1][idxCol] = camposAssociados.topCenter;
                    }

                    if (camposAssociados.topRight !== null && typeof camposAssociados.topRight.valor === 'number') {
                        camposAssociados.topRight.valor++;
                        novoMapa[idxRow-1][idxCol+1] = camposAssociados.topRight;
                    }

                    if (camposAssociados.midLeft !== null && typeof camposAssociados.midLeft.valor === 'number') {
                        camposAssociados.midLeft.valor++;
                        novoMapa[idxRow][idxCol-1] = camposAssociados.midLeft;
                    }

                    if (camposAssociados.midRight !== null && typeof camposAssociados.midRight.valor === 'number') {
                        camposAssociados.midRight.valor++;
                        novoMapa[idxRow][idxCol+1] = camposAssociados.midRight;
                    }

                    if (camposAssociados.bottomLeft !== null && typeof camposAssociados.bottomLeft.valor === 'number') {
                        camposAssociados.bottomLeft.valor++;
                        novoMapa[idxRow+1][idxCol-1] = camposAssociados.bottomLeft;
                    }

                    if (camposAssociados.bottomCenter !== null && typeof camposAssociados.bottomCenter.valor === 'number') {
                        camposAssociados.bottomCenter.valor++;
                        novoMapa[idxRow+1][idxCol] = camposAssociados.bottomCenter;
                    }

                    if (camposAssociados.bottomRight !== null && typeof camposAssociados.bottomRight.valor === 'number') {
                        camposAssociados.bottomRight.valor++;
                        novoMapa[idxRow+1][idxCol+1] = camposAssociados.bottomRight;
                    }
                }
            });
        });

        setMapa(novoMapa);

        return novoMapa;
    }

    const abrirCasasUnica = (row: number, col: number) => {
        const newMapa = [...mapa];
        (newMapa[row][col]).aberto = true;

        setMapa(newMapa);
    }

    const abrirCasasEmMassa = (paramRow: number, paramCol: number) => {
        const newMapa = [...mapa];

        // Passo 1: Marca o elemento como visitado
        if((newMapa[paramRow][paramCol]).marcado) {
            setNumeroFlags(numeroFlags + 1);
        }

        (newMapa[paramRow][paramCol]).aberto = true;
        (newMapa[paramRow][paramCol]).marcado = false;
        setMapa(newMapa);

        // Passo 2: Esse elemento esta na lista de interesse?
        const idx = casasInteresse.indexOf({ row: paramRow, col: paramCol })
        if (idx >= 0) {
            casasInteresse.splice(idx, 1);
        }

        // Passo 3: Há elemento nulo não visitado acima?
        if (paramRow-1 >= 0 && (newMapa[paramRow-1][paramCol]).valor === 0 && !(newMapa[paramRow-1][paramCol]).aberto) {
            casasInteresse.push({ row: paramRow-1, col: paramCol });
        }
        else if (paramRow-1 >= 0 && (newMapa[paramRow-1][paramCol]).valor > 0) {
            if (!casasInteresseNumerais.find(casa => casa.row === paramRow-1 && casa.col === paramCol)) {
                casasInteresseNumerais.push({ row: paramRow-1, col: paramCol });
            }
        }

        // Passo 4: Há elemento numérico à direita-cima?
        if (paramRow-1 >= 0 && paramCol+1 < tamanhoMapa && (newMapa[paramRow-1][paramCol+1]).valor > 0) {
            if (!casasInteresseNumerais.find(casa => casa.row === paramRow-1 && casa.col === paramCol+1)) {
                casasInteresseNumerais.push({ row: paramRow-1, col: paramCol+1 });
            }
        }

        // Passo 5: Há elemento numérico à esquerda-cima?
        if (paramRow-1 >= 0 && paramCol-1 >= 0 && (newMapa[paramRow-1][paramCol-1]).valor > 0) {
            if (!casasInteresseNumerais.find(casa => casa.row === paramRow-1 && casa.col === paramCol-1)) {
                casasInteresseNumerais.push({ row: paramRow-1, col: paramCol-1 });
            }
        }

        // Passo 6: Há elemento nulo não visitado abaixo?
        if (paramRow+1 < tamanhoMapa && (newMapa[paramRow+1][paramCol]).valor === 0 && !(newMapa[paramRow+1][paramCol]).aberto) {
            casasInteresse.push({ row: paramRow+1, col: paramCol });
        }
        else if (paramRow+1 < tamanhoMapa && (newMapa[paramRow+1][paramCol]).valor > 0) {
            if (!casasInteresseNumerais.find(casa => casa.row === paramRow+1 && casa.col === paramCol)) {
                casasInteresseNumerais.push({ row: paramRow+1, col: paramCol });
            }
        }

        // Passo 7: Há elemento numérico à direita-baixo?
        if (paramRow+1 < tamanhoMapa && paramCol+1 < tamanhoMapa && (newMapa[paramRow+1][paramCol+1]).valor > 0) {
            if (!casasInteresseNumerais.find(casa => casa.row === paramRow+1 && casa.col === paramCol+1)) {
                casasInteresseNumerais.push({ row: paramRow+1, col: paramCol+1 });
            }
        }

        // Passo 8: Há elemento numérico à esquerda-baixo?
        if (paramRow+1 < tamanhoMapa && paramCol-1 >= 0 && (newMapa[paramRow+1][paramCol-1]).valor > 0) {
            if (!casasInteresseNumerais.find(casa => casa.row === paramRow+1 && casa.col === paramCol-1)) {
                casasInteresseNumerais.push({ row: paramRow+1, col: paramCol-1 });
            }
        }

        // Passo 9: Há elemento nulo à direita não visitado?
        if (paramCol+1 < tamanhoMapa && (newMapa[paramRow][paramCol+1]).valor === 0 && !(newMapa[paramRow][paramCol+1]).aberto) {
            abrirCasasEmMassa(paramRow, paramCol+1);
        }
        else if (paramCol+1 < tamanhoMapa && (newMapa[paramRow][paramCol+1]).valor > 0) {
            if (!casasInteresseNumerais.find(casa => casa.row === paramRow && casa.col === paramCol+1)) {
                casasInteresseNumerais.push({ row: paramRow, col: paramCol+1 });
            }
        }

        // Passo 10: Há elemento nulo à esquerda não visitado?
        if (paramCol-1 >= 0 && (newMapa[paramRow][paramCol-1]).valor === 0 && !(newMapa[paramRow][paramCol-1]).aberto) {
            abrirCasasEmMassa(paramRow, paramCol-1);
        }
        else if (paramCol-1 >= 0 && (newMapa[paramRow][paramCol-1]).valor > 0) {
            if (!casasInteresseNumerais.find(casa => casa.row === paramRow && casa.col === paramCol-1)) {
                casasInteresseNumerais.push({ row: paramRow, col: paramCol-1 });
            }
        }

        // Passo 11: Há elemento na lista de interesse?
        if (casasInteresse.length > 0) {
            const destino = casasInteresse[0];
            casasInteresse.shift()
            abrirCasasEmMassa(destino.row, destino.col);
        }

        // Passo 12: Marca todas as coordenadas da lista de interesse numérico como aberto
        casasInteresseNumerais.forEach(casa => {
            if((newMapa[casa.row][casa.col]).marcado) {
                setNumeroFlags(numeroFlags + 1);
            }

            (newMapa[casa.row][casa.col]).aberto = true;
            (newMapa[casa.row][casa.col]).marcado = false;
        })
        setMapa(newMapa);
    }

    const inserirFlag = (row: number, col: number) => {
        const newMapa = [...mapa];
        if (!(newMapa[row][col]).aberto) {
            if ((newMapa[row][col]).marcado) {
                (newMapa[row][col]).marcado = false
                setNumeroFlags(numeroFlags + 1);
            }
            else {
                (newMapa[row][col]).marcado = true
                setNumeroFlags(numeroFlags - 1);
            }

            setMapa(newMapa);
        }
    }

    const handleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, row: number, col: number) => {
        if (jogoEmAndamento) {
            if (e.button === 2) {
                inserirFlag(row, col);
            }
            else if (!(mapa[row][col]).marcado) {
                if ((mapa[row][col]).valor === 'B') {
                    abrirCasasUnica(row, col);
                    setJogoEmAndamento(false);
                    setFimJogo(true);
                    setFimJogoStatus(0);
                }
                else if ((mapa[row][col]).valor === 0) {
                    casasInteresseNumerais = [];
                    abrirCasasEmMassa(row, col);
                }
                else {
                    abrirCasasUnica(row, col);
                }
            }

            console.log(casasInteresseNumerais)
        }
    }

    useEffect(() => {
        // Tamanho do tabuleiro (X por X)
        switch(dificuldade) {
            case 1: setTamanhoMapa(10); break;
            case 2: setTamanhoMapa(18); break;
            case 3: setTamanhoMapa(25); break;
            case 4: setTamanhoMapa(33); break;
            default: setTamanhoMapa(10);
        }

        // Quantidade de bombas
        switch(dificuldade) {
            case 1: setQuantidadeBombas(10); break;
            case 2: setQuantidadeBombas(50); break;
            case 3: setQuantidadeBombas(100); break;
            case 4: setQuantidadeBombas(180); break;
            default: setQuantidadeBombas(10);
        }
    }, [dificuldade])

    useEffect(() => {
        if (jogoEmAndamento) {
            let todasCasasAbertas = true;

            mapa.forEach(mapRow => {
                mapRow.forEach(mapCol => {
                    if (!mapCol.aberto && !mapCol.marcado) {
                        todasCasasAbertas = false;
                    }
                })
            })

            if (todasCasasAbertas) {
                setJogoEmAndamento(false);
                setFimJogo(true);
                setFimJogoStatus(1);
            }
        }
    }, [mapa, jogoEmAndamento])

    useEffect(() => {
        setNumeroFlags(quantidadeBombas);
    }, [quantidadeBombas])

    return (
        <>
            <main className="game-page">
                <div className="game-name">
                    Campo minado
                </div>

                <div className="game-settings">
                    <select className="game-dificuldade" name="dificuldade" id="dificuldade" onChange={(e) => setDificuldade(parseInt(e.target.value))}>
                        <option value="1">Fácil</option>
                        <option value="2">Médio</option>
                        <option value="3">Dificil</option>
                        <option value="4">Experiente</option>
                    </select>
                    <button className="game-restart" onClick={montarMapa}>Iniciar</button>
                </div>

                <section className="game">
                    <div className="game-map">
                        <div className="game-map-container">
                            {
                                mapa.map((mapRow, idxRow) => {
                                    return (
                                        <div key={idxRow} className="game-map-row">
                                            {
                                                mapRow.map((mapCol, idxCol) => {
                                                    const estaAberto = mapCol.aberto;
                                                    const ehBomba = mapCol.valor === 'B';
                                                    const ehNulo = mapCol.valor === 0;

                                                    return (
                                                        <span key={idxCol} className={`game-map-collum ${estaAberto && 'aberto'} ${estaAberto && ehBomba && 'bomba'} ${estaAberto && ehNulo && 'nulo'}`} onMouseDown={(e) => handleClick(e, idxRow, idxCol)}>
                                                            {(mapCol.aberto && mapCol.valor > 0 && mapCol.valor)}
                                                            {(mapCol.aberto && mapCol.valor === 'B' && <img src={BombIcon} />)}
                                                            {(mapCol.marcado && <img src={FlagIcon} />)}
                                                        </span>
                                                    )
                                                })
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </section>
            </main>

            <main className={`game-modal ${fimJogo && 'aberto'}`}>
                <div className="game-modal-box">
                    <h3 className={fimJogoStatus ? 'ganhou' : 'perdeu'}>{fimJogoStatus ? 'Parabéns! Você venceu!' : 'Ahh não! Você perdeu!'}</h3>
                    <div className='button'>
                        <button onClick={() => window.location.reload()}>Reiniciar</button>
                    </div>
                </div>
            </main>
        </>
    )
}

export default CriarPartida;
