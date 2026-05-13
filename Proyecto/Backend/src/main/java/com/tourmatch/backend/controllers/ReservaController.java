package com.tourmatch.backend.controllers;

import com.tourmatch.backend.models.Reserva;
import com.tourmatch.backend.services.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal; // IMPORTANTE: Para leer el Token
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @PostMapping("/crear")
    public ResponseEntity<?> crearReserva(@RequestBody Reserva reserva) {
        try {
            Reserva nuevaReserva = reservaService.crearReserva(reserva);
            return ResponseEntity.ok(nuevaReserva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/disponibles")
    public ResponseEntity<?> verViajesDisponibles(@RequestParam int capacidad) {
        try {
            List<Reserva> viajes = reservaService.obtenerViajesDisponibles(capacidad);
            return ResponseEntity.ok(viajes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // NUEVO ENDPOINT: El conductor acepta el viaje
    @PutMapping("/{id}/aceptar")
    public ResponseEntity<?> aceptarReserva(@PathVariable Long id, Principal principal) {
        try {
            // principal.getName() extrae automáticamente el correo del Token JWT
            Reserva reservaActualizada = reservaService.aceptarReserva(id, principal.getName());
            return ResponseEntity.ok(reservaActualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}