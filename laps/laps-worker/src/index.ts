/**
 * Worker para busca de histórico de veículos
 * Combina dados do Supabase (Adalberto) com API externa (Softcom)
 */

interface Env {
	SUPABASE_URL: string;
	SUPABASE_ANON_KEY: string;
	EXTERNAL_API_URL: string;
}

// Tipos do sistema atual (Softcom)
interface ItemServico {
	codigo: number;
	quantidade: number;
	valorUnitario: number;
	descricao: string;
	observacao: string | null;
	dataHora: string;
	tipoItem: string;
	codigoMecanico: number;
}

interface Historico {
	codigoVenda: number;
	dataVenda: string;
	quilometragem: number;
	marca: string | null;
	modelo: string;
	anoFabricacao: string;
	chassi: string | null;
	observacaoGeral: string | null;
	itens: ItemServico[];
	sistema: 'Softcom' | 'Adalberto'; // Identificador do sistema
}

interface UltimoDono {
	'Código do Cliente': number;
	'Nome do Cliente': string;
	'Razão Social': string;
	'Endereço': string;
	'Cidade': string;
	'UF': string;
	'Fone Resid': string;
	'E-mail': string | null;
}

interface HistoricoVeiculo {
	placa: string;
	ultimoDono: UltimoDono;
	historico: Historico[];
}

// Tipos do sistema antigo (Adalberto/Supabase)
interface BackupAutosVenda {
	Codigo: number;
	Cliente_Nome: string;
	Cliente_Endereço: string;
	Cliente_Bairro: string;
	Cliente_Cidade: string;
	Cliente_Telefone_Residência: string;
	Placa: string;
	Veículo: string;
	quilometragem: number;
	Valor: number;
	Dia: number;
	Mês: number;
	Ano: number;
	Aberta: boolean;
	Cliente_Codigo: number;
	Data_Lancamento: string;
	Usuario_Codigo: number;
	Mecanico_Codigo: number;
	NotaFiscal_Codigo: number;
	pago: boolean;
	ValorPago: number;
}

/**
 * Mapeia dados do sistema antigo (Adalberto/Supabase) para o formato atual
 */
function mapearDadosAntigos(dadosSupabase: BackupAutosVenda[]): Partial<HistoricoVeiculo> {
	if (!dadosSupabase.length) {
		return { historico: [] };
	}

	// Pegar dados do último cliente (mais recente)
	const ultimoRegistro = dadosSupabase.reduce((ultimo, atual) => 
		new Date(`${atual.Ano}-${atual.Mês}-${atual.Dia}`) > new Date(`${ultimo.Ano}-${ultimo.Mês}-${ultimo.Dia}`) 
			? atual 
			: ultimo
	);

	const ultimoDono: UltimoDono = {
		'Código do Cliente': ultimoRegistro.Cliente_Codigo,
		'Nome do Cliente': ultimoRegistro.Cliente_Nome,
		'Razão Social': ultimoRegistro.Cliente_Nome, // Assumindo que é igual ao nome
		'Endereço': ultimoRegistro.Cliente_Endereço,
		'Cidade': ultimoRegistro.Cliente_Cidade,
		'UF': ultimoRegistro.Cliente_Bairro, // Pode precisar ajustar
		'Fone Resid': ultimoRegistro.Cliente_Telefone_Residência,
		'E-mail': null // Sistema antigo não tinha email
	};

	const historico: Historico[] = dadosSupabase.map(registro => ({
		codigoVenda: registro.Codigo,
		dataVenda: `${registro.Ano}-${String(registro.Mês).padStart(2, '0')}-${String(registro.Dia).padStart(2, '0')}`,
		quilometragem: registro.quilometragem || 0,
		marca: null, // Sistema antigo não separava marca
		modelo: registro.Veículo || 'Não informado',
		anoFabricacao: String(registro.Ano), // Usando ano da venda como aproximação
		chassi: null,
		observacaoGeral: null,
					sistema: 'Adalberto',
		itens: [
			{
				codigo: registro.Codigo,
				quantidade: 1,
				valorUnitario: registro.Valor || 0,
				descricao: `Serviço realizado - Valor: R$ ${(registro.Valor || 0).toFixed(2)}`,
				observacao: registro.pago ? 'Pago' : 'Pendente',
				dataHora: `${registro.Ano}-${String(registro.Mês).padStart(2, '0')}-${String(registro.Dia).padStart(2, '0')}T00:00:00`,
				tipoItem: 'Serviço',
				codigoMecanico: registro.Mecanico_Codigo || 0
			}
		]
	}));

	return {
		placa: ultimoRegistro.Placa,
		ultimoDono,
		historico
	};
}

