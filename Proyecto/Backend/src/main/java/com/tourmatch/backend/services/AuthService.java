package com.tourmatch.backend.services;

import com.tourmatch.backend.dtos.AuthResponse;
import com.tourmatch.backend.dtos.LoginRequest;
import com.tourmatch.backend.dtos.RegistroRequest;
import com.tourmatch.backend.models.Usuario;
import com.tourmatch.backend.repositories.UsuarioRepository;
import com.tourmatch.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Lógica para registrar un usuario nuevo
    public AuthResponse registrar(RegistroRequest request) {
        // 1. Verificar si el correo ya existe
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // 2. Crear el usuario y guardar los datos
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(request.getNombre());
        nuevoUsuario.setEmail(request.getEmail());
        // ¡Súper importante! Encriptamos la contraseña antes de guardarla
        nuevoUsuario.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Convertimos el texto del JSON al Enum de Java
        nuevoUsuario.setRol(Usuario.TipoRol.valueOf(request.getRol().toUpperCase()));

        // 3. Guardar en PostgreSQL
        usuarioRepository.save(nuevoUsuario);

        // 4. Generar el Token VIP para que ya quede logueado
        String token = jwtUtil.generateToken(nuevoUsuario.getEmail(), nuevoUsuario.getRol().name());
        return new AuthResponse(token, "Usuario registrado con éxito");
    }

    // Lógica para iniciar sesión
    public AuthResponse login(LoginRequest request) {
        // 1. Buscar al usuario
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(request.getEmail());
        
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();

        // 2. Comparar la contraseña enviada con la encriptada en la BD
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        // 3. Si todo está bien, generamos un nuevo token
        String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRol().name());
        return new AuthResponse(token, "Login exitoso");
    }
}