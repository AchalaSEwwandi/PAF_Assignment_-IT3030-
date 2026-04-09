package com.smartcampus.controller;

import com.smartcampus.dto.AuthResponse;
import com.smartcampus.dto.GoogleTokenRequest;
import com.smartcampus.dto.LoginRequest;
import com.smartcampus.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = authService.authenticate(loginRequest);
<<<<<<< HEAD

            if (response.getToken() != null) {
=======
            
            if (response.getJwt() != null) {
>>>>>>> 2dbbab9d29ee86b9aea5ad189df4948350af6b40
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse("Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleTokenRequest tokenRequest) {
        try {
            AuthResponse response = authService.authenticateWithGoogle(tokenRequest);
<<<<<<< HEAD

            if (response.getToken() != null) {
=======
            
            if (response.getJwt() != null) {
>>>>>>> 2dbbab9d29ee86b9aea5ad189df4948350af6b40
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse("Google login failed: " + e.getMessage()));
        }
    }
<<<<<<< HEAD

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody com.smartcampus.dto.RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            if ("Registration successful".equals(response.getMessage())) {
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthResponse("Registration failed: " + e.getMessage()));
        }
    }
=======
>>>>>>> 2dbbab9d29ee86b9aea5ad189df4948350af6b40
}