import { useState } from 'react';
import { buscarHistoricoVeiculo } from '../services/api';
import { HistoricoVeiculo } from '../types/veiculo';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

function ConsultaServicos() {
    const [placa, setPlaca] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dados, setDados] = useState<HistoricoVeiculo | null>(null);
    const [filtro, setFiltro] = useState('');
    const [mostrarUltimoDono, setMostrarUltimoDono] = useState(false);
    const navigate = useNavigate();

    const handleBuscar = async () => {
        if (!placa) {
            setError('Por favor, informe a placa do veículo');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const resultado = await buscarHistoricoVeiculo(placa);
            setDados(resultado);
        } catch (err) {
            setError('Erro ao buscar histórico do veículo');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Cabeçalho */}
            <header className="bg-blue-900 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-4 border-blue-800 shadow mr-4 flex items-center justify-center">
                                <img src="/logo.png" alt="Luciano Auto Peças" className="w-20 h-20 object-cover object-center" style={{ transform: 'scale(1.06)' }} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-white">Sistema de Consultas</h1>
                                <p className="text-blue-200 font-medium">Luciano Auto Peças</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold shadow transition-colors duration-200"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>
            {/* Conteúdo principal */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white/90 rounded-3xl shadow-2xl p-8 border border-blue-100">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-extrabold text-blue-900 mb-2">Consulta de Veículos</h2>
                            <p className="text-blue-700">Consulte o histórico de serviços pelo número da placa.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="text"
                                value={placa}
                                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                                placeholder="Digite a placa do veículo"
                                className="w-56 px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-blue-50 text-blue-900 placeholder-blue-400 font-semibold"
                            />
                            <button
                                onClick={handleBuscar}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:bg-blue-300 disabled:cursor-not-allowed font-bold shadow transition-colors duration-200 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Buscando...
                                    </>
                                ) : (
                                    'Buscar'
                                )}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}
                    {dados && (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="font-semibold text-blue-900" htmlFor="filtro">Buscar peça ou serviço:</label>
                                    <input
                                        id="filtro"
                                        type="text"
                                        value={filtro}
                                        onChange={e => setFiltro(e.target.value)}
                                        placeholder="Ex: óleo, filtro, pneu..."
                                        className="w-64 px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-blue-50 text-blue-900 placeholder-blue-400 font-semibold"
                                    />
                                </div>
                                <button
                                    onClick={() => setMostrarUltimoDono(!mostrarUltimoDono)}
                                    className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 font-bold shadow transition-colors duration-200 flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    {mostrarUltimoDono ? 'Ocultar Informações do Último Dono' : 'Ver Informações do Último Dono'}
                                </button>
                            </div>
                            {mostrarUltimoDono && (
                                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow">
                                    <h3 className="text-xl font-bold text-blue-900 mb-4">Último Dono</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                            <p className="text-blue-700">Nome</p>
                                            <p className="text-lg font-bold text-blue-900">{dados.ultimoDono['Nome do Cliente']}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                            <p className="text-blue-700">Telefone</p>
                                            <p className="text-lg font-bold text-blue-900">{dados.ultimoDono['Fone Resid']}</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 col-span-2">
                                            <p className="text-blue-700">Endereço</p>
                                            <p className="text-lg font-bold text-blue-900">{dados.ultimoDono.Endereço}, {dados.ultimoDono.Cidade} - {dados.ultimoDono.UF}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 shadow">
                                <h3 className="text-xl font-bold text-blue-900 mb-4">Histórico de Serviços</h3>
                                <div className="space-y-6">
                                    {dados.historico.map((servico, index) => {
                                        // Filtrar itens do serviço pelo termo digitado
                                        const itensFiltrados = filtro.trim()
                                            ? servico.itens.filter(item =>
                                                item.descricao.toLowerCase().includes(filtro.toLowerCase())
                                            )
                                            : servico.itens;
                                        // Se não houver itens após o filtro, não exibe o serviço
                                        if (itensFiltrados.length === 0) return null;
                                        return (
                                            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-blue-100">
                                                <div className="grid grid-cols-3 gap-4 mb-6">
                                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                        <p className="text-blue-700">Data</p>
                                                        <p className="text-lg font-bold text-blue-900">{new Date(servico.dataVenda).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                        <p className="text-blue-700">Quilometragem</p>
                                                        <p className="text-lg font-bold text-blue-900">{servico.quilometragem} km</p>
                                                    </div>
                                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                        <p className="text-blue-700">Modelo</p>
                                                        <p className="text-lg font-bold text-blue-900">{servico.modelo}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-blue-900 mb-4">Itens do Serviço</h4>
                                                    <div className="space-y-3">
                                                        {itensFiltrados.map((item, itemIndex) => (
                                                            <div key={itemIndex} className="bg-blue-50 rounded-lg p-4 flex justify-between items-center border border-blue-100">
                                                                <div>
                                                                    <p className="font-semibold text-blue-900">{item.descricao}</p>
                                                                    {item.observacao && (
                                                                        <p className="text-blue-600 text-sm mt-1">{item.observacao}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
export default ConsultaServicos; 