// src/services/api.ts
import { HistoricoVeiculo } from '../types/veiculo';
import { supabase } from './supabase';

const API_URL = 'https://pp.campinagrande.br';

export async function buscarHistoricoVeiculo(placa: string): Promise<HistoricoVeiculo> {
    try {
        // Buscar dados da API externa
        const apiExternaPromise = buscarNaAPIExterna(placa);
        
        // Buscar dados do Supabase
        const supabasePromise = buscarNoSupabase(placa);
        
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
            fontes.push('API Externa');
            console.log('Dados da API Externa:', {
                placa: resultadoAPI.value.placa,
                quantidadeServicos: resultadoAPI.value.historico.length,
                estruturaServico: resultadoAPI.value.historico[0] ? {
                    codigoVenda: resultadoAPI.value.historico[0].codigoVenda,
                    dataVenda: resultadoAPI.value.historico[0].dataVenda,
                    quantidadeItens: resultadoAPI.value.historico[0].itens.length
                } : 'Nenhum serviço'
            });
        } else {
            erros.push('Erro na API externa: ' + resultadoAPI.reason);
        }

        // Se o Supabase retornou dados
        if (resultadoSupabase.status === 'fulfilled' && resultadoSupabase.value) {
            console.log('Dados do Supabase:', {
                placa: resultadoSupabase.value.placa,
                quantidadeServicos: resultadoSupabase.value.historico.length,
                estruturaServico: resultadoSupabase.value.historico[0] ? {
                    codigoVenda: resultadoSupabase.value.historico[0].codigoVenda,
                    dataVenda: resultadoSupabase.value.historico[0].dataVenda,
                    quantidadeItens: resultadoSupabase.value.historico[0].itens.length
                } : 'Nenhum serviço'
            });
            
            if (dadosCombinados) {
                // Combinar dados se ambos retornaram
                dadosCombinados = combinarDados(dadosCombinados, resultadoSupabase.value);
                fontes.push('Supabase');
            } else {
                // Usar apenas dados do Supabase se API externa falhou
                dadosCombinados = resultadoSupabase.value;
                fontes.push('Supabase');
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
    const response = await fetch(`${API_URL}/historico?placa=${placa}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Veículo com placa ${placa} não encontrado na API externa.`);
        }
        throw new Error(`Erro na API externa: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Adicionar informação sobre a fonte
    data.fontes = ['API Externa'];
    return data;
}

async function buscarNoSupabase(placa: string): Promise<HistoricoVeiculo | null> {
    try {
        // Primeiro, buscar as vendas da placa
        const { data: vendas, error: errorVendas } = await supabase
            .from('backup_autos_venda')
            .select('*')
            .eq('Placa', placa.toUpperCase())
            .order('Data_Lancamento', { ascending: false });

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
                console.log('Dados de data da venda:', {
                    Dia: venda.Dia,
                    Mês: venda.Mês,
                    Ano: venda.Ano,
                    Data_Lancamento: venda.Data_Lancamento
                });

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
                        console.warn('Data inválida construída:', `${ano}-${mes}-${dia}`);
                        dataVenda = venda.Data_Lancamento || new Date().toISOString().split('T')[0];
                    }
                } else if (venda.Data_Lancamento) {
                    // Usar Data_Lancamento se disponível
                    dataVenda = venda.Data_Lancamento;
                } else {
                    // Fallback para data atual
                    dataVenda = new Date().toISOString().split('T')[0];
                }

                console.log('Data final da venda:', dataVenda);

                // Processar itens da venda
                const itensProcessados = itens && itens.length > 0 
                    ? itens.map(item => ({
                        codigo: item.Codigo,
                        quantidade: item.Quantidade || 1,
                        valorUnitario: item.Valor || 0,
                        descricao: item.Descrição || 'Item não especificado',
                        observacao: null,
                        dataHora: dataVenda || new Date().toISOString().split('T')[0],
                        tipoItem: 'servico',
                        codigoMecanico: venda.Mecanico_Codigo || 0
                    }))
                    : [{
                        codigo: venda.Codigo,
                        quantidade: 1,
                        valorUnitario: venda.Valor || 0,
                        descricao: `Serviço - ${venda.Veículo || 'Veículo'}`,
                        observacao: `Valor: R$ ${venda.Valor || 0} | Pago: ${venda.pago ? 'Sim' : 'Não'} | Valor Pago: R$ ${venda.ValorPago || 0}`,
                        dataHora: dataVenda || new Date().toISOString().split('T')[0],
                        tipoItem: 'servico',
                        codigoMecanico: venda.Mecanico_Codigo || 0
                    }];

                return {
                    codigoVenda: venda.Codigo,
                    dataVenda: dataVenda,
                    quilometragem: venda.quilometragem || 0,
                    marca: null, // Não temos marca separada na tabela
                    modelo: venda.Veículo || 'Não informado',
                    anoFabricacao: '', // Não temos ano de fabricação na tabela
                    chassi: null, // Não temos chassi na tabela
                    observacaoGeral: null, // Não temos observação geral na tabela
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
            fontes: ['Supabase']
        };

    } catch (error) {
        console.error('Erro ao buscar no Supabase:', error);
        throw error;
    }
}

function combinarDados(dadosAPI: HistoricoVeiculo, dadosSupabase: HistoricoVeiculo): HistoricoVeiculo {
    console.log('Combinando dados de API e Supabase:');
    console.log('API - Quantidade de serviços:', dadosAPI.historico.length);
    console.log('Supabase - Quantidade de serviços:', dadosSupabase.historico.length);
    
    // Combinar históricos, evitando duplicatas por data
    const historicoCombinado = [...dadosAPI.historico];
    
    dadosSupabase.historico.forEach(servicoSupabase => {
        console.log('Verificando serviço Supabase:', {
            dataVenda: servicoSupabase.dataVenda,
            quilometragem: servicoSupabase.quilometragem,
            modelo: servicoSupabase.modelo
        });
        
        // Verificar se já existe um serviço similar na API
        const existe = historicoCombinado.some(servicoAPI => {
            const mesmaData = servicoAPI.dataVenda === servicoSupabase.dataVenda;
            const mesmaQuilometragem = servicoAPI.quilometragem === servicoSupabase.quilometragem;
            const mesmoModelo = servicoAPI.modelo === servicoSupabase.modelo;
            
            console.log('Comparando com serviço API:', {
                dataVenda: servicoAPI.dataVenda,
                quilometragem: servicoAPI.quilometragem,
                modelo: servicoAPI.modelo,
                mesmaData,
                mesmaQuilometragem,
                mesmoModelo
            });
            
            // Considerar duplicata se tiver mesma data E (mesma quilometragem OU mesmo modelo)
            return mesmaData && (mesmaQuilometragem || mesmoModelo);
        });
        
        if (!existe) {
            console.log('Adicionando serviço do Supabase (não é duplicata)');
            historicoCombinado.push(servicoSupabase);
        } else {
            console.log('Serviço do Supabase já existe na API (duplicata)');
        }
    });

    // Ordenar por data (mais recente primeiro)
    historicoCombinado.sort((a, b) => {
        const dataA = new Date(a.dataVenda);
        const dataB = new Date(b.dataVenda);
        return dataB.getTime() - dataA.getTime();
    });

    console.log('Total de serviços após combinação:', historicoCombinado.length);

    // Usar dados do proprietário da fonte mais recente
    const ultimoDono = dadosAPI.ultimoDono['Nome do Cliente'] !== 'Não informado' 
        ? dadosAPI.ultimoDono 
        : dadosSupabase.ultimoDono;

    return {
        placa: dadosAPI.placa,
        ultimoDono,
        historico: historicoCombinado,
        fontes: ['API Externa', 'Supabase']
    };
}

function normalizarDados(dados: HistoricoVeiculo): HistoricoVeiculo {
    console.log('Normalizando dados para garantir estrutura consistente');
    
    // Normalizar cada serviço no histórico
    const historicoNormalizado = dados.historico.map(servico => ({
        ...servico,
        // Garantir que todos os campos obrigatórios existam
        codigoVenda: servico.codigoVenda || 0,
        dataVenda: servico.dataVenda || new Date().toISOString().split('T')[0],
        quilometragem: servico.quilometragem || 0,
        marca: servico.marca || null,
        modelo: servico.modelo || 'Não informado',
        anoFabricacao: servico.anoFabricacao || '',
        chassi: servico.chassi || null,
        observacaoGeral: servico.observacaoGeral || null,
        itens: servico.itens.map(item => ({
            ...item,
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