// src/services/api.ts
import { HistoricoVeiculo } from '../types/veiculo';

const API_URL = 'https://pp.campinagrande.br';

export async function buscarHistoricoVeiculo(placa: string): Promise<HistoricoVeiculo> {
    try {
        const response = await fetch(`${API_URL}/historico?placa=${placa}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar histórico: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente mais tarde.');
    }
}