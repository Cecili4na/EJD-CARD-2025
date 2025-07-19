// src/services/api.ts
import { HistoricoVeiculo } from '../types/veiculo';

// URL do Worker (será substituída pela URL de produção após deploy)
const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

export async function buscarHistoricoVeiculo(placa: string): Promise<HistoricoVeiculo> {
    try {
        const response = await fetch(`${WORKER_URL}/historico?placa=${placa}`, {
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