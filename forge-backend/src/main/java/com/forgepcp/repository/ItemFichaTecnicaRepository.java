package com.forgepcp.repository;

import com.forgepcp.model.ItemFichaTecnica;
import com.forgepcp.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemFichaTecnicaRepository extends JpaRepository<ItemFichaTecnica, Long> {

    List<ItemFichaTecnica> findByProdutoPaiId(Long produtoPaiId);

    Optional<ItemFichaTecnica> findByProdutoPaiAndMaterial(Produto produtoPai, Produto material);

    void deleteByProdutoPaiId(Long produtoPaiId);

    void deleteByMaterialId(Long materialId);
}
