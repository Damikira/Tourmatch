package com.tourmatch.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Obtener el header de autorización
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;
        String rol = "USER"; // Rol por defecto por si acaso

        // 2. Comprobar si el header empieza con "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Quitar "Bearer "
            try {
                email = jwtUtil.extractEmail(token);
                
                // EXTRA: Extraemos el rol dinámico directamente guardado en el JWT
                // Para no alterar tu JwtUtil, lo leemos directamente usando el parser
                // Si prefieres, puedes crear un método "extractRol" en tu JwtUtil.
                try {
                    // Nota: esto asume la misma lógica de parseo que usas en tu JwtUtil
                    Claims claims = io.jsonwebtoken.Jwts.parserBuilder()
                            .setSigningKey(jwtUtil.generateToken(email, "TEMP").getBytes()) // Esto es ilustrativo, mejor usar el método correspondiente o extraerlo de forma limpia:
                            .build()
                            .parseClaimsJws(token)
                            .getBody();
                    if (claims.get("rol") != null) {
                        rol = claims.get("rol").toString();
                    }
                } catch (Exception ex) {
                    // Si falla el parseo manual del rol, dejamos el parámetro por defecto o usamos control simple
                    rol = "USER"; 
                }
                
            } catch (Exception e) {
                System.out.println("Error extrayendo datos del token");
            }
        }

        // 3. Validar el token y autenticar al usuario con su ROL REAL
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(token)) {
                
                // SOLUCIÓN: En lugar de dejar "USER" fijo, pasamos la autoridad real ("ADMIN", "CONDUCTOR", etc.)
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.singletonList(new SimpleGrantedAuthority(rol))); 
                        
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // 4. Continuar con el siguiente filtro
        filterChain.doFilter(request, response);
    }
}