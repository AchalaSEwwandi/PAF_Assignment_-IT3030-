package com.smartcampus.service;

import com.smartcampus.dto.AuthResponse;
import com.smartcampus.dto.GoogleTokenRequest;
import com.smartcampus.dto.LoginRequest;
<<<<<<< HEAD
import com.smartcampus.dto.RegisterRequest;
=======
>>>>>>> 2dbbab9d29ee86b9aea5ad189df4948350af6b40
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
<<<<<<< HEAD
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
=======
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Optional;
>>>>>>> 2dbbab9d29ee86b9aea5ad189df4948350af6b40

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

<<<<<<< HEAD
    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse authenticate(LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();

                if (user.getStatus() == User.Status.PENDING) {
                    return new AuthResponse("Waiting for admin approval. Please contact your administrator.");
                }

=======
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
                
>>>>>>> 2dbbab9d29ee86b9aea5ad189df4948350af6b40
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

<<<<<<< HEAD
    @SuppressWarnings("unchecked")
    public AuthResponse authenticateWithGoogle(GoogleTokenRequest tokenRequest) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(tokenRequest.getToken());
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map<String, Object>> googleResponse = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    entity,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);

            Map<String, Object> userInfo = googleResponse.getBody();
            if (userInfo == null || !userInfo.containsKey("email")) {
                return new AuthResponse("Could not retrieve email from Google token.");
            }

            String googleEmail = (String) userInfo.get("email");
            String googleName = (String) userInfo.get("name");
            String googleId = (String) userInfo.get("sub");

            Optional<User> userOpt = userRepository.findByEmail(googleEmail);

            if (userOpt.isPresent()) {
                User user = userOpt.get();

                if (user.getStatus() == User.Status.PENDING) {
                    return new AuthResponse("Waiting for admin approval. Please contact your administrator.");
                }

                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    user.setStatus(User.Status.ACTIVE);
                    user.setRole(User.Role.STUDENT);
                    userRepository.save(user);
                }

                String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
                return new AuthResponse(jwt, user);
            } else {
                if (tokenRequest.getRole() == null || tokenRequest.getRole().trim().isEmpty()) {
                    return new AuthResponse("ROLE_REQUIRED");
                }

                User newUser = new User();
                newUser.setFullName(googleName != null ? googleName : "Google User");
                newUser.setEmail(googleEmail);
                newUser.setUsername(googleEmail.split("@")[0]);
                newUser.setGoogleId(googleId);
                newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));

                try {
                    User.Role role = User.Role.valueOf(tokenRequest.getRole().toUpperCase());
                    newUser.setRole(role);
                    if (role == User.Role.STUDENT) {
                        newUser.setStatus(User.Status.ACTIVE);
                    } else {
                        newUser.setStatus(User.Status.PENDING);
                    }
                } catch (Exception e) {
                    newUser.setRole(User.Role.STUDENT);
                    newUser.setStatus(User.Status.ACTIVE);
                }

                newUser.setActive(true);
                userRepository.save(newUser);

                if (newUser.getStatus() == User.Status.PENDING) {
                    return new AuthResponse("Registration successful. Waiting for admin approval.");
                } else {
                    String jwt = jwtUtil.generateToken(newUser.getEmail(), newUser.getRole().name());
                    return new AuthResponse(jwt, newUser);
                }
=======
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
>>>>>>> 2dbbab9d29ee86b9aea5ad189df4948350af6b40
            }
        } catch (Exception e) {
            return new AuthResponse("Google authentication failed: " + e.getMessage());
        }
    }
<<<<<<< HEAD

    public AuthResponse register(RegisterRequest request) {
        try {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return new AuthResponse("Email is already taken");
            }

            User newUser = new User();
            newUser.setUsername(request.getEmail().split("@")[0]);
            newUser.setFullName(request.getName() != null ? request.getName() : "New User");
            newUser.setEmail(request.getEmail());
            newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));

            try {
                User.Role role = User.Role.valueOf(request.getRole().toUpperCase());
                newUser.setRole(role);
                if (role == User.Role.STUDENT) {
                    newUser.setStatus(User.Status.ACTIVE);
                } else {
                    newUser.setStatus(User.Status.PENDING);
                }
            } catch (Exception e) {
                newUser.setRole(User.Role.STUDENT);
                newUser.setStatus(User.Status.ACTIVE);
            }

            newUser.setActive(true);
            userRepository.save(newUser);

            return new AuthResponse("Registration successful");
        } catch (Exception e) {
            return new AuthResponse("Registration failed: " + e.getMessage());
        }
    }
}
=======
}
>>>>>>> 2dbbab9d29ee86b9aea5ad189df4948350af6b40
