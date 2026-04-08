package com.smartcampus.service;

import com.smartcampus.dto.AuthResponse;
import com.smartcampus.dto.GoogleTokenRequest;
import com.smartcampus.dto.LoginRequest;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse authenticate(LoginRequest loginRequest) {
        try {
            // Validate credentials
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Check user status
            Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                if (user.getStatus() == User.Status.PENDING) {
                    return new AuthResponse("Waiting for admin approval. Please contact your administrator.");
                }
                
                if (user.getActive()) {
                    String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
                    return new AuthResponse(jwt, user);
                } else {
                    return new AuthResponse("Account is inactive. Please contact your administrator.");
                }
            } else {
                return new AuthResponse("User not found");
            }
        } catch (BadCredentialsException e) {
            return new AuthResponse("Invalid email or password");
        } catch (Exception e) {
            return new AuthResponse("Authentication failed: " + e.getMessage());
        }
    }

    public AuthResponse authenticateWithGoogle(GoogleTokenRequest tokenRequest) {
        try {
            // For now, we'll simulate Google token verification
            // In a real implementation, you would call Google's API to verify the token
            
            Optional<User> userOpt = userRepository.findByEmail("google.user@example.com"); // Simulated email from Google
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                if (user.getStatus() == User.Status.PENDING) {
                    return new AuthResponse("Waiting for admin approval. Please contact your administrator.");
                }
                
                // Update user with Google ID and set status to ACTIVE if new user
                if (user.getGoogleId() == null) {
                    user.setGoogleId(tokenRequest.getToken());
                    user.setStatus(User.Status.ACTIVE);
                    user.setRole(User.Role.STUDENT); // Default role for Google users
                    userRepository.save(user);
                }
                
                String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
                return new AuthResponse(jwt, user);
            } else {
                // Create new user from Google
                User newUser = new User();
                newUser.setFullName("Google User");
                newUser.setEmail("google.user@example.com"); // Simulated email
                newUser.setGoogleId(tokenRequest.getToken());
                newUser.setRole(User.Role.STUDENT);
                newUser.setStatus(User.Status.PENDING);
                newUser.setActive(true);
                
                userRepository.save(newUser);
                return new AuthResponse("Registration successful. Waiting for admin approval.");
            }
        } catch (Exception e) {
            return new AuthResponse("Google authentication failed: " + e.getMessage());
        }
    }
}
