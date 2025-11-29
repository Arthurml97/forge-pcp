package com.forgepcp.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ItemFichaTecnica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produto_pai_id")
    private Produto produtoPai;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Produto material;

    private Integer quantidade;
}
