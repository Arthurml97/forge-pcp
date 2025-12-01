import { useState } from 'react';
import { toast } from 'react-toastify';
import api from './services/api';

function ProductForm({ aoSalvar }) {
    const [nome, setNome] = useState('');
    const [tipo, setTipo] = useState('MATERIA_PRIMA');
    const [custo, setCusto] = useState(''); // Apenas para Matéria Prima

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            // LÓGICA DE PCP:
            // 1. Matéria Prima: Custo é manual (compra).
            // 2. Produto Final: Custo é 0 (calculado depois).

            const custoFinal = tipo === 'MATERIA_PRIMA' ? parseFloat(custo) : 0;

            await api.post('/produtos', {
                nome,
                tipo,
                custo: custoFinal,
                preco: 0,
                saldoEstoque: 0
            });

            toast.success('Item cadastrado na Engenharia!');

            setNome('');
            setCusto('');
            if (aoSalvar) aoSalvar();

        } catch (erro) {
            toast.error('Erro: ' + (erro.response?.data?.message || erro.message));
        }
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#fff' }}>
            <h3 style={{ marginTop: 0, color: '#0056b3' }}>Cadastro de Item</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 2 }}>
                    <label style={{ fontSize: '14px' }}>Descrição do Item:</label>
                    <input required value={nome} onChange={e => setNome(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="Ex: Parafuso M4 ou Mesa de Jantar" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <label style={{ fontSize: '14px' }}>Classificação:</label>
                    <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <option value="MATERIA_PRIMA">Insumo (Compra)</option>
                        <option value="PRODUTO_FINALIZADO">Produto Acabado (Venda)</option>
                    </select>
                </div>

                {tipo === 'MATERIA_PRIMA' && (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <label style={{ fontSize: '14px' }}>Custo Aquisição (R$):</label>
                        <input type="number" step="0.01" required value={custo} onChange={e => setCusto(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="0.00" />
                    </div>
                )}

                <button type="submit" style={{ padding: '8px 20px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '35px', fontWeight: 'bold' }}>
                    Cadastrar
                </button>
            </form>
        </div>
    );
}

export default ProductForm;