/**
 * Busca dados no sistema antigo (Supabase)
 */
async function buscarDadosAntigos(placa: string, env: Env): Promise<Partial<HistoricoVeiculo>> {
	try {
		const response = await fetch(
			`${env.SUPABASE_URL}/rest/v1/backup_autos_venda?Placa=eq.${placa}`,
			{
				headers: {
					'apikey': env.SUPABASE_ANON_KEY,
					'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
					'Content-Type': 'application/json'
				}
			}
		);

		if (!response.ok) {
			console.error('Erro ao buscar dados antigos:', response.status, response.statusText);
			return { historico: [] };
		}

		const dados: BackupAutosVenda[] = await response.json();
		return mapearDadosAntigos(dados);
	} catch (error) {
		console.error('Erro na busca Supabase:', error);
		return { historico: [] };
	}
}

/**
 * Busca dados no sistema novo (Softcom/API externa)
 */
async function buscarDadosNovos(placa: string, env: Env): Promise<Partial<HistoricoVeiculo>> {
	try {
		const response = await fetch(`${env.EXTERNAL_API_URL}/historico?placa=${placa}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			console.error('Erro ao buscar dados novos:', response.status, response.statusText);
			return { historico: [] };
		}

		const dados: HistoricoVeiculo = await response.json();
		
		// Marcar dados como do sistema Softcom
		const historicoComSistema = dados.historico.map(item => ({
			...item,
			sistema: 'Softcom' as const
		}));

		return {
			...dados,
			historico: historicoComSistema
		};
	} catch (error) {
		console.error('Erro na busca API externa:', error);
		return { historico: [] };
	}
}

/**
 * Combina dados dos dois sistemas em ordem cronológica
 */
function combinarHistoricos(dadosAntigos: Partial<HistoricoVeiculo>, dadosNovos: Partial<HistoricoVeiculo>): HistoricoVeiculo {
			// Usar dados do sistema Softcom como base, ou criar estrutura mínima
	const resultado: HistoricoVeiculo = {
		placa: dadosNovos.placa || dadosAntigos.placa || '',
		ultimoDono: dadosNovos.ultimoDono || dadosAntigos.ultimoDono || {
			'Código do Cliente': 0,
			'Nome do Cliente': 'Não informado',
			'Razão Social': 'Não informado',
			'Endereço': 'Não informado',
			'Cidade': 'Não informado',
			'UF': 'Não informado',
			'Fone Resid': 'Não informado',
			'E-mail': null
		},
		historico: []
	};

	// Combinar históricos e ordenar cronologicamente (mais recente primeiro)
	const historicoCompleto = [
		...(dadosAntigos.historico || []),
		...(dadosNovos.historico || [])
	].sort((a, b) => new Date(b.dataVenda).getTime() - new Date(a.dataVenda).getTime());

	resultado.historico = historicoCompleto;

	return resultado;
}

/**
 * Endpoint principal para busca de histórico
 */
async function handleHistoricoRequest(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const placa = url.searchParams.get('placa');

	if (!placa) {
		return new Response(
			JSON.stringify({ error: 'Parâmetro "placa" é obrigatório' }),
			{ 
				status: 400, 
				headers: { 
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				} 
			}
		);
	}

	try {
		// Busca paralela nos dois sistemas
		const [dadosAntigos, dadosNovos] = await Promise.all([
			buscarDadosAntigos(placa, env),
			buscarDadosNovos(placa, env)
		]);

		// Combinar os resultados
		const resultado = combinarHistoricos(dadosAntigos, dadosNovos);

		return new Response(JSON.stringify(resultado), {
			headers: { 
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			}
		});
	} catch (error) {
		console.error('Erro geral na busca:', error);
		return new Response(
			JSON.stringify({ error: 'Erro interno do servidor' }),
			{ 
				status: 500, 
				headers: { 
					'Content-Type': 'application/json',
					'Access-Control-Allow-Origin': '*'
				} 
			}
		);
	}
}

/**
 * Handler principal do Worker
 */
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		switch (url.pathname) {
			case '/historico':
				return handleHistoricoRequest(request, env);
			case '/health':
				return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
					headers: { 'Content-Type': 'application/json' }
				});
			default:
				return new Response('Not Found', { status: 404 });
		}
	},
} satisfies ExportedHandler<Env>;