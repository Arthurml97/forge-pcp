package com.forgepcp.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpeanAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Forge PCP API")
                        .version("1.0")
                        .description("API de Planejamento e Controle de Produção para uso Industrial.")
                        .contact(new Contact()
                                .name("Arthur")
                                .email("arthurml97@gmail.com")));
    }
}
