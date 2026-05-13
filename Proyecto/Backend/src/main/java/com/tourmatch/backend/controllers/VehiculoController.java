package com.tourmatch.backend.controllers;

import com.tourmatch.backend.dtos.VehiculoRequest;
import com.tourmatch.backend.models.Vehiculo;
import com.tourmatch.backend.services.VehiculoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {

    @Autowired
    private VehiculoService vehiculoService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarVehiculo(@RequestBody VehiculoRequest request, Principal principal) {
        try {
            Vehiculo nuevoVehiculo = vehiculoService.registrarVehiculo(request, principal.getName());
            return ResponseEntity.ok(nuevoVehiculo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}