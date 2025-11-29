package com.forgepcp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Data
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String descricao;

    @Column(precision = 10, scale = 2)
    private BigDecimal custo;

    private Integer saldoEstoque = 0;

    @Enumerated(EnumType.STRING)
    private TipoProduto tipo;

    public Produto() {
    }
}
