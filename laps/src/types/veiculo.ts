// src/types/veiculo.ts
export interface ItemServico {
    codigo: number;
    quantidade: number;
    valorUnitario: number;
    descricao: string;
    observacao: string | null;
    dataHora: string;
    tipoItem: string;
    codigoMecanico: number;
}

export interface Historico {
    codigoVenda: number;
    dataVenda: string;
    quilometragem: number;
    marca: string | null;
    modelo: string;
    anoFabricacao: string;
    chassi: string | null;
    observacaoGeral: string | null;
    itens: ItemServico[];
}

export interface UltimoDono {
    'Código do Cliente': number;
    'Nome do Cliente': string;
    'Razão Social': string;
    'Endereço': string;
    'Cidade': string;
    'UF': string;
    'Fone Resid': string;
    'E-mail': string | null;
}

export interface HistoricoVeiculo {
    placa: string;
    ultimoDono: UltimoDono;
    historico: Historico[];
}