// src/services/api.ts
import { HistoricoVeiculo } from '../types/veiculo';
import { supabase } from './supabase';

// URL da API externa
const API_URL = 'https://pp.campinagrande.br';

export async function buscarHistoricoVeiculo(placa: string): Promise<HistoricoVeiculo> {
    try {
        // Normalizar a placa (remover espaços e converter para maiúsculas)
        const placaNormalizada = placa.replace(/\s/g, '').toUpperCase();
        
        // Buscar dados da API externa (sem espaços)
        const apiExternaPromise = buscarNaAPIExterna(placaNormalizada);
        
        // Buscar dados do Supabase (com e sem espaços)
        const supabasePromise = buscarNoSupabase(placaNormalizada);
        
        // Aguardar ambas as buscas
        const [resultadoAPI, resultadoSupabase] = await Promise.allSettled([
            apiExternaPromise,
            supabasePromise
        ]);

        // Processar resultados
        let dadosCombinados: HistoricoVeiculo | null = null;
        const erros: string[] = [];
        const fontes: string[] = [];

        // Se a API externa retornou dados
        if (resultadoAPI.status === 'fulfilled') {
            dadosCombinados = resultadoAPI.value;
            fontes.push('Softcom');
        } else {
            erros.push('Erro na API externa: ' + resultadoAPI.reason);
        }

        // Se o Supabase retornou dados
        if (resultadoSupabase.status === 'fulfilled' && resultadoSupabase.value) {
            if (dadosCombinados) {
                // Combinar dados se ambos retornaram
                dadosCombinados = combinarDados(dadosCombinados, resultadoSupabase.value);
                fontes.push('Alberto');
            } else {
                // Usar apenas dados do Supabase se API externa falhou
                dadosCombinados = resultadoSupabase.value;
                fontes.push('Alberto');
            }
        } else if (resultadoSupabase.status === 'rejected') {
            erros.push('Erro no Supabase: ' + resultadoSupabase.reason);
        }

        if (!dadosCombinados) {
            throw new Error(`Veículo com placa ${placa} não encontrado em nenhuma fonte. ${erros.join('; ')}`);
        }

        // Normalizar e adicionar informações sobre as fontes
        if (dadosCombinados) {
            dadosCombinados = normalizarDados(dadosCombinados);
            dadosCombinados.fontes = fontes;
            // Usar a placa normalizada no retorno
            dadosCombinados.placa = placaNormalizada;
        }
        return dadosCombinados;

    } catch (error) {
        console.error('Erro na requisição:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Não foi possível conectar aos servidores. Verifique sua conexão ou tente novamente mais tarde.');
    }
}

