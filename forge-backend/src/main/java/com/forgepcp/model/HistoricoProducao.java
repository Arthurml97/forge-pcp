package com.forgepcp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class HistoricoProducao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produto_id")
    private Produto produto; // Função para notar qual produto foi produzido

    private Integer quantidade;

    private LocalDateTime dataProducao; // Função que marca a data do momento que foi produzido
}
