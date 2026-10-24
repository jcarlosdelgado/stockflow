package com.stockflow.modules.user.controller;

import com.stockflow.modules.user.dto.UserDto;
import com.stockflow.modules.user.entity.Role;
import com.stockflow.modules.user.service.UserService;
import com.stockflow.shared.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Endpoints de administración de usuarios (Requiere rol ROLE_ADMIN)")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Listar todos los usuarios", description = "Obtiene la lista completa de usuarios del sistema")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID", description = "Obtiene los detalles de un usuario específico")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Activar o desactivar cuenta de usuario", description = "Modifica el estado activo/inactivo de un usuario")
    public ResponseEntity<ApiResponse<UserDto>> toggleStatus(@PathVariable Long id, @RequestParam boolean active) {
        return ResponseEntity.ok(ApiResponse.ok("Estado de usuario actualizado", userService.updateUserStatus(id, active)));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Cambiar rol de usuario", description = "Actualiza los permisos y el rol de un usuario")
    public ResponseEntity<ApiResponse<UserDto>> updateRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(ApiResponse.ok("Rol de usuario actualizado", userService.updateUserRole(id, role)));
    }
}
