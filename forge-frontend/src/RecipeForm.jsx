import { useState } from 'react';
import { toast } from 'react-toastify'
import api from './services/api';

// Recebe "produtosDisponiveis" como propriedade do Pai
function RecipeForm({ produtosDisponiveis, aoAtualizar }) {
    const [produtoPai, setProdutoPai] = useState('');
    const [material, setMaterial] = useState('');
    const [quantidade, setQuantidade] = useState(1);

    async function handleSalvarReceita(e) {
        e.preventDefault();
        if (!produtoPai || !material) return toast.error("Selecione os produtos!");
        if (produtoPai === material) return toast.error("Um produto não pode ser feito dele mesmo!");

        try {
            await api.post(`/produtos/${produtoPai}/ficha-tecnica`, {
                idMaterial: parseInt(material),
                quantidade: parseInt(quantidade)
            });
            toast.success(`Receita definida com sucesso!`);
            setQuantidade(1);
            if (aoAtualizar) aoAtualizar();
        } catch (erro) {
            toast.error('Erro: ' + (erro.response?.data?.message || erro.message));
        }
    }

    // Filtros visuais usando a lista que veio do Pai
    const acabados = produtosDisponiveis.filter(p => p.tipo === 'PRODUTO_FINALIZADO');
    const insumos = produtosDisponiveis.filter(p => p.tipo === 'MATERIA_PRIMA');

    return (
        <div style={{ height: '100%', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h3 style={{ color: '#d35400', marginTop: 0 }}>Confecção</h3>
            <form onSubmit={handleSalvarReceita} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Produto Final:</label>
                    <select value={produtoPai} onChange={e => setProdutoPai(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                        <option value="">Selecione...</option>
                        {acabados.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Insumo:</label>
                    <select value={material} onChange={e => setMaterial(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                        <option value="">Selecione...</option>
                        {insumos.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Quantidade Necessária:</label>
                    <input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" style={{ padding: '10px', backgroundColor: '#d35400', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Vincular Receita 🔗
                </button>
            </form>
        </div>
    );
}

export default RecipeForm;