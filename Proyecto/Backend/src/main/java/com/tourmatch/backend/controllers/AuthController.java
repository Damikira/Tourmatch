package com.tourmatch.backend.controllers;

import com.tourmatch.backend.dtos.AuthResponse;
import com.tourmatch.backend.dtos.LoginRequest;
import com.tourmatch.backend.dtos.RegistroRequest;
import com.tourmatch.backend.services.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
// Agregamos CrossOrigin para que React (puerto 5173) pueda conectarse a Spring Boot (8080)
@CrossOrigin(origins = "http://localhost:5173") 
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody RegistroRequest request) {
        try {
            // El servicio se encarga de la lógica y de guardar en PostgreSQL
            AuthResponse response = authService.registrar(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Si el correo ya existe o faltan datos, enviamos el error a React
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Credenciales incorrectas: " + e.getMessage());
        }
    }
}