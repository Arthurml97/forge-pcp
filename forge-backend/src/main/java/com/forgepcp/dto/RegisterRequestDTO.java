package com.forgepcp.dto;

import com.forgepcp.model.UserRole;

public record RegisterRequestDTO(String login, String password, UserRole role) {

}