async function buscarNaAPIExterna(placa: string): Promise<HistoricoVeiculo> {
    console.log('Tentando buscar na API externa:', `${API_URL}/historico?placa=${placa}`);
    
    try {
        const response = await fetch(`${API_URL}/historico?placa=${placa}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        console.log('Resposta da API externa:', response.status, response.statusText);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Veículo com placa ${placa} não encontrado na API externa.`);
            }
            throw new Error(`Erro na API externa: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Dados recebidos da API externa:', data);
        
        // Adicionar informação sobre a fonte
        data.fontes = ['Softcom'];
        return data;
    } catch (error) {
        console.error('Erro ao buscar na API externa:', error);
        throw error;
    }
}

async function buscarNoSupabase(placa: string): Promise<HistoricoVeiculo | null> {
    try {
        // Tentar buscar com a placa normalizada (sem espaços)
        let { data: vendas, error: errorVendas } = await supabase
            .from('backup_autos_venda')
            .select('*')
            .eq('Placa', placa.toUpperCase())
            .order('Data_Lancamento', { ascending: false });

        // Se não encontrou, tentar com espaços (formato: XXX 0000)
        if ((!vendas || vendas.length === 0) && placa.length >= 3) {
            const placaComEspaco = placa.slice(0, 3) + ' ' + placa.slice(3);
            
            const { data: vendasComEspaco, error: errorVendasComEspaco } = await supabase
                .from('backup_autos_venda')
                .select('*')
                .eq('Placa', placaComEspaco)
                .order('Data_Lancamento', { ascending: false });
            
            if (vendasComEspaco && vendasComEspaco.length > 0) {
                vendas = vendasComEspaco;
                errorVendas = errorVendasComEspaco;
            }
        }

        // Se ainda não encontrou, tentar buscar com espaços no formato original
        if ((!vendas || vendas.length === 0) && placa.includes(' ')) {
            const placaSemEspaco = placa.replace(/\s/g, '');
            
            const { data: vendasSemEspaco, error: errorVendasSemEspaco } = await supabase
                .from('backup_autos_venda')
                .select('*')
                .eq('Placa', placaSemEspaco)
                .order('Data_Lancamento', { ascending: false });
            
            if (vendasSemEspaco && vendasSemEspaco.length > 0) {
                vendas = vendasSemEspaco;
                errorVendas = errorVendasSemEspaco;
            }
        }

        if (errorVendas) {
            console.error('Erro ao buscar vendas no Supabase:', errorVendas);
            throw new Error('Erro ao buscar histórico do veículo no Supabase');
        }

        if (!vendas || vendas.length === 0) {
            return null; // Retorna null se não encontrou dados
        }

        // Para cada venda, buscar os itens relacionados
        const historicoCompleto = await Promise.all(
            vendas.map(async (venda) => {
                // Buscar itens da venda
                const { data: itens, error: errorItens } = await supabase
                    .from('backup_autos_itens')
                    .select('*')
                    .eq('Código_Documento', venda.Codigo);

                if (errorItens) {
                    console.error('Erro ao buscar itens:', errorItens);
                }

                // Construir data a partir de Dia, Mês e Ano
                let dataVenda;
                if (venda.Dia && venda.Mês && venda.Ano) {
                    // Tentar construir data a partir de Dia, Mês e Ano
                    const dia = venda.Dia.toString().padStart(2, '0');
                    const mes = venda.Mês.toString().padStart(2, '0');
                    const ano = venda.Ano.toString();
                    
                    // Validar se é uma data válida
                    const dataTeste = new Date(`${ano}-${mes}-${dia}`);
                    if (!isNaN(dataTeste.getTime())) {
                        dataVenda = `${ano}-${mes}-${dia}`;
                    } else {
                        dataVenda = venda.Data_Lancamento || new Date().toISOString().split('T')[0];
                    }
                } else if (venda.Data_Lancamento) {
                    dataVenda = venda.Data_Lancamento;
                } else {
                    dataVenda = new Date().toISOString().split('T')[0];
                }

                // Processar itens
                const itensProcessados = (itens || []).map(item => ({
                    codigo: item.Codigo || 0,
                    quantidade: item.Quantidade || 1,
                    valorUnitario: item.Valor || 0,
                    descricao: item.Descrição || 'Item não especificado',
                    observacao: null, // Removido texto específico
                    dataHora: dataVenda,
                    tipoItem: 'servico',
                    codigoMecanico: venda.Mecanico_Codigo || 0
                }));

                return {
                    codigoVenda: venda.Codigo,
                    dataVenda: dataVenda,
                    quilometragem: venda.quilometragem || 0,
                    marca: null, // Não temos marca separada na tabela
                    modelo: venda.Veículo || 'Não informado',
                    anoFabricacao: '', // Não temos ano de fabricação na tabela
                    chassi: null, // Não temos chassi na tabela
                    observacaoGeral: null, // Não temos observação geral na tabela
                    sistema: 'Alberto' as const, // Marcar como sistema Alberto
                    itens: itensProcessados
                };
            })
        );

        // Buscar dados do último proprietário
        const ultimoRegistro = vendas[0];
        const ultimoDono = {
            'Código do Cliente': ultimoRegistro.Cliente_Codigo || 0,
            'Nome do Cliente': ultimoRegistro.Cliente_Nome || 'Não informado',
            'Razão Social': '', // Não temos razão social na tabela
            'Endereço': ultimoRegistro.Cliente_Endereço || 'Não informado',
            'Bairro': ultimoRegistro.Cliente_Bairro || undefined,
            'Cidade': ultimoRegistro.Cliente_Cidade || 'Não informada',
            'UF': '', // Não temos UF na tabela
            'Fone Resid': ultimoRegistro.Cliente_Telefone_Residência || 'Não informado',
            'E-mail': null // Não temos email na tabela
        };

        return {
            placa: placa.toUpperCase(),
            ultimoDono,
            historico: historicoCompleto,
            fontes: ['Alberto']
        };

    } catch (error) {
        console.error('Erro ao buscar no Supabase:', error);
        throw error;
    }
}

function combinarDados(dadosAPI: HistoricoVeiculo, dadosSupabase: HistoricoVeiculo): HistoricoVeiculo {
    // Combinar históricos, evitando duplicatas por data
    const historicoCombinado = [...dadosAPI.historico];
    
    dadosSupabase.historico.forEach(servicoSupabase => {
        // Verificar se já existe um serviço similar na API
        const existe = historicoCombinado.some(servicoAPI => {
            const mesmaData = servicoAPI.dataVenda === servicoSupabase.dataVenda;
            const mesmaQuilometragem = servicoAPI.quilometragem === servicoSupabase.quilometragem;
            const mesmoModelo = servicoAPI.modelo === servicoSupabase.modelo;
            
            // Considerar duplicata se tiver mesma data E (mesma quilometragem OU mesmo modelo)
            return mesmaData && (mesmaQuilometragem || mesmoModelo);
        });
        
        if (!existe) {
            historicoCombinado.push(servicoSupabase);
        }
    });

    // Ordenar por data (mais recente primeiro)
    historicoCombinado.sort((a, b) => {
        const dataA = new Date(a.dataVenda);
        const dataB = new Date(b.dataVenda);
        return dataB.getTime() - dataA.getTime();
    });

    // Usar dados do proprietário da fonte mais recente
    const ultimoDono = dadosAPI.ultimoDono['Nome do Cliente'] !== 'Não informado' 
        ? dadosAPI.ultimoDono 
        : dadosSupabase.ultimoDono;

    return {
        placa: dadosAPI.placa,
        ultimoDono,
        historico: historicoCombinado,
        fontes: ['Softcom', 'Alberto']
    };
}

function normalizarDados(dados: HistoricoVeiculo): HistoricoVeiculo {
    
    // Normalizar cada serviço no histórico
    const historicoNormalizado = dados.historico.map(servico => ({
        codigoVenda: servico.codigoVenda || 0,
        dataVenda: servico.dataVenda || new Date().toISOString().split('T')[0],
        quilometragem: servico.quilometragem || 0,
        marca: servico.marca || null,
        modelo: servico.modelo || 'Não informado',
        anoFabricacao: servico.anoFabricacao || '',
        chassi: servico.chassi || null,
        observacaoGeral: servico.observacaoGeral || null,
        sistema: (servico.sistema as 'Softcom' | 'Alberto') || 'Softcom', // Garantir que sistema sempre existe
        itens: servico.itens.map(item => ({
            codigo: item.codigo || 0,
            quantidade: item.quantidade || 1,
            valorUnitario: item.valorUnitario || 0,
            descricao: item.descricao || 'Item não especificado',
            observacao: item.observacao || null,
            dataHora: item.dataHora || servico.dataVenda,
            tipoItem: item.tipoItem || 'servico',
            codigoMecanico: item.codigoMecanico || 0
        }))
    }));

    return {
        ...dados,
        historico: historicoNormalizado
    };
}

// Função para buscar sugestões de placas na API externa
export async function buscarSugestoesAPI(prefixo: string): Promise<string[]> {
    try {
        const response = await fetch(`${API_URL}/sugestoes?prefixo=${prefixo.toUpperCase()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.placas || [];
        }
        return [];
    } catch (error) {
        console.error('Erro ao buscar sugestões na API:', error);
        return [];
    }
}

// Função para buscar sugestões de placas no Supabase
export async function buscarSugestoesSupabase(prefixo: string): Promise<string[]> {
    try {
        const { data, error } = await supabase
            .from('backup_autos_venda')
            .select('Placa')
            .ilike('Placa', `${prefixo.toUpperCase()}%`)
            .limit(10);

        if (error) {
            console.error('Erro ao buscar sugestões no Supabase:', error);
            return [];
        }

        // Remover duplicatas e retornar placas únicas
        const placasUnicas = [...new Set(data.map(item => item.Placa))];
        return placasUnicas;
    } catch (error) {
        console.error('Erro ao buscar sugestões no Supabase:', error);
        return [];
    }
}