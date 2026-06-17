package com.tourmatch.backend.controllers;

import com.tourmatch.backend.models.Reserva;
import com.tourmatch.backend.dtos.ReservaDTO; 
import com.tourmatch.backend.services.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class ReservaController {

    @Autowired
    private ReservaService reservaService;

    @PostMapping("/crear")
    public ResponseEntity<?> crearReserva(@RequestBody Reserva reserva, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body("No autorizado.");
            }
            Reserva nuevaReserva = reservaService.crearReservaConUsuario(reserva, principal.getName());
            return ResponseEntity.ok(nuevaReserva);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/mis-reservas")
    public ResponseEntity<?> obtenerMisReservas(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body("No autorizado.");
            }
            List<Reserva> misViajes = reservaService.obtenerReservasPorUsuario(principal.getName());
            return ResponseEntity.ok(misViajes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/disponibles")
    public ResponseEntity<?> verViajesDisponibles(@RequestParam int capacity) {
        try {
            List<ReservaDTO> viajes = reservaService.obtenerViajesDisponibles(capacity);
            return ResponseEntity.ok(viajes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/aceptar")
    public ResponseEntity<?> aceptarReserva(@PathVariable Long id, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body("No autorizado.");
            }
            Reserva reservaActualizada = reservaService.aceptarReserva(id, principal.getName());
            return ResponseEntity.ok(reservaActualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/mis-viajes-activos")
    public ResponseEntity<?> obtenerMisViajesActivos(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body("No autorizado.");
            }
            List<ReservaDTO> activos = reservaService.obtenerViajesAceptadosPorConductor(principal.getName());
            return ResponseEntity.ok(activos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<?> finalizarViaje(@PathVariable Long id, Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(401).body("No autorizado.");
            }
            Reserva reservaFinalizada = reservaService.finalizarReserva(id, principal.getName());
            return ResponseEntity.ok(reservaFinalizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}