package com.stockflow.modules.user.service;

import com.stockflow.modules.user.dto.UserDto;
import com.stockflow.modules.user.entity.Role;
import com.stockflow.modules.user.entity.User;
import com.stockflow.modules.user.repository.UserRepository;
import com.stockflow.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateUserStatus(Long id, boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        user.setIsActive(isActive);
        return UserDto.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserDto updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        user.setRole(role);
        return UserDto.fromEntity(userRepository.save(user));
    }
}